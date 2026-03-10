const express = require('express');
const { whatsappQuote } = require('../controllers/quoteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/whatsapp', protect, whatsappQuote);

module.exports = router;
