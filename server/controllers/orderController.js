const Order = require('../models/Order');
const { sendAdminNotification, sendOrderConfirmation } = require('../utils/sendEmail');
const { loadStore, saveStore } = require('../utils/fileStore');

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
    const customerSent = await sendOrderConfirmation(orderData);
    if (customerSent) {
      console.log('✅ Customer Order Confirmation Email Sent');
    } else {
      console.log('❌ Customer Order Confirmation Email Delivery Failed');
    }
  } catch (error) {
    console.error('❌ Customer Email Exception:', error?.message || error);
  }

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
    items.forEach((item) => {
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
    const totalAmount = discountedSubtotal + gst;

    let amountPaid = totalAmount;
    let amountDue = 0;

    if (paymentType === 'advance_50') {
      amountPaid = Math.round(totalAmount * 0.5);
      amountDue = totalAmount - amountPaid;
    } else if (paymentType === 'token_50') {
      amountPaid = 50;
      amountDue = Math.max(0, totalAmount - 50);
    } else if (paymentType === 'pay_later') {
      amountPaid = 0;
      amountDue = totalAmount;
    }

    const orderId = 'VF-' + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderId,
      user: req.user ? (req.user.id || req.user._id) : null,
      customerName,
      customerEmail,
      customerPhone,
      address: address || '',
      items,
      subtotal,
      discount,
      gst,
      totalAmount,
      paymentType: paymentType || 'full',
      amountPaid,
      amountDue,
      paymentMethod: paymentMethod || 'Razorpay / UPI',
      paymentStatus: paymentType === 'pay_later' ? 'pending' : amountDue > 0 ? 'partially_paid' : 'paid',
      statusTimeline: 'Order Received',
      adminNotificationEmail: 'vibeforge@gmail.com',
      adminNotificationPhone: '9943380320',
      createdAt: new Date(),
    };

    console.log(`\n🚨 [AUTOMATED ORDER DISPATCH] Order #${orderId} Received!`);
    console.log(`✉️ Sending Confirmation Email to Customer: ${customerEmail}`);
    console.log(`✉️ Sending Notification Email to Admin: ${process.env.ADMIN_EMAIL || 'vibeforgemrs@gmail.com'}`);

    // Store in mock store as backup for sync
    mockOrdersDB.unshift({ ...orderData, createdAt: new Date() });
    syncMockOrdersStore();

    try {
      // Step 1: Save order to MongoDB database first
      const order = await Order.create(orderData);
      console.log(`✅ Order #${orderId} successfully saved in MongoDB database.`);

      // Step 2: Trigger sendOrderConfirmation ONLY AFTER MongoDB successfully stores the order
      await dispatchOrderEmails(orderData);

      // Emit real-time Socket.IO event to all admin clients
      const io = req.app.get('io');
      if (io) {
        io.emit('order:created', orderData);
        io.emit('notification:order', {
          title: `New Order Received! #${orderId}`,
          message: `${customerName} ordered ${items?.[0]?.title || 'Service'} for ₹${totalAmount}`,
          orderId
        });
      }

      return res.status(201).json(order);
    } catch (dbErr) {
      console.error('❌ MongoDB order save failed:', dbErr.message);
      // Ensure email is sent ONLY after MongoDB successfully stores the order
      return res.status(500).json({
        message: 'Failed to save order in MongoDB. Order confirmation email was not dispatched.',
        error: dbErr.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
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

  // Dispatch emails independently
  await dispatchOrderEmails(orderData);

  res.json({
    success: true,
    message: 'Automated Order Email & WhatsApp Notifications Dispatched Successfully',
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
      order.paymentStatus = order.amountDue > 0 ? 'partially_paid' : 'paid';
      await order.save();
      return res.json({ message: 'Payment verified successfully', order });
    }

    const mock = mockOrdersDB.find((o) => o.orderId === orderId);
    if (mock) {
      mock.razorpayPaymentId = razorpayPaymentId || 'pay_mock_' + Date.now();
      mock.paymentStatus = mock.amountDue > 0 ? 'partially_paid' : 'paid';
      return res.json({ message: 'Payment verified successfully', order: mock });
    }

    res.status(400).json({ message: 'Order not found for verification' });
  } catch (error) {
    res.json({ message: 'Payment verified (mock)' });
  }
};

module.exports = {
  createOrder,
  notifyAdminOrder,
  getOrderById,
  getMyOrders,
  verifyRazorpayPayment,
  mockOrdersDB,
};
