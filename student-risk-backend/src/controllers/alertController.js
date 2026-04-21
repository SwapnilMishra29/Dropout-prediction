const Alert = require('../models/Alert');
const Student = require('../models/Student');

// Get all alerts (with filters)
exports.getAllAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.is_resolved) filter.is_resolved = req.query.is_resolved === 'true';
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.alert_type) filter.alert_type = req.query.alert_type;
    
    const alerts = await Alert.find(filter)
      .populate('student_id')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });
    
    const total = await Alert.countDocuments(filter);
    
    res.json({
      success: true,
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get alerts for a specific student
exports.getStudentAlerts = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const alerts = await Alert.find({ student_id: student._id })
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get unresolved alerts
exports.getUnresolvedAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ is_resolved: false })
      .populate('student_id')
      .sort({ severity: -1, created_at: 1 });
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Resolve an alert
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes, resolved_by } = req.body;
    
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    alert.is_resolved = true;
    alert.resolved_at = new Date();
    alert.resolution_notes = resolution_notes;
    alert.resolved_by = resolved_by || 'System';
    
    await alert.save();
    
    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk resolve alerts
exports.bulkResolveAlerts = async (req, res) => {
  try {
    const { alert_ids, resolution_notes, resolved_by } = req.body;
    
    if (!alert_ids || !Array.isArray(alert_ids)) {
      return res.status(400).json({ 
        success: false, 
        error: 'alert_ids array is required' 
      });
    }
    
    const result = await Alert.updateMany(
      { _id: { $in: alert_ids } },
      {
        is_resolved: true,
        resolved_at: new Date(),
        resolution_notes: resolution_notes,
        resolved_by: resolved_by || 'System'
      }
    );
    
    res.json({
      success: true,
      data: {
        modified_count: result.modifiedCount,
        matched_count: result.matchedCount
      },
      message: `${result.modifiedCount} alerts resolved successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get alert statistics
exports.getAlertStatistics = async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const unresolvedAlerts = await Alert.countDocuments({ is_resolved: false });
    const resolvedAlerts = await Alert.countDocuments({ is_resolved: true });
    
    const severityStats = await Alert.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          unresolved: {
            $sum: { $cond: [{ $eq: ['$is_resolved', false] }, 1, 0] }
          }
        }
      }
    ]);
    
    const typeStats = await Alert.aggregate([
      {
        $group: {
          _id: '$alert_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalAlerts,
        unresolved: unresolvedAlerts,
        resolved: resolvedAlerts,
        resolution_rate: ((resolvedAlerts / totalAlerts) * 100).toFixed(2),
        by_severity: severityStats,
        top_alert_types: typeStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};