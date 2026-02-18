const express = require('express');
const { whatsappQuote } = require('../controllers/quoteController');

const router = express.Router();
router.get('/whatsapp', whatsappQuote);

module.exports = router;
