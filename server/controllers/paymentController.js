const express = require('express');
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

const initialStore = loadStore();
const mockOrdersDB = initialStore.orders || [];

const syncMockOrdersStore = () => {
  const currentStore = loadStore();
  currentStore.orders = mockOrdersDB;
  saveStore(currentStore);
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
  const payload = { ...order.toObject ? order.toObject() : order, _id: order._id };
  const existingIdx = mockOrdersDB.findIndex((o) => o.orderId === payload.orderId);
  if (existingIdx !== -1) {
    mockOrdersDB[existingIdx] = payload;
  } else {
    mockOrdersDB.unshift(payload);
  }
  syncMockOrdersStore();
};

const saveConfirmedOrder = async ({ paymentIntent, cashfreeOrder, paymentRecord, webhookPayload, req }) => {
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
    subtotal: payload.subtotal || paymentIntent.totalAmount,
    discount: payload.discount || 0,
    gst: payload.gst || 0,
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

  await sendAdminNotification({
    subject: '🚀 New Paid Order Received',
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    message: `Paid Order #${order.orderId} confirmed. Total: ₹${order.totalAmount}. Transaction: ${order.transactionId}`,
    details: order,
  });

  return order;
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

const buildReturnUrl = (orderId) => {
  const clientUrl = (process.env.CLIENT_URL || process.env.ADMIN_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${clientUrl}/track?id=${encodeURIComponent(orderId)}&paymentReturn=true&newOrder=true`;
};

const buildNotifyUrl = () => {
  const backendUrl = (process.env.BACKEND_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
  return `${backendUrl}/api/payment/webhook`;
};

const createCashfreeOrder = async (req, res) => {
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
      orderId: clientOrderId,
      totalAmount: providedTotal,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required checkout fields.' });
    }

    const amounts = calculateOrderAmounts(items, paymentType, couponCode, Number(providedTotal));
    const orderId = clientOrderId && String(clientOrderId).trim()
      ? String(clientOrderId).trim()
      : 'VF-' + Math.floor(100000 + Math.random() * 900000);

    const paymentIntentPayload = {
      orderId,
      status: 'PENDING',
      amountPaid: amounts.amountPaid,
      amountDue: amounts.amountDue,
      totalAmount: amounts.totalAmount,
      paymentType: paymentType || 'full',
      paymentMethod: paymentMethod || 'Cashfree',
      couponCode: couponCode || '',
      customerName,
      customerEmail,
      customerPhone,
      address: address || '',
      items: items || [],
      payload: {
        orderId,
        user: req.user ? (req.user.id || req.user._id) : null,
        customerName,
        customerEmail,
        customerPhone,
        address: address || '',
        items: items || [],
        subtotal: amounts.subtotal,
        discount: amounts.discount,
        gst: amounts.gst,
        totalAmount: amounts.totalAmount,
        paymentType: paymentType || 'full',
        amountPaid: amounts.amountPaid,
        amountDue: amounts.amountDue,
        paymentMethod: paymentMethod || 'Cashfree',
        couponCode: couponCode || '',
      },
    };

    let paymentIntent = await PaymentIntent.findOne({ orderId });
    if (paymentIntent) {
      Object.assign(paymentIntent, paymentIntentPayload);
    } else {
      paymentIntent = new PaymentIntent(paymentIntentPayload);
    }

    const cfConfig = getCashfreeConfig();
    const cfOrderRequest = buildCashfreeOrderRequest({
      orderId,
      totalAmount: amounts.amountPaid,
      customerEmail,
      customerPhone,
      customerName,
      notifyUrl: buildNotifyUrl(),
      returnUrl: buildReturnUrl(orderId),
    });

    const gateway = getCashfreeGateway();
    const cfResponse = await gateway.orderCreate(cfConfig, cfOrderRequest);
    const cfOrder = cfResponse?.cfOrder || {};

    paymentIntent.cashfreeOrderId = cfOrder.orderId || '';
    paymentIntent.cashfreeOrderInternalId = cfOrder.cfOrderId?.toString?.() || '';
    paymentIntent.cashfreePaymentSessionId = cfOrder.paymentSessionId || '';
    paymentIntent.cashfreeResponse = { order: cfOrder };
    await paymentIntent.save();

    const isProductionEnv = String(process.env.CASHFREE_ENV || '').toUpperCase() === 'PRODUCTION';
    const checkoutBase = isProductionEnv
      ? 'https://www.cashfree.com/pg/checkout/order'
      : 'https://sandbox.cashfree.com/pg/checkout/order';
    const paymentUrl = cfOrder.paymentLink ||
      (cfOrder.orderToken
        ? `${checkoutBase}?order_id=${encodeURIComponent(orderId)}&order_token=${encodeURIComponent(cfOrder.orderToken)}`
        : null);

    if (!paymentUrl) {
      return res.status(500).json({ success: false, message: 'Unable to build Cashfree checkout URL.' });
    }

    return res.status(201).json({
      success: true,
      orderId,
      paymentUrl,
      cashfreeOrderId: paymentIntent.cashfreeOrderId,
      paymentSessionId: paymentIntent.cashfreePaymentSessionId,
    });
  } catch (error) {
    console.error('❌ Cashfree create order error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Cashfree order creation error', error: error.message || String(error) });
  }
};

const reconcilePaymentStatus = async (paymentIntent, webhookPayload = null, req = null) => {
  if (!paymentIntent) {
    throw new Error('Payment intent not found for reconciliation');
  }

  const config = getCashfreeConfig();
  const gateway = getCashfreeGateway();
  const cfOrderResponse = await gateway.getOrder(config, paymentIntent.orderId);
  const cfOrder = cfOrderResponse?.cfOrder || {};
  const paymentResult = await gateway.getPaymentsForOrder(config, paymentIntent.orderId);
  const payments = paymentResult?.cfPaymentsEntities || [];
  const successPayment = payments.find((payment) => String(payment.paymentStatus).toUpperCase() === 'SUCCESS');

  const orderStatus = String(cfOrder.orderStatus || '').toUpperCase();
  if (!successPayment && orderStatus !== 'PAID') {
    throw new Error('Cashfree payment has not reached a successful status yet');
  }

  paymentIntent.status = 'SUCCESS';
  paymentIntent.cashfreeResponse = {
    order: cfOrder || {},
    payments,
    webhookPayload: webhookPayload || paymentIntent.cashfreeResponse?.webhookPayload || {},
  };
  paymentIntent.cashfreeOrderId = cfOrder.orderId || paymentIntent.cashfreeOrderId;
  paymentIntent.cashfreeOrderInternalId = cfOrder.cfOrderId?.toString?.() || paymentIntent.cashfreeOrderInternalId;
  paymentIntent.cashfreePaymentSessionId = cfOrder.paymentSessionId || paymentIntent.cashfreePaymentSessionId;
  await paymentIntent.save();

  if (await Order.exists({ orderId: paymentIntent.orderId })) {
    return Order.findOne({ orderId: paymentIntent.orderId });
  }

  const paymentRecord = successPayment || payments[0] || {};
  const paymentTimestampRaw = paymentRecord.paymentTime || paymentRecord.payment_time || webhookPayload?.tx_time || webhookPayload?.payment_time;
  const paymentTimestamp = paymentTimestampRaw ? new Date(paymentTimestampRaw) : new Date();

  return saveConfirmedOrder({ paymentIntent, cashfreeOrder: cfOrder, paymentRecord, webhookPayload, req });
};

const findPaymentIntent = async ({ orderId, cashfreeOrderId }) => {
  if (orderId) {
    const intent = await PaymentIntent.findOne({ orderId });
    if (intent) return intent;
  }
  if (cashfreeOrderId) {
    const intent = await PaymentIntent.findOne({ cashfreeOrderId });
    if (intent) return intent;
  }
  return null;
};

const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId, cashfreeOrderId } = req.body;
    const paymentIntent = await findPaymentIntent({ orderId, cashfreeOrderId });
    if (!paymentIntent) {
      return res.status(404).json({ success: false, message: 'Payment intent not found for verification.' });
    }

    if (paymentIntent.status === 'SUCCESS') {
      const existingOrder = await Order.findOne({ orderId: paymentIntent.orderId });
      return res.json({ success: true, message: 'Payment already verified.', order: existingOrder });
    }

    const order = await reconcilePaymentStatus(paymentIntent, null, req);
    return res.json({ success: true, message: 'Payment verified and order created.', order });
  } catch (error) {
    console.error('❌ Cashfree verify error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Cashfree payment verification failed.', error: error.message || String(error) });
  }
};

const cashfreeWebhookHandler = async (req, res) => {
  try {
    const rawBody = req.rawBody || (req.body ? JSON.stringify(req.body) : '');
    const signature = req.headers['x-webhook-signature'] || req.headers['x-cashfree-signature'] || req.headers['x-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook signature.' });
    }

    if (!verifySignature(rawBody, signature)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    let payload;
    try {
      payload = req.body && typeof req.body === 'object' ? req.body : JSON.parse(rawBody.toString('utf8'));
    } catch (parseError) {
      return res.status(400).json({ success: false, message: 'Invalid webhook JSON payload.' });
    }

    const orderId = payload.order_id || payload.orderId || payload.data?.orderId || payload.data?.order_id;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Webhook payload is missing order ID.' });
    }

    const paymentIntent = await findPaymentIntent({ orderId, cashfreeOrderId: payload.cf_order_id || payload.data?.cf_order_id });
    if (!paymentIntent) {
      return res.status(404).json({ success: false, message: 'Payment intent not found for webhook order.' });
    }

    if (paymentIntent.status === 'SUCCESS') {
      return res.json({ success: true, message: 'Webhook ignored; payment already processed.' });
    }

    const statusValue = String(payload.orderStatus || payload.txStatus || payload.status || payload.data?.orderStatus || payload.data?.txStatus || '').toUpperCase();
    const isSuccess = ['SUCCESS', 'PAID'].includes(statusValue);
    if (!isSuccess) {
      return res.json({ success: true, message: 'Webhook received; payment not yet successful.', status: statusValue });
    }

    const order = await reconcilePaymentStatus(paymentIntent, payload);
    return res.json({ success: true, message: 'Webhook payment processed.', orderId: order.orderId, order });
  } catch (error) {
    console.error('❌ Cashfree webhook error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Webhook processing failed.', error: error.message || String(error) });
  }
};

module.exports = {
  createCashfreeOrder,
  verifyCashfreePayment,
  cashfreeWebhookHandler,
};
