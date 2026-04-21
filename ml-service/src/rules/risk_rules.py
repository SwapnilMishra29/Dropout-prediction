"""
Rule-based risk scoring module
Consistent with feature engineering thresholds
"""

import pandas as pd
import numpy as np

# Constants matching feature_engineering.py
ATTENDANCE_THRESHOLD = 75
LOW_MARKS_THRESHOLD = 50  # CHANGED: Should be 50, not 40!
MAX_RISK_SCORE = 8.0      # Updated to match new weights (2.5+2.5+2.0+1.0 = 8.0)

def assign_risk_level(df: pd.DataFrame) -> pd.DataFrame:
    """
    Assign risk scores and levels based on business rules
    
    Args:
        df: DataFrame with columns: attendance_flag, fee_flag, low_marks_flag, marks_trend
        
    Returns:
        DataFrame with added columns: risk_score, risk_level, risk_color
    """
    df = df.copy()
    
    # Required columns check
    required_cols = ["attendance_flag", "fee_flag", "low_marks_flag", "marks_trend"]
    
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Convert to numeric and handle invalid values
    for col in required_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        # Ensure binary for flag columns (0 or 1)
        if col != "marks_trend":
            df[col] = df[col].clip(0, 1).astype(int)
    
    # Create trend_flag: 1 if declining performance (marks_trend == -1)
    df["trend_flag"] = (df["marks_trend"] == -1).astype(int)
    
    # Weighted risk scoring for better sensitivity
    # Weights: Attendance=2.5, Marks=2.5, Fees=2.0, Trend=1.0
    df["risk_score"] = (
        (df["attendance_flag"] * 2.5) +      # Critical: attendance issues
        (df["low_marks_flag"] * 2.5) +       # Critical: academic performance
        (df["fee_flag"] * 2.0) +             # Important: financial issues
        (df["trend_flag"] * 1.0)              # Moderate: declining trend
    )
    
    # Clip to max score (8.0)
    df["risk_score"] = df["risk_score"].clip(0, MAX_RISK_SCORE)
    
    # Risk level thresholds (sensitive to catch at-risk students early)
    def get_risk_level(score):
        if score < 2.5:      # Low risk (0-2.49)
            return "LOW"
        elif score < 5.0:    # Medium risk (2.5-4.99)
            return "MEDIUM"
        else:                 # High risk (5.0-8.0)
            return "HIGH"
    
    df["risk_level"] = df["risk_score"].apply(get_risk_level)
    
    # Risk colors for visualization
    color_map = {
        "LOW": "green",
        "MEDIUM": "orange",
        "HIGH": "red"
    }
    df["risk_color"] = df["risk_level"].map(color_map)
    
    return df

def get_risk_description(risk_level: str) -> str:
    """Get detailed description of risk level"""
    descriptions = {
        "LOW": "Student is on track. Continue monitoring regularly.",
        "MEDIUM": "Student shows warning signs. Intervention recommended.",
        "HIGH": "Student at critical risk. Immediate intervention required!"
    }
    return descriptions.get(risk_level, "Unknown risk level")

def calculate_risk_factors(df: pd.DataFrame) -> pd.DataFrame:
    """Identify which risk factors are present for each student"""
    df = df.copy()
    
    df["risk_factors"] = df.apply(lambda row: [
        "Low Attendance" if row.get("attendance_flag", 0) else None,
        "Low Marks" if row.get("low_marks_flag", 0) else None,
        "Unpaid Fees" if row.get("fee_flag", 0) else None,
        "Declining Performance" if row.get("trend_flag", 0) else None
    ], axis=1)
    
    # Remove None values
    df["risk_factors"] = df["risk_factors"].apply(lambda x: [f for f in x if f is not None])
    df["risk_factor_count"] = df["risk_factors"].apply(len)
    
    return df

if __name__ == "__main__":
    # Test with comprehensive scenarios
    test_cases = pd.DataFrame({
        "student_id": [1, 2, 3, 4, 5, 6, 7, 8],
        "attendance_flag": [0, 1, 0, 1, 1, 1, 0, 1],
        "fee_flag": [0, 0, 1, 1, 0, 1, 1, 1],
        "low_marks_flag": [0, 0, 0, 1, 1, 1, 1, 1],
        "marks_trend": [1, 1, -1, 1, -1, 0, -1, -1],
        "description": [
            "Excellent student",
            "Only attendance issue",
            "Only declining trend", 
            "Attendance + fees",
            "Marks + trend",
            "All except trend",
            "All except attendance",
            "All risk factors (critical)"
        ]
    })
    
    print("="*60)
    print("RISK RULES TESTING")
    print("="*60)
    
    result = assign_risk_level(test_cases)
    result = calculate_risk_factors(result)
    
    for _, row in result.iterrows():
        print(f"\n📊 Student {row['student_id']}: {row['description']}")
        print(f"   Risk Score: {row['risk_score']:.1f}/8.0")
        print(f"   Risk Level: {row['risk_level']} ({row['risk_color']})")
        print(f"   Risk Factors: {', '.join(row['risk_factors']) if row['risk_factors'] else 'None'}")
        print(f"   {get_risk_description(row['risk_level'])}")
    
    # Test with your specific student
    print("\n" + "="*60)
    print("TESTING YOUR SPECIFIC STUDENT (2000)")
    print("="*60)
    
    student_2000 = pd.DataFrame({
        "student_id": [2000],
        "attendance_flag": [1],  # 50% attendance -> flag=1
        "fee_flag": [1],         # fees not paid -> flag=1  
        "low_marks_flag": [1],   # avg marks 45 (<50) -> flag=1
        "marks_trend": [1]       # improving (+10) -> trend=1 (not -1)
    })
    
    result = assign_risk_level(student_2000)
    print(f"\nRisk Score: {result['risk_score'].iloc[0]:.1f}/8.0")
    print(f"Risk Level: {result['risk_level'].iloc[0]}")
    print(f"Risk Color: {result['risk_color'].iloc[0]}")
    
    # Expected output calculation:
    # attendance_flag=1 * 2.5 = 2.5
    # low_marks_flag=1 * 2.5 = 2.5  
    # fee_flag=1 * 2.0 = 2.0
    # trend_flag=0 * 1.0 = 0
    # TOTAL = 7.0/8.0 = HIGH risk
    
    print("\n✅ Expected: HIGH risk (score ~7.0)")
    print(f"✅ Actual: {result['risk_level'].iloc[0]} risk (score {result['risk_score'].iloc[0]:.1f})")
    
    if result['risk_level'].iloc[0] == "HIGH":
        print("✅ CORRECT! Student 2000 is correctly identified as HIGH risk")
    else:
        print("⚠️ Still needs adjustment - should be HIGH risk")