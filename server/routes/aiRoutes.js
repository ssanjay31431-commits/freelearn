const express = require('express');
const router = express.Router();
const { handleAIChat } = require('../controllers/aiController');

router.post('/chat', handleAIChat);

module.exports = router;
