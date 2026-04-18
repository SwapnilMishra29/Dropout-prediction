const Student = require('../models/Student');

const Prediction = require('../models/Prediction');

exports.getSummary = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    // Get latest prediction per student
    const latestPredictions = await Prediction.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$student_id",
          risk_level: { $first: "$risk_level" }
        }
      }
    ]);

    const summary = {
      total_students: totalStudents,
      high_risk_count: latestPredictions.filter(p => p.risk_level === "HIGH").length,
      medium_risk_count: latestPredictions.filter(p => p.risk_level === "MEDIUM").length,
      low_risk_count: latestPredictions.filter(p => p.risk_level === "LOW").length
    };

    res.json(summary);

    console.log("Latest Predictions Count:", latestPredictions.length);
    console.log("Total Students:", totalStudents);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHighRiskStudents = async (req, res) => {

  try {

    const highRiskPredictions = await Prediction.find({ risk_level: 'HIGH' }).populate('student_id');

    const students = highRiskPredictions.map(p => p.student_id);

    res.json(students);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

exports.getStudentHistory = async (req, res) => {

  try {

    const history = await Prediction.find({ student_id: req.params.id }).sort({ timestamp: -1 });

    res.json(history);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};