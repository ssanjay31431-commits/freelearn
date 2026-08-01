const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const DEFAULT_ADMIN_EMAILS = ['vibeforgemrs@gmail.com', 'ssanjay31431@gmail.com'];

const getSenderAddress = () => {
  if (process.env.FROM_EMAIL && process.env.FROM_EMAIL.trim()) {
    return process.env.FROM_EMAIL.trim();
  }
  return 'orders@vibeforge.com';
};

const getAdminRecipients = () => {
  const configured = [process.env.ADMIN_EMAIL, process.env.NOTIFICATION_EMAIL]
    .filter(Boolean)
    .map((e) => String(e).trim());
  return configured.length ? configured : DEFAULT_ADMIN_EMAILS;
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const logEmailDetails = ({ stage, to, sender, subject, response, error }) => {
  const timestamp = new Date().toISOString();
  const recipient = Array.isArray(to) ? to.join(', ') : String(to || '');
  const messageId = response?.messageId || response?.response || 'N/A';

  console.log(`\n======================================================`);
  console.log(`✉️  [BREVO SMTP EMAIL DISPATCH: ${stage.toUpperCase()}]`);
  console.log(`======================================================`);
  console.log(`📅 Timestamp:     ${timestamp}`);
  console.log(`👤 Recipient:     ${recipient}`);
  console.log(`📤 Sender:        ${sender}`);
  console.log(`📌 Subject:       ${subject}`);
  console.log(`🆔 Message ID:    ${messageId}`);

  if (stage === 'SUCCESS') {
    console.log(`✅ SMTP Response:`, JSON.stringify({ messageId: infoMessageId(response), accepted: response?.accepted || [], response: response?.response || '' }, null, 2));
  } else {
    console.log(`❌ Error:`, JSON.stringify(error || {}, null, 2));
  }
  console.log(`======================================================\n`);
};

function infoMessageId(resp) {
  return resp?.messageId || resp?.id || 'N/A';
}

const sendEmail = async ({ to, subject, html, text }) => {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length) {
    console.warn('[Brevo SMTP] No valid recipient email address provided. Skipping email send.');
    return false;
  }

  const sender = getSenderAddress();
  const fromAddress = sender.includes('<') ? sender : `VibeForge <${sender}>`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[Brevo SMTP] SMTP_USER or SMTP_PASS is missing in environment variables.');
    return false;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: fromAddress,
      to: recipients,
      subject,
      html,
      text: text || '',
    };

    const info = await transporter.sendMail(mailOptions);

    if (info && (info.messageId || info.accepted?.length)) {
      logEmailDetails({ stage: 'SUCCESS', to: recipients, sender: fromAddress, subject, response: info });
      return true;
    }

    logEmailDetails({ stage: 'FAILED', to: recipients, sender: fromAddress, subject, response: info, error: { message: 'No accepted recipients returned by Brevo SMTP' } });
    return false;
  } catch (error) {
    logEmailDetails({
      stage: 'EXCEPTION',
      to: recipients,
      sender: fromAddress,
      subject,
      error: { message: error.message, code: error.code, command: error.command },
    });
    return false;
  }
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getBrandMeta = () => ({
  name: 'VibeForge Digital Agency',
  primary: '#4f46e5',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  dark: '#0f172a',
  light: '#f8fafc',
  supportEmail: process.env.ADMIN_EMAIL || 'vibeforgemrs@gmail.com',
  whatsappLink: process.env.WHATSAPP_LINK || 'https://wa.me/919876543210',
});

const getOrderConfirmationTemplate = (orderData = {}) => {
  const brand = getBrandMeta();
  const trackingUrl = `https://vibeforge.netlify.app/track?id=${orderData.orderId || 'ORDER'}`;
  const serviceName = orderData.items?.map((item) => item.title).join(', ') || orderData.serviceName || 'VibeForge Service';
  const packageName = orderData.packageName || orderData.packageSelected || 'Premium Package';
  const customerName = orderData.customerName || 'Valued Customer';
  const orderId = orderData.orderId || 'N/A';
  const currentStatus = orderData.statusTimeline || 'Order Received';
  const estimatedDelivery = orderData.estimatedDeliveryDate || orderData.deliveryDate || 'To be confirmed';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmed | VibeForge</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f6ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6ff;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.10);">
                <tr>
                  <td style="background:linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%);padding:30px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left">
                          <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.16);">
                            <span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#ffffff;color:${brand.primary};font-weight:700;font-size:16px;text-align:center;line-height:36px;">VF</span>
                            <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.4px;">VibeForge</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:18px;">
                          <div style="font-size:30px;font-weight:700;color:#ffffff;margin:0 0 6px;">Order confirmed 🎉</div>
                          <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);margin:0;">Thank you for trusting VibeForge Digital Agency. Your project is now officially in motion.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <div style="font-size:20px;font-weight:700;color:${brand.dark};margin:0 0 8px;">Hello ${customerName},</div>
                    <div style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 20px;">We have received your order and created a polished experience for your next digital launch. Below is a quick snapshot of your booking.</div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:0;">
                      <tr>
                        <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;">
                          <div style="font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:8px;">Order Summary</div>
                          <div style="font-size:22px;font-weight:700;color:${brand.dark};">#${orderId}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:18px 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Service</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${serviceName}</div>
                              </td>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Package</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${packageName}</div>
                              </td>
                            </tr>
                            <tr>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Price</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${formatCurrency(orderData.totalAmount || 0)}</div>
                              </td>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Payment Status</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${orderData.paymentStatus || 'Advance Paid'}</div>
                              </td>
                            </tr>
                            <tr>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Advance Paid</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${formatCurrency(orderData.amountPaid || 0)}</div>
                              </td>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Estimated Delivery</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${estimatedDelivery}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;background:linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(7,182,212,0.10) 100%);border:1px solid #dbeafe;border-radius:16px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4f46e5;margin-bottom:8px;">Current Status</div>
                          <div style="font-size:18px;font-weight:700;color:${brand.dark};margin-bottom:10px;">${currentStatus}</div>
                          <div style="font-size:14px;line-height:1.6;color:#475569;">Our team will keep you updated at every milestone so you always know what is happening next.</div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td align="center">
                          <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 24px;border-radius:999px;">Track Order</a>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-top:1px solid #e2e8f0;padding-top:18px;">
                      <tr>
                        <td style="font-size:14px;line-height:1.7;color:#64748b;">
                          Need help? Reach our team at <a href="mailto:${brand.supportEmail}" style="color:${brand.primary};text-decoration:none;font-weight:700;">${brand.supportEmail}</a> or <a href="${brand.whatsappLink}" style="color:${brand.primary};text-decoration:none;font-weight:700;">WhatsApp us</a>.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#0f172a;padding:24px 28px;color:#cbd5e1;text-align:center;font-size:13px;line-height:1.6;">
                    <div style="font-weight:700;color:#ffffff;margin-bottom:6px;">VibeForge Digital Agency</div>
                    <div>© 2026 VibeForge. All rights reserved.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const getStatusUpdateTemplate = (orderData = {}, statusText = 'Updated') => {
  const brand = getBrandMeta();
  const trackingUrl = `https://vibeforge.netlify.app/track?id=${orderData.orderId || 'ORDER'}`;
  const currentStatus = statusText || orderData.statusTimeline || 'Updated';
  const steps = [
    { label: 'Order Received', active: ['Order Received', 'Pending', 'Planning', 'Designing', 'Development', 'Testing', 'Review', 'Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Planning', active: ['Planning', 'Designing', 'Development', 'Testing', 'Review', 'Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Designing', active: ['Designing', 'Development', 'Testing', 'Review', 'Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Development', active: ['Development', 'Testing', 'Review', 'Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Testing', active: ['Testing', 'Review', 'Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Review', active: ['Review', 'Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Completed', active: ['Completed', 'Delivered'].includes(currentStatus) },
    { label: 'Delivered', active: currentStatus === 'Delivered' },
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Update | VibeForge</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f6ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6ff;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.10);">
                <tr>
                  <td style="background:linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%);padding:30px 28px;">
                    <div style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px;">Project status updated</div>
                    <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);">Your order is now moving through the next milestone.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <div style="font-size:20px;font-weight:700;color:${brand.dark};margin:0 0 6px;">Order #${orderData.orderId || 'N/A'}</div>
                    <div style="font-size:15px;line-height:1.7;color:#475569;margin-bottom:18px;">The latest update from our team is now available. Your current state is highlighted below.</div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(7,182,212,0.10) 100%);border:1px solid #dbeafe;border-radius:16px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4f46e5;margin-bottom:8px;">Current Status</div>
                          <div style="font-size:20px;font-weight:700;color:${brand.dark};margin-bottom:6px;">${currentStatus}</div>
                          <div style="font-size:14px;line-height:1.6;color:#475569;">Expected delivery: ${orderData.estimatedDeliveryDate || orderData.deliveryDate || 'To be confirmed'}</div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td align="center">
                          <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 24px;border-radius:999px;">Track Order Live</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const getAdminNotificationTemplate = ({ subject, customerName, customerEmail, customerPhone, message, details }) => {
  const brand = getBrandMeta();
  const order = details || {};
  const serviceName = order.items?.map((item) => item.title).join(', ') || 'N/A';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Order Notification | VibeForge</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f6ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6ff;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.10);">
                <tr>
                  <td style="background:linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%);padding:30px 28px;">
                    <div style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px;">🚀 New order received</div>
                    <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);">A fresh client inquiry has arrived and needs your attention.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                      <tr>
                        <td style="padding:20px;">
                          <div style="font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:10px;">Customer Details</div>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Customer</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${customerName || order.customerName || 'N/A'}</div>
                              </td>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Email</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${customerEmail || order.customerEmail || 'N/A'}</div>
                              </td>
                            </tr>
                            <tr>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Phone</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${customerPhone || order.customerPhone || 'N/A'}</div>
                              </td>
                              <td width="50%" style="padding:8px 0;vertical-align:top;">
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.9px;margin-bottom:6px;">Order ID</div>
                                <div style="font-size:15px;font-weight:700;color:${brand.dark};">${order.orderId || 'N/A'}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;background:linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(7,182,212,0.10) 100%);border:1px solid #dbeafe;border-radius:16px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4f46e5;margin-bottom:8px;">Order Quick View</div>
                          <div style="font-size:15px;font-weight:700;color:${brand.dark};margin-bottom:6px;">${serviceName}</div>
                          <div style="font-size:14px;line-height:1.6;color:#475569;">Package: ${order.packageName || order.packageSelected || 'Standard'} &nbsp;&nbsp;•&nbsp;&nbsp;Amount: ${formatCurrency(order.totalAmount || 0)} &nbsp;&nbsp;•&nbsp;&nbsp;Payment: ${order.paymentStatus || 'Pending'} &nbsp;&nbsp;•&nbsp;&nbsp;Date: ${orderDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const sendCustomerOrderEmail = async (orderData) => {
  if (!orderData || !orderData.customerEmail) {
    console.warn('[Brevo SMTP] Customer order confirmation skipped: missing customerEmail.');
    return false;
  }

  const customerEmail = String(orderData.customerEmail).trim();
  const html = getOrderConfirmationTemplate(orderData);
  const text = `Hello ${orderData.customerName || 'Valued Customer'},\n\nYour order #${orderData.orderId} has been confirmed.\nTrack your order live: https://vibeforge.netlify.app/track?id=${orderData.orderId}`;

  const ok = await sendEmail({
    to: [customerEmail],
    subject: `🎉 Order Confirmed | VibeForge Order #${orderData.orderId || ''}`,
    html,
    text,
  });

  if (ok) {
    console.log(`[Brevo SMTP] Customer order confirmation email sent to ${customerEmail}`);
  }

  return ok;
};

const sendOrderConfirmation = async (orderData) => sendCustomerOrderEmail(orderData);

const sendAdminNotification = async ({ subject, customerName, customerEmail, customerPhone, message, details }) => {
  const recipients = getAdminRecipients();
  const mailSubject = subject.startsWith('[VibeForge]') ? subject : `🚀 New Order Received | VibeForge Order #${details?.orderId || ''}`;
  const html = getAdminNotificationTemplate({ subject: mailSubject, customerName, customerEmail, customerPhone, message, details });
  const text = `${mailSubject}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nMessage: ${message}`;

  const ok = await sendEmail({ to: recipients, subject: mailSubject, html, text });
  if (ok) {
    console.log(`[Brevo SMTP] Admin notification sent to ${recipients.join(', ')}`);
  }

  return ok;
};

const sendStatusUpdateEmail = async (orderData, statusText) => {
  if (!orderData || !orderData.customerEmail) return false;

  const html = getStatusUpdateTemplate(orderData, statusText);
  const text = `Hello ${orderData.customerName || 'Valued Customer'},\n\nYour order #${orderData.orderId} status is now: ${statusText}.`;

  const ok = await sendEmail({
    to: [orderData.customerEmail],
    subject: `📦 Order Update | VibeForge Order #${orderData.orderId}`,
    html,
    text,
  });

  if (ok) {
    console.log(`[Brevo SMTP] Status update email sent to ${orderData.customerEmail}`);
  }

  return ok;
};

const sendStatusUpdate = async (orderData, statusText) => sendStatusUpdateEmail(orderData, statusText);

const sendWelcomeEmail = async ({ customerName, customerEmail }) => {
  if (!customerEmail) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #4338ca, #6366f1); padding: 24px; border-radius: 12px; color: white;">
        <h2 style="margin: 0 0 8px;">Welcome to VibeForge</h2>
        <p style="margin: 0;">Thanks for joining us, ${customerName || 'there'}.</p>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px; margin-top: 16px; color: #0f172a;">
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p>We will keep you updated on your orders and projects.</p>
      </div>
    </div>
  `;
  const text = `Hello ${customerName || 'there'}, welcome to VibeForge. Your account has been created successfully.`;

  const ok = await sendEmail({
    to: [customerEmail],
    subject: 'Welcome to VibeForge',
    html,
    text,
  });

  if (ok) {
    console.log(`[Brevo SMTP] Welcome email sent to ${customerEmail}`);
  }

  return ok;
};

const sendDatabaseClearOtpEmail = async ({ email, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #dc2626;">⚠️ Database Purge Verification</h2>
      <p>Your OTP is:</p>
      <div style="font-size: 28px; letter-spacing: 6px; font-weight: bold; margin: 16px 0;">${otp}</div>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
  const text = `Database Purge OTP: ${otp}`;
  const recipients = getAdminRecipients();

  return sendEmail({
    to: recipients,
    subject: 'Database Purge OTP',
    html,
    text,
  });
};

module.exports = {
  sendEmail,
  sendAdminNotification,
  sendCustomerOrderEmail,
  sendOrderConfirmation,
  sendStatusUpdateEmail,
  sendStatusUpdate,
  sendWelcomeEmail,
  sendDatabaseClearOtpEmail,
  getOrderConfirmationTemplate,
  getStatusUpdateTemplate,
  getAdminNotificationTemplate,
  ADMIN_EMAIL: DEFAULT_ADMIN_EMAILS[0],
};
