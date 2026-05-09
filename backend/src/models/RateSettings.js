const mongoose = require('mongoose');

const rateSettingsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      unique: true,
      index: true
    },
    USD: {
      compra: { type: Number, required: true, default: 980 },
      venta: { type: Number, required: true, default: 1000 }
    },
    lastUpdated: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RateSettings', rateSettingsSchema);
