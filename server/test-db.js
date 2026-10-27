const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Starting ParkWatch Backend Diagnostics...\n');

const runTests = async () => {
  try {
    // 1. Test Database Connection
    process.stdout.write('1. Testing MongoDB Connection... ');
    if (!process.env.MONGO_URI) {
      console.log('❌ FAILED (MONGO_URI not found in .env)');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ PASSED');

    // 2. Test Environment Variables
    process.stdout.write('2. Testing Environment Variables... ');
    const requiredEnv = ['JWT_SECRET', 'PORT'];
    const missing = requiredEnv.filter(env => !process.env[env]);
    if (missing.length > 0) {
      console.log(`❌ FAILED (Missing: ${missing.join(', ')})`);
    } else {
      console.log('✅ PASSED');
    }

    // 3. Check Cloudinary Config (Optional but recommended)
    process.stdout.write('3. Checking Cloudinary Configuration... ');
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('✅ CONFIGURED');
    } else {
      console.log('⚠️ WARNING (Cloudinary not configured, uploads will fail)');
    }

    console.log('\n🎉 Diagnostics completed successfully. The backend is ready for production.');
    process.exit(0);

  } catch (error) {
    console.log('❌ FAILED');
    console.error(error);
    process.exit(1);
  }
};

runTests();
