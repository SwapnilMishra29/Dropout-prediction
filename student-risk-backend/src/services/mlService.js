const axios = require('axios');

class MLService {
  constructor() {
    this.baseURL = process.env.ML_API_URL || 'http://localhost:7860';
    this.timeout = 10000;
  }

  async predict(features) {
    try {
      const response = await axios.post(`${this.baseURL}/predict`, features, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('ML Service Error:', error.message);
      
      // Fallback prediction when ML service is unavailable
      return {
        success: false,
        data: this.getFallbackPrediction(features),
        error: error.message
      };
    }
  }

  getFallbackPrediction(features) {
    // Simple rule-based fallback
    let riskScore = 0;
    
    // Attendance factor
    if (features.attendance_percentage < 75) riskScore += 0.3;
    else if (features.attendance_percentage < 85) riskScore += 0.1;
    
    // Marks factor
    const avgMarks = features.average_marks;
    if (avgMarks < 40) riskScore += 0.4;
    else if (avgMarks < 50) riskScore += 0.3;
    else if (avgMarks < 60) riskScore += 0.2;
    
    // Fee factor
    if (!features.fees_paid) riskScore += 0.2;
    
    // Trend factor
    if (features.marks_trend === -1) riskScore += 0.1;
    
    // Multiple factors bonus
    let factorCount = 0;
    if (features.attendance_percentage < 75) factorCount++;
    if (avgMarks < 50) factorCount++;
    if (!features.fees_paid) factorCount++;
    if (factorCount >= 2) riskScore += 0.1;
    
    const final_score = Math.min(riskScore, 1);
    
    let risk_level;
    if (final_score < 0.4) risk_level = 'LOW';
    else if (final_score < 0.7) risk_level = 'MEDIUM';
    else risk_level = 'HIGH';
    
    return { final_score, risk_level };
  }
}

module.exports = new MLService();