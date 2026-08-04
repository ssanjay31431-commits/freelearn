const crypto = require('crypto');
const axios = require('axios');
const {
  CFConfig,
  CFPaymentGateway,
  CFEnvironment,
  CFOrderRequest,
  CFCustomerDetails,
  CFOrderMeta,
} = require('cashfree-pg-sdk-nodejs');

const SUPPORTED_API_VERSIONS = new Set(['2022-09-01', '2022-01-01']);
const VALID_PAYMENT_METHODS = new Set(['upi', 'nb', 'cc', 'dc', 'emi', 'paylater', 'app', 'paypal', 'ppc', 'ccc', 'applepay']);
const VALID_PHONE_REGEX = /^[6-9]\d{9}$/;

const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove +91, spaces, hyphens, and any non-digit characters
  let cleanPhone = String(phone).replace(/\D/g, '');
  // Use the last 10 digits
  if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }
  return cleanPhone;
};

const getCashfreeOrderBaseUrl = (environment) =>
  environment === CFEnvironment.PRODUCTION ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

const getCashfreeOrderUrl = (environment) => `${getCashfreeOrderBaseUrl(environment)}/orders`;

const normalizeCashfreeOrderResponse = (data) => {
  if (!data || typeof data !== 'object') return {};
  return {
    ...data,
    orderId: data.order_id || data.orderId,
    orderToken: data.order_token || data.orderToken,
    cfOrderId: data.cf_order_id || data.cfOrderId,
    paymentSessionId: data.payment_session_id || data.paymentSessionId,
    paymentLink: data.payment_link || data.paymentLink,
  };
};

const buildCashfreeRawOrderPayload = ({ orderId, totalAmount, customerEmail, customerPhone, customerName, notifyUrl, returnUrl, paymentMethods = 'upi,nb,cc,dc,emi,paylater,app' }) => {
  const normalizedPhone = normalizePhoneNumber(customerPhone);
  validateCashfreeOrderPayload({ orderId, totalAmount, customerEmail, customerPhone: normalizedPhone, customerName, notifyUrl, returnUrl });

  return {
    order_id: String(orderId).trim(),
    order_amount: Number(totalAmount),
    order_currency: 'INR',
    customer_details: {
      customer_id: String(orderId).trim(),
      customer_name: String(customerName).trim(),
      customer_email: String(customerEmail).trim(),
      customer_phone: String(normalizedPhone).trim(),
    },
    order_meta: {
      return_url: String(returnUrl).trim(),
      notify_url: String(notifyUrl).trim(),
      payment_methods: sanitizePaymentMethods(paymentMethods),
    },
  };
};

const createCashfreeOrderRaw = async (params) => {
  const environment = String(process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;
  const url = getCashfreeOrderUrl(environment);
  const payload = buildCashfreeRawOrderPayload(params);

  const headers = {
    'x-client-id': String(process.env.CASHFREE_APP_ID || '').trim(),
    'x-client-secret': String(process.env.CASHFREE_SECRET_KEY || '').trim(),
    'x-api-version': getCashfreeApiVersion(),
    'Content-Type': 'application/json',
  };

  if (!headers['x-client-id'] || !headers['x-client-secret']) {
    throw new Error('Missing Cashfree credentials for raw request fallback');
  }

  console.log('Cashfree raw request URL:', url);
  console.log('Cashfree raw request payload:', JSON.stringify(payload, null, 2));

  const response = await axios.post(url, payload, {
    headers,
    timeout: 180000,
    validateStatus: () => true,
  });

  console.log('Cashfree raw response status:', response.status);
  console.log('Cashfree raw response body:', JSON.stringify(response.data, null, 2));

  if (response.status >= 200 && response.status < 300) {
    return {
      cfHeaders: response.headers,
      cfOrder: normalizeCashfreeOrderResponse(response.data),
    };
  }

  const rawError = new Error('Cashfree raw order creation failed');
  rawError.response = response;
  rawError.statusCode = response.status;
  rawError.details = response.data;
  throw rawError;
};

const fetchExistingCashfreeOrder = async (orderId) => {
  const config = getCashfreeConfig();
  const gateway = getCashfreeGateway();
  const existingOrder = await gateway.getOrder(config, orderId);
  return existingOrder;
};

const getCashfreeApiVersion = () => {
  const configuredVersion = String(process.env.CASHFREE_API_VERSION || '2022-09-01').trim();
  if (!SUPPORTED_API_VERSIONS.has(configuredVersion)) {
    console.warn(`⚠️ Unsupported CASHFREE_API_VERSION=${configuredVersion}; falling back to 2022-09-01`);
    return '2022-09-01';
  }
  return configuredVersion;
};

const getCashfreeConfig = () => {
  const env = String(process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
  const environment = env === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  const apiVersion = getCashfreeApiVersion();
  const clientId = String(process.env.CASHFREE_APP_ID || '').trim();
  const clientSecret = String(process.env.CASHFREE_SECRET_KEY || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error('Missing Cashfree credentials in environment variables');
  }

  return new CFConfig(environment, apiVersion, clientId, clientSecret, 180000);
};

const getCashfreeGateway = () => new CFPaymentGateway();

const sanitizePaymentMethods = (paymentMethods) => {
  if (!paymentMethods || typeof paymentMethods !== 'string') {
    return 'upi,nb,cc,dc,emi,paylater,app';
  }

  const normalized = paymentMethods
    .split(',')
    .map((method) => method.trim().toLowerCase())
    .filter(Boolean)
    .reduce((set, method) => {
      const mapped = {
        card: 'cc',
        creditcard: 'cc',
        debitcard: 'dc',
        netbanking: 'nb',
      }[method] || method;
      if (VALID_PAYMENT_METHODS.has(mapped)) {
        set.add(mapped);
      }
      return set;
    }, new Set());

  return Array.from(normalized).join(',') || 'upi,nb,cc,dc,emi,paylater,app';
};

const validateCashfreeOrderPayload = ({ orderId, totalAmount, customerEmail, customerPhone, customerName, notifyUrl, returnUrl }) => {
  if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
    throw new Error('Cashfree validation error: orderId is required and must be a non-empty string.');
  }

  if (totalAmount == null || Number.isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
    throw new Error('Cashfree validation error: totalAmount is required and must be a positive number.');
  }

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    throw new Error('Cashfree validation error: customerName is required and must be a non-empty string.');
  }

  if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.trim()) {
    throw new Error('Cashfree validation error: customerEmail is required and must be a non-empty string.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new Error('Cashfree validation error: customerEmail must be a valid email address.');
  }

  const normalizedPhone = normalizePhoneNumber(customerPhone);
  if (!normalizedPhone || normalizedPhone.length !== 10) {
    throw new Error(`Invalid customer phone number (${customerPhone}). A valid 10-digit Indian phone number is required.`);
  }

  if (!notifyUrl || typeof notifyUrl !== 'string' || !notifyUrl.trim()) {
    throw new Error('Cashfree validation error: notifyUrl is required and must be a non-empty string.');
  }

  if (!returnUrl || typeof returnUrl !== 'string' || !returnUrl.trim()) {
    throw new Error('Cashfree validation error: returnUrl is required and must be a non-empty string.');
  }
};

const buildCashfreeOrderRequest = ({ orderId, totalAmount, customerEmail, customerPhone, customerName, notifyUrl, returnUrl, paymentMethods = 'upi,nb,cc,dc,emi,paylater,app' }) => {
  const normalizedPhone = normalizePhoneNumber(customerPhone);
  validateCashfreeOrderPayload({ orderId, totalAmount, customerEmail, customerPhone: normalizedPhone, customerName, notifyUrl, returnUrl });

  const customerDetails = new CFCustomerDetails();
  customerDetails.customerId = String(orderId).trim();
  customerDetails.customerName = String(customerName).trim();
  customerDetails.customerEmail = String(customerEmail).trim();
  customerDetails.customerPhone = String(normalizedPhone).trim();

  const cfOrderRequest = new CFOrderRequest();
  cfOrderRequest.orderId = String(orderId).trim();
  cfOrderRequest.orderAmount = Number(totalAmount);
  cfOrderRequest.orderCurrency = 'INR';
  cfOrderRequest.customerDetails = customerDetails;

  const orderMeta = new CFOrderMeta();
  orderMeta.returnUrl = String(returnUrl).trim();
  orderMeta.notifyUrl = String(notifyUrl).trim();
  orderMeta.paymentMethods = sanitizePaymentMethods(paymentMethods);

  cfOrderRequest.orderMeta = orderMeta;
  return cfOrderRequest;
};

const createCashfreeOrder = async ({ orderId, totalAmount, customerName, customerEmail, customerPhone, notifyUrl, returnUrl, paymentMethods }) => {
  const normalizedPhone = normalizePhoneNumber(customerPhone);
  if (!normalizedPhone || normalizedPhone.length !== 10) {
    throw new Error(`Invalid customer phone number (${customerPhone}). A valid 10-digit Indian phone number is required.`);
  }

  console.log({
    customerName,
    customerEmail,
    customerPhone: normalizedPhone
  });

  const config = getCashfreeConfig();
  const gateway = getCashfreeGateway();
  const orderRequest = buildCashfreeOrderRequest({
    orderId,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone: normalizedPhone,
    notifyUrl,
    returnUrl,
    paymentMethods,
  });

  const idempotencyKey = `cf-${String(orderId).trim()}-${Date.now()}`;
  const requestID = `req-${String(orderId).trim()}-${Date.now()}`;

  console.log('Cashfree Config:', {
    environment: config.environment,
    apiVersion: config.apiVersion,
    clientId: config.clientId ? '****' : null,
    timeout: config.timeout,
  });
  console.log('Cashfree Gateway URL:', gateway.getURL(config.environment));
  console.log('Cashfree Request:', JSON.stringify(orderRequest, null, 2));

  try {
    const response = await gateway.orderCreate(config, orderRequest, {
      idempotencyKey,
      requestID,
    });
    console.log('Cashfree Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (err) {
    console.error('Cashfree orderCreate failed status:', err.response?.status || err.statusCode || 'N/A');
    console.error('Cashfree orderCreate failed data:', err.response?.data || err.body || err.details || 'N/A');
    console.error('Cashfree orderCreate failed message:', err.message);
    console.error('Cashfree orderCreate failed stack:', err.stack);

    const shouldFallback = err.response?.data?.code === 'request_failed' || err.statusCode === 500 || String(process.env.CASHFREE_ENV || '').toUpperCase() === 'SANDBOX';
    if (shouldFallback) {
      try {
        console.warn('Cashfree SDK failed, trying raw HTTP fallback.');
        const rawResponse = await createCashfreeOrderRaw({
          orderId,
          totalAmount,
          customerName,
          customerEmail,
          customerPhone,
          notifyUrl,
          returnUrl,
          paymentMethods,
        });
        console.log('Cashfree raw fallback response:', JSON.stringify(rawResponse, null, 2));
        return rawResponse;
      } catch (rawErr) {
        console.error('Cashfree raw fallback error status:', rawErr.response?.status || rawErr.statusCode || 'N/A');
        console.error('Cashfree raw fallback error data:', rawErr.response?.data || rawErr.details || 'N/A');
        console.error('Cashfree raw fallback error message:', rawErr.message);
        console.error('Cashfree raw fallback stack:', rawErr.stack);

        const isDuplicateOrder = rawErr.response?.status === 409 && rawErr.response?.data?.code === 'order_already_exists';
        if (isDuplicateOrder) {
          console.warn('Cashfree duplicate order conflict detected, fetching existing order.');
          try {
            const existingOrder = await fetchExistingCashfreeOrder(orderId);
            console.log('Cashfree existing order fetched successfully:', JSON.stringify(existingOrder, null, 2));
            return existingOrder;
          } catch (fetchErr) {
            console.error('Cashfree fetch existing order failed:', fetchErr.message || fetchErr);
          }
        }

        throw rawErr;
      }
    }

    throw err;
  }
};

const getPaymentStatus = async ({ orderId }) => {
  if (!orderId) {
    throw new Error('orderId is required to retrieve Cashfree payment status');
  }

  const config = getCashfreeConfig();
  const gateway = getCashfreeGateway();

  const orderResponse = await gateway.getOrder(config, orderId);
  const paymentsResponse = await gateway.getPaymentsForOrder(config, orderId);

  const cfOrder = orderResponse?.cfOrder || {};
  const payments = paymentsResponse?.cfPaymentsEntities || [];
  const successPayment = payments.find((payment) => String(payment.paymentStatus).toUpperCase() === 'SUCCESS');
  const isPaid = Boolean(successPayment || String(cfOrder.orderStatus || '').toUpperCase() === 'PAID');

  return {
    order: cfOrder,
    payments,
    successPayment,
    isPaid,
    status: cfOrder.orderStatus || (successPayment ? 'PAID' : 'PENDING'),
  };
};

const verifyCashfreePayment = async ({ orderId }) => {
  const status = await getPaymentStatus({ orderId });
  if (!status.isPaid) {
    return {
      success: false,
      message: `Cashfree order ${orderId} is not paid yet. Current status: ${status.status}`,
      status,
    };
  }

  return {
    success: true,
    message: 'Cashfree payment verified successfully.',
    status,
  };
};

const createPaymentSession = async (params) => {
  const response = await createCashfreeOrder(params);
  return {
    ...response,
    paymentUrl: response?.cfOrder?.paymentLink || null,
    orderToken: response?.cfOrder?.orderToken || null,
  };
};

const verifySignature = (rawBody, signature) => {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing CASHFREE_SECRET_KEY environment variable for webhook verification');
  }
  const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expectedSignature === signature;
};

module.exports = {
  getCashfreeConfig,
  getCashfreeGateway,
  buildCashfreeOrderRequest,
  createCashfreeOrder,
  createPaymentSession,
  verifyCashfreePayment,
  getPaymentStatus,
  verifySignature,
  normalizePhoneNumber,
};
