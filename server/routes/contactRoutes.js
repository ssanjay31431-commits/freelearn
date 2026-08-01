const express = require('express');
const router = express.Router();
const { sendAdminNotification } = require('../utils/sendEmail');

let contactSubmissions = [];

router.post('/send', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please provide name, email, and message' });
  }

  const submission = {
    _id: 'inq_' + Date.now(),
    name,
    email,
    phone: phone || '',
    message,
    createdAt: new Date().toISOString(),
  };

  contactSubmissions.push(submission);

  // Send Email Notification to Admin (vibeforgemrs@gmail.com)
  await sendAdminNotification({
    subject: 'Contact Form Inquiry',
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    message,
  });

  return res.status(201).json({
    success: true,
    message: 'Your message has been sent directly to vibeforgemrs@gmail.com! Admin will contact you shortly.',
    data: submission,
  });
});

router.get('/all', (req, res) => {
  res.json(contactSubmissions);
});

module.exports = router;
