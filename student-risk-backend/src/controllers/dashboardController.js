const Student = require('../models/Student');
const Prediction = require('../models/Prediction');

// 🔥 Summary
const getSummary = async (req, res) => {
  try {
    const students = await Student.find({}, { _id: 1 });

    const validIds = students.map(s => s._id);

    const latestPredictions = await Prediction.aggregate([
      {
        $match: {
          student_id: { $in: validIds }
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$student_id",
          risk_level: { $first: "$risk_level" }
        }
      }
    ]);

    res.json({
      total_students: students.length,
      high_risk_count: latestPredictions.filter(p => p.risk_level === "HIGH").length,
      medium_risk_count: latestPredictions.filter(p => p.risk_level === "MEDIUM").length,
      low_risk_count: latestPredictions.filter(p => p.risk_level === "LOW").length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 High risk students
const getHighRiskStudents = async (req, res) => {
  try {
    const students = await Student.find({}, { _id: 1 });
    const validIds = students.map(s => s._id);

    const data = await Prediction.find({
      student_id: { $in: validIds },
      risk_level: "HIGH"
    }).populate('student_id');

    res.json(data.map(p => p.student_id));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 History
const getStudentHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ student_id: req.params.id });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const history = await Prediction.find({
      student_id: student._id
    }).sort({ timestamp: -1 });

    res.json(history);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSummary,
  getHighRiskStudents,
  getStudentHistory
};