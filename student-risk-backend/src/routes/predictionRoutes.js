const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// Get prediction for a student
router.get('/:student_id', predictionController.getPrediction);

// Get prediction history
router.get('/history/:student_id', predictionController.getPredictionHistory);

// Get risk statistics
router.get('/statistics/all', predictionController.getRiskStatistics);

module.exports = router;