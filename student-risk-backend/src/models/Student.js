const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  program: {
    type: String,
    default: 'Computer Science'
  },
  enrollment_year: {
    type: Number,
    default: new Date().getFullYear()
  },
  current_semester: {
    type: Number,
    default: 1
  },
  department: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Graduated', 'Dropped Out', 'Transferred'],
    default: 'Active'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Simple pre-save middleware


module.exports = mongoose.model('Student', studentSchema);