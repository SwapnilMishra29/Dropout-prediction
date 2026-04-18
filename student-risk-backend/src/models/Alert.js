const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({

  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

  alert_type: { type: String, required: true },

  message: { type: String, required: true },

  created_at: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);