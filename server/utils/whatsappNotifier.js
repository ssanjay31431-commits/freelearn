/**
 * WhatsApp Notification Utility for VibeForge Digital Agency
 * Supports WhatsApp Cloud API integration with console fallback log.
 */

const sendWhatsAppMessage = async ({ phone, customerName, orderId, statusTimeline, customMessage }) => {
  try {
    const formattedPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const messageText = customMessage || `Hello ${customerName}, your VibeForge Order #${orderId} status has been updated to: *${statusTimeline}*. Thank you for choosing VibeForge Digital Agency! 🚀`;

    console.log(`\n💬 [WHATSAPP DISPATCH] To: ${formattedPhone || 'Customer'}`);
    console.log(`Content: ${messageText}`);

    // If WhatsApp Cloud API credentials exist in environment
    if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      const axios = require('axios');
      await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: messageText }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    return true;
  } catch (error) {
    console.error('WhatsApp notification error:', error.message);
    return false;
  }
};

module.exports = { sendWhatsAppMessage };
