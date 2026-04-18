const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({

  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

  attendance_percentage: { type: Number, required: true },

  marks: [{ type: Number }],

  subjects: [{ type: String }],

}, { timestamps: true });

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);