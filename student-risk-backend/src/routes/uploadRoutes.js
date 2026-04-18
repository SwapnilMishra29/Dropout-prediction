const express = require('express');

const router = express.Router();

const uploadController = require('../controllers/uploadController');

router.post('/csv', uploadController.uploadCSV);

module.exports = router;