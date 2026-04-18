const express = require('express');

const router = express.Router();

const academicController = require('../controllers/academicController');

router.post('/', academicController.createAcademicRecord);

router.get('/:student_id', academicController.getAcademicRecordsByStudentId);

module.exports = router;