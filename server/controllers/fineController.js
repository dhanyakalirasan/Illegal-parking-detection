const Fine = require('../models/Fine');
const Complaint = require('../models/Complaint');
const { sendEmail } = require('../services/emailService');

const generateFineId = () => {
  return `FN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Admin generates a fine
exports.generateFine = async (req, res) => {
  try {
    const { complaintId } = req.body;
    
    // Check if complaint exists and is verified
    const complaint = await Complaint.findById(complaintId).populate('citizenId');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    if (complaint.status !== 'VERIFIED') {
      return res.status(400).json({ message: 'Cannot generate fine. Complaint must be VERIFIED first.' });
    }
    
    // Check if fine already exists
    const existingFine = await Fine.findOne({ complaintId });
    if (existingFine) return res.status(400).json({ message: 'Fine already exists for this complaint' });

    // Dynamic Fine Amount Lookup (Phase 10: Admin-configurable Fine System)
    const Violation = require('../models/Violation');
    const violationData = await Violation.findOne({ violationType: complaint.violationType });
    
    // Default fallback to 500 if the violation model hasn't been seeded yet
    const dynamicAmount = violationData ? violationData.fineAmount : 500;

    const newFine = new Fine({
      fineId: generateFineId(),
      complaintId: complaint._id,
      vehicleNumber: complaint.vehicleNumber,
      violationType: complaint.violationType,
      amount: dynamicAmount,
    });

    await newFine.save();
    
    // Send email to the citizen who reported it (as an update)
    await sendEmail({
      to: complaint.citizenId.email,
      subject: `Update on Report ${complaint.complaintId}`,
      html: `
        <h2>Good news!</h2>
        <p>Your report for vehicle <strong>${complaint.vehicleNumber}</strong> has resulted in a verified violation.</p>
        <p>A fine of ₹${newFine.amount} has been issued against the offender.</p>
        <p>Thank you for making the city safer.</p>
      `
    });

    // Phase 16: Audit Log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      adminId: req.user.id,
      action: 'GENERATE_FINE',
      resourceId: newFine._id,
      resourceType: 'Fine',
      details: { amount: newFine.amount },
      ipAddress: req.ip
    });

    res.status(201).json({ message: 'Fine generated successfully', fine: newFine });
  } catch (error) {
    console.error('Generate fine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin or Citizen retrieves fines
exports.getFines = async (req, res) => {
  try {
    const fines = await Fine.find().populate('complaintId');
    res.status(200).json(fines);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Public: Get fines by vehicle number
exports.getFinesByVehicle = async (req, res) => {
  try {
    // Escape regex characters for safe search
    const normalizedPlate = req.params.vehicleNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (!normalizedPlate) {
      return res.status(400).json({ message: 'Invalid vehicle number' });
    }
    
    // Find fines where vehicleNumber loosely matches
    const fines = await Fine.find({ 
      vehicleNumber: { $regex: new RegExp(normalizedPlate.split('').join('.*'), 'i') } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(fines);
  } catch (error) {
    console.error('Error fetching fines by vehicle:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public: Pay a fine
exports.payFine = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });
    
    fine.status = 'PAID';
    fine.resolvedAt = Date.now();
    await fine.save();
    
    res.status(200).json({ message: 'Payment successful', fine });
  } catch (error) {
    console.error('Error paying fine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
