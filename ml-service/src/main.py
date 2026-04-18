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
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({"error": "Expected a list of student data"}), 400

        if not data:
            return jsonify([])

        # Check each item
        required = ["student_id", "attendance_percentage", "average_marks", "marks_trend", "attendance_flag", "fee_flag", "low_marks_flag", "performance_ratio"]
        for i, item in enumerate(data):
            if not isinstance(item, dict):
                return jsonify({"error": f"Item {i} is not a dict"}), 400
            missing = [f for f in required if f not in item]
            if missing:
                return jsonify({"error": f"Item {i} missing fields: {missing}"}), 400

        result = batch_predict(data)
        # result is DataFrame
        predictions = []
        for _, row in result.iterrows():
            predictions.append({
                "student_id": int(row["student_id"]),
                "final_score": float(row["final_score"]),
                "risk_level": row["risk_level"]
            })
        return jsonify(predictions)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)