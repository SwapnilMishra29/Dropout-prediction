const predictionService = require('../services/predictionService');

exports.getPrediction = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const prediction = await predictionService.getPrediction(student_id);
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const history = await predictionService.getPredictionHistory(student_id, limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.getRiskStatistics = async (req, res) => {
  try {
    const stats = await predictionService.getRiskStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};