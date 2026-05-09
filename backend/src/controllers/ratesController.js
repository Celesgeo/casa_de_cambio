const { fetchDolarBlue, fetchFinanzasArgy } = require('../services/quoteService');
const RateSettings = require('../models/RateSettings');

const DEFAULT_RATES = {
  USD: { compra: 980, venta: 1000 },
  lastUpdated: null
};

const normalizeRates = (doc) => ({
  USD: {
    compra: Number(doc?.USD?.compra) || DEFAULT_RATES.USD.compra,
    venta: Number(doc?.USD?.venta) || DEFAULT_RATES.USD.venta
  },
  lastUpdated: doc?.lastUpdated ? new Date(doc.lastUpdated).toISOString() : null
});

async function getOrCreateRates(companyId) {
  const cid = String(companyId || '').trim();
  if (!cid) return DEFAULT_RATES;

  let settings = await RateSettings.findOne({ companyId: cid });
  if (!settings) {
    settings = await RateSettings.create({
      companyId: cid,
      USD: DEFAULT_RATES.USD,
      lastUpdated: null
    });
  }
  return normalizeRates(settings);
}

exports.getOurRatesForCompany = getOrCreateRates;

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

// @route GET /api/rates/finanzasargy
exports.getFinanzasArgyRates = async (req, res, next) => {
  try {
    const data = await fetchFinanzasArgy();
    return res.json(data);
  } catch (error) {
    console.error('FinanzasArgy rates error:', error);
    next(error);
  }
};

// @route GET /api/rates/ours
exports.getOurRates = async (req, res, next) => {
  try {
    const rates = await getOrCreateRates(req.user?.companyId);
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    return res.json(rates);
  } catch (error) {
    console.error('Get our rates error:', error);
    next(error);
  }
};

// @route POST /api/rates/sync
exports.syncOurRates = async (req, res, next) => {
  try {
    const data = await fetchDolarBlue();
    const companyId = req.user?.companyId;
    const nextLastUpdated = new Date();

    const updated = await RateSettings.findOneAndUpdate(
      { companyId },
      {
        $set: {
          USD: { compra: Number(data.compra) || DEFAULT_RATES.USD.compra, venta: Number(data.venta) || DEFAULT_RATES.USD.venta },
          lastUpdated: nextLastUpdated
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ message: 'Rates updated', rates: normalizeRates(updated) });
  } catch (error) {
    console.error('Sync rates error:', error);
    next(error);
  }
};

// @route PUT /api/rates/ours
exports.updateOurRates = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const compra = Number(req.body?.compra);
    const venta = Number(req.body?.venta);

    if (!Number.isFinite(compra) || !Number.isFinite(venta) || compra < 0 || venta < 0) {
      return res.status(400).json({ message: 'Valores de compra/venta inválidos' });
    }

    const updated = await RateSettings.findOneAndUpdate(
      { companyId },
      {
        $set: {
          USD: { compra, venta },
          lastUpdated: new Date()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(normalizeRates(updated));
  } catch (error) {
    console.error('Update our rates error:', error);
    next(error);
  }
};
