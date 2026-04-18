const multer = require('multer');
const Papa = require('papaparse');
const axios = require('axios');
const Prediction = require('../models/Prediction');

const upload = multer({ storage: multer.memoryStorage() });

function mergeStudentData(attendance, marks, fees) {
  const dataMap = {};

  attendance.forEach(row => {
    if (row.student_id) {
      dataMap[row.student_id] = { ...dataMap[row.student_id], student_id: row.student_id, attendance_percentage: parseFloat(row.attendance_percentage) };
    }
  });

  marks.forEach(row => {
    if (row.student_id) {
      const marksArray = row.marks ? row.marks.split(',').map(Number) : [];
      dataMap[row.student_id] = { ...dataMap[row.student_id], student_id: row.student_id, marks: marksArray };
    }
  });

  fees.forEach(row => {
    if (row.student_id) {
      dataMap[row.student_id] = { ...dataMap[row.student_id], student_id: row.student_id, fee_paid: row.fee_paid === 'true', pending_amount: parseFloat(row.pending_amount) };
    }
  });

  return Object.values(dataMap);
}

function prepareBatchData(merged) {
  return merged.map(student => {
    const average_marks = student.marks ? student.marks.reduce((a, b) => a + b, 0) / student.marks.length : 0;
    return {
      student_id: student.student_id,
      attendance_percentage: student.attendance_percentage,
      average_marks,
      marks_trend: 0, // Placeholder
      attendance_flag: student.attendance_percentage < 75 ? 1 : 0,
      fee_flag: !student.fee_paid ? 1 : 0,
      low_marks_flag: average_marks < 50 ? 1 : 0,
      performance_ratio: average_marks / 100
    };
  });
}

exports.uploadCSV = [
  upload.fields([
    { name: 'attendance', maxCount: 1 },
    { name: 'marks', maxCount: 1 },
    { name: 'fees', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files.attendance || !req.files.marks || !req.files.fees) {
        return res.status(400).json({ error: 'All three CSV files are required: attendance, marks, fees' });
      }

      // Parse CSVs
      const attendanceData = Papa.parse(req.files.attendance[0].buffer.toString(), { header: true, skipEmptyLines: true }).data;
      const marksData = Papa.parse(req.files.marks[0].buffer.toString(), { header: true, skipEmptyLines: true }).data;
      const feesData = Papa.parse(req.files.fees[0].buffer.toString(), { header: true, skipEmptyLines: true }).data;

      // Merge data
      const mergedData = mergeStudentData(attendanceData, marksData, feesData);

      // Prepare batch data
      const batchData = prepareBatchData(mergedData);

      // Call Flask batch API
      const response = await axios.post(`${process.env.ML_API_URL}/batch_upload`, { data: batchData });

      // Store predictions
      const predictions = response.data.predictions || [];
      for (let pred of predictions) {
        const prediction = new Prediction({
          student_id: pred.student_id,
          final_score: pred.final_score,
          risk_level: pred.risk_level,
          timestamp: new Date()
        });
        await prediction.save();
      }

      res.json({ message: 'Batch predictions processed and stored successfully', count: predictions.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
];