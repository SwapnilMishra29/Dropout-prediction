const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// GET /api/academic/student/:student_id - Get all academic records
router.get('/student/:student_id', academicController.getAcademicRecordsByStudent);

// GET /api/academic/student/:student_id/latest - Get latest record
router.get('/student/:student_id/latest', academicController.getLatestAcademicRecord);

// GET /api/academic/student/:student_id/summary - Get academic summary
router.get('/student/:student_id/summary', academicController.getAcademicSummary);

// POST /api/academic - Create academic record
router.post('/', academicController.createAcademicRecord);

// PUT /api/academic/:id - Update academic record
router.put('/:id', academicController.updateAcademicRecord);

// DELETE /api/academic/:id - Delete academic record
router.delete('/:id', academicController.deleteAcademicRecord);

module.exports = router;