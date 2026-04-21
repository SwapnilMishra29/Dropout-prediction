const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  
  // Semester/Year information
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  
  academic_year: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  
  // Attendance
  attendance_percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: Number.isFinite,
      message: 'Attendance percentage must be a valid number'
    }
  },
  
  // Test Marks
  test1_marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  test2_marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Subject details (optional)
  subjects: [{
    name: String,
    marks: Number,
    max_marks: { type: Number, default: 100 }
  }],
  
  // Additional metrics
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  
  total_credits: {
    type: Number,
    min: 0
  },
  
  earned_credits: {
    type: Number,
    min: 0
  },
  
  // Backward compatibility
  marks: [{
    type: Number
  }],
  
  // Metadata
  notes: {
    type: String,
    maxlength: 500
  },
  
  recorded_by: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound indexes
academicRecordSchema.index({ student_id: 1, semester: -1, academic_year: -1 });
academicRecordSchema.index({ student_id: 1, created_at: -1 });

// Virtual for average marks
academicRecordSchema.virtual('average_marks').get(function() {
  if (this.test1_marks && this.test2_marks) {
    return (this.test1_marks + this.test2_marks) / 2;
  }
  if (this.marks && this.marks.length) {
    return this.marks.reduce((a, b) => a + b, 0) / this.marks.length;
  }
  return 0;
});

// Method to get features for ML
academicRecordSchema.methods.getMLFeatures = function() {
  return {
    attendance_percentage: this.attendance_percentage,
    test1_marks: this.test1_marks,
    test2_marks: this.test2_marks,
    average_marks: this.average_marks
  };
};

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);