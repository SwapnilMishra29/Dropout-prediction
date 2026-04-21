"""
Prediction module using trained model + rule-based scoring
Integrates with feature_engineering and risk_rules
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import logging

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from data.feature_engineering import feature_engineering, ATTENDANCE_THRESHOLD, LOW_MARKS_THRESHOLD
from rules.risk_rules import assign_risk_level

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# UPDATED: Even more weight to rule-based for high-risk cases
ML_WEIGHT = 0.2      # Reduced from 0.3
RULE_WEIGHT = 0.8    # Increased from 0.7

# Updated MAX_RISK_SCORE to match risk_rules.py
MAX_RISK_SCORE = 11.0

def _get_model_path(model_path=None):
    """Get model path with fallback"""
    if model_path is None:
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        model_path = BASE_DIR / "models" / "model.pkl"
    return str(model_path)

def load_model(model_path=None):
    """Load model from a .pkl file"""
    model_path = _get_model_path(model_path)
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return joblib.load(model_path)

def _get_feature_columns():
    """Get expected feature columns from saved file"""
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    feature_path = BASE_DIR / "models" / "feature_columns.pkl"
    
    if os.path.exists(feature_path):
        return joblib.load(feature_path)
    
    # Default feature columns (must match training)
    return [
        "attendance_percentage",
        "average_marks",
        "marks_trend",
        "attendance_flag",
        "fee_flag",
        "low_marks_flag",
        "performance_ratio",
    ]

def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract features in correct order for model prediction"""
    feature_cols = _get_feature_columns()
    
    # Check for missing columns
    missing = [c for c in feature_cols if c not in df.columns]
    if missing:
        logger.error(f"Missing required feature columns: {missing}")
        raise ValueError(f"Missing required feature columns: {missing}")
    
    # Return features in correct order
    return df[feature_cols].copy()

def _normalize_rule_score(df: pd.DataFrame) -> pd.Series:
    """Normalize rule-based risk score to 0..1 range with non-linear scaling"""
    if "risk_score" not in df.columns:
        raise ValueError("Dataframe must contain 'risk_score' from assign_risk_level")
    
    # Linear normalization
    linear_norm = df["risk_score"].astype(float) / MAX_RISK_SCORE
    
    # Apply non-linear scaling to make medium-high scores more prominent
    # This amplifies scores above 0.5
    normalized = linear_norm.apply(lambda x: x ** 0.7 if x > 0.5 else x ** 1.2)
    
    return normalized.clip(0, 1)

def _assign_final_risk_level(final_score: float) -> str:
    """Convert numeric score to risk category - More aggressive thresholds"""
    if final_score < 0.30:      # Lowered from 0.35
        return "LOW"
    elif final_score < 0.55:    # Lowered from 0.65
        return "MEDIUM"
    else:
        return "HIGH"

def predict_dropout(student_data, model_path=None):
    """
    Predict dropout risk for a single student or DataFrame
    """
    try:
        # Convert input to DataFrame
        if isinstance(student_data, dict):
            df = pd.DataFrame([student_data])
        elif isinstance(student_data, pd.DataFrame):
            df = student_data.copy()
        else:
            raise TypeError("student_data must be a dict or pandas DataFrame")
        
        logger.info(f"Processing {len(df)} student(s)")
        
        # DEBUG: Print input
        print(f"\n🔍 Input Data:")
        print(df[['student_id', 'attendance_percentage', 'test1_marks', 'test2_marks', 'fees_paid']].to_string(index=False))
        
        # Step 1: Apply feature engineering
        df = feature_engineering(df)
        
        # DEBUG: Show engineered features
        print(f"\n🔍 Engineered Features:")
        debug_cols = ['student_id', 'average_marks', 'marks_trend', 'attendance_flag', 'low_marks_flag', 'fee_flag']
        print(df[debug_cols].to_string(index=False))
        
        # Step 2: Apply rule-based scoring
        df_rb = assign_risk_level(df)
        
        # DEBUG: Show rule-based score
        rule_score = df_rb['risk_score'].iloc[0]
        print(f"\n🔍 Rule-Based Risk Score: {rule_score:.1f}/{MAX_RISK_SCORE}")
        print(f"   Rule Risk Level: {df_rb['risk_level'].iloc[0]}")
        
        # Step 3: Prepare ML features
        X = _prepare_features(df_rb)
        
        # Step 4: Get ML model prediction
        try:
            model = load_model(model_path)
            proba = model.predict_proba(X)
            
            # Get probability of dropout (class 1)
            if proba.shape[1] == 1:
                ml_prob = pd.Series(proba[:, 0], index=df_rb.index)
            else:
                ml_prob = pd.Series(proba[:, 1], index=df_rb.index)
            
            ml_prob_value = ml_prob.iloc[0]
            print(f"\n🔍 ML Dropout Probability: {ml_prob_value:.3f}")
            
        except FileNotFoundError as e:
            logger.warning(f"Model not found: {e}. Using rule-based only.")
            ml_prob_value = 0.0
            print(f"\n⚠️ Model not found, using rule-based only")
        
        # Step 5: Normalize rule score with non-linear scaling
        normalized_rule_raw = rule_score / MAX_RISK_SCORE
        normalized_rule = normalized_rule_raw ** 0.6  # Non-linear boost for high scores
        
        print(f"\n🔍 Rule Score Normalization:")
        print(f"   Raw: {normalized_rule_raw:.3f}")
        print(f"   Boosted: {normalized_rule:.3f}")
        
        # Calculate final score
        final_score_value = (ML_WEIGHT * ml_prob_value) + (RULE_WEIGHT * normalized_rule)
        
        # DEBUG: Show combination
        print(f"\n🔍 Score Combination:")
        print(f"   ML Weight ({ML_WEIGHT}) * {ml_prob_value:.3f} = {ML_WEIGHT * ml_prob_value:.3f}")
        print(f"   Rule Weight ({RULE_WEIGHT}) * {normalized_rule:.3f} = {RULE_WEIGHT * normalized_rule:.3f}")
        print(f"   Final Score: {final_score_value:.3f}")
        
        # Step 6: Assign final risk levels
        final_risk = _assign_final_risk_level(final_score_value)
        
        print(f"\n✅ Final Prediction: {final_risk} (Score: {final_score_value:.3f})")
        
        # Create result DataFrame
        result = pd.DataFrame({
            "student_id": [df_rb['student_id'].iloc[0]],
            "final_score": [round(final_score_value, 3)],
            "risk_level": [final_risk]
        })
        
        logger.info(f"Prediction complete: {result.iloc[0].to_dict()}")
        
        return result
        
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise

def batch_predict(inputs, model_path=None):
    """Predict dropout for multiple students"""
    if isinstance(inputs, list):
        df = pd.DataFrame(inputs)
    elif isinstance(inputs, pd.DataFrame):
        df = inputs.copy()
    else:
        raise TypeError("inputs must be a list of dicts or pandas DataFrame")
    
    return predict_dropout(df, model_path=model_path)

if __name__ == "__main__":
    # Test with your high-risk student
    print("="*60)
    print("TESTING STUDENT 2003 (Should be HIGH)")
    print("="*60)
    
    test_student = {
        "student_id": 2003,
        "attendance_percentage": 65,
        "test1_marks": 30,
        "test2_marks": 55,
        "fees_paid": False
    }
    
    result = predict_dropout(test_student)
    
    print("\n" + "="*60)
    print("TESTING STUDENT 2000 (Should be HIGH)")
    print("="*60)
    
    test_student2 = {
        "student_id": 2000,
        "attendance_percentage": 50,
        "test1_marks": 40,
        "test2_marks": 50,
        "fees_paid": False
    }
    
    result2 = predict_dropout(test_student2)