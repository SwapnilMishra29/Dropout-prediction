"""
Feature Engineering Module
Transforms raw student data into ML-ready features with CONSISTENT thresholds
"""

import pandas as pd
import numpy as np
from pathlib import Path

# GLOBAL CONSTANTS - SINGLE SOURCE OF TRUTH
# Change these thresholds
ATTENDANCE_THRESHOLD = 75  # Keep this
LOW_MARKS_THRESHOLD = 50   # CHANGE from 40 to 50! ⭐
PERFORMANCE_BASELINE = 50  # CHANGE from 40 to 50

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # Average Marks
    df["average_marks"] = (df["test1_marks"] + df["test2_marks"]) / 2
    
    # Marks Trend (with smaller threshold for change detection)
    df["marks_trend"] = (df["test2_marks"] - df["test1_marks"]).apply(
        lambda x: 1 if pd.notna(x) and x > 3 else (  # Changed from 5 to 3
            -1 if pd.notna(x) and x < -3 else 0
        )
    )
    
    # Attendance Flag
    df["attendance_flag"] = (df["attendance_percentage"] < ATTENDANCE_THRESHOLD).astype(int)
    
    # Fee Flag
    df["fees_paid"] = df["fees_paid"].astype(str).str.lower().isin(["true", "1", "yes"])
    df["fee_flag"] = (~df["fees_paid"]).astype(int)
    
    # Low Marks Flag - USING NEW THRESHOLD 50
    df["low_marks_flag"] = (df["average_marks"] < LOW_MARKS_THRESHOLD).astype(int)
    
    # Performance Ratio - USING NEW BASELINE 50
    df["performance_ratio"] = (df["average_marks"] / PERFORMANCE_BASELINE).clip(0, 2)
    
    return df

def validate_features(df: pd.DataFrame) -> bool:
    """Validate that all required features exist"""
    required_features = [
        "attendance_percentage",
        "average_marks", 
        "marks_trend",
        "attendance_flag",
        "fee_flag",
        "low_marks_flag",
        "performance_ratio"
    ]
    
    missing = [f for f in required_features if f not in df.columns]
    if missing:
        print(f"❌ Missing features: {missing}")
        return False
    
    print("✅ All required features present")
    return True

if __name__ == "__main__":
    # Load data
    try:
        df = pd.read_csv(data_path)
        print(f"✓ Loaded merged data — {len(df)} rows")
        
        # Validate required columns
        required_cols = ["student_id", "attendance_percentage", "fees_paid", 
                        "test1_marks", "test2_marks"]
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"❌ Missing columns: {missing_cols}")
            print(f"Available columns: {list(df.columns)}")
            exit()
        
        # Apply feature engineering
        df = feature_engineering(df)
        
        print("\n✅ Engineered Features (first 5 rows):")
        display_cols = ["student_id", "average_marks", "marks_trend", 
                       "attendance_flag", "fee_flag", "low_marks_flag", 
                       "performance_ratio"]
        print(df[display_cols].head().to_string(index=False))
        
        # Summary statistics
        print("\n📊 Feature Summary:")
        print(f"  Average marks: {df['average_marks'].mean():.2f}")
        print(f"  Low attendance (flag=1): {df['attendance_flag'].sum()}/{len(df)}")
        print(f"  Fees not paid (flag=1): {df['fee_flag'].sum()}/{len(df)}")
        print(f"  Low marks (flag=1): {df['low_marks_flag'].sum()}/{len(df)}")
        print(f"  Negative trend: {(df['marks_trend'] == -1).sum()}/{len(df)}")
        
        # Save enriched file
        output_path = BASE_DIR / "data" / "processed" / "merged_data_engineered.csv"
        df.to_csv(output_path, index=False)
        print(f"\n✓ Saved enriched dataset → {output_path}")
        
    except FileNotFoundError:
        print("❌ merged_data.csv not found. Run merge_data.py first.")
        exit()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()