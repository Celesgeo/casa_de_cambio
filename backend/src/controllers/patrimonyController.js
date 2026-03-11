const Patrimony = require('../models/Patrimony');

const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP'];

// @route GET /api/patrimony - multi-tenant
exports.getPatrimony = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
    let items = await Patrimony.find({ companyId, currency: { $in: CURRENCIES } }).sort({ currency: 1 });
    // Si la compañía no tiene ningún registro de patrimonio, crear filas en 0 (ej. cuenta demo)
    if (items.length === 0) {
      try {
        for (const c of CURRENCIES) {
          await Patrimony.findOneAndUpdate(
            { companyId, currency: c },
            { amount: 0, lastUpdated: new Date() },
            { new: true, upsert: true }
          );
        }
        items = await Patrimony.find({ companyId, currency: { $in: CURRENCIES } }).sort({ currency: 1 });
      } catch (initErr) {
        if (initErr.code === 11000) {
          items = [];
        } else throw initErr;
      }
    }
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

// @route PUT /api/patrimony - multi-tenant
exports.updatePatrimony = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
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
      { companyId, currency: c },
      { amount: num, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    return res.json(doc);
  } catch (error) {
    console.error('Update patrimony error:', error);
    next(error);
  }
};

// @route POST /api/patrimony/init - multi-tenant
exports.initPatrimony = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
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
        { companyId, currency: c },
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
