const Complaint = require('../models/Complaint');
const Fine = require('../models/Fine');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Complaint.countDocuments();
    const newReports = await Complaint.countDocuments({ status: { $in: ['SUBMITTED', 'ASSIGNED'] } });
    const verified = await Complaint.countDocuments({ status: 'VERIFIED' });
    const rejected = await Complaint.countDocuments({ status: 'REJECTED' });

    // Aggregate Fines
    const finesAggr = await Fine.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const totalFines = finesAggr.length > 0 ? finesAggr[0].totalAmount : 0;
    const paidFines = finesAggr.length > 0 ? finesAggr[0].paidAmount : 0;

    // Calculate Repeat Offenders
    // Group complaints by vehicleNumber and count
    const repeatOffendersAggr = await Complaint.aggregate([
      { $group: { _id: '$vehicleNumber', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'repeatOffenders' }
    ]);
    const repeatOffenders = repeatOffendersAggr.length > 0 ? repeatOffendersAggr[0].repeatOffenders : 0;

    // Charts: Violations By Type
    const violationsByTypeAggr = await Complaint.aggregate([
      { $group: { _id: '$violationType', value: { $sum: 1 } } }
    ]);
    const violationsByType = violationsByTypeAggr.map(v => ({
      name: v._id.replace('_', ' '),
      value: v.value
    }));

    // Charts: Reports By Day (last 7 days simplified)
    // For simplicity, we just send mock data for the week chart unless we want to do complex date math
    // Let's do simple date math for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const reportsByDayAggr = await Complaint.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      { $group: {
          _id: { $dayOfWeek: "$createdAt" },
          reports: { $sum: 1 }
      }}
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let reportsByDay = days.map((day, idx) => {
      // MongoDB $dayOfWeek returns 1 for Sunday, 7 for Saturday
      const match = reportsByDayAggr.find(r => r._id === idx + 1);
      return { name: day, reports: match ? match.reports : 0 };
    });

    res.status(200).json({
      stats: {
        totalReports,
        newReports,
        verified,
        rejected,
        totalFines,
        paidFines,
        repeatOffenders
      },
      charts: {
        violationsByType: violationsByType.length > 0 ? violationsByType : [{ name: 'No Data', value: 1 }],
        reportsByDay
      }
    });

  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
