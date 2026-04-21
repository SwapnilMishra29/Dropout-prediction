const Student = require('../models/Student');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().limit(20);
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let student;
    
    // Try to find by _id first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }
    
    // If not found, try by student_id
    if (!student) {
      student = await Student.findOne({ student_id: id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    // Check for duplicate student_id
    const existingStudent = await Student.findOne({ student_id: req.body.student_id });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID already exists' 
      });
    }
    
    // Check for duplicate email
    const existingEmail = await Student.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists' 
      });
    }
    
    const student = new Student(req.body);
    await student.save();
    
    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let student;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ student_id: id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    Object.assign(student, req.body);
    await student.save();
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let student;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ student_id: id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    await student.deleteOne();
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStudentRiskSummary = async (req, res) => {
  try {
    const { id } = req.params;
    let student;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ student_id: id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({
      success: true,
      data: {
        student: {
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          program: student.program,
          current_semester: student.current_semester
        },
        risk_level: 'Not calculated',
        message: 'Run prediction to get risk assessment'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};