const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'UPDATE_COMPLAINT_STATUS', 'GENERATE_FINE'
    resourceId: { type: String, required: true }, // ID of the modified resource
    resourceType: { type: String, required: true }, // e.g., 'Complaint', 'Fine'
    details: { type: Object }, // Before/After state or other context
    ipAddress: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
