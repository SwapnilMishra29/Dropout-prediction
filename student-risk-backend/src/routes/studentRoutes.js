const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Student routes are working!' });
});

// CRUD routes
router.get('/', studentController.getAllStudents);
router.get('/risk-summary/:id', studentController.getStudentRiskSummary);
router.get('/:id', studentController.getStudent);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;