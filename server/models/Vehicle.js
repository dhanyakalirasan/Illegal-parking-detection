const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    make: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    registrationYear: {
      type: Number,
    },
    vehicleType: {
      type: String,
      enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE', 'OTHER'],
      default: 'OTHER',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
