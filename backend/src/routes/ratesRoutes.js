const express = require('express');
const { getMarketRates, getOurRates, syncOurRates } = require('../controllers/ratesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
// Only require JWT when explicitly enabled (default: no auth for easier dev)
const useAuth = process.env.REQUIRE_AUTH === 'true';

const noop = (req, res, next) => next();
router.get('/market', getMarketRates);
router.get('/ours', useAuth ? protect : noop, getOurRates);
router.post('/sync', useAuth ? protect : noop, syncOurRates);

module.exports = router;
