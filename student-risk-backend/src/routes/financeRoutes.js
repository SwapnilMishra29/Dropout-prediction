const express = require('express');

const router = express.Router();

const financeController = require('../controllers/financeController');

router.post('/', financeController.createFinanceRecord);

router.get('/:student_id', financeController.getFinanceRecordsByStudentId);

module.exports = router;