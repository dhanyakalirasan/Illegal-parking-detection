const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();

// Phase 17: Security Hardening
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
// app.use(mongoSanitize()); // Disabled due to Express 5 compatibility bug

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/police', require('./routes/policeRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ParkWatch API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    if (process.env.MONGO_URI) {
       await mongoose.connect(process.env.MONGO_URI);
       console.log('MongoDB Connected');
    } else {
       console.log('MongoDB URI not provided. Skipping connection for now.');
    }
  } catch (err) {
    console.error('Database connection failed', err);
  }
  console.log(`Server running on port ${PORT}`);
});
