const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'ADMIN'],
      default: 'CITIZEN',
    },
    vehicleNumbers: [
      {
        type: String,
        uppercase: true,
        trim: true,
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    civicPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
