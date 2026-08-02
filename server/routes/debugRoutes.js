const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/sendEmail');

// Simple health check
router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Debug routes are available' });
});

// Send a test email via Brevo/SMTP using server-side config.
// POST /api/debug/send-test-email
// body: { to: 'recipient@example.com', subject: 'Test', text: 'Hello', html: '<b>Hello</b>' }
router.post('/send-test-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body || {};
    if (!to) return res.status(400).json({ success: false, message: 'Recipient `to` is required' });

    const ok = await sendEmail({ to: [String(to).trim()], subject: subject || 'Test Email from VibeForge', text: text || 'Test email', html: html || '<div>Test email</div>' });

    if (ok) return res.json({ success: true, message: 'Test email sent (or queued)' });
    return res.status(500).json({ success: false, message: 'Failed to send test email. Check server logs for details.' });
  } catch (err) {
    console.error('Debug send-test-email error:', err?.message || err);
    res.status(500).json({ success: false, message: err?.message || 'Internal error' });
  }
});

module.exports = router;
