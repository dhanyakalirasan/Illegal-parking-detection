const mongoose = require('mongoose');

const trafficStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    contactEmail: { type: String, required: true },
    phone: { type: String },
    jurisdiction: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrafficStation', trafficStationSchema);
