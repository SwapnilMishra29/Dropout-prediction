from predict import predict_dropout
import pandas as pd

data = {
    "student_id": [9999],
    "attendance_percentage": [40],
    "average_marks": [30],
    "marks_trend": [-1],
    "attendance_flag": [1],
    "fee_flag": [1],
    "low_marks_flag": [1],
    "performance_ratio": [0.3]
}


df = pd.DataFrame(data)

result = predict_dropout(df)

print(result)