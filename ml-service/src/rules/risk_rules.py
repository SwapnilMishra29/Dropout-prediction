import pandas as pd
import os

def assign_risk_level(df: pd.DataFrame) -> pd.DataFrame:

    required_cols = [
        "attendance_flag",
        "fee_flag",
        "low_marks_flag",
        "marks_trend"
    ]

    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Create trend_flag: 1 if declining performance (marks_trend == -1), else 0
    df["trend_flag"] = df["marks_trend"].apply(lambda x: 1 if x == -1 else 0)

    # Improved weighted risk scoring
    # Higher weights for critical factors: attendance and marks (2.0 each)
    # Medium weight for fees (1.5)
    # Lower weight for trend (1.0)
    df["risk_score"] = (
        (df["attendance_flag"] * 2.0) +
        (df["low_marks_flag"] * 2.0) +
        (df["fee_flag"] * 1.5) +
        (df["trend_flag"] * 1.0)
    )

    # Define improved risk levels based on weighted scores
    def get_risk_level(score):
        if score < 2:
            return "LOW"
        elif score < 4:
            return "MEDIUM"
        else:
            return "HIGH"

    df["risk_level"] = df["risk_score"].apply(get_risk_level)

    # Assign risk colors for visualization
    color_map = {
        "LOW": "green",
        "MEDIUM": "yellow",
        "HIGH": "red"
    }

    df["risk_color"] = df["risk_level"].map(color_map)

    return df


# ---------------- MAIN ---------------- #

if __name__ == "__main__":
    try:
        # Get current file directory (IMPORTANT FIX)
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        # Go to ml-service root
        ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../"))

        # Correct paths
        input_path = os.path.join(ROOT_DIR, "data/processed/merged_data_engineered.csv")
        output_path = os.path.join(ROOT_DIR, "data/processed/final_output.csv")

        print(f"📂 Reading from: {input_path}")

        df = pd.read_csv(input_path)

        df = assign_risk_level(df)

        print("\n✅ Sample Output:")
        print(df[["student_id", "risk_score", "risk_level"]].to_string(index=False))

        df.to_csv(output_path, index=False)

        print(f"\n📁 Saved to: {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")