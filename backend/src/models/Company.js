const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: String, default: 'demo', trim: true },
    isActive: { type: Boolean, default: true },
    logo: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
