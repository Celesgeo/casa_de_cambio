const Operation = require('../models/Operation');
const Patrimony = require('../models/Patrimony');

// @desc    Create a new currency exchange operation
// @route   POST /api/operations
// @access  Private (to be protected with auth middleware)
const createOperation = async (req, res, next) => {
  try {
    const {
      type,
      clientName,
      currency,
      rate,
      amount,
      employeeName,
      paymentMethod,
      surchargePercent
    } = req.body;

    // Validate required fields
    if (
      !type ||
      !clientName ||
      !currency ||
      rate == null ||
      rate === '' ||
      amount == null ||
      amount === '' ||
      !employeeName
    ) {
      console.error('Missing required fields:', {
        type: !!type,
        clientName: !!clientName,
        currency: !!currency,
        rate: rate != null && rate !== '',
        amount: amount != null && amount !== '',
        employeeName: !!employeeName
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Coerce numeric fields so Mongoose always receives numbers (JSON may send strings)
    const rateNum = Number(rate);
    const amountNum = Number(amount);
    if (Number.isNaN(rateNum) || rateNum < 0 || Number.isNaN(amountNum) || amountNum < 0) {
      console.error('Invalid numeric fields:', { rate, amount });
      return res.status(400).json({ message: 'Rate and amount must be valid non-negative numbers' });
    }

    // Respaldo: asegurar totalARS por si el frontend no lo envía
    req.body.totalARS = rateNum * amountNum;

    const surchargeNum =
      surchargePercent != null && surchargePercent !== ''
        ? Math.max(0, Number(surchargePercent))
        : 0;
    const payment = paymentMethod && ['Efectivo', 'Transferencia'].includes(paymentMethod)
      ? paymentMethod
      : 'Efectivo';

    // Calcular adjustedRate y totalARS en el servidor (no depender del frontend)
    let adjustedRateNum = rateNum;
    if (payment === 'Transferencia' && surchargeNum > 0) {
      adjustedRateNum = rateNum + (rateNum * surchargeNum / 100);
    }
    const totalARS = Math.round(adjustedRateNum * amountNum * 100) / 100;

    const operationData = {
      type: String(type).trim(),
      clientName: String(clientName).trim(),
      currency: String(currency).trim(),
      rate: rateNum,
      amount: amountNum,
      employeeName: String(employeeName).trim(),
      paymentMethod: payment,
      surchargePercent: surchargeNum,
      adjustedRate: adjustedRateNum,
      totalARS
    };

    const operation = new Operation(operationData);
    const saved = await operation.save();
    console.log('Operation created successfully:', saved._id);

    // Update patrimony: Compra = we give FX, receive ARS (subtract ARS, add FX). Venta = we receive ARS, give FX (add ARS, subtract FX).
    const arsAmount = saved.totalARS;
    const fxCurrency = String(saved.currency).toUpperCase();
    const fxAmount = saved.amount;
    try {
      const updatePatrimony = async (currency, delta) => {
        await Patrimony.findOneAndUpdate(
          { currency },
          { $inc: { amount: delta }, $set: { lastUpdated: new Date() } },
          { upsert: true, new: true }
        );
      };
      if (saved.type === 'Compra') {
        await updatePatrimony('ARS', -arsAmount);
        await updatePatrimony(fxCurrency, fxAmount);
      } else {
        await updatePatrimony('ARS', arsAmount);
        await updatePatrimony(fxCurrency, -fxAmount);
      }
    } catch (patrimonyErr) {
      console.error('Patrimony update failed after operation save:', patrimonyErr);
      // Operation already saved; do not fail the request
    }

    return res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating operation:', error);
    return next(error);
  }
};

// @desc    Get all operations (newest first)
// @route   GET /api/operations
// @access  Private (to be protected with auth middleware)
const getOperations = async (req, res, next) => {
  try {
    const operations = await Operation.find().sort({ createdAt: -1 });
    return res.json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return next(error);
  }
};

// @desc    Delete all operations
// @route   DELETE /api/operations
// @access  Private
const deleteAllOperations = async (req, res, next) => {
  try {
    const result = await Operation.deleteMany({});
    console.log('Operations deleted:', result.deletedCount);
    return res.json({ message: 'Operations deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting operations:', error);
    return next(error);
  }
};

module.exports = {
  createOperation,
  getOperations,
  deleteAllOperations
};
