const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Compra', 'Venta'],
      required: true
    },
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    currency: {
      type: String,
      required: true,
      trim: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    totalARS: {
      type: Number,
      required: false, // Calculado en controlador y en pre-save
      min: 0
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['Efectivo', 'Transferencia']
    },
    surchargePercent: {
      type: Number,
      default: 0,
      min: 0
    },
    adjustedRate: {
      type: Number,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Auto-calculate adjustedRate and totalARS before saving
operationSchema.pre('save', function (next) {
  // Use provided adjustedRate if available, otherwise calculate it
  if (this.adjustedRate == null) {
    // Calculate adjusted rate based on payment method and surcharge
    if (this.paymentMethod === 'Transferencia' && this.surchargePercent > 0) {
      this.adjustedRate = this.rate + (this.rate * this.surchargePercent / 100);
    } else {
      this.adjustedRate = this.rate;
    }
  }

  // Calculate totalARS using adjustedRate (or rate if adjustedRate not set)
  const rateToUse = this.adjustedRate != null ? this.adjustedRate : this.rate;
  this.totalARS = rateToUse * this.amount;
  next();
});

module.exports = mongoose.model('Operation', operationSchema);
