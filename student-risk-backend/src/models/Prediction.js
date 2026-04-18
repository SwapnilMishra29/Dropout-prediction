const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({

  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

  final_score: { type: Number, required: true },

  risk_level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },

  timestamp: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);