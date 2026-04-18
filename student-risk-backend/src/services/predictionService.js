const axios = require('axios');

const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const FinanceRecord = require('../models/FinanceRecord');
const Prediction = require('../models/Prediction');
const Alert = require('../models/Alert');

async function predictRisk(studentId) {
  try {
    // 1. Get student
    let student;
    if (typeof studentId === 'string') {
      student = await Student.findOne({ student_id: studentId });
    } else {
      student = await Student.findById(studentId);
    }

    if (!student) throw new Error('Student not found');

    // 2. Get latest academic record
    const latestAcademic = await AcademicRecord
      .findOne({ student_id: student._id })
      .sort({ createdAt: -1 });

    if (!latestAcademic) throw new Error('No academic records found');

    // 3. Compute features
    const average_marks =
      latestAcademic.marks.reduce((a, b) => a + b, 0) /
      latestAcademic.marks.length;

    const marks_trend = 0; // can improve later
    const attendance_flag = latestAcademic.attendance_percentage < 75 ? 1 : 0;
    const low_marks_flag = average_marks < 50 ? 1 : 0;

    // 4. Get latest finance record
    const latestFinance = await FinanceRecord
      .findOne({ student_id: student._id })
      .sort({ createdAt: -1 });

    if (!latestFinance) throw new Error('No finance records found');

    const fee_flag = !latestFinance.fee_paid ? 1 : 0;

    const performance_ratio = average_marks / 100;

    // 5. Prepare ML payload
    const data = {
      student_id: student.student_id,
      attendance_percentage: latestAcademic.attendance_percentage,
      average_marks,
      marks_trend,
      attendance_flag,
      fee_flag,
      low_marks_flag,
      performance_ratio
    };

    // 6. Call ML API
    const url = `${process.env.ML_API_URL}/predict`;

    const response = await axios.post(url, data, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { final_score, risk_level } = response.data;

    // 7. Get existing prediction (IMPORTANT for alert logic)
    const existingPrediction = await Prediction.findOne({
      student_id: student._id
    });

    // 8. UPSERT (Fix duplicate problem 🔥)
    const prediction = await Prediction.findOneAndUpdate(
      { student_id: student._id },
      {
        final_score,
        risk_level,
        timestamp: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    // 9. Populate student for response
    await prediction.populate('student_id');

    // 10. Alert logic (ONLY when risk becomes HIGH)
    if (
      risk_level === 'HIGH' &&
      (!existingPrediction || existingPrediction.risk_level !== 'HIGH')
    ) {
      await Alert.create({
        student_id: student._id,
        alert_type: 'High Risk Detected',
        message: 'Student has been identified with high dropout risk.',
        created_at: new Date()
      });
    }

    return prediction;

  } catch (error) {
    console.error("Prediction Error:", error.message);
    throw error;
  }
}

module.exports = { predictRisk };