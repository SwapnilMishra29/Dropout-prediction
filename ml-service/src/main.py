"""
Main entry point for ML service
Flask API for predictions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging
import pandas as pd

# Add src to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.models.predict import predict_dropout

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

def validate_student_data(data):
    """Validate student data for single prediction"""
    # Required fields check
    if 'student_id' not in data:
        return False, "student_id is required"
    
    # Validate numeric fields if present
    if 'attendance_percentage' in data:
        try:
            val = float(data['attendance_percentage'])
            if val < 0 or val > 100:
                return False, "attendance_percentage must be between 0 and 100"
        except (ValueError, TypeError):
            return False, "attendance_percentage must be a number"
    
    if 'test1_marks' in data:
        try:
            val = float(data['test1_marks'])
            if val < 0 or val > 100:
                return False, "test1_marks must be between 0 and 100"
        except (ValueError, TypeError):
            return False, "test1_marks must be a number"
    
    if 'test2_marks' in data:
        try:
            val = float(data['test2_marks'])
            if val < 0 or val > 100:
                return False, "test2_marks must be between 0 and 100"
        except (ValueError, TypeError):
            return False, "test2_marks must be a number"
    
    return True, "Valid"

# Middleware
@app.before_request
def log_request_info():
    logger.info(f'{request.method} {request.url} - {request.remote_addr}')

@app.after_request
def after_request(response):
    logger.info(f'Response: {response.status_code}')
    return response

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "ML Dropout Prediction API is running 🚀",
        "version": "2.0",
        "endpoints": {
            "/predict": "POST - Single student prediction",
            "/batch_predict": "POST - Batch prediction with CSV file",
            "/health": "GET - Health check"
        },
        "thresholds": {
            "attendance_warning": "< 75%",
            "low_marks": "< 40%",
            "risk_levels": ["LOW", "MEDIUM", "HIGH"]
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "dropout-prediction-api"
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Predict dropout risk for a single student"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid data format, expected JSON object'}), 400
        
        # Validate data
        is_valid, error_msg = validate_student_data(data)
        if not is_valid:
            logger.error(f"Validation failed: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        logger.info(f"Predicting for student: {data.get('student_id')}")
        
        # Make prediction
        result = predict_dropout(data)
        
        if result is not None and not result.empty:
            prediction_dict = result.iloc[0].to_dict()
            logger.info(f"Prediction: risk_level={prediction_dict['risk_level']}, score={prediction_dict['final_score']}")
            return jsonify(prediction_dict)
        else:
            return jsonify({'error': 'Prediction failed - no result'}), 400
            
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict_endpoint():
    """Batch prediction from CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read CSV
        df = pd.read_csv(file)
        logger.info(f"Processing batch: {len(df)} records")
        
        # Validate required columns
        required_cols = ['student_id', 'attendance_percentage', 'test1_marks', 'test2_marks']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            return jsonify({"error": f"Missing required columns: {missing_cols}"}), 400
        
        # Make predictions
        results = predict_dropout(df)
        
        # Add summary
        summary = {
            "total_students": len(results),
            "risk_distribution": results['risk_level'].value_counts().to_dict(),
            "average_risk_score": float(results['final_score'].mean())
        }
        
        logger.info(f"Batch complete: {summary}")
        
        return jsonify({
            "predictions": results.to_dict(orient="records"),
            "summary": summary
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 7860))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    
    logger.info(f"Starting Dropout Prediction API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)