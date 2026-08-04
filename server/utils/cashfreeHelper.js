const crypto = require('crypto');
const { CFConfig, CFPaymentGateway, CFEnvironment, CFOrderRequest, CFCustomerDetails, CFOrderMeta } = require('cashfree-pg-sdk-nodejs');

const getCashfreeConfig = () => {
  const env = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
  const environment = env === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  const apiVersion = process.env.CASHFREE_API_VERSION || '2022-09-01';
  const clientId = process.env.CASHFREE_APP_ID;
  const clientSecret = process.env.CASHFREE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Cashfree credentials in environment variables');
  }

  return new CFConfig(environment, apiVersion, clientId, clientSecret, 180000);
};

const getCashfreeGateway = () => new CFPaymentGateway();

const normalizePaymentMethods = (paymentMethods) => {
  if (!paymentMethods || typeof paymentMethods !== 'string') {
    return 'upi,nb,cc,dc,emi,paylater,app';
  }

  const mapping = {
    card: 'cc',
    dc: 'dc',
    creditcard: 'cc',
    debitcard: 'dc',
    upi: 'upi',
    netbanking: 'nb',
    emi: 'emi',
    paylater: 'paylater',
    app: 'app',
    paypal: 'paypal',
    ppc: 'ppc',
    ccc: 'ccc',
    applepay: 'applepay',
  };

  return paymentMethods
    .split(',')
    .map((method) => method.trim().toLowerCase())
    .filter(Boolean)
    .map((method) => mapping[method] || method)
    .filter((method, index, arr) => method && arr.indexOf(method) === index)
    .join(',') || 'upi,nb,cc,dc,emi,paylater,app';
};

const buildCashfreeOrderRequest = ({ orderId, totalAmount, customerEmail, customerPhone, customerName, notifyUrl, returnUrl, paymentMethods = 'upi,nb,cc,dc,emi,paylater,app' }) => {
  const customerDetails = new CFCustomerDetails();
  customerDetails.customerId = orderId;
  customerDetails.customerName = customerName;
  customerDetails.customerEmail = customerEmail;
  customerDetails.customerPhone = customerPhone;

  const cfOrderRequest = new CFOrderRequest();
  cfOrderRequest.orderId = orderId;
  cfOrderRequest.orderAmount = totalAmount;
  cfOrderRequest.orderCurrency = 'INR';
  cfOrderRequest.customerDetails = customerDetails;

  const orderMeta = new CFOrderMeta();
  orderMeta.returnUrl = returnUrl;
  orderMeta.notifyUrl = notifyUrl;
  orderMeta.paymentMethods = normalizePaymentMethods(paymentMethods);

  cfOrderRequest.orderMeta = orderMeta;
  return cfOrderRequest;
};

const createCashfreeOrder = async ({ orderId, totalAmount, customerName, customerEmail, customerPhone, notifyUrl, returnUrl, paymentMethods }) => {
  const config = getCashfreeConfig();
  const gateway = getCashfreeGateway();
  const orderRequest = buildCashfreeOrderRequest({
    orderId,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    notifyUrl,
    returnUrl,
    paymentMethods,
  });

  const response = await gateway.orderCreate(config, orderRequest);
  return response;
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
};
