const axios = require('axios');

const predictRisk = async (studentData, retries = 3) => {
  const url = `${process.env.ML_API_URL}/predict`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`ML API call attempt ${attempt}:`, url);
      const response = await axios.post(url, studentData, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      console.error(`ML API Error (attempt ${attempt}):`, err.message);

      if (attempt === retries) {
        throw new Error(`ML API call failed after ${retries} attempts: ${err.message}`);
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = { predictRisk };