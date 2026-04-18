import pandas as pd
import os
from pathlib import Path


def merge_data():
    """
    Merge attendance, marks, and fees CSV files on student_id.
    Remove duplicate student records and save the cleaned dataset.

    Returns:
        pd.DataFrame: Cleaned merged dataframe
    """
    try:
        # Get the base directory (ml-service/)
        BASE_DIR = Path(__file__).resolve().parent.parent.parent

        # Define paths for raw data and processed output
        data_dir = BASE_DIR / 'data' / 'raw'
        output_dir = BASE_DIR / 'data' / 'processed'

        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)

        # Load CSV files
        print("Loading CSV files...")
        attendance_df = pd.read_csv(data_dir / 'attendance.csv')
        marks_df = pd.read_csv(data_dir / 'marks.csv')
        fees_df = pd.read_csv(data_dir / 'fees.csv')

        print(f"Attendance data shape: {attendance_df.shape}")
        print(f"Marks data shape: {marks_df.shape}")
        print(f"Fees data shape: {fees_df.shape}")

        # Step 1: Merge attendance and marks on student_id
        print("Merging attendance and marks data...")
        merged_df = attendance_df.merge(marks_df, on='student_id', how='outer')

        # Step 2: Merge the result with fees on student_id
        print("Merging with fees data...")
        merged_df = merged_df.merge(fees_df, on='student_id', how='outer')

        print(f"Merged data shape before removing duplicates: {merged_df.shape}")

        # Step 3: Remove duplicate student records based on student_id
        # Keep the first occurrence of each student_id
        print("Removing duplicate student records...")
        merged_df = merged_df.drop_duplicates(subset='student_id', keep='first')

        print(f"Merged data shape after removing duplicates: {merged_df.shape}")

        # Step 4: Save the cleaned dataset
        output_path = output_dir / 'merged_data.csv'
        merged_df.to_csv(output_path, index=False)
        print(f"Cleaned merged data saved to: {output_path}")

        return merged_df

    except FileNotFoundError as e:
        print(f"Error: Required CSV file not found - {e}")
        return None
    except Exception as e:
        print(f"Error merging data: {e}")
        return None


if __name__ == "__main__":
    merged_data = merge_data()
    if merged_data is not None:
        print(f"Final merged data shape: {merged_data.shape}")
        print("All rows:")
        print(merged_data.head())
    else:
        print("Merging failed")