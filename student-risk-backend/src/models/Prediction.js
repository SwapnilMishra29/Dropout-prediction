const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  final_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  risk_level: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH']
  },
  // Store the features used for this prediction
  features_used: {
    attendance_percentage: Number,
    average_marks: Number,
    marks_trend: Number,
    attendance_flag: Number,
    fee_flag: Number,
    low_marks_flag: Number,
    performance_ratio: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast queries
predictionSchema.index({ student_id: 1, timestamp: -1 });
predictionSchema.index({ risk_level: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);