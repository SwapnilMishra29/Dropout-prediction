const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  alert_type: {
    type: String,
    required: true,
    enum: [
      'High Risk Detected',
      'Risk Escalated',
      'Attendance Warning',
      'Academic Warning',
      'Fee Due Reminder',
      'Intervention Required'
    ]
  },
  
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  risk_score: {
    type: Number,
    min: 0,
    max: 1
  },
  
  is_resolved: {
    type: Boolean,
    default: false
  },
  
  resolved_at: {
    type: Date
  },
  
  resolved_by: {
    type: String
  },
  
  resolution_notes: {
    type: String,
    maxlength: 500
  },
  
  // For tracking
  created_at: {
    type: Date,
    default: Date.now
  },
  
  expires_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
alertSchema.index({ student_id: 1, created_at: -1 });
alertSchema.index({ is_resolved: 1, severity: 1 });
alertSchema.index({ created_at: -1 });

// Static method to cleanup old resolved alerts
alertSchema.statics.cleanupOldAlerts = async function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return await this.deleteMany({
    is_resolved: true,
    resolved_at: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Alert', alertSchema);