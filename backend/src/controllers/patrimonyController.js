const Patrimony = require('../models/Patrimony');

const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP'];

// @route GET /api/patrimony
exports.getPatrimony = async (req, res, next) => {
  try {
    const items = await Patrimony.find({ currency: { $in: CURRENCIES } }).sort({ currency: 1 });
    const byCurrency = {};
    CURRENCIES.forEach((c) => { byCurrency[c] = { currency: c, amount: 0, lastUpdated: null }; });
    items.forEach((item) => {
      byCurrency[item.currency] = {
        currency: item.currency,
        amount: item.amount,
        lastUpdated: item.lastUpdated
      };
    });
    return res.json(Object.values(byCurrency));
  } catch (error) {
    console.error('Get patrimony error:', error);
    next(error);
  }
};

// @route PUT /api/patrimony
exports.updatePatrimony = async (req, res, next) => {
  try {
    const { currency, amount } = req.body;
    if (!currency || !CURRENCIES.includes(String(currency).toUpperCase())) {
      return res.status(400).json({ message: 'Valid currency required (USD, ARS, EUR, BRL, CLP)' });
    }
    const num = Number(amount);
    if (Number.isNaN(num) || num < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }
    const c = String(currency).toUpperCase();
    const doc = await Patrimony.findOneAndUpdate(
      { currency: c },
      { amount: num, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    return res.json(doc);
  } catch (error) {
    console.error('Update patrimony error:', error);
    next(error);
  }
};

// @route POST /api/patrimony/init
exports.initPatrimony = async (req, res, next) => {
  try {
    const entries = req.body; // [{ currency, amount }, ...]
    if (!Array.isArray(entries)) {
      return res.status(400).json({ message: 'Body must be an array of { currency, amount }' });
    }
    const result = [];
    for (const e of entries) {
      const c = String(e.currency || '').toUpperCase();
      if (!CURRENCIES.includes(c)) continue;
      const num = Math.max(0, Number(e.amount));
      if (Number.isNaN(num)) continue;
      const doc = await Patrimony.findOneAndUpdate(
        { currency: c },
        { amount: num, lastUpdated: new Date() },
        { new: true, upsert: true }
      );
      result.push(doc);
    }
    return res.json(result);
  } catch (error) {
    console.error('Init patrimony error:', error);
    next(error);
  }
};
