const mongoose = require('mongoose');

const financeRecordSchema = new mongoose.Schema({

  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

  fee_paid: { type: Boolean, required: true },

  pending_amount: { type: Number, required: true },

}, { timestamps: true });

module.exports = mongoose.model('FinanceRecord', financeRecordSchema);