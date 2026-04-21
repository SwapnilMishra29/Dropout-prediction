const AcademicRecord = require('../models/AcademicRecord');
const Student = require('../models/Student');

// Get all academic records for a student
exports.getAcademicRecordsByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Find student by either ID type
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const records = await AcademicRecord.find({ student_id: student._id })
      .sort({ semester: -1, academic_year: -1 });
    
    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get latest academic record
exports.getLatestAcademicRecord = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const record = await AcademicRecord.findOne({ student_id: student._id })
      .sort({ semester: -1, academic_year: -1 });
    
    if (!record) {
      return res.status(404).json({ success: false, error: 'No academic records found' });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create academic record
exports.createAcademicRecord = async (req, res) => {
  try {
    const { student_id, ...recordData } = req.body;
    
    // Find student by either ID type
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    // Check if record for same semester exists
    const existingRecord = await AcademicRecord.findOne({
      student_id: student._id,
      semester: recordData.semester,
      academic_year: recordData.academic_year
    });
    
    if (existingRecord) {
      return res.status(400).json({ 
        success: false, 
        error: 'Academic record already exists for this semester' 
      });
    }
    
    const record = new AcademicRecord({
      student_id: student._id,
      ...recordData
    });
    
    await record.save();
    await record.populate('student_id');
    
    res.status(201).json({
      success: true,
      data: record,
      message: 'Academic record created successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update academic record
exports.updateAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await AcademicRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Academic record not found' });
    }
    
    Object.assign(record, req.body);
    await record.save();
    
    res.json({
      success: true,
      data: record,
      message: 'Academic record updated successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete academic record
exports.deleteAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await AcademicRecord.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Academic record not found' });
    }
    
    res.json({
      success: true,
      message: 'Academic record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get academic summary (trend analysis)
exports.getAcademicSummary = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    let student;
    if (student_id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(student_id);
    } else {
      student = await Student.findOne({ student_id: student_id });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const records = await AcademicRecord.find({ student_id: student._id })
      .sort({ semester: 1 });
    
    if (records.length === 0) {
      return res.status(404).json({ success: false, error: 'No academic records found' });
    }
    
    // Calculate trend
    const marksHistory = records.map(r => ({
      semester: r.semester,
      average_marks: (r.test1_marks + r.test2_marks) / 2,
      attendance: r.attendance_percentage
    }));
    
    // Calculate improvement/decline
    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];
    const firstAvg = (firstRecord.test1_marks + firstRecord.test2_marks) / 2;
    const lastAvg = (lastRecord.test1_marks + lastRecord.test2_marks) / 2;
    const marksChange = lastAvg - firstAvg;
    
    const trend = marksChange > 5 ? 'IMPROVING' : marksChange < -5 ? 'DECLINING' : 'STABLE';
    
    res.json({
      success: true,
      data: {
        total_semesters: records.length,
        current_semester: lastRecord.semester,
        current_avg_marks: lastAvg,
        current_attendance: lastRecord.attendance_percentage,
        marks_trend: trend,
        marks_change: marksChange,
        history: marksHistory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};