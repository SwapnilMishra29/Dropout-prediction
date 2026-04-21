const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const Alert = require('../models/Alert');
const AcademicRecord = require('../models/AcademicRecord');
const FinanceRecord = require('../models/FinanceRecord');

// Get main dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Student statistics
    const totalStudents = await Student.countDocuments({ is_active: true });
    const activeStudents = totalStudents;
    const totalDropouts = await Student.countDocuments({ status: 'Dropped Out' });
    
    // Risk distribution (latest predictions only)
    const riskDistribution = await Prediction.aggregate([
      {
        $sort: { student_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$student_id',
          latest_risk: { $first: '$risk_level' }
        }
      },
      {
        $group: {
          _id: '$latest_risk',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const highRisk = riskDistribution.find(r => r._id === 'HIGH')?.count || 0;
    const mediumRisk = riskDistribution.find(r => r._id === 'MEDIUM')?.count || 0;
    const lowRisk = riskDistribution.find(r => r._id === 'LOW')?.count || 0;
    
    // Alert statistics
    const activeAlerts = await Alert.countDocuments({ is_resolved: false });
    const criticalAlerts = await Alert.countDocuments({ 
      is_resolved: false, 
      severity: 'HIGH' 
    });
    
    // Recent predictions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentPredictions = await Prediction.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            risk: '$risk_level'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    // Average metrics
    const avgAttendance = await AcademicRecord.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$attendance_percentage' }
        }
      }
    ]);
    
    const avgMarks = await AcademicRecord.aggregate([
      {
        $project: {
          avg_marks: { $avg: ['$test1_marks', '$test2_marks'] }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$avg_marks' }
        }
      }
    ]);
    
    // Fee collection summary
    const feeStats = await FinanceRecord.aggregate([
      {
        $group: {
          _id: null,
          total_fees: { $sum: '$total_fees' },
          total_paid: { $sum: '$amount_paid' },
          total_pending: { $sum: '$pending_amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          active: activeStudents,
          dropped_out: totalDropouts,
          retention_rate: ((activeStudents / (activeStudents + totalDropouts)) * 100).toFixed(1)
        },
        risk: {
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk,
          high_risk_percentage: ((highRisk / totalStudents) * 100).toFixed(1)
        },
        alerts: {
          total: activeAlerts,
          critical: criticalAlerts
        },
        academics: {
          avg_attendance: avgAttendance[0]?.avg?.toFixed(2) || 0,
          avg_marks: avgMarks[0]?.avg?.toFixed(2) || 0
        },
        finance: {
          total_fees: feeStats[0]?.total_fees || 0,
          total_paid: feeStats[0]?.total_paid || 0,
          total_pending: feeStats[0]?.total_pending || 0,
          collection_rate: ((feeStats[0]?.total_paid / feeStats[0]?.total_fees) * 100).toFixed(2)
        },
        recent_trends: recentPredictions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get high-risk students list
exports.getHighRiskStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get latest predictions for all students
    const highRiskPredictions = await Prediction.aggregate([
      {
        $sort: { student_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$student_id',
          latest_prediction: { $first: '$$ROOT' }
        }
      },
      {
        $match: { 'latest_prediction.risk_level': 'HIGH' }
      },
      {
        $sort: { 'latest_prediction.final_score': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    
    const studentIds = highRiskPredictions.map(p => p._id);
    const students = await Student.find({ _id: { $in: studentIds } });
    
    // Combine data
    const results = highRiskPredictions.map(pred => {
      const student = students.find(s => s._id.equals(pred._id));
      return {
        student: {
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          program: student.program,
          current_semester: student.current_semester
        },
        prediction: pred.latest_prediction
      };
    });
    
    const total = await Prediction.aggregate([
      {
        $sort: { student_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$student_id',
          latest_risk: { $first: '$risk_level' }
        }
      },
      {
        $match: { latest_risk: 'HIGH' }
      },
      {
        $count: 'total'
      }
    ]);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: total[0]?.total || 0,
        pages: Math.ceil((total[0]?.total || 0) / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get risk trend over time
exports.getRiskTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const trend = await Prediction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            risk: '$risk_level'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    // Format for chart
    const dates = [...new Set(trend.map(t => t._id.date))];
    const chartData = dates.map(date => {
      const dayData = trend.filter(t => t._id.date === date);
      return {
        date,
        HIGH: dayData.find(d => d._id.risk === 'HIGH')?.count || 0,
        MEDIUM: dayData.find(d => d._id.risk === 'MEDIUM')?.count || 0,
        LOW: dayData.find(d => d._id.risk === 'LOW')?.count || 0
      };
    });
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get department-wise risk distribution
exports.getDepartmentRiskStats = async (req, res) => {
  try {
    const stats = await Prediction.aggregate([
      {
        $sort: { student_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$student_id',
          latest_risk: { $first: '$risk_level' }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $group: {
          _id: {
            department: '$student.department',
            risk: '$latest_risk'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.department',
          HIGH: {
            $sum: {
              $cond: [{ $eq: ['$_id.risk', 'HIGH'] }, '$count', 0]
            }
          },
          MEDIUM: {
            $sum: {
              $cond: [{ $eq: ['$_id.risk', 'MEDIUM'] }, '$count', 0]
            }
          },
          LOW: {
            $sum: {
              $cond: [{ $eq: ['$_id.risk', 'LOW'] }, '$count', 0]
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats.filter(s => s._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};