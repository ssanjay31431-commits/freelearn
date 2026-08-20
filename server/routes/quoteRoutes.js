const express = require('express');
const router = express.Router();
const { createQuoteRequest, getQuotes } = require('../controllers/quoteController');

router.post('/', createQuoteRequest);
router.get('/', getQuotes);

module.exports = router;
