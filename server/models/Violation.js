const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
  {
    violationType: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    severity: { 
      type: String, 
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW' 
    },
    fineAmount: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Violation', violationSchema);
