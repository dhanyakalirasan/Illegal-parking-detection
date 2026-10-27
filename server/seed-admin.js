require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('No MONGO_URI in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@parkwatch.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const newAdmin = new User({
      name: 'System Admin',
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'ADMIN',
      isActive: true
    });

    await newAdmin.save();
    console.log('Successfully created Admin account!');
    console.log('Email: admin@parkwatch.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
