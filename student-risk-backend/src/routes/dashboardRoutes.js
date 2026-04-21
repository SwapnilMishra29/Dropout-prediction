const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats - Main dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/high-risk-students - High risk students list
router.get('/high-risk-students', dashboardController.getHighRiskStudents);

// GET /api/dashboard/risk-trend - Risk trend over time
router.get('/risk-trend', dashboardController.getRiskTrend);

// GET /api/dashboard/department-stats - Department-wise risk distribution
router.get('/department-stats', dashboardController.getDepartmentRiskStats);

module.exports = router;