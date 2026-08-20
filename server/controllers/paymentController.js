const express = require('express');
const Order = require('../models/Order');
const PaymentIntent = require('../models/PaymentIntent');
const { sendAdminNotification, sendOrderConfirmation } = require('../utils/sendEmail');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const { loadStore, saveStore } = require('../utils/fileStore');
const {
  getCashfreeConfig,
  getCashfreeGateway,
  createCashfreeOrder,
  getPaymentStatus,
  verifySignature,
  normalizePhoneNumber,
} = require('../utils/cashfreeHelper');

const initialStore = loadStore();
const mockOrdersDB = initialStore.orders || [];

const syncMockOrdersStore = () => {
  const currentStore = loadStore();
  currentStore.orders = mockOrdersDB;
  saveStore(currentStore);
};

const saveOrderBackup = (order) => {
  if (!order) return;
  const payload = { ...order.toObject ? order.toObject() : order, _id: order._id };
  const existingIdx = mockOrdersDB.findIndex((o) => o.orderId === payload.orderId);
  if (existingIdx !== -1) {
    mockOrdersDB[existingIdx] = payload;
  } else {
    mockOrdersDB.unshift(payload);
  }
  syncMockOrdersStore();
};

const emitOrderEvents = (io, order) => {
  if (!io || !order) return;
  const payload = order.toObject ? order.toObject() : order;

  // General Order Events
  io.emit('newOrder', payload);
  io.emit('order:created', payload);
  io.emit('orderUpdated', payload);
  io.emit('order:status_updated', payload);
  
  // Specific Required Payment & Production Events
  io.emit('payment_success', payload);
  io.emit('order_confirmed', payload);
  io.emit('admin_new_order', payload);
  io.emit('invoice_generated', payload);
  io.emit('tracking_updated', payload);

  // Room Specific Emissions
  io.to(`order_${order.orderId}`).emit('orderUpdated', payload);
  io.to(`order_${order.orderId}`).emit('order:status_updated', payload);
  io.to(`order_${order.orderId}`).emit('tracking_updated', payload);

  io.emit('notification:order', {
    title: `New Paid Order Received! #${order.orderId}`,
    message: `${order.customerName} ordered ${order.items?.[0]?.title || 'Service'} for ₹${order.totalAmount}`,
    orderId: order.orderId,
  });
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

const buildReturnUrl = (orderId) => {
  const clientUrl = (process.env.CLIENT_URL || process.env.ADMIN_URL || 'https://vibeforge.vercel.app').replace(/\/$/, '');
  return `${clientUrl}/track?id=${encodeURIComponent(orderId)}&paymentReturn=true`;
};

const buildNotifyUrl = () => {
  const backendUrl = (process.env.BACKEND_URL || process.env.API_URL || 'https://vibeforge-hq68.onrender.com').replace(/\/$/, '');
  return `${backendUrl}/api/payment/webhook`;
};

/**
 * 1. Create Pending Order in MongoDB & Generate Cashfree Payment Order
 */
const createCashfreeOrderHandler = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone: rawCustomerPhone,
      address,
      items,
      paymentType,
      paymentMethod,
      couponCode,
      orderId: clientOrderId,
      totalAmount: providedTotal,
    } = req.body;

    console.log(`\n💳 [CASHFREE CREATE ORDER] Order Request received for ${customerName} (${customerEmail})`);

    if (!customerName || !customerEmail || !rawCustomerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required checkout fields.' });
    }

    const customerPhone = normalizePhoneNumber(rawCustomerPhone || (req.user && req.user.phone) || '');
    if (!customerPhone || customerPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: `Invalid customer phone number (${rawCustomerPhone}). A valid 10-digit Indian phone number is required.`,
      });
    }

    const isBalancePayment = req.body.isBalancePayment || paymentType === 'remaining_balance';
    const parentOrderId = req.body.parentOrderId || (clientOrderId && clientOrderId.includes('-BAL-') ? clientOrderId.split('-BAL-')[0] : null);

    let parentOrder = null;
    if (parentOrderId) {
      parentOrder = await Order.findOne({ orderId: parentOrderId });
    }

    const amounts = calculateOrderAmounts(items, paymentType, couponCode, Number(providedTotal));

    if (isBalancePayment && parentOrder) {
      amounts.amountPaid = Number(providedTotal) || parentOrder.amountDue;
      amounts.totalAmount = parentOrder.totalAmount;
      amounts.amountDue = 0;
    }

    const orderId = clientOrderId && String(clientOrderId).trim()
      ? String(clientOrderId).trim()
      : 'VF-' + Math.floor(100000 + Math.random() * 900000);

    // Save pending order to MongoDB
    const pendingOrderData = {
      orderId,
      parentOrderId: parentOrder ? parentOrder.orderId : null,
      user: req.user ? (req.user.id || req.user._id) : null,
      customerName,
      customerEmail,
      customerPhone,
      address: address || '',
      items: items || [],
      subtotal: amounts.subtotal,
      discount: amounts.discount,
      gst: amounts.gst,
      totalAmount: parentOrder ? parentOrder.totalAmount : amounts.totalAmount,
      paymentType: paymentType || 'full',
      amountPaid: isBalancePayment && parentOrder ? parentOrder.totalAmount : amounts.amountPaid,
      amountDue: isBalancePayment ? 0 : amounts.amountDue,
      paymentMethod: paymentMethod || 'Cashfree',
      paymentStatus: 'PENDING',
      orderStatus: 'PAYMENT_PENDING',
      emailStatus: 'NOT_SENT',
      adminStatus: 'WAITING_FOR_PAYMENT',
      statusTimeline: 'PAYMENT_PENDING',
      cashfreeOrderId: orderId,
      cfOrderId: orderId,
    };

    let order = await Order.findOne({ orderId });
    if (order) {
      if (order.paymentStatus === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'Order has already been paid for.',
          orderId: order.orderId,
        });
      }
      Object.assign(order, pendingOrderData);
      await order.save();
    } else {
      order = await Order.create(pendingOrderData);
    }
    saveOrderBackup(order);

    // Save PaymentIntent for redundancy
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
      payload: pendingOrderData,
    };

    let paymentIntent = await PaymentIntent.findOne({ orderId });
    if (paymentIntent) {
      Object.assign(paymentIntent, paymentIntentPayload);
      await paymentIntent.save();
    } else {
      paymentIntent = await PaymentIntent.create(paymentIntentPayload);
    }

    // Call Cashfree API to create order session
    let cfResponse;
    try {
      cfResponse = await createCashfreeOrder({
        orderId,
        totalAmount: amounts.amountPaid,
        customerEmail,
        customerPhone,
        customerName,
        notifyUrl: buildNotifyUrl(),
        returnUrl: buildReturnUrl(orderId),
        paymentMethods: 'upi,nb,cc',
      });
    } catch (error) {
      console.error('❌ Cashfree create order error:', error.message || error);
      console.error('Cashfree error details:', error.response?.data || error.details || error.body || null);
      return res.status(500).json({
        success: false,
        message: 'Cashfree order creation failed.',
        error: error.message || String(error),
        details: error.response?.data || error.details || error.body || null,
      });
    }

    const cfOrder = cfResponse?.cfOrder || cfResponse || {};

    order.cashfreeOrderId = cfOrder.orderId || cfOrder.order_id || orderId;
    order.cfOrderId = cfOrder.orderId || cfOrder.order_id || orderId;
    order.cashfreeOrderInternalId = cfOrder.cfOrderId?.toString?.() || cfOrder.cf_order_id?.toString?.() || '';
    order.cashfreePaymentSessionId = cfOrder.paymentSessionId || cfOrder.payment_session_id || '';
    order.cashfreeResponse = { order: cfOrder };
    await order.save();
    saveOrderBackup(order);

    paymentIntent.cashfreeOrderId = order.cashfreeOrderId;
    paymentIntent.cashfreeOrderInternalId = order.cashfreeOrderInternalId;
    paymentIntent.cashfreePaymentSessionId = order.cashfreePaymentSessionId;
    paymentIntent.cashfreeResponse = { order: cfOrder };
    await paymentIntent.save();

    const paymentSessionId = order.cashfreePaymentSessionId || cfOrder.paymentSessionId || cfOrder.payment_session_id || '';

    if (!paymentSessionId) {
      return res.status(500).json({
        success: false,
        message: 'Cashfree API did not return a valid payment_session_id.',
        details: cfOrder,
      });
    }

    console.log(`✅ Cashfree Order Session Created Successfully #${orderId}. Session ID: ${paymentSessionId}`);

    return res.status(201).json({
      success: true,
      orderId,
      cashfreeOrderId: order.cashfreeOrderId,
      cfOrderId: order.cashfreeOrderId,
      paymentSessionId,
      payment_session_id: paymentSessionId,
      environment: 'production',
      mode: 'production',
    });
  } catch (error) {
    console.error('❌ Cashfree create order handler error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Cashfree order creation error', error: error.message || String(error) });
  }
};

/**
 * Reconcile Payment Status using Cashfree API (Webhooks & Return URL)
 * Idempotent, transaction-safe, dispatches emails, invoices & socket events.
 */
const reconcilePaymentStatus = async ({ orderId, cashfreeOrderId, webhookPayload = null, req = null }) => {
  const searchId = orderId || cashfreeOrderId;
  if (!searchId) {
    throw new Error('Missing order ID for payment reconciliation');
  }

  console.log(`\n🔍 [PAYMENT RECONCILIATION] Checking payment status for Order #${searchId}...`);

  // Check if order exists in MongoDB
  let existingOrder = await Order.findOne({ $or: [{ orderId: searchId }, { cashfreeOrderId: searchId }, { cfOrderId: searchId }] });
  
  // Idempotency check: If already paid, return immediately
  if (existingOrder && existingOrder.paymentStatus === 'PAID') {
    console.log(`✔ [Reconcile] Order #${existingOrder.orderId} is ALREADY PAID. Returning existing order record.`);
    return existingOrder;
  }

  // Fetch live payment status from Cashfree API
  const statusResult = await getPaymentStatus({ orderId: searchId });
  const cfOrder = statusResult?.order || {};
  const payments = statusResult?.payments || [];
  const successPayment = statusResult?.successPayment || null;

  const cfOrderStatus = String(cfOrder.order_status || cfOrder.orderStatus || statusResult?.status || '').toUpperCase();
  const isPaidSuccess = statusResult?.isPaid || Boolean(successPayment) || cfOrderStatus === 'PAID';

  console.log(`Cashfree Status Check for #${searchId}: isPaid=${isPaidSuccess}, cfOrderStatus=${cfOrderStatus}, PaymentsFound=${payments.length}`);

  if (!isPaidSuccess) {
    // Payment failed or is still pending
    if (existingOrder && ['FAILED', 'CANCELLED', 'EXPIRED', 'USER_DROPPED'].includes(cfOrderStatus)) {
      existingOrder.paymentStatus = 'FAILED';
      existingOrder.orderStatus = 'PAYMENT_FAILED';
      existingOrder.statusTimeline = 'PAYMENT_FAILED';
      existingOrder.adminStatus = 'PAYMENT_FAILED';
      existingOrder.transactionStatus = 'FAILED';
      await existingOrder.save();
      saveOrderBackup(existingOrder);
    }
    throw new Error(`Cashfree payment status for #${searchId} is '${cfOrderStatus || 'PENDING'}', not successful yet.`);
  }

  // Atomic Update to PAID status (Idempotent lock)
  const paymentRecord = successPayment || payments[0] || {};
  const paymentTimestampRaw = paymentRecord.paymentTime || paymentRecord.payment_time || webhookPayload?.tx_time || webhookPayload?.payment_time;
  const paymentTimestamp = paymentTimestampRaw ? new Date(paymentTimestampRaw) : new Date();
  const cfPaymentId = (paymentRecord.cfPaymentId || paymentRecord.cf_payment_id || paymentRecord.bankReference || paymentRecord.authId || '').toString();
  const transactionId = cfPaymentId || cfOrder.orderId || cfOrder.order_id || searchId;

  let order = await Order.findOneAndUpdate(
    {
      $or: [{ orderId: searchId }, { cashfreeOrderId: searchId }, { cfOrderId: searchId }],
      paymentStatus: { $ne: 'PAID' },
    },
    {
      $set: {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        status: 'CONFIRMED',
        statusTimeline: 'CONFIRMED',
        paymentMethod: 'Cashfree',
        emailStatus: 'SENDING',
        adminStatus: 'PAID',
        cashfreeOrderId: cfOrder.orderId || cfOrder.order_id || searchId,
        cfOrderId: cfOrder.orderId || cfOrder.order_id || searchId,
        cashfreeOrderInternalId: cfOrder.cfOrderId?.toString?.() || cfOrder.cf_order_id?.toString?.() || '',
        cashfreePaymentSessionId: cfOrder.paymentSessionId || cfOrder.payment_session_id || '',
        cashfreePaymentId: cfPaymentId,
        cfPaymentId,
        paymentId: cfPaymentId,
        transactionId,
        transactionStatus: 'SUCCESS',
        paidAt: paymentTimestamp,
        paymentTimestamp,
        paymentDate: paymentTimestamp,
        invoiceGenerated: true,
        amountPaid: Number(paymentRecord.paymentAmount || paymentRecord.payment_amount || cfOrder.orderAmount || cfOrder.order_amount || existingOrder?.amountPaid || 0),
        cashfreeResponse: { order: cfOrder, payment: paymentRecord, webhookPayload },
      },
    },
    { new: true }
  );

  // If order was null, another process already set paymentStatus = 'PAID'
  if (!order) {
    order = await Order.findOne({ $or: [{ orderId: searchId }, { cashfreeOrderId: searchId }, { cfOrderId: searchId }] });
    return order;
  }

  // Update PaymentIntent if present
  let paymentIntent = await PaymentIntent.findOne({ orderId: order.orderId });
  if (paymentIntent) {
    paymentIntent.status = 'SUCCESS';
    paymentIntent.cashfreeResponse = { order: cfOrder, payments, webhookPayload };
    await paymentIntent.save();
  }

  // If this is a balance payment for a parent order:
  if (order && order.parentOrderId) {
    try {
      const parent = await Order.findOne({ orderId: order.parentOrderId });
      if (parent) {
        parent.amountPaid = parent.totalAmount;
        parent.amountDue = 0;
        parent.paymentStatus = 'PAID';
        parent.cashfreePaymentId = cfPaymentId;
        parent.paidAt = paymentTimestamp;
        await parent.save();
        try {
          const parentInvoice = await generateInvoicePDF(parent);
          parent.invoicePath = parentInvoice.invoicePath;
          parent.invoiceUrl = parentInvoice.invoiceUrl;
          await parent.save();
        } catch (e) {}
        saveOrderBackup(parent);
        broadcastOrderUpdates(req, parent);
      }
    } catch (parentErr) {
      console.error('❌ Error updating parent order on balance payment:', parentErr);
    }
  }

  // 1. Generate Invoice PDF
  try {
    const { invoicePath, invoiceUrl } = await generateInvoicePDF(order);
    order.invoicePath = invoicePath;
    order.invoiceUrl = invoiceUrl;
    order.invoiceGenerated = true;
    await order.save();
    saveOrderBackup(order);
    console.log(`✔ Invoice PDF generated for order #${order.orderId}: ${invoiceUrl}`);
  } catch (invoiceErr) {
    console.error('❌ PDF Invoice Generation Error:', invoiceErr.message || invoiceErr);
  }

  // 2. Send Confirmation Email with Retries
  let emailSent = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const sent = await sendOrderConfirmation(order);
      if (sent) {
        emailSent = true;
        break;
      }
    } catch (e) {
      console.error(`❌ [Email Attempt ${attempt}/3] Error sending confirmation email for #${order.orderId}:`, e.message || e);
    }
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  if (emailSent) {
    order.emailStatus = 'SENT';
    order.emailSentAt = new Date();
    order.confirmationEmailSent = true;
  } else {
    order.emailStatus = 'FAILED';
  }
  await order.save();
  saveOrderBackup(order);

  // 3. Emit Socket.IO Events to Admin & Customer tracking room
  const io = req?.app?.get ? req.app.get('io') : null;
  emitOrderEvents(io, order);

  // 4. Send Admin Notification Alert
  try {
    await sendAdminNotification({
      subject: '🚀 New Paid Order Received',
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      message: `Paid Order #${order.orderId} confirmed. Total: ₹${order.totalAmount}. CF Payment ID: ${order.cfPaymentId || order.transactionId}`,
      details: order,
    });
  } catch (adminEmailErr) {
    console.error('❌ Error sending admin notification email:', adminEmailErr.message || adminEmailErr);
  }

  return order;
};

/**
 * 4. Verify Cashfree Payment (Return URL Endpoint)
 */
const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId, cashfreeOrderId } = req.body;
    const targetOrderId = orderId || cashfreeOrderId;

    if (!targetOrderId) {
      return res.status(400).json({ success: false, message: 'Missing order ID for verification.' });
    }

    const order = await reconcilePaymentStatus({ orderId: targetOrderId, cashfreeOrderId, req });
    return res.json({
      success: true,
      message: 'Payment verified and order confirmed by Cashfree API.',
      order,
    });
  } catch (error) {
    console.warn('⚠️ Cashfree payment verification pending or failed:', error.message || error);
    return res.status(202).json({
      success: false,
      message: error.message || 'Payment is still pending or not verified by Cashfree API.',
      paymentStatus: 'PENDING',
      orderStatus: 'PAYMENT_PENDING',
    });
  }
};

/**
 * Get Cashfree Payment Status Endpoint (GET /api/payment/status/:orderId)
 */
const getPaymentStatusHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId parameter is required' });
    }

    let order = await Order.findOne({ $or: [{ orderId }, { cashfreeOrderId: orderId }, { cfOrderId: orderId }] });
    const liveStatus = await getPaymentStatus({ orderId });

    if (liveStatus.isPaid && order && order.paymentStatus !== 'PAID') {
      order = await reconcilePaymentStatus({ orderId, req });
    }

    return res.json({
      success: true,
      orderId,
      order: order || null,
      liveStatus,
    });
  } catch (error) {
    console.error('❌ Get payment status error:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message || String(error),
    });
  }
};

/**
 * Cashfree Webhook Handler (Primary Automatic Trigger)
 */
const cashfreeWebhookHandler = async (req, res) => {
  try {
    const rawBody = req.rawBody || (req.body ? JSON.stringify(req.body) : '');
    const signature = req.headers['x-webhook-signature'] || req.headers['x-cashfree-signature'] || req.headers['x-signature'];
    const timestamp = req.headers['x-webhook-timestamp'] || req.headers['x-timestamp'] || '';

    console.log(`\n🔔 [CASHFREE WEBHOOK RECEIVED] Timestamp: ${timestamp || 'N/A'}, Signature: ${signature ? 'PRESENT' : 'MISSING'}`);

    if (!signature) {
      console.warn('⚠️ Webhook request rejected: Missing signature header.');
      return res.status(400).json({ success: false, message: 'Missing webhook signature.' });
    }

    const isValidSignature = verifySignature(rawBody, signature, timestamp);
    console.log(`Webhook Signature Verification Result: ${isValidSignature ? 'VALID ✅' : 'INVALID ❌'}`);

    if (!isValidSignature) {
      console.warn('⚠️ Webhook request rejected: Signature mismatch.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    let payload;
    try {
      payload = req.body && typeof req.body === 'object' ? req.body : JSON.parse(rawBody.toString('utf8'));
    } catch (parseError) {
      return res.status(400).json({ success: false, message: 'Invalid webhook JSON payload.' });
    }

    console.log('Webhook Payload:', JSON.stringify(payload, null, 2));

    const orderId = payload.data?.order?.order_id || payload.data?.order?.orderId || payload.order_id || payload.orderId || payload.data?.order_id || payload.data?.orderId;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Webhook payload is missing order ID.' });
    }

    const eventType = String(payload.type || payload.event || '').toUpperCase();
    const paymentStatusInPayload = String(payload.data?.payment?.payment_status || payload.payment_status || '').toUpperCase();

    // Check if this is a payment success event
    const isSuccessEvent = eventType.includes('SUCCESS') || paymentStatusInPayload === 'SUCCESS';

    if (!isSuccessEvent && ['FAILED', 'CANCELLED', 'EXPIRED', 'USER_DROPPED'].includes(paymentStatusInPayload)) {
      console.log(`[Webhook] Order #${orderId} payment status is ${paymentStatusInPayload}. Updating DB to FAILED.`);
      await Order.findOneAndUpdate(
        { $or: [{ orderId }, { cashfreeOrderId: orderId }] },
        { $set: { paymentStatus: 'FAILED', orderStatus: 'PAYMENT_FAILED', statusTimeline: 'PAYMENT_FAILED' } }
      );
      return res.json({ success: true, message: `Webhook recorded non-success status: ${paymentStatusInPayload}` });
    }

    const order = await reconcilePaymentStatus({
      orderId,
      cashfreeOrderId: payload.cf_order_id || payload.data?.cf_order_id || payload.data?.order?.cf_order_id,
      webhookPayload: payload,
      req,
    });

    return res.json({
      success: true,
      message: 'Webhook payment processed successfully.',
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    console.error('❌ Cashfree webhook error:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed.',
      error: error.message || String(error),
    });
  }
};

module.exports = {
  createCashfreeOrder: createCashfreeOrderHandler,
  verifyCashfreePayment,
  getPaymentStatusHandler,
  cashfreeWebhookHandler,
};
