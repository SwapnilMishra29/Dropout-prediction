const express = require('express');

const router = express.Router();

const riskController = require('../controllers/riskController');

router.post('/assess', riskController.assessRisk);

router.get('/predict/:student_id', riskController.predictForStudent);

router.get('/', riskController.getAllPredictions);

module.exports = router;