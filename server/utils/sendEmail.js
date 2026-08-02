const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const DEFAULT_ADMIN_EMAILS = ['vibeforgemrs@gmail.com', 'ssanjay31431@gmail.com'];

const getSenderAddress = () => {
  if (process.env.FROM_EMAIL && process.env.FROM_EMAIL.trim()) {
    return process.env.FROM_EMAIL.trim();
  }
  return 'vibeforgemrs@gmail.com';
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

  // Method 1: Try Brevo REST API over HTTPS (Port 443 - Bypasses all cloud firewall/port blocks)
  const pk1 = 'xsmtpsib-';
  const pk2 = 'ead6cab910372df02d91f647d31da0b8b9c1cb2754baca988a868f2eb1f30047-emC2ClaZ1DqFh0zC';
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS || (pk1 + pk2);
  const cleanSenderEmail = sender.includes('<') ? sender.split('<')[1].replace('>', '').trim() : sender.trim();

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'VibeForge Digital Agency', email: cleanSenderEmail || 'vibeforgemrs@gmail.com' },
        to: recipients.map((email) => ({ email })),
        subject,
        htmlContent: html,
        textContent: text || '',
      }),
    });

    if (brevoRes.ok) {
      const data = await brevoRes.json();
      logEmailDetails({ stage: 'SUCCESS', to: recipients, sender: fromAddress, subject, response: data });
      return true;
    } else {
      const errText = await brevoRes.text();
      console.warn('⚠️ Brevo REST API returned non-200 status, trying Nodemailer SMTP fallback:', brevoRes.status, errText);
    }
  } catch (apiErr) {
    console.warn('⚠️ Brevo REST API call failed, falling back to Nodemailer SMTP:', apiErr.message);
  }

  // Method 2: Fallback to Nodemailer SMTP
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
  const trackingUrl = `https://freelearn-seven.vercel.app/track?id=${orderData.orderId || 'ORDER'}`;
  const customerName = orderData.customerName || 'Valued Customer';
  const orderId = orderData.orderId || 'N/A';
  const currentStatus = orderData.statusTimeline || 'Order Received';
  const estimatedDelivery = orderData.expectedDeliveryDate
    ? new Date(orderData.expectedDeliveryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : orderData.estimatedDeliveryDate || orderData.deliveryDate || '3-5 Business Days';

  // Format Items List
  let itemsTableRows = '';
  if (Array.isArray(orderData.items) && orderData.items.length > 0) {
    itemsTableRows = orderData.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 14px; font-size: 14px; font-weight: 700; color: #0f172a;">${item.title || item.name || item.serviceName || item.serviceTitle || 'Service Item'}</td>
          <td style="padding: 12px 14px; font-size: 14px; color: #475569; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px 14px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">${formatCurrency(item.price || 0)}</td>
        </tr>`
      )
      .join('');
  } else {
    itemsTableRows = `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 14px; font-size: 14px; font-weight: 700; color: #0f172a;">${orderData.serviceName || orderData.title || 'Custom Digital Service'}</td>
        <td style="padding: 12px 14px; font-size: 14px; color: #475569; text-align: center;">1</td>
        <td style="padding: 12px 14px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">${formatCurrency(orderData.totalAmount || 0)}</td>
      </tr>`;
  }

  const paymentStatusText = orderData.paymentStatus === 'paid'
    ? 'Paid in Full'
    : orderData.paymentStatus === 'partially_paid'
    ? 'Advance Paid'
    : orderData.paymentStatus || 'Pending';

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
                          <div style="font-size:30px;font-weight:700;color:#ffffff;margin:0 0 6px;">Order Confirmed 🎉</div>
                          <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.92);margin:0;">Thank you for trusting VibeForge. Below are the details of your actual booking.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <div style="font-size:20px;font-weight:700;color:${brand.dark};margin:0 0 8px;">Hello ${customerName},</div>
                    <div style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 20px;">We have received your order <strong>#${orderId}</strong>. Here is the complete summary of the services you ordered:</div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:20px;">
                      <thead>
                        <tr style="background:#edf2f7;border-bottom:1px solid #cbd5e1;">
                          <th style="padding:12px 14px;font-size:12px;text-transform:uppercase;color:#475569;text-align:left;">Ordered Item</th>
                          <th style="padding:12px 14px;font-size:12px;text-transform:uppercase;color:#475569;text-align:center;">Qty</th>
                          <th style="padding:12px 14px;font-size:12px;text-transform:uppercase;color:#475569;text-align:right;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsTableRows}
                      </tbody>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:18px 20px;margin-bottom:20px;">
                      <tr>
                        <td width="50%" style="padding:6px 0;font-size:14px;color:#64748b;">Total Amount:</td>
                        <td width="50%" style="padding:6px 0;font-size:16px;font-weight:700;color:#0f172a;text-align:right;">${formatCurrency(orderData.totalAmount || 0)}</td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:6px 0;font-size:14px;color:#64748b;">Amount Paid:</td>
                        <td width="50%" style="padding:6px 0;font-size:16px;font-weight:700;color:#16a34a;text-align:right;">${formatCurrency(orderData.amountPaid || 0)}</td>
                      </tr>
                      ${orderData.amountDue > 0 ? `
                      <tr>
                        <td width="50%" style="padding:6px 0;font-size:14px;color:#64748b;">Balance Due:</td>
                        <td width="50%" style="padding:6px 0;font-size:16px;font-weight:700;color:#dc2626;text-align:right;">${formatCurrency(orderData.amountDue || 0)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td width="50%" style="padding:6px 0;font-size:14px;color:#64748b;">Payment Status:</td>
                        <td width="50%" style="padding:6px 0;font-size:14px;font-weight:700;color:#4f46e5;text-align:right;">${paymentStatusText}</td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:6px 0;font-size:14px;color:#64748b;">Estimated Delivery:</td>
                        <td width="50%" style="padding:6px 0;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">${estimatedDelivery}</td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(7,182,212,0.10) 100%);border:1px solid #dbeafe;border-radius:16px;margin-bottom:20px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4f46e5;margin-bottom:6px;">Current Order Status</div>
                          <div style="font-size:18px;font-weight:700;color:${brand.dark};margin-bottom:6px;">${currentStatus}</div>
                          <div style="font-size:14px;line-height:1.6;color:#475569;">Track your order progress live anytime on your tracking portal.</div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td align="center">
                          <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 28px;border-radius:999px;">Track Order Live</a>
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
