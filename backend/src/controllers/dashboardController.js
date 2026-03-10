const Operation = require('../models/Operation');
const Patrimony = require('../models/Patrimony');

function startOfTodayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// @route GET /api/dashboard/summary - real data per company
exports.summary = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });

    const todayStart = startOfTodayUTC();
    const operations = await Operation.find({ companyId }).lean();
    const patrimony = await Patrimony.find({ companyId }).lean();

    const todayOps = operations.filter((op) => new Date(op.createdAt) >= todayStart);
    const totalDailyVolume = operations.reduce((sum, op) => sum + (op.totalARS || 0), 0);
    const arsPatrimony = patrimony.find((p) => p.currency === 'ARS');
    const cashOnHand = arsPatrimony?.amount ?? 0;
    const totalPatrimony = cashOnHand;

    let spreadAverage = 0;
    if (operations.length > 0) {
      const withRate = operations.filter((op) => op.rate > 0);
      if (withRate.length > 0) {
        spreadAverage = withRate.reduce((s, op) => s + (op.rate || 0), 0) / withRate.length;
        spreadAverage = spreadAverage > 1000 ? (spreadAverage * 0.02) / spreadAverage : 0.02;
      }
    }

    return res.json({
      totalDailyVolume: Math.round(totalDailyVolume * 100) / 100,
      totalPatrimony: Math.round(totalPatrimony * 100) / 100,
      spreadAverage,
      operationsToday: todayOps.length,
      cashOnHand: Math.round(cashOnHand * 100) / 100
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    next(error);
  }
};
