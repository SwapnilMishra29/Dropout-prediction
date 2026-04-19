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
import pandas as pd

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


@app.route('/batch_predict', methods=['POST'])
def batch_predict_endpoint():
    try:
        # 🔴 Validate files
        if 'attendance' not in request.files or \
           'marks' not in request.files or \
           'fees' not in request.files:
            return jsonify({"error": "Missing CSV files"}), 400

        # ✅ Read CSV files
        attendance_df = pd.read_csv(request.files['attendance'])
        marks_df = pd.read_csv(request.files['marks'])
        fees_df = pd.read_csv(request.files['fees'])

        # 🔥 FIX 1: Convert string → numeric
        attendance_df["attendance_percentage"] = pd.to_numeric(
            attendance_df["attendance_percentage"], errors='coerce'
        )

        marks_df["test1_marks"] = pd.to_numeric(
            marks_df["test1_marks"], errors='coerce'
        )
        marks_df["test2_marks"] = pd.to_numeric(
            marks_df["test2_marks"], errors='coerce'
        )

        # 🔥 FIX 2: Merge safely
        merged = attendance_df.merge(marks_df, on='student_id', how='inner')
        merged = merged.merge(fees_df, on='student_id', how='inner')


        # 🔥 Feature Engineering
        merged["average_marks"] = (merged["test1_marks"] + merged["test2_marks"]) / 2

        merged["marks_trend"] = (merged["test2_marks"] - merged["test1_marks"]).fillna(0)
        merged["marks_trend"] = merged["marks_trend"].apply(
            lambda x: 1 if x > 0 else (-1 if x < 0 else 0)
        )

        merged["attendance_flag"] = (merged["attendance_percentage"] < 75).astype(int)

        # 🔥 FIX 3: Boolean handling
        merged["fees_paid"] = merged["fees_paid"].astype(str).str.lower() == "true"
        merged["fee_flag"] = (~merged["fees_paid"]).astype(int)

        merged["low_marks_flag"] = (merged["average_marks"] < 40).astype(int)
        merged["performance_ratio"] = merged["average_marks"] / 40

        # 🔥 Prediction
        from models.predict import batch_predict
        result = batch_predict(merged)

        return jsonify(result.to_dict(orient="records"))

    except Exception as e:
        print("❌ Flask Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv("PORT", 7860))
    app.run(host="0.0.0.0", port=port)  # Disable debug mode
