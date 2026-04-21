const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Get all finance records for a student
router.get('/student/:student_id', financeController.getFinanceRecordsByStudent);

// Get latest finance record (for ML prediction)
router.get('/latest/:student_id', financeController.getLatestFinanceRecord);

// Create finance record
router.post('/', financeController.createFinanceRecord);

// Update finance record
router.put('/:id', financeController.updateFinanceRecord);

// Delete finance record
router.delete('/:id', financeController.deleteFinanceRecord);

module.exports = router;