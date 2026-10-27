const express = require('express');
const router = express.Router();
const TrafficPolice = require('../models/TrafficPolice');

// @route   GET /api/police
// @desc    Get all active traffic police officers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const policeList = await TrafficPolice.find({ isActive: true }).sort({ area: 1 });
    res.status(200).json({
      success: true,
      count: policeList.length,
      data: policeList
    });
  } catch (err) {
    console.error('Error fetching traffic police:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
