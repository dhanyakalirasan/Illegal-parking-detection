const express = require('express');
const { 
  createComplaint, 
  getAllComplaints, 
  getMyComplaints, 
  getComplaintById, 
  updateStatus 
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createComplaint);
router.get('/', protect, adminOnly, getAllComplaints);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
