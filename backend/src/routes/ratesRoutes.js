const express = require('express');
const { getMarketRates, getFinanzasArgyRates, getOurRates, syncOurRates } = require('../controllers/ratesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/market', getMarketRates);
router.get('/finanzasargy', getFinanzasArgyRates);
router.get('/ours', protect, getOurRates);
router.post('/sync', protect, syncOurRates);

module.exports = router;
