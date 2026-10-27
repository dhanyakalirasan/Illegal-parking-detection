const express = require('express');
const { generateFine, getFines } = require('../controllers/fineController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, adminOnly, generateFine);
router.get('/', protect, adminOnly, getFines);

// Public routes for payment portal
const { getFinesByVehicle, payFine } = require('../controllers/fineController');
router.get('/public/:vehicleNumber', getFinesByVehicle);
router.post('/:id/pay', payFine);

module.exports = router;
