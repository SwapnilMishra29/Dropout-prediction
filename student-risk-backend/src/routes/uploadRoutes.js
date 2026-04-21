const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Get upload templates
router.get('/templates', uploadController.getTemplates);

// Download prediction results
router.get('/download/:filename', uploadController.downloadPredictions);

// Single file uploads
router.post('/students', 
  uploadController.upload.single('file'), 
  uploadController.uploadStudents
);

router.post('/academic', 
  uploadController.upload.single('file'), 
  uploadController.uploadAcademicRecords
);

router.post('/finance', 
  uploadController.upload.single('file'), 
  uploadController.uploadFinanceRecords
);

// Batch prediction from CSV
router.post('/predict', 
  uploadController.upload.single('file'), 
  uploadController.uploadAndPredict
);

// Complete data upload (all three files)
router.post('/complete', 
  uploadController.uploadMultiple, 
  uploadController.uploadCompleteData
);

module.exports = router;