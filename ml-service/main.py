"""
Main entry point for ML service
Flask API for predictions
"""
from flask import Flask, request, jsonify
import os
import sys
import logging

# Add the current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.models.predict import predict_dropout
from src.utils.helpers import log_info, log_error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.before_request
def log_request_info():
    logger.info(f'{request.method} {request.url}')

@app.after_request
def after_request(response):
    logger.info(f'Response: {response.status_code}')
    return response

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "ML Dropout Prediction API is running 🚀",
        "endpoints": ["/predict", "/batch_predict", "/health"]
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "dropout-prediction-ml"})

@app.route('/predict', methods=['POST'])
def predict():
    """Predict dropout risk for a student"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid data format'}), 400

        if 'student_id' not in data:
            return jsonify({'error': 'student_id is required'}), 400

        log_info(f"Predicting for student: {data.get('student_id')}")

        result = predict_dropout(data)
        if result is not None and not result.empty:
            prediction_dict = result.iloc[0].to_dict()
            log_info(f"Prediction result: {prediction_dict}")
            return jsonify(prediction_dict)
        else:
            return jsonify({'error': 'Prediction failed - no result'}), 400
            
    except Exception as e:
        log_error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Batch prediction from JSON data"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if isinstance(data, list):
            results = []
            for item in data:
                try:
                    result = predict_dropout(item)
                    if result is not None and not result.empty:
                        results.append(result.iloc[0].to_dict())
                except Exception as e:
                    results.append({'error': str(e), 'student_id': item.get('student_id')})
            
            return jsonify({"predictions": results, "total": len(results)})
        else:
            return jsonify({'error': 'Expected array of student data'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 7860))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)