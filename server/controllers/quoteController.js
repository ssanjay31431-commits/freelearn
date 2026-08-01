const CustomQuote = require('../models/CustomQuote');

const mockQuotes = [];

const createQuoteRequest = async (req, res) => {
  try {
    const { name, email, phone, serviceType, budget, expectedDelivery, projectDetails, referenceFileUrl } = req.body;

    const quoteData = {
      name,
      email,
      phone,
      serviceType,
      budget,
      expectedDelivery,
      projectDetails,
      referenceFileUrl: referenceFileUrl || '',
      status: 'Pending',
      createdAt: new Date(),
    };

    try {
      const newQuote = await CustomQuote.create(quoteData);
      return res.status(201).json(newQuote);
    } catch (err) {
      mockQuotes.push(quoteData);
      return res.status(201).json(quoteData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit quote request' });
  }
};

const getQuotes = async (req, res) => {
  try {
    const quotes = await CustomQuote.find().sort({ createdAt: -1 });
    if (quotes.length > 0) return res.json(quotes);
  } catch (err) {}
  res.json(mockQuotes);
};

module.exports = { createQuoteRequest, getQuotes, mockQuotes };
