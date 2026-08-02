const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/sendEmail');

// Security: require a secret header to avoid abuse in production.
// Set DEBUG_EMAIL_SECRET in your environment and pass it in header 'x-debug-secret'.
router.post('/send-test', async (req, res) => {
  try {
    const provided = req.headers['x-debug-secret'] || req.query.debug_secret;
    if (process.env.DEBUG_EMAIL_SECRET && (!provided || provided !== process.env.DEBUG_EMAIL_SECRET)) {
      return res.status(403).json({ success: false, message: 'Missing or invalid debug secret' });
    }

    const { to, subject, text, html } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Missing `to` email address in body' });

    const ok = await sendEmail({ to: Array.isArray(to) ? to : [to], subject: subject || 'VibeForge Test Email', text: text || 'This is a test email from VibeForge', html: html || `<div><p>This is a test email from VibeForge</p></div>` });

    if (ok) return res.json({ success: true, message: 'Test email sent (or delivery accepted by provider).' });
    return res.status(500).json({ success: false, message: 'Email send failed. Check server logs for details.' });
  } catch (err) {
    console.error('Debug send-test error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
