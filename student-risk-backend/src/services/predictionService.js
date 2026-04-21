const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const FinanceRecord = require('../models/FinanceRecord');
const Prediction = require('../models/Prediction');
const mlService = require('./mlService');

class PredictionService {
  
  getAverageMarks(academicRecord) {
    if (!academicRecord) return 0;
    if (academicRecord.test1_marks && academicRecord.test2_marks) {
      return (academicRecord.test1_marks + academicRecord.test2_marks) / 2;
    }
    if (academicRecord.marks && academicRecord.marks.length) {
      return academicRecord.marks.reduce((a, b) => a + b, 0) / academicRecord.marks.length;
    }
    return 0;
  }
  
  async calculateMarksTrend(studentId) {
    const records = await AcademicRecord.find({ student_id: studentId })
      .sort({ semester: 1 })
      .limit(2);
    
    if (records.length < 2) return 0;
    
    const currentAvg = this.getAverageMarks(records[1]);
    const previousAvg = this.getAverageMarks(records[0]);
    const diff = currentAvg - previousAvg;
    
    if (diff > 5) return 1;
    if (diff < -5) return -1;
    return 0;
  }
  
  async prepareFeatures(studentId) {
    // Find student
    let student;
    if (typeof studentId === 'string' && studentId.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ student_id: studentId });
    }
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Get latest academic record
    const academicRecord = await AcademicRecord.findOne({ student_id: student._id })
      .sort({ semester: -1 });
    
    // Default values if no academic record exists
    let attendance_percentage = 75;
    let test1_marks = 50;
    let test2_marks = 50;
    let average_marks = 50;
    
    if (academicRecord) {
      attendance_percentage = academicRecord.attendance_percentage || 75;
      test1_marks = academicRecord.test1_marks || 50;
      test2_marks = academicRecord.test2_marks || 50;
      average_marks = this.getAverageMarks(academicRecord);
    }
    
    // Get latest finance record
    const financeRecord = await FinanceRecord.findOne({ student_id: student._id })
      .sort({ semester: -1 });
    
    const marksTrend = await this.calculateMarksTrend(student._id);
    const attendanceFlag = attendance_percentage < 75 ? 1 : 0;
    const lowMarksFlag = average_marks < 50 ? 1 : 0;
    const feeFlag = (financeRecord && !financeRecord.fees_paid) ? 1 : 0;
    
    // Ensure performance_ratio is a valid number (not NaN)
    let performance_ratio = average_marks / 50;
    if (isNaN(performance_ratio) || !isFinite(performance_ratio)) {
      performance_ratio = 1.0; // Default value
    }
    
    const features = {
      student_id: student.student_id,
      attendance_percentage: attendance_percentage,
      test1_marks: test1_marks,
      test2_marks: test2_marks,
      fees_paid: financeRecord ? financeRecord.fees_paid : true,
      average_marks: average_marks,
      marks_trend: marksTrend,
      attendance_flag: attendanceFlag,
      fee_flag: feeFlag,
      low_marks_flag: lowMarksFlag,
      performance_ratio: performance_ratio
    };
    
    return { student, features, academicRecord, financeRecord };
  }
  
  async getPrediction(studentId) {
    try {
      const { student, features, academicRecord, financeRecord } = await this.prepareFeatures(studentId);
      
      console.log('📊 Features for prediction:', JSON.stringify(features, null, 2));
      
      // Call ML service
      const mlResult = await mlService.predict(features);
      
      let final_score, risk_level;
      
      if (mlResult.success) {
        final_score = mlResult.data.final_score;
        risk_level = mlResult.data.risk_level;
      } else {
        // Fallback prediction
        final_score = 0.5;
        risk_level = 'MEDIUM';
      }
      
      // Ensure final_score is a valid number
      if (isNaN(final_score) || !isFinite(final_score)) {
        final_score = 0.5;
        risk_level = 'MEDIUM';
      }
      
      // Save prediction
      const prediction = await Prediction.findOneAndUpdate(
        { student_id: student._id },
        {
          final_score,
          risk_level,
          features_used: {
            attendance_percentage: features.attendance_percentage,
            average_marks: features.average_marks,
            marks_trend: features.marks_trend,
            attendance_flag: features.attendance_flag,
            fee_flag: features.fee_flag,
            low_marks_flag: features.low_marks_flag,
            performance_ratio: features.performance_ratio
          },
          timestamp: new Date()
        },
        { upsert: true, new: true }
      );
      
      await prediction.populate('student_id', 'student_id name email program');
      
      return prediction;
      
    } catch (error) {
      console.error('Prediction Error:', error);
      throw error;
    }
  }
  
  async getPredictionHistory(studentId, limit = 10) {
    let student;
    if (typeof studentId === 'string' && studentId.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ student_id: studentId });
    }
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    const predictions = await Prediction.find({ student_id: student._id })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    return predictions;
  }
  
  async getRiskStatistics() {
    const stats = await Prediction.aggregate([
      {
        $sort: { student_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$student_id',
          latest_risk: { $first: '$risk_level' },
          latest_score: { $first: '$final_score' }
        }
      },
      {
        $group: {
          _id: '$latest_risk',
          count: { $sum: 1 },
          avg_score: { $avg: '$latest_score' }
        }
      }
    ]);
    
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    
    return {
      total_predictions: total,
      high_risk: stats.find(s => s._id === 'HIGH')?.count || 0,
      medium_risk: stats.find(s => s._id === 'MEDIUM')?.count || 0,
      low_risk: stats.find(s => s._id === 'LOW')?.count || 0
    };
  }
}

module.exports = new PredictionService();