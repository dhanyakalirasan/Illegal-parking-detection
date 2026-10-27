require('dotenv').config();
const mongoose = require('mongoose');
const TrafficPolice = require('./models/TrafficPolice');

const seedCoimbatorePolice = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('No MONGO_URI in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Sample data for Coimbatore Traffic Police
    const coimbatorePolice = [
      { name: 'Inspector M. Kumar', area: 'Gandhipuram', phone: '9448123456' },
      { name: 'Sub-Inspector S. Ramesh', area: 'RS Puram', phone: '9448123457' },
      { name: 'Inspector K. Lakshmi', area: 'Peelamedu', phone: '9448123458' },
      { name: 'Sub-Inspector V. Karthik', area: 'Singanallur', phone: '9448123459' },
      { name: 'Inspector R. Saravanan', area: 'Ukkadam', phone: '9448123460' },
      { name: 'Sub-Inspector P. Selvam', area: 'Avinashi Road', phone: '9448123461' },
      { name: 'Inspector T. Vijay', area: 'Trichy Road', phone: '9448123462' },
      { name: 'Sub-Inspector A. Anand', area: 'Thudiyalur', phone: '9448123463' },
    ];

    // Clear existing data (optional, but good for resetting)
    await TrafficPolice.deleteMany({});
    
    await TrafficPolice.insertMany(coimbatorePolice);
    console.log('Successfully seeded Coimbatore traffic police data.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedCoimbatorePolice();
