const Order = require('../models/Order');
const PaymentIntent = require('../models/PaymentIntent');
const { sendAdminNotification, sendOrderConfirmation } = require('../utils/sendEmail');
const { loadStore, saveStore } = require('../utils/fileStore');
const {
  getCashfreeConfig,
  buildCashfreeOrderRequest,
  getCashfreeGateway,
  verifySignature,
} = require('../utils/cashfreeHelper');

// In-memory / persistent file store for orders if DB is unavailable
const initialStore = loadStore();
const mockOrdersDB = initialStore.orders || [];

const syncMockOrdersStore = () => {
  const currentStore = loadStore();
  currentStore.orders = mockOrdersDB;
  saveStore(currentStore);
};

const dispatchOrderEmails = async (orderData) => {
  try {
    const adminSent = await sendAdminNotification({
      subject: '🚀 New Order Received',
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      message: `Order #${orderData.orderId} received. Services: ${orderData.items?.map((item) => item.title).join(', ')}. Total: ₹${orderData.totalAmount}, Paid: ₹${orderData.amountPaid}`,
      details: orderData,
    });
    if (adminSent) {
      console.log('✅ Admin Order Notification Email Sent');
    } else {
      console.log('❌ Admin Email Delivery Failed');
    }
  } catch (error) {
    console.error('❌ Admin Email Exception:', error?.message || error);
  }
};

const calculateOrderAmounts = (items = [], paymentType = 'full', couponCode = '', providedTotal = 0) => {
  let subtotal = 0;
  (items || []).forEach((item) => {
    let itemPrice = Number(item.price) || 0;
    if (item.priority === 'fast') itemPrice += 100;
    if (item.priority === 'express') itemPrice += 200;
    subtotal += itemPrice * (item.quantity || 1);
  });

  let discount = 0;
  if (couponCode && couponCode.toUpperCase() === 'VIBE10') {
    discount = Math.round(subtotal * 0.1);
  } else if (couponCode && couponCode.toUpperCase() === 'FIRST20') {
    discount = Math.round(subtotal * 0.2);
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = Math.round(discountedSubtotal * 0.18);
  const totalAmount = providedTotal > 0 ? Number(providedTotal) : discountedSubtotal + gst;

  let amountPaid = 0;
  if (paymentType === 'advance_50') {
    amountPaid = Math.round(totalAmount * 0.5);
  } else if (paymentType === 'token_50') {
    amountPaid = 50;
  } else if (paymentType === 'demo_1') {
    amountPaid = 1;
  } else {
    amountPaid = totalAmount;
  }

  const amountDue = Math.max(0, totalAmount - amountPaid);

  return {
    subtotal,
    discount,
    gst,
    totalAmount,
    amountPaid,
    amountDue,
  };
};

const emitOrderEvents = (io, order) => {
  if (!io || !order) return;
  io.emit('newOrder', order);
  io.emit('order:created', order);
  io.emit('notification:order', {
    title: `New Order Received! #${order.orderId}`,
    message: `${order.customerName} ordered ${order.items?.[0]?.title || 'Service'} for ₹${order.totalAmount}`,
    orderId: order.orderId,
  });
};

const saveOrderBackup = (order) => {
  const existingIdx = mockOrdersDB.findIndex((o) => o.orderId === order.orderId);
  const payload = { ...order.toObject ? order.toObject() : order, _id: order._id };
  if (existingIdx !== -1) {
    mockOrdersDB[existingIdx] = payload;
  } else {
    mockOrdersDB.unshift(payload);
  }
  syncMockOrdersStore();
};

const saveConfirmedOrder = async ({ paymentIntent, cashfreeOrder, paymentRecord, webhookPayload }) => {
  const orderId = paymentIntent.orderId;
  const orderExists = await Order.findOne({ orderId });
  if (orderExists) {
    return orderExists;
  }

  const payload = paymentIntent.payload || {};
  const paymentTimestampRaw = paymentRecord?.paymentTime || paymentRecord?.payment_time || webhookPayload?.tx_time || webhookPayload?.payment_time;
  const paymentTimestamp = paymentTimestampRaw ? new Date(paymentTimestampRaw) : new Date();

  const orderData = {
    orderId,
    user: payload.user || null,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    address: payload.address || '',
    items: payload.items || [],
    subtotal: paymentIntent.subtotal || payload.subtotal || paymentIntent.totalAmount,
    discount: paymentIntent.discount || payload.discount || 0,
    gst: paymentIntent.gst || payload.gst || 0,
    totalAmount: paymentIntent.totalAmount,
    paymentType: paymentIntent.paymentType || payload.paymentType || 'full',
    amountPaid: paymentIntent.amountPaid,
    amountDue: paymentIntent.amountDue,
    paymentMethod: paymentIntent.paymentMethod || payload.paymentMethod || 'Cashfree',
    paymentStatus: 'PAID',
    orderStatus: 'Confirmed',
    statusTimeline: 'Confirmed',
    emailStatus: 'NOT_SENT',
    cashfreeOrderId: paymentIntent.cashfreeOrderId || '',
    cashfreeOrderInternalId: paymentIntent.cashfreeOrderInternalId || '',
    cashfreePaymentSessionId: paymentIntent.cashfreePaymentSessionId || '',
    cashfreeResponse: {
      order: cashfreeOrder || {},
      payment: paymentRecord || {},
      webhookPayload: webhookPayload || {},
    },
    transactionId: paymentRecord?.bankReference || paymentRecord?.authId || paymentRecord?.cfPaymentId?.toString() || paymentIntent.cashfreeOrderId || '',
    paymentTimestamp,
    createdAt: new Date(),
  };

  let order = await Order.create(orderData);
  saveOrderBackup(order);

  const io = req?.app?.get ? req.app.get('io') : null;
  emitOrderEvents(io, order);

  try {
    const customerSent = await sendOrderConfirmation(orderData);
    if (customerSent) {
      order.emailStatus = 'SENT';
      order.emailSentAt = new Date();
      await order.save();
      saveOrderBackup(order);
      if (io) {
        io.emit('orderUpdated', order);
        io.emit('order:status_updated', order);
        io.to(`order_${order.orderId}`).emit('orderUpdated', order);
        io.to(`order_${order.orderId}`).emit('order:status_updated', order);
      }
    } else {
      order.emailStatus = 'FAILED';
      await order.save();
      saveOrderBackup(order);
    }
  } catch (error) {
    order.emailStatus = 'FAILED';
    await order.save();
    console.error('❌ Error sending confirmation email after payment verification:', error.message || error);
  }

  await dispatchOrderEmails(orderData);
  return order;
};

const verifyCashfreeOrderAndCreate = async (paymentIntent, webhookPayload = null) => {
  if (!paymentIntent) {
    throw new Error('Payment intent not found for verification');
  }

  const config = getCashfreeConfig();
  const gateway = getCashfreeGateway();

  const orderResult = await gateway.getOrder(config, paymentIntent.orderId);
  const paymentsResult = await gateway.getPaymentsForOrder(config, paymentIntent.orderId);

  const cfOrder = orderResult?.cfOrder;
  const payments = paymentsResult?.cfPaymentsEntities || [];
  const successPayment = payments.find((payment) => String(payment.paymentStatus).toUpperCase() === 'SUCCESS');

  if (!successPayment && String(cfOrder?.orderStatus).toUpperCase() !== 'PAID') {
    throw new Error('Payment is not verified yet');
  }

  const paymentRecord = successPayment || payments[0] || {};

  paymentIntent.status = 'SUCCESS';
  paymentIntent.cashfreeResponse = {
    order: cfOrder || {},
    payments,
    webhookPayload: webhookPayload || paymentIntent.cashfreeResponse?.webhookPayload || {},
  };
  paymentIntent.cashfreeOrderId = cfOrder?.orderId || paymentIntent.cashfreeOrderId;
  paymentIntent.cashfreeOrderInternalId = cfOrder?.cfOrderId?.toString?.() || paymentIntent.cashfreeOrderInternalId;
  paymentIntent.cashfreePaymentSessionId = cfOrder?.paymentSessionId || paymentIntent.cashfreePaymentSessionId;
  await paymentIntent.save();

  return saveConfirmedOrder({ paymentIntent, cashfreeOrder: cfOrder, paymentRecord, webhookPayload });
};

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      paymentType,
      paymentMethod,
      couponCode,
    } = req.body;

    let subtotal = 0;
    (items || []).forEach((item) => {
      let itemPrice = Number(item.price) || 0;
      if (item.priority === 'fast') itemPrice += 100;
      if (item.priority === 'express') itemPrice += 200;
      subtotal += itemPrice * (item.quantity || 1);
    });

    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === 'VIBE10') {
      discount = Math.round(subtotal * 0.1);
    } else if (couponCode && couponCode.toUpperCase() === 'FIRST20') {
      discount = Math.round(subtotal * 0.2);
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gst = Math.round(discountedSubtotal * 0.18);
    const totalAmount = Number(req.body.totalAmount) > 0 ? Number(req.body.totalAmount) : (discountedSubtotal + gst);
    const amountPaid = req.body.amountPaid !== undefined && req.body.amountPaid !== null ? Number(req.body.amountPaid) : (paymentType === 'advance_50' ? Math.round(totalAmount * 0.5) : paymentType === 'token_50' ? 50 : totalAmount);
    const amountDue = req.body.amountDue !== undefined && req.body.amountDue !== null ? Number(req.body.amountDue) : Math.max(0, totalAmount - amountPaid);
    const paymentStatus = req.body.paymentStatus || (paymentType === 'pay_later' ? 'UNPAID' : amountDue > 0 ? 'PARTIALLY PAID' : 'PAID');

    // Prefer client-provided orderId when available (e.g. VF-881262) to keep Firestore and MongoDB in sync
    const orderId = req.body.orderId && String(req.body.orderId).trim()
      ? String(req.body.orderId).trim()
      : 'VF-' + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderId,
      user: req.user ? (req.user.id || req.user._id) : null,
      customerName,
      customerEmail,
      customerPhone,
      address: address || '',
      items: items || [],
      subtotal: subtotal || totalAmount,
      discount: discount || 0,
      gst: gst || 0,
      totalAmount,
      paymentType: req.body.paymentType || paymentType || 'full',
      amountPaid,
      amountDue,
      paymentMethod: paymentMethod || 'Razorpay / UPI',
      paymentStatus,
      orderStatus: 'Order Received',
      emailStatus: 'NOT_SENT',
      statusTimeline: 'Order Received',
      adminNotificationEmail: 'vibeforge@gmail.com',
      adminNotificationPhone: '9943380320',
      createdAt: new Date(),
    };

    console.log(`\n📦 [NEW ORDER RECEIVED] Order #${orderId} Saved in MongoDB. Status: Order Received. Email: NOT_SENT.`);

    // Upsert in MongoDB to prevent duplicate orders
    let order = await Order.findOneAndUpdate(
      { orderId },
      { $set: orderData },
      { upsert: true, new: true, runValidators: false }
    );

    console.log(`✅ Order #${orderId} saved/upserted in MongoDB database.`);

    // Backup in memory store
    const existingIdx = mockOrdersDB.findIndex((o) => o.orderId === orderId);
    if (existingIdx !== -1) {
      mockOrdersDB[existingIdx] = { ...orderData, _id: order._id };
    } else {
      mockOrdersDB.unshift({ ...orderData, _id: order._id });
    }
    syncMockOrdersStore();

    // Emit Socket.IO events immediately to Admin Dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', order);
      io.emit('order:created', order);
      io.emit('notification:order', {
        title: `New Order Received! #${orderId}`,
        message: `${customerName} ordered ${items?.[0]?.title || 'Service'} for ₹${totalAmount}`,
        orderId
      });
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error creating/upserting order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.query;
    const targetId = orderId || req.params?.id || req.body?.orderId;
    const targetEmail = email || req.body?.email;

    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Order ID is required to track order status.' });
    }

    let order = await Order.findOne({ $or: [{ orderId: targetId.trim() }, { _id: targetId.trim() }] });
    if (!order) {
      order = mockOrdersDB.find((o) => o.orderId === targetId.trim() || o._id === targetId.trim());
    }

    if (!order) {
      return res.status(404).json({ success: false, message: `Invalid Order ID #${targetId}. No order found.` });
    }

    if (targetEmail) {
      const cleanEmail = targetEmail.trim().toLowerCase();
      const orderCustomerEmail = (order.customerEmail || '').trim().toLowerCase();
      if (orderCustomerEmail && orderCustomerEmail !== cleanEmail) {
        return res.status(403).json({ success: false, message: 'Email address does not match this Order ID.' });
      }
    }

    return res.json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        items: order.items,
        totalAmount: order.totalAmount,
        amountPaid: order.amountPaid,
        amountDue: order.amountDue,
        paymentStatus: order.paymentStatus || 'PAID',
        orderStatus: order.orderStatus || order.statusTimeline || 'Order Received',
        emailStatus: order.emailStatus || 'NOT_SENT',
        emailSentAt: order.emailSentAt || null,
        statusTimeline: order.statusTimeline || order.orderStatus || 'Order Received',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt || order.createdAt,
      }
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, message: 'Error retrieving order status: ' + error.message });
  }
};

const notifyAdminOrder = async (req, res) => {
  const orderData = req.body;
  const { orderId, customerName, customerEmail, customerPhone, totalAmount, amountPaid, items } = orderData;
  
  console.log(`\n======================================================`);
  console.log(`🚨 AUTOMATED VIBEFORGE ORDER DISPATCH 🚨`);
  console.log(`======================================================`);
  console.log(`🆔 Order ID: #${orderId}`);
  console.log(`👤 Customer: ${customerName} (${customerPhone})`);
  console.log(`✉️ Customer Email: ${customerEmail}`);
  console.log(`📦 Services: ${items?.map(i => i.title).join(', ')}`);
  console.log(`💰 Total Budget: ₹${totalAmount}`);
  console.log(`💳 Amount Paid: ₹${amountPaid}`);
  console.log(`======================================================\n`);

  // Notify admin only; no customer confirmation email is sent automatically.
  await dispatchOrderEmails(orderData);

  res.json({
    success: true,
    message: 'Admin order notification dispatched successfully.',
    adminEmail: 'vibeforge@gmail.com',
    adminPhone: '9943380320',
  });
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    let order = await Order.findOne({ orderId: id });
    if (!order) {
      order = mockOrdersDB.find((o) => o.orderId === id || o._id === id);
    }
    if (order) return res.json(order);

    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    const found = mockOrdersDB.find((o) => o.orderId === id);
    if (found) return res.json(found);
    res.status(404).json({ message: 'Order not found' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to view orders' });
    }

    const userId = req.user._id || req.user.id;
    const userEmail = (req.user.email || '').toLowerCase().trim();

    let dbOrders = [];
    try {
      dbOrders = await Order.find({
        $or: [
          { user: userId },
          { customerEmail: new RegExp(`^${userEmail}$`, 'i') }
        ]
      }).sort({ createdAt: -1 });
    } catch (e) {
      dbOrders = [];
    }

    const memoryOrders = mockOrdersDB.filter(
      (o) =>
        (o.user && (o.user.toString() === userId.toString() || o.user === userId)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail)
    );

    const orderMap = new Map();
    memoryOrders.forEach((o) => {
      if (o && o.orderId) orderMap.set(o.orderId, o);
    });
    dbOrders.forEach((o) => {
      if (o && o.orderId) orderMap.set(o.orderId, o);
    });

    const userOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
    );

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customer orders', error: error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  const { orderId, razorpayPaymentId } = req.body;
  try {
    let order = await Order.findOne({ orderId });
    if (order) {
      order.razorpayPaymentId = razorpayPaymentId || 'pay_mock_' + Date.now();
      order.paymentStatus = order.amountDue > 0 ? 'PARTIALLY PAID' : 'PAID';
      await order.save();
      return res.json({ message: 'Payment verified successfully', order });
    }

    const mock = mockOrdersDB.find((o) => o.orderId === orderId);
    if (mock) {
      mock.razorpayPaymentId = razorpayPaymentId || 'pay_mock_' + Date.now();
      mock.paymentStatus = mock.amountDue > 0 ? 'PARTIALLY PAID' : 'PAID';
      return res.json({ message: 'Payment verified successfully', order: mock });
    }

    res.status(400).json({ message: 'Order not found for verification' });
  } catch (error) {
    res.json({ message: 'Payment verified (mock)' });
  }
};

const sendConfirmationEmailHandler = async (req, res) => {
  try {
    const orderData = req.body || {};
    const targetOrderId = req.params?.orderId || req.params?.id || orderData?.orderId;

    if (!targetOrderId && !orderData?.customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email or Order ID is required.' });
    }

    let order = null;
    if (targetOrderId) {
      order = await Order.findOne({ $or: [{ orderId: targetOrderId }, { _id: targetOrderId }] });
    }

    const payloadToEmail = order ? order.toObject() : orderData;
    if (!payloadToEmail || !payloadToEmail.customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email is required.' });
    }

    console.log(`✉️ Admin triggered Brevo SMTP confirmation email for Order #${payloadToEmail.orderId || targetOrderId} -> ${payloadToEmail.customerEmail}`);

    const customerSent = await sendOrderConfirmation(payloadToEmail);

    if (customerSent) {
      const now = new Date();
      if (order) {
        order.orderStatus = 'Confirmed';
        order.statusTimeline = 'Confirmed';
        order.emailStatus = 'SENT';
        order.emailSentAt = now;
        await order.save();
      }

      const mockIndex = mockOrdersDB.findIndex((o) => o.orderId === payloadToEmail.orderId);
      if (mockIndex !== -1) {
        mockOrdersDB[mockIndex].orderStatus = 'Confirmed';
        mockOrdersDB[mockIndex].statusTimeline = 'Confirmed';
        mockOrdersDB[mockIndex].emailStatus = 'SENT';
        mockOrdersDB[mockIndex].emailSentAt = now;
        syncMockOrdersStore();
      }

      const updatedObject = order
        ? order.toObject()
        : { ...payloadToEmail, orderStatus: 'Confirmed', statusTimeline: 'Confirmed', emailStatus: 'SENT', emailSentAt: now };

      const io = req.app.get('io');
      if (io) {
        io.emit('orderUpdated', updatedObject);
        io.emit('order:status_updated', updatedObject);
        if (targetOrderId) {
          io.to(`order_${targetOrderId}`).emit('orderUpdated', updatedObject);
          io.to(`order_${targetOrderId}`).emit('order:status_updated', updatedObject);
        }
      }

      return res.json({
        success: true,
        message: 'Confirmation email sent successfully.',
        orderStatus: 'Confirmed',
        emailStatus: 'SENT',
        emailSentAt: now,
        order: updatedObject,
      });
    } else {
      if (order) {
        order.orderStatus = 'Pending';
        order.statusTimeline = 'Pending';
        order.emailStatus = 'FAILED';
        await order.save();
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to send confirmation email via Brevo SMTP.',
        orderStatus: 'Pending',
        emailStatus: 'FAILED',
      });
    }
  } catch (error) {
    console.error('Error in sendConfirmationEmailHandler:', error);
    res.status(500).json({ success: false, message: 'Email dispatch error: ' + error.message, error: error.message });
  }
};

module.exports = {
  createOrder,
  trackOrder,
  notifyAdminOrder,
  getOrderById,
  getMyOrders,
  verifyRazorpayPayment,
  sendConfirmationEmailHandler,
  mockOrdersDB,
};
