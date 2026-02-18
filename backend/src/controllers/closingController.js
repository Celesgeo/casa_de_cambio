const Operation = require('../models/Operation');
const Patrimony = require('../models/Patrimony');

// @route GET /api/closing/calculate
exports.calculate = async (req, res, next) => {
  try {
    const patrimony = await Patrimony.find({}).lean();
    const byCurrency = {};
    patrimony.forEach((p) => { byCurrency[p.currency] = p.amount; });

    const operations = await Operation.find({}).sort({ createdAt: 1 }).lean();
    let totalBuysARS = 0;
    let totalSalesARS = 0;
    operations.forEach((op) => {
      const ars = op.totalARS || 0;
      if (op.type === 'Compra') totalBuysARS += ars;
      else totalSalesARS += ars;
    });

    const actualARS = byCurrency.ARS ?? 0;
    const initialARS = actualARS - totalSalesARS + totalBuysARS; // Reconstruido: initial + ventas - compras = actual
    const expectedARS = initialARS - totalBuysARS + totalSalesARS;

    return res.json({
      initialPatrimonyARS: initialARS,
      totalBuysARS,
      totalSalesARS,
      expectedBalanceARS: expectedARS,
      actualBalanceARS: actualARS,
      difference: actualARS - expectedARS,
      patrimonyByCurrency: byCurrency,
      gainLossPercent: initialARS !== 0 ? ((actualARS - initialARS) / Math.abs(initialARS)) * 100 : null
    });
  } catch (error) {
    console.error('Closing calculate error:', error);
    next(error);
  }
};
