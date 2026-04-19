# feature_engineering.py
# Step 3 of the AI Dropout Prediction System
# Transforms raw student data into ML-ready features

import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR  = Path(__file__).resolve().parent.parent.parent
data_path = BASE_DIR / "data" / "processed" / "merged_data.csv"


def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:

    # 1. Average Marks
    df["average_marks"] = (df["test1_marks"] + df["test2_marks"]) / 2

    # 2. Marks Trend (MOST IMPORTANT 🔥)
    # Why trend is important: Tracks student performance over time.
    # A declining trend indicates potential dropout risk, while improvement shows positive progress.
    # How it's calculated: Difference between test2 and test1 marks, then categorized.
    # Handle missing marks safely by treating NaN differences as no change (0).
    df["marks_trend"] = (df["test2_marks"] - df["test1_marks"]).apply(
        lambda x: 1 if pd.notna(x) and x > 0 else (-1 if pd.notna(x) and x < 0 else 0)
    )

    # 3. Attendance Flag
    df["attendance_flag"] = (df["attendance_percentage"] < 75).astype(int)

    # 4. Fee Flag
    df["fees_paid"] = df["fees_paid"].astype(str).str.lower() == "true"
    df["fee_flag"] = (~df["fees_paid"]).astype(int)

    # 5. Low Marks Flag (use 40 as pass threshold)
    df["low_marks_flag"] = (df["average_marks"] < 40).astype(int)

    df["performance_ratio"] = df["average_marks"] / 40

    return df


# ── MAIN: Test with merged_data.csv ──────────────────────────────────────────
if __name__ == "__main__":

    # ── Load data ─────────────────────────────────────────────────────────────
    try:
        df = pd.read_csv(data_path)
        print(f"✓ Loaded real merged data — {len(df)} rows")
    except FileNotFoundError:
        print("❌ Real merged_data.csv not found")
        exit()          # ← FIXED: inside except so it only runs on failure
                        #   Previously it was un-indented (same level as try),
                        #   so Python ran it unconditionally — even on success —
                        #   stopping the script right after the load message.

    # ── Validate required columns ─────────────────────────────────────────────
    required = {
    "name",
    "student_id",
    "attendance_percentage",
    "fees_paid",
    "test1_marks",
    "test2_marks"
}
    missing = required - set(df.columns)
    if missing:
        print(f"Available columns: {list(df.columns)}")
        raise ValueError(f"Missing required columns: {missing}")

    # ── Apply feature engineering ─────────────────────────────────────────────
    df = feature_engineering(df)
    print("\n── Engineered Features (first 5 rows) ──────────────────────────────────")
    print(df[["name","student_id", "average_marks", "marks_trend",
          "attendance_flag", "fee_flag", "low_marks_flag"]].head().to_string(index=False))

    # ── Sample output: student_id and marks_trend ────────────────────────────
    print("\n── Sample Marks Trend Output ────────────────────────────────────────────")
    print(df[["student_id", "marks_trend"]].head().to_string(index=False))

    # ── Summary statistics for each flag ──────────────────────────────────────
    print("\n── Flag Summary ────────────────────────────────────────────────────────")
    total   = len(df)
    att_cnt = df["attendance_flag"].sum()
    fee_cnt = df["fee_flag"].sum()
    low_cnt = df["low_marks_flag"].sum()

    for label, count in [
        ("Low attendance  (< 75%)",           att_cnt),
        ("Fees not paid",                     fee_cnt),
        ("Low marks (< 40)",             low_cnt),
    ]:
        bar = "█" * int(count) + "░" * (total - int(count))
        print(f"  {label:32s}  {count:>4}/{total}  [{bar}]")
    
    print(f"\n  Average performance ratio: {df['performance_ratio'].mean():.2f}")

    # ── Save enriched file ────────────────────────────────────────────────────
    output_path = BASE_DIR / "data" / "processed" / "merged_data_engineered.csv"
    df.to_csv(output_path, index=False)
    print(f"\n✓ Saved enriched dataset → {output_path}")
    print(f"  Columns now: {list(df.columns)}")