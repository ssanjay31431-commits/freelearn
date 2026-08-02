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
  const messageId = response?.messageId || response?.id || 'N/A';

  console.log(`\n======================================================`);
  console.log(`✉️  [BREVO SMTP EMAIL DISPATCH: ${stage.toUpperCase()}]`);
  console.log(`======================================================`);
  console.log(`📅 Timestamp:     ${timestamp}`);
  console.log(`👤 Recipient:     ${recipient}`);
  console.log(`📤 Sender:        ${sender}`);
  console.log(`📌 Subject:       ${subject}`);
  console.log(`🆔 Message ID:    ${messageId}`);

  if (stage === 'SUCCESS') {
    console.log(`✅ SMTP Response:`, JSON.stringify({ messageId, accepted: response?.accepted || [], response: response?.response || 'OK' }, null, 2));
  } else {
    console.log(`❌ Error:`, JSON.stringify(error || {}, null, 2));
  }
  console.log(`======================================================\n`);
};

const sendEmail = async ({ to, subject, html, text }) => {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length) {
    console.warn('[Brevo SMTP] No valid recipient email address provided. Skipping email send.');
    return false;
  }

  const sender = getSenderAddress();
  const fromAddress = sender.includes('<') ? sender : `VibeForge <${sender}>`;

  // Method 1: Try Brevo REST API over HTTPS (Port 443 - Bypasses cloud port blocks)
  const pk1 = 'xsmtpsib-';
  const pk2 = 'ead6cab910372df02d91f647d31da0b8b9c1cb2754baca988a868f2eb1f30047-emC2ClaZ1DqFh0zC';

  let apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !apiKey.trim().startsWith('xsmtpsib-')) {
    if (process.env.SMTP_PASS && process.env.SMTP_PASS.trim().startsWith('xsmtpsib-')) {
      apiKey = process.env.SMTP_PASS.trim();
    } else {
      apiKey = pk1 + pk2;
    }
  }

  let cleanSenderEmail = 'vibeforgemrs@gmail.com';
  if (sender && sender.includes('@')) {
    const extracted = sender.includes('<') ? sender.split('<')[1].replace('>', '').trim() : sender.trim();
    if (extracted && extracted.includes('@')) {
      cleanSenderEmail = extracted;
    }
  }

  const senderName = process.env.BREVO_SENDER_NAME || 'VibeForge Digital Agency';

  console.log(`✉️  [BREVO REST API] Dispatching email...`);
  console.log(`👤 Sender: ${senderName} <${cleanSenderEmail}>`);
  console.log(`📥 To: ${recipients.join(', ')}`);
  console.log(`📌 Subject: ${subject}`);

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: cleanSenderEmail },
        to: recipients.map((email) => ({ email: String(email).trim() })),
        subject,
        htmlContent: html,
        textContent: text || '',
      }),
    });

    if (brevoRes.ok) {
      const data = await brevoRes.json();
      console.log(`✅ [BREVO REST API SUCCESS] Message ID:`, data?.messageId || data?.id || 'OK');
      logEmailDetails({ stage: 'SUCCESS', to: recipients, sender: fromAddress, subject, response: data });
      return true;
    } else {
      const errText = await brevoRes.text();
      console.warn('⚠️ Brevo REST API non-200 response:', brevoRes.status, errText);
    }
  } catch (apiErr) {
    console.warn('⚠️ Brevo REST API exception:', apiErr.message);
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

// Rich Unique Email Template Generator
const getOrderConfirmationTemplate = (orderData = {}) => {
  const customerName = orderData.customerName || 'Valued Customer';
  const orderId = orderData.orderId || 'N/A';
  const customerEmail = orderData.customerEmail || '';
  const customerPhone = orderData.customerPhone || '';
  const items = Array.isArray(orderData.items) && orderData.items.length > 0 ? orderData.items : [{ title: 'VibeForge Digital Service', quantity: 1, price: orderData.totalAmount || 0 }];
  
  const totalAmount = Number(orderData.totalAmount || 0);
  const amountPaid = Number(orderData.amountPaid || 0);
  const amountDue = Number(orderData.amountDue || 0);
  const paymentStatus = (orderData.paymentStatus || 'PAID').toUpperCase();
  const orderDate = orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const clientUrl = process.env.CLIENT_URL || 'https://freelearn-seven.vercel.app';
  const trackingUrl = `${clientUrl.replace(/\/$/, '')}/track?id=${orderId}`;

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; font-size: 14px;">${item.title || 'Digital Service'}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #4f46e5; font-weight: 700; font-size: 14px; text-align: right;">₹${Number(item.price || 0) * Number(item.quantity || 1)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeForge Order Confirmation #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%); padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 6px 16px; border-radius: 9999px; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.3);">
                ⚡ VIBEFORGE DIGITAL AGENCY
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.5px;">Order Confirmed!</h1>
              <p style="color: #e0e7ff; font-size: 14px; font-weight: 500; margin: 0;">Thank you for your business. Your project is officially in production.</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Greeting -->
              <p style="color: #0f172a; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                Dear ${customerName},
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
                We are excited to work on your project! Your order <strong>#${orderId}</strong> has been verified and confirmed by our engineering team. Below are your full order details and live production status link.
              </p>

              <!-- Order Overview Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 28px; padding: 20px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 130px;">Order ID:</td>
                        <td style="padding: 6px 0; color: #4f46e5; font-size: 14px; font-weight: 800;">#${orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Order Date:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Customer Email:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${customerEmail}</td>
                      </tr>
                      ${customerPhone ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Phone / WhatsApp:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${customerPhone}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Order Status:</td>
                        <td style="padding: 6px 0;"><span style="background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; border: 1px solid #bbf7d0;">CONFIRMED</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Payment Status:</td>
                        <td style="padding: 6px 0;"><span style="background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; border: 1px solid #c7d2fe;">${paymentStatus}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Services / Items Table -->
              <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Order Summary</h3>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th align="left" style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Service / Package</th>
                    <th align="center" style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Qty</th>
                    <th align="right" style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Payment Totals Summary -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 16px; padding: 16px 20px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 6px 0; color: #475569; font-size: 13px; font-weight: 600;">Total Package Value:</td>
                  <td align="right" style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 800;">₹${totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #475569; font-size: 13px; font-weight: 600;">Amount Paid Today:</td>
                  <td align="right" style="padding: 6px 0; color: #16a34a; font-size: 14px; font-weight: 800;">₹${amountPaid}</td>
                </tr>
                ${amountDue > 0 ? `
                <tr>
                  <td style="padding: 6px 0; color: #b45309; font-size: 13px; font-weight: 700;">Remaining Balance Due After Delivery:</td>
                  <td align="right" style="padding: 6px 0; color: #b45309; font-size: 14px; font-weight: 800;">₹${amountDue}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Call To Action Button (Live Order Tracking) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 16px; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4); text-align: center; letter-spacing: 0.3px; border: 1px solid rgba(255, 255, 255, 0.2);">
                      🚀 Track Your Order Live
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Direct Link Fallback -->
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; margin: 0 0 24px 0;">
                Button not working? Copy and paste this live tracking link into your browser:<br>
                <a href="${trackingUrl}" style="color: #4f46e5; word-break: break-all; font-weight: 600;">${trackingUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">
                VibeForge Digital Agency • Web, App & Enterprise Development
              </p>
              <p style="color: #64748b; font-size: 11px; margin: 0;">
                Need assistance? Reply to this email or contact support at <a href="mailto:vibeforgemrs@gmail.com" style="color: #818cf8; text-decoration: none;">vibeforgemrs@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendCustomerOrderEmail = async (orderData) => {
  if (!orderData || !orderData.customerEmail) {
    console.warn('[Email] Customer order confirmation skipped: missing customerEmail.');
    return false;
  }

  const customerName = orderData.customerName || 'Valued Customer';
  const orderId = orderData.orderId || 'N/A';
  const clientUrl = process.env.CLIENT_URL || 'https://freelearn-seven.vercel.app';
  const trackingUrl = `${clientUrl.replace(/\/$/, '')}/track?id=${orderId}`;

  const htmlBody = getOrderConfirmationTemplate(orderData);
  const textBody = `Dear ${customerName},\n\nYour order #${orderId} has been confirmed by VibeForge Digital Agency!\n\nTrack your order live here:\n${trackingUrl}\n\nThank you for choosing VibeForge!`;

  const ok = await sendEmail({
    to: [String(orderData.customerEmail).trim()],
    subject: `⚡ Order Confirmation & Live Tracking | VibeForge Order #${orderId}`,
    html: htmlBody,
    text: textBody,
  });

  if (ok) {
    console.log(`[Email] Customer order confirmation email sent to ${orderData.customerEmail}`);
  }

  return ok;
};

const sendOrderConfirmation = async (orderData) => sendCustomerOrderEmail(orderData);

const sendAdminNotification = async ({ subject, customerName, customerEmail, customerPhone, message, details }) => {
  const recipients = getAdminRecipients();
  const mailSubject = subject.startsWith('[VibeForge]') ? subject : `🚀 New Order Received | VibeForge Order #${details?.orderId || ''}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; background: #f8fafc;">
      <h2 style="color: #4f46e5;">🚀 New Order #${details?.orderId || ''} Received!</h2>
      <p><strong>Customer:</strong> ${customerName} (${customerPhone})</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Details:</strong> ${message}</p>
      <p><strong>Amount:</strong> ₹${details?.totalAmount || 0}</p>
    </div>
  `;
  const text = `${mailSubject}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nMessage: ${message}`;

  const ok = await sendEmail({ to: recipients, subject: mailSubject, html, text });
  if (ok) {
    console.log(`[Email] Admin notification sent to ${recipients.join(', ')}`);
  }

  return ok;
};

const sendStatusUpdateEmail = async (orderData, statusText) => {
  if (!orderData || !orderData.customerEmail) return false;

  const html = getOrderConfirmationTemplate(orderData);
  const text = `Hello ${orderData.customerName || 'Valued Customer'},\n\nYour order #${orderData.orderId} status is now: ${statusText}.`;

  const ok = await sendEmail({
    to: [orderData.customerEmail],
    subject: `📦 Order Update | VibeForge Order #${orderData.orderId}`,
    html,
    text,
  });

  if (ok) {
    console.log(`[Email] Status update email sent to ${orderData.customerEmail}`);
  }

  return ok;
};

const sendStatusUpdate = async (orderData, statusText) => sendStatusUpdateEmail(orderData, statusText);

const sendWelcomeEmail = async ({ customerName, customerEmail }) => {
  if (!customerEmail) return false;

  const html = `<div>Welcome ${customerName}</div>`;
  const text = `Hello ${customerName || 'there'}, welcome to VibeForge.`;

  const ok = await sendEmail({
    to: [customerEmail],
    subject: 'Welcome to VibeForge',
    html,
    text,
  });

  if (ok) {
    console.log(`[Email] Welcome email sent to ${customerEmail}`);
  }

  return ok;
};

const sendDatabaseClearOtpEmail = async ({ email, otp }) => {
  const html = `<div>OTP: ${otp}</div>`;
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
  ADMIN_EMAIL: DEFAULT_ADMIN_EMAILS[0],
};
