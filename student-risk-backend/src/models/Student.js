const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({

 student_id: {
  type: String,
  required: true,
  unique: true
},

  name: { type: String, required: true },

  branch: { type: String, required: true },

  year: { type: Number, required: true },

  semester: { type: Number, required: true },

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);