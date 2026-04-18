const Student = require('../models/Student');

exports.getAllStudents = async (req, res) => {

  try {

    const students = await Student.find();

    res.json(students);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

exports.getStudentById = async (req, res) => {

  try {

    const student = await Student.findById(req.params.id);

    if (!student) {

      return res.status(404).json({ error: 'Student not found' });

    }

    res.json(student);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

exports.createStudent = async (req, res) => {

  try {

    const student = new Student(req.body);

    await student.save();

    res.status(201).json(student);

  } catch (err) {

    res.status(400).json({ error: err.message });

  }

};

exports.updateStudent = async (req, res) => {

  try {

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!student) {

      return res.status(404).json({ error: 'Student not found' });

    }

    res.json(student);

  } catch (err) {

    res.status(400).json({ error: err.message });

  }

};

exports.deleteStudent = async (req, res) => {

  try {

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {

      return res.status(404).json({ error: 'Student not found' });

    }

    res.json({ message: 'Student deleted successfully' });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};