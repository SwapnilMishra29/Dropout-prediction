const FinanceRecord = require('../models/FinanceRecord');
const Student = require('../models/Student');

// Get all finance records for a student
exports.getFinanceRecordsByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Find student
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const records = await FinanceRecord.find({ student_id: student._id })
      .sort({ semester: -1 });
    
    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create finance record
exports.createFinanceRecord = async (req, res) => {
  try {
    const { student_id, semester, total_fees, fees_paid, amount_paid, due_date } = req.body;
    
    // Find student
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const record = new FinanceRecord({
      student_id: student._id,
      semester,
      total_fees,
      fees_paid: fees_paid || false,
      amount_paid: amount_paid || 0,
      due_date
    });
    
    await record.save();
    
    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update finance record
exports.updateFinanceRecord = async (req, res) => {
  try {
    const record = await FinanceRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({ success: false, error: 'Finance record not found' });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete finance record
exports.deleteFinanceRecord = async (req, res) => {
  try {
    const record = await FinanceRecord.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({ success: false, error: 'Finance record not found' });
    }
    
    res.json({
      success: true,
      message: 'Finance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get latest finance record (for prediction)
exports.getLatestFinanceRecord = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id.toUpperCase() });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const record = await FinanceRecord.findOne({ student_id: student._id })
      .sort({ semester: -1 });
    
    res.json({
      success: true,
      data: record || { fees_paid: true } // Default to paid if no record
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};