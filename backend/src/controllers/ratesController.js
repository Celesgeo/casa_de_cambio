const { fetchDolarBlue } = require('../services/quoteService');

// In-memory "our" rates (can be synced from market) - shared for quote controller
let ourRates = {
  USD: { compra: 980, venta: 1000 },
  lastUpdated: null
};
exports.ourRates = () => ourRates;
exports.setOurRates = (r) => { ourRates = r; };

// @route GET /api/rates/market
exports.getMarketRates = async (req, res, next) => {
  try {
    const data = await fetchDolarBlue();
    return res.json(data);
  } catch (error) {
    console.error('Market rates error:', error);
    next(error);
  }
};

// @route GET /api/rates/ours
exports.getOurRates = (req, res) => {
  return res.json(ourRates);
};

// @route POST /api/rates/sync
exports.syncOurRates = async (req, res, next) => {
  try {
    const data = await fetchDolarBlue();
    const nextRates = {
      USD: { compra: data.compra, venta: data.venta },
      lastUpdated: new Date().toISOString()
    };
    ourRates = nextRates;
    return res.json({ message: 'Rates updated', rates: ourRates });
  } catch (error) {
    console.error('Sync rates error:', error);
    next(error);
  }
};
