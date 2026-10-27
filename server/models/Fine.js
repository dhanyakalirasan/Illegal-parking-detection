const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    fineId: { type: String, required: true, unique: true },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    vehicleNumber: { type: String, required: true },
    violationType: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'PAID', 'DISPUTED', 'WAIVED', 'CANCELLED'],
      default: 'PENDING' 
    },
    issuedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    disputeReason: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fine', fineSchema);
