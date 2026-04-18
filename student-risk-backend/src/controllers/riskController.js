const { predictRisk: callML } = require('../services/mlService');

const { predictRisk } = require('../services/predictionService');

exports.assessRisk = async (req, res) => {

  try {

    const risk = await callML(req.body);

    res.json(risk);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

const Student = require('../models/Student');

exports.predictForStudent = async (req, res) => {
  try {
    const studentIdParam = req.params.student_id;

    console.log("Incoming student_id:", studentIdParam);

    // 🔥 STEP 1: Find student using student_id field
    const student = await Student.findOne({ student_id: studentIdParam });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log("Found student:", student._id);

    // 🔥 STEP 2: Use Mongo _id for prediction
    const prediction = await predictRisk(student._id);

    res.json(prediction);

  } catch (err) {
    console.error("❌ Prediction Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const Prediction = require('../models/Prediction');

exports.getAllPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .populate('student_id') // 🔥 important
      .sort({ createdAt: -1 });

    res.json(predictions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
