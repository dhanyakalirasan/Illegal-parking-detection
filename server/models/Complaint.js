const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { type: String },
    vehicleType: { type: String },
    violationType: { type: String },
    description: { type: String },
    
    // Cloudinary URLs
    originalImageUrl: { type: String },
    processedImageUrl: { type: String },
    vehicleCropUrl: { type: String },
    plateCropUrl: { type: String },
    
    // Location Details
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    trafficStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrafficStation' },
    assignedPoliceName: { type: String },
    
    // AI Metrics
    detectionConfidence: { type: Number },
    ocrConfidence: { type: Number },
    
    // Priorities
    priorityScore: { type: Number },
    priorityLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    
    // Status Flow
    status: { 
      type: String, 
      enum: ['SUBMITTED', 'PROCESSING', 'ASSIGNED', 'REVIEWING', 'VERIFIED', 'REJECTED', 'DISPUTED'],
      default: 'SUBMITTED' 
    }
  },
  { timestamps: true }
);

// Basic auto-increment or UUID logic can be applied to `complaintId` in the controller

module.exports = mongoose.model('Complaint', complaintSchema);
