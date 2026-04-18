const AcademicRecord = require('../models/AcademicRecord');
const Student = require('../models/Student');
const mongoose = require('mongoose');

exports.createAcademicRecord = async (req, res) => {
  try {
    const { student_id, ...recordData } = req.body;

    // If student_id is a string, find the student and use ObjectId
    let studentObjectId = student_id;
    if (typeof student_id === 'string' && !mongoose.Types.ObjectId.isValid(student_id)) {
      const student = await Student.findOne({ student_id: student_id });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentObjectId = student._id;
    }

    const record = new AcademicRecord({
      ...recordData,
      student_id: studentObjectId
    });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAcademicRecordsByStudentId = async (req, res) => {
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

    const records = await AcademicRecord.find({
      student_id: studentObjectId,
    });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
