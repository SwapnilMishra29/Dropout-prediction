const mongoose = require('mongoose');

const financeRecordSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  total_fees: {
    type: Number,
    required: true,
    default: 0
  },
  fees_paid: {
    type: Boolean,
    default: false
  },
  amount_paid: {
    type: Number,
    default: 0
  },
  due_date: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FinanceRecord', financeRecordSchema);