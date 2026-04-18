"""
Prediction module using trained model + rule-based scoring
"""

import os
import sys

import joblib
import pandas as pd

# Enable running as script from src/models by adding ml-service/src to sys.path
ROOT_SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_SRC not in sys.path:
    sys.path.insert(0, ROOT_SRC)

from rules.risk_rules import assign_risk_level


def _get_model_path(model_path=None):
    if model_path is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        model_path = os.path.join(base_dir, "models", "model.pkl")
    return model_path


def load_model(model_path=None):
    """Load model from a .pkl file."""
    model_path = _get_model_path(model_path)
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return joblib.load(model_path)


def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract features required for ML prediction."""
    feature_cols = [
        "attendance_percentage",
        "average_marks",
        "marks_trend",
        "attendance_flag",
        "fee_flag",
        "low_marks_flag",
        "performance_ratio",
    ]

    missing = [c for c in feature_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required feature columns: {missing}")

    return df[feature_cols].copy()


def _normalize_rule_score(df: pd.DataFrame) -> pd.Series:
    """Normalize rule-based risk score to 0..1 range."""
    if "risk_score" not in df.columns:
        raise ValueError("Dataframe must contain 'risk_score' from assign_risk_level")

    max_score = 6.5
    normalized = df["risk_score"].astype(float) / max_score
    return normalized.clip(0, 1)


def _assign_final_risk_level(final_score: float) -> str:
    if final_score < 0.4:
        return "LOW"
    elif final_score <= 0.7:
        return "MEDIUM"
    else:
        return "HIGH"


def _preprocess_input(df: pd.DataFrame) -> pd.DataFrame:
    """Compute missing flags from raw data if not provided."""
    df = df.copy()

    # Ensure student_id exists
    if "student_id" not in df.columns:
        df["student_id"] = "unknown"

    # Compute attendance_flag if not provided
    if "attendance_flag" not in df.columns:
        if "attendance_percentage" in df.columns:
            df["attendance_flag"] = (df["attendance_percentage"] < 75).astype(int)
        else:
            df["attendance_flag"] = 0  # default

    # Compute low_marks_flag if not provided
    if "low_marks_flag" not in df.columns:
        if "average_marks" in df.columns:
            df["low_marks_flag"] = (df["average_marks"] < 50).astype(int)
        else:
            df["low_marks_flag"] = 0  # default

    # Compute performance_ratio if not provided
    if "performance_ratio" not in df.columns:
        if "average_marks" in df.columns:
            df["performance_ratio"] = df["average_marks"] / 100.0
        else:
            df["performance_ratio"] = 0.5  # default

    # Ensure marks_trend exists
    if "marks_trend" not in df.columns:
        df["marks_trend"] = 0  # default stable

    # Ensure fee_flag exists
    if "fee_flag" not in df.columns:
        df["fee_flag"] = 0  # default paid

    return df


def predict_dropout(student_data, model_path=None):
    """Predict dropout risk for a single student or DataFrame."""
    if isinstance(student_data, dict):
        df = pd.DataFrame([student_data])
    elif isinstance(student_data, pd.DataFrame):
        df = student_data.copy()
    else:
        raise TypeError("student_data must be a dict or pandas DataFrame")

    # Preprocess: compute missing flags if not provided
    df = _preprocess_input(df)

    # Apply rule-based scoring first
    df_rb = assign_risk_level(df)

    # Extract ML features
    X = _prepare_features(df_rb)

    # Get ML model probability for dropout class (1)
    try:
        model = load_model(model_path)
        proba = model.predict_proba(X)

        if proba.shape[1] == 1:
            ml_prob = pd.Series(proba[:, 0], index=df_rb.index)
        else:
            ml_prob = pd.Series(proba[:, 1], index=df_rb.index)
    except FileNotFoundError:
        print("Warning: Model not found, using rule-based only")
        ml_prob = pd.Series(0.0, index=df_rb.index)

    # Normalize rule score and combine
    normalized_rule = _normalize_rule_score(df_rb)
    final_score = (0.6 * ml_prob) + (0.4 * normalized_rule)

    df_rb["final_score"] = final_score
    df_rb["final_risk_level"] = df_rb["final_score"].apply(_assign_final_risk_level)

    result = df_rb[["student_id", "final_score", "final_risk_level"]].copy()
    result = result.rename(columns={"final_risk_level": "risk_level"})

    return result


def batch_predict(inputs, model_path=None):
    """Predict dropout for multiple students (list of dicts or DataFrame)."""
    if isinstance(inputs, list):
        df = pd.DataFrame(inputs)
    elif isinstance(inputs, pd.DataFrame):
        df = inputs.copy()
    else:
        raise TypeError("inputs must be a list of dicts or pandas DataFrame")

    return predict_dropout(df, model_path=model_path)


if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    default_input = os.path.join(base_dir, "data", "processed", "merged_data_engineered.csv")

    df = pd.read_csv(default_input)
    output = predict_dropout(df)

    print("Sample prediction output:")
    print(output.head().to_string(index=False))

