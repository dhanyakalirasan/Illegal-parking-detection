require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

const seedDemoData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('No MONGO_URI in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'ADMIN' });
    const citizenUser = await User.findOne({ role: 'CITIZEN' });

    if (!citizenUser) {
      console.log('No citizen user found. Cannot seed complaints.');
      process.exit(1);
    }

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount > 5) {
      console.log('Demo data already exists. Skipping seed.');
      process.exit(0);
    }

    // Generate past dates for the chart
    const getPastDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    const mockComplaints = [
      {
        complaintId: 'PW-2026-101',
        citizenId: citizenUser._id,
        vehicleNumber: 'TN38AB1234',
        vehicleType: 'CAR',
        violationType: 'ILLEGAL_PARKING',
        description: 'Parked in a no parking zone',
        latitude: 20.5937,
        longitude: 78.9629,
        address: 'MG Road, Main Market',
        status: 'VERIFIED',
        priorityScore: 60,
        priorityLevel: 'MEDIUM',
        createdAt: getPastDate(1)
      },
      {
        complaintId: 'PW-2026-102',
        citizenId: citizenUser._id,
        vehicleNumber: 'KA01XY5678',
        vehicleType: 'TRUCK',
        violationType: 'BLOCKING_ENTRANCE',
        description: 'Blocking the main gate of the hospital',
        latitude: 20.6000,
        longitude: 78.9700,
        address: 'City Hospital',
        status: 'SUBMITTED',
        priorityScore: 90,
        priorityLevel: 'HIGH',
        createdAt: getPastDate(0)
      },
      {
        complaintId: 'PW-2026-103',
        citizenId: citizenUser._id,
        vehicleNumber: 'MH04XY1234',
        vehicleType: 'CAR',
        violationType: 'FOOTPATH',
        description: 'Parked entirely on the footpath',
        latitude: 20.6100,
        longitude: 78.9800,
        address: 'Avenue Street',
        status: 'ASSIGNED',
        priorityScore: 70,
        priorityLevel: 'MEDIUM',
        createdAt: getPastDate(2)
      },
      {
        complaintId: 'PW-2026-104',
        citizenId: citizenUser._id,
        vehicleNumber: 'TN38AB1234', // Repeat offender
        vehicleType: 'CAR',
        violationType: 'EMERGENCY_ZONE',
        description: 'Parked in ambulance bay',
        latitude: 20.5937,
        longitude: 78.9629,
        address: 'City Hospital Emergency',
        status: 'SUBMITTED',
        priorityScore: 100,
        priorityLevel: 'HIGH',
        createdAt: getPastDate(0)
      },
      {
        complaintId: 'PW-2026-105',
        citizenId: citizenUser._id,
        vehicleNumber: 'DL01ZZ9999',
        vehicleType: 'MOTORCYCLE',
        violationType: 'ILLEGAL_PARKING',
        description: 'Parked middle of the road',
        latitude: 20.6000,
        longitude: 78.9700,
        address: 'Market Cross',
        status: 'REJECTED',
        priorityScore: 40,
        priorityLevel: 'LOW',
        createdAt: getPastDate(4)
      }
    ];

    await Complaint.insertMany(mockComplaints);
    console.log('Successfully seeded 5 mock complaints for the dashboard demo.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDemoData();
