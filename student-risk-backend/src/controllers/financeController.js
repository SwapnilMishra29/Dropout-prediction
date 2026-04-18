const FinanceRecord = require('../models/FinanceRecord');
const Student = require('../models/Student');
const mongoose = require('mongoose');



exports.getFinanceRecordsByStudentId = async (req, res) => {
  try {
    let { student_id } = req.params;

    let studentObjectId;

    // 🔥 HANDLE BOTH CASES
    if (mongoose.Types.ObjectId.isValid(student_id)) {
      studentObjectId = student_id;
    } else {
      const student = await Student.findOne({ student_id });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentObjectId = student._id;
    }

    const records = await FinanceRecord.find({
      student_id: studentObjectId,
    });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createFinanceRecord = async (req, res) => {
  try {
    let { student_id, ...recordData } = req.body;

    let studentObjectId;

    // 🔥 HANDLE BOTH CASES
    if (mongoose.Types.ObjectId.isValid(student_id)) {
      studentObjectId = student_id;
    } else {
      const student = await Student.findOne({ student_id });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentObjectId = student._id;
    }

    const record = new FinanceRecord({
      student_id: studentObjectId,
      ...recordData,
    });

    await record.save();
    res.status(201).json(record);

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

