const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET /api/alerts - Get all alerts
router.get('/', alertController.getAllAlerts);

// GET /api/alerts/unresolved - Get unresolved alerts
router.get('/unresolved', alertController.getUnresolvedAlerts);

// GET /api/alerts/statistics - Get alert statistics
router.get('/statistics', alertController.getAlertStatistics);

// GET /api/alerts/student/:student_id - Get alerts for student
router.get('/student/:student_id', alertController.getStudentAlerts);

// POST /api/alerts/bulk-resolve - Bulk resolve alerts
router.post('/bulk-resolve', alertController.bulkResolveAlerts);

// PUT /api/alerts/:id/resolve - Resolve an alert
router.put('/:id/resolve', alertController.resolveAlert);

module.exports = router;