const Operation = require('../models/Operation');

/**
 * Start of day UTC for a given date
 */
function startOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

/**
 * End of day UTC (start of next day)
 */
function endOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + 1);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

// @route GET /api/reports/daily-balance
// Query: ?date=YYYY-MM-DD (optional; default today UTC)
exports.getDailyBalance = async (req, res, next) => {
  try {
    let date = req.query.date;
    if (!date) {
      const now = new Date();
      date = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
    }
    const [y, m, d] = date.split('-').map(Number);
    if (!y || !m || !d) {
      return res.status(400).json({ message: 'Invalid date; use YYYY-MM-DD' });
    }
    const dayStart = startOfDayUTC(new Date(Date.UTC(y, m - 1, d)));
    const dayEnd = endOfDayUTC(dayStart);

    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
    const operations = await Operation.find({
      companyId,
      createdAt: { $gte: dayStart, $lt: dayEnd }
    }).lean();

    let usdComprados = 0;
    let usdVendidos = 0;
    let totalARSCompras = 0;
    let totalARSVentas = 0;

    operations.forEach((op) => {
      const amount = op.amount || 0;
      const ars = op.totalARS || 0;
      const currency = (op.currency || '').toUpperCase();
      if (currency !== 'USD') return;
      if (op.type === 'Compra') {
        usdComprados += amount;
        totalARSCompras += ars;
      } else {
        usdVendidos += amount;
        totalARSVentas += ars;
      }
    });

    const gananciaEstimadaARS = totalARSVentas - totalARSCompras;

    const opsForExport = operations.map((op) => ({
      type: op.type,
      clientName: op.clientName,
      currency: op.currency,
      amount: op.amount,
      rate: op.rate,
      totalARS: op.totalARS,
      paymentMethod: op.paymentMethod,
      employeeName: op.employeeName,
      createdAt: op.createdAt
    }));

    return res.json({
      date,
      usdComprados: Math.round(usdComprados * 100) / 100,
      usdVendidos: Math.round(usdVendidos * 100) / 100,
      gananciaEstimadaARS: Math.round(gananciaEstimadaARS * 100) / 100,
      totalARSCompras: Math.round(totalARSCompras * 100) / 100,
      totalARSVentas: Math.round(totalARSVentas * 100) / 100,
      operations: opsForExport
    });
  } catch (error) {
    console.error('Reports daily balance error:', error);
    next(error);
  }
};
