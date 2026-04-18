"""
Main entry point for ML service
Flask API for predictions
"""
from flask import Flask, request, jsonify
from src.models.predict import predict_dropout, batch_predict
from src.utils.helpers import log_info, log_error
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

# Add CORS and other middleware if needed
@app.before_request
def log_request_info():
    logger.info(f'{request.method} {request.url} - {request.remote_addr}')

@app.after_request
def after_request(response):
    logger.info(f'Response: {response.status_code}')
    return response


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict dropout risk for a student
    """
    try:
        data = request.json
        if not data:
            log_error("No JSON data provided")
            return jsonify({'error': 'No data provided'}), 400

        # Basic validation
        if not isinstance(data, dict):
            log_error("Invalid data format - not a dict")
            return jsonify({'error': 'Invalid data format'}), 400

        if 'student_id' not in data:
            log_error("Missing student_id")
            return jsonify({'error': 'student_id is required'}), 400

        log_info(f"Predicting for student: {data.get('student_id')}")

        result = predict_dropout(data)
        if result is not None and not result.empty:
            # Convert DataFrame to dict for single prediction
            prediction_dict = result.iloc[0].to_dict()
            log_info(f"Prediction result: {prediction_dict}")
            return jsonify(prediction_dict)
        else:
            log_error("Prediction returned empty result")
            return jsonify({'error': 'Prediction failed - no result'}), 400
    except ValueError as e:
        log_error(f"Validation error: {e}")
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        log_error(f"Unexpected error in prediction: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.route('/batch-predict', methods=['POST'])
def batch_predict_endpoint():
    """
    Predict for multiple students
    """
    try:
        data = request.json
        if not data or 'students' not in data:
            return jsonify({'error': 'Missing students array'}), 400

        students = data.get('students', [])
        if not isinstance(students, list) or len(students) == 0:
            return jsonify({'error': 'students must be a non-empty array'}), 400

        log_info(f"Batch predicting for {len(students)} students")

        results = batch_predict(students)
        if results is not None and not results.empty:
            # Convert DataFrame to list of dicts
            predictions = results.to_dict('records')
            return jsonify({'predictions': predictions, 'count': len(predictions)})
        else:
            return jsonify({'error': 'Batch prediction failed'}), 400
    except Exception as e:
        log_error(f"Error in batch prediction: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Test model loading with timeout
        from src.models.predict import load_model
        import time
        start_time = time.time()
        model = load_model()
        load_time = time.time() - start_time
        
        return jsonify({
            'status': 'healthy',
            'ml_service': 'running',
            'model': 'loaded',
            'model_load_time': f'{load_time:.2f}s'
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 503


if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)  # Disable debug mode
