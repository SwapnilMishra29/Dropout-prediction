import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add src to path for imports
ROOT_SRC = os.path.abspath(os.path.dirname(__file__))
if ROOT_SRC not in sys.path:
    sys.path.insert(0, ROOT_SRC)

from models.predict import predict_dropout, batch_predict

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Dropout Prediction API is running"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Check required fields
        required = ["student_id", "attendance_percentage", "average_marks", "marks_trend", "attendance_flag", "fee_flag", "low_marks_flag", "performance_ratio"]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        result = predict_dropout(data)
        # result is DataFrame, get first row
        row = result.iloc[0]
        return jsonify({
            "student_id": int(row["student_id"]),
            "final_score": float(row["final_score"]),
            "risk_level": row["risk_level"]
        })
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict_endpoint():
    try:
        from flask import request, jsonify
        import pandas as pd

        if 'attendance' not in request.files or \
           'marks' not in request.files or \
           'fees' not in request.files:
            return jsonify({"error": "Missing CSV files"}), 400

        # Read CSV files
        attendance_df = pd.read_csv(request.files['attendance'])
        marks_df = pd.read_csv(request.files['marks'])
        fees_df = pd.read_csv(request.files['fees'])

        # 🔥 IMPORTANT: Inline merge (TEMP FIX to avoid import issues)
        merged = attendance_df.merge(marks_df, on='student_id', how='outer')
        merged = merged.merge(fees_df, on='student_id', how='outer')

        # 🔥 Feature Engineering
        merged["average_marks"] = (merged["test1_marks"] + merged["test2_marks"]) / 2
        merged["marks_trend"] = (merged["test2_marks"] - merged["test1_marks"]).apply(
            lambda x: 1 if x > 0 else (-1 if x < 0 else 0)
        )
        merged["attendance_flag"] = (merged["attendance_percentage"] < 75).astype(int)

        merged["fees_paid"] = merged["fees_paid"].astype(str).str.lower() == "true"
        merged["fee_flag"] = (~merged["fees_paid"]).astype(int)

        merged["low_marks_flag"] = (merged["average_marks"] < 40).astype(int)
        merged["performance_ratio"] = merged["average_marks"] / 40

        # 🔥 Prediction
        from models.predict import batch_predict
        result = batch_predict(merged)

        return jsonify(result.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)