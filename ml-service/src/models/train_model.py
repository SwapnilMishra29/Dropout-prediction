"""
Train model for Dropout Early Warning System (Dummy Data Version)
----------------------------------------------------------------
Generates synthetic dataset, trains RandomForest model,
evaluates it, and saves model.pkl
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split


def generate_dummy_data(n=100):
    """Generate synthetic student dataset"""

    df = pd.DataFrame({
        "student_id": range(1001, 1001 + n),
        "attendance_percentage": np.random.randint(40, 100, n),
        "average_marks": np.random.randint(30, 100, n),
        "marks_trend": np.random.choice([-1, 0, 1], n),
        "attendance_flag": np.random.choice([0, 1], n),
        "fee_flag": np.random.choice([0, 1], n),
        "low_marks_flag": np.random.choice([0, 1], n),
        "performance_ratio": np.random.uniform(0.3, 1.0, n)
    })

    return df


def create_target(df):
    """Create dropout_risk target variable"""

    df["risk_score"] = (
        df["attendance_flag"] * 2 +
        df["low_marks_flag"] * 2 +
        df["fee_flag"] * 1.5 +
        df["marks_trend"].apply(lambda t: 1 if t == -1 else 0)
    )

    # HIGH risk → 1, else → 0
    df["dropout_risk"] = (df["risk_score"] >= 4).astype(int)

    df.drop(columns=["risk_score"], inplace=True)

    return df


def train_model():
    """Main training function"""

    print("Generating dummy dataset...")
    df = generate_dummy_data(100)

    df = create_target(df)

    feature_cols = [
        "attendance_percentage",
        "average_marks",
        "marks_trend",
        "attendance_flag",
        "fee_flag",
        "low_marks_flag",
        "performance_ratio",
    ]

    X = df[feature_cols]
    y = df["dropout_risk"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y if y.nunique() > 1 else None
    )

    print("Training model...")

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("\nModel Training Completed")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:\n")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save model
    module_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    model_path = os.path.join(module_root, "models", "model.pkl")

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)

    print(f"\nModel saved at: {model_path}")


if __name__ == "__main__":
    train_model()