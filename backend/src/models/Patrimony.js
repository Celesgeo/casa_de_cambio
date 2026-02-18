const mongoose = require('mongoose');

const patrimonySchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
      unique: true,
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

// Update lastUpdated on save
patrimonySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Patrimony', patrimonySchema);
