const Complaint = require('../models/Complaint');
const TrafficStation = require('../models/TrafficStation');

// Helper function to generate unique ID
const generateComplaintId = () => {
  return `PW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      violationType,
      description,
      latitude,
      longitude,
      address,
      originalImageUrl
    } = req.body;

    // Find nearest traffic station (Phase 4 Logic)
    let assignedStationId = null;
    if (latitude && longitude) {
      // Very basic nearest calculation placeholder (haversine formula or simple geospatial query)
      // Assuming stations are small, simple distance calculation
      const stations = await TrafficStation.find({ isActive: true });
      if (stations.length > 0) {
        // Find nearest logic
        let nearestStation = stations[0];
        let minDistance = Number.MAX_VALUE;
        
        stations.forEach(station => {
          const dLat = (station.latitude - latitude) * Math.PI / 180.0;
          const dLon = (station.longitude - longitude) * Math.PI / 180.0;
          
          // Simple euclidean for prototype (replace with true haversine if needed)
          const distance = Math.sqrt(dLat*dLat + dLon*dLon);
          if (distance < minDistance) {
            minDistance = distance;
            nearestStation = station;
          }
        });
        
        assignedStationId = nearestStation._id;
      }
    }

    // Phase 13: Repeat Offender Detection
    let previousViolationsCount = 0;
    if (vehicleNumber) {
      const normalizedPlate = vehicleNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      previousViolationsCount = await Complaint.countDocuments({ 
        vehicleNumber: { $regex: new RegExp(normalizedPlate.split('').join('.*'), 'i') } 
      });
    }

    // Phase 12: Automatic Complaint Priority
    let priorityScore = 50; // Base score
    let priorityReason = '';

    // Adjust for violation type
    if (violationType === 'EMERGENCY_ZONE') {
      priorityScore += 40;
      priorityReason += 'Blocking emergency access. ';
    } else if (violationType === 'BLOCKING_ENTRANCE') {
      priorityScore += 20;
    }
    
    // Adjust for repeat offender
    if (previousViolationsCount > 0) {
      priorityScore += (previousViolationsCount * 10);
      priorityReason += `Repeat offender (${previousViolationsCount} previous). `;
    }

    // Cap score at 100
    priorityScore = Math.min(priorityScore, 100);

    let priorityLevel = 'LOW';
    if (priorityScore >= 80) priorityLevel = 'HIGH';
    else if (priorityScore >= 60) priorityLevel = 'MEDIUM';

    let assignedPoliceName = null;
    if (assignedStationId) {
      const TrafficPolice = require('../models/TrafficPolice');
      const officers = await TrafficPolice.find({ isActive: true });
      if (officers.length > 0) {
        // Randomly assign one for prototype purposes
        const randomOfficer = officers[Math.floor(Math.random() * officers.length)];
        assignedPoliceName = randomOfficer.name;
      }
    }

    const newComplaint = new Complaint({
      complaintId: generateComplaintId(),
      citizenId: req.user.id,
      vehicleNumber,
      vehicleType,
      violationType,
      description,
      originalImageUrl,
      latitude,
      longitude,
      address,
      trafficStationId: assignedStationId,
      assignedPoliceName,
      status: assignedStationId ? 'ASSIGNED' : 'SUBMITTED',
      priorityScore,
      priorityLevel,
      // priorityReason could also be saved if schema supported it
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all complaints (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('citizenId', 'name email')
      .populate('trafficStationId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my complaints (Citizen)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user.id })
      .populate('trafficStationId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single complaint
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'name email phone')
      .populate('trafficStationId', 'name address');
      
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Auth check: Only admin or the citizen who created it can view
    if (req.user.role !== 'ADMIN' && complaint.citizenId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update status (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const complaint = await Complaint.findById(req.params.id).populate('citizenId');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = status;
    
    // Assign police name if verified and handle Civic Points
    const User = require('../models/User');
    if (status === 'VERIFIED') {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) {
        complaint.assignedPoliceName = `Officer ${adminUser.name}`;
      } else {
        complaint.assignedPoliceName = 'Assigned Officer';
      }
      
      // Award points to the citizen
      if (complaint.citizenId) {
        const citizen = await User.findById(complaint.citizenId._id || complaint.citizenId);
        if (citizen) {
          citizen.civicPoints = (citizen.civicPoints || 0) + 50;
          await citizen.save();
        }
      }

      // Generate the Fine object
      const Fine = require('../models/Fine');
      const existingFine = await Fine.findOne({ complaintId: complaint._id });
      if (!existingFine) {
        const generateFineId = () => {
          return `FN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        };
        const newFine = new Fine({
          fineId: generateFineId(),
          complaintId: complaint._id,
          vehicleNumber: complaint.vehicleNumber,
          violationType: complaint.violationType,
          amount: 500, // Default for now
        });
        await newFine.save();
      }
    } else if (status === 'REJECTED') {
      // Deduct points for fake reports
      if (complaint.citizenId) {
        const citizen = await User.findById(complaint.citizenId._id || complaint.citizenId);
        if (citizen) {
          citizen.civicPoints = Math.max(0, (citizen.civicPoints || 0) - 10);
          await citizen.save();
        }
      }
    }
    
    await complaint.save();
    
    // Phase 15: Email Notification on Status Change
    const { sendEmail } = require('../services/emailService');
    await sendEmail({
      to: complaint.citizenId.email,
      subject: `ParkWatch Report Status Update: ${complaint.complaintId}`,
      html: `
        <h2>Report Status Updated</h2>
        <p>Your report for vehicle <strong>${complaint.vehicleNumber}</strong> has been updated.</p>
        <p>New Status: <strong>${status}</strong></p>
        <p>Thank you for using ParkWatch.</p>
      `
    });

    // Phase 16: Audit Log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_COMPLAINT_STATUS',
      resourceId: complaint._id,
      resourceType: 'Complaint',
      details: { newStatus: status },
      ipAddress: req.ip
    });
    
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
