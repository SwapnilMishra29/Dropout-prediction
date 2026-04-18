const express = require('express');

const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getSummary);

router.get('/high-risk', dashboardController.getHighRiskStudents);

router.get('/student/:id/history', dashboardController.getStudentHistory);

module.exports = router;