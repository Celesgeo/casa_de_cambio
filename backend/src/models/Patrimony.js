const mongoose = require('mongoose');

const patrimonySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['USD', 'ARS', 'EUR', 'BRL', 'CLP']
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

patrimonySchema.index({ companyId: 1, currency: 1 }, { unique: true });

// Update lastUpdated on save
patrimonySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Patrimony', patrimonySchema);
