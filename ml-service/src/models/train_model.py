"""
Train model for Dropout Early Warning System
Optimized for your 100-record dataset
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, recall_score, precision_score, f1_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTETomek
import warnings
warnings.filterwarnings('ignore')

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from data.feature_engineering import feature_engineering
from rules.risk_rules import assign_risk_level

def prepare_training_data(df: pd.DataFrame) -> tuple:
    """
    Prepare data for training by creating target variable
    """
    df = df.copy()
    
    # Use rule-based risk score as target
    df = assign_risk_level(df)
    
    # Create target: HIGH risk = dropout (1)
    df["dropout_risk"] = (df["risk_level"] == "HIGH").astype(int)
    
    # Feature columns
    feature_cols = [
        "attendance_percentage",
        "average_marks",
        "marks_trend",
        "attendance_flag",
        "fee_flag",
        "low_marks_flag",
        "performance_ratio",
    ]
    
    # Ensure all feature columns exist
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0
    
    X = df[feature_cols]
    y = df["dropout_risk"]
    
    return X, y, feature_cols

def train_model(data_path=None):
    """Main training function optimized for 100 records"""
    
    if data_path is None:
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        data_path = BASE_DIR / "data" / "processed" / "merged_data_engineered.csv"
    
    print("="*60)
    print("🎯 DROPOUT PREDICTION MODEL TRAINING")
    print("="*60)
    
    print(f"📂 Loading data from: {data_path}")
    
    # Load engineered data
    if not os.path.exists(data_path):
        print(f"❌ Data file not found: {data_path}")
        return None
    
    df = pd.read_csv(data_path)
    print(f"✅ Loaded {len(df)} records")
    
    # Prepare features and target
    X, y, feature_cols = prepare_training_data(df)
    
    print(f"\n📊 Dataset Analysis:")
    print(f"  Total records: {len(df)}")
    print(f"  Features: {len(feature_cols)}")
    print(f"  Target distribution:")
    print(f"    Not Dropout (0): {(y==0).sum()} ({(y==0).mean()*100:.1f}%)")
    print(f"    Dropout (1): {(y==1).sum()} ({(y==1).mean()*100:.1f}%)")
    print(f"  Imbalance ratio: {max(y.value_counts())/min(y.value_counts()):.1f}:1")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📊 Train/Test Split:")
    print(f"  Training set: {len(X_train)} records")
    print(f"    - Not Dropout: {(y_train==0).sum()} ({(y_train==0).mean()*100:.1f}%)")
    print(f"    - Dropout: {(y_train==1).sum()} ({(y_train==1).mean()*100:.1f}%)")
    print(f"  Test set: {len(X_test)} records")
    print(f"    - Not Dropout: {(y_test==0).sum()} ({(y_test==0).mean()*100:.1f}%)")
    print(f"    - Dropout: {(y_test==1).sum()} ({(y_test==1).mean()*100:.1f}%)")
    
    # Apply SMOTE for handling imbalance
    print(f"\n🔄 Applying SMOTE for handling class imbalance...")
    try:
        smote = SMOTE(random_state=42, k_neighbors=min(5, y_train.value_counts().min() - 1))
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
        print(f"  Before SMOTE: {len(X_train)} records")
        print(f"  After SMOTE: {len(X_train_resampled)} records")
        print(f"  Dropout samples increased from {(y_train==1).sum()} to {(y_train_resampled==1).sum()}")
    except Exception as e:
        print(f"  ⚠️ SMOTE failed: {e}. Using original data.")
        X_train_resampled, y_train_resampled = X_train, y_train
    
    # Try multiple models
    models = {
        'RandomForest': RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=3,
            min_samples_leaf=1,
            random_state=42,
            class_weight='balanced'
        ),
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        ),
        'LogisticRegression': LogisticRegression(
            class_weight='balanced',
            random_state=42,
            max_iter=1000
        )
    }
    
    best_model = None
    best_recall = 0
    best_score = 0
    
    print(f"\n🔧 Training multiple models...")
    print("-"*60)
    
    for name, model in models.items():
        # Train model
        model.fit(X_train_resampled, y_train_resampled)
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred, zero_division=0)
        precision = precision_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        print(f"\n{name}:")
        print(f"  Accuracy:  {accuracy:.4f}")
        print(f"  Recall:    {recall:.4f} (Important: How many dropouts caught)")
        print(f"  Precision: {precision:.4f}")
        print(f"  F1-Score:  {f1:.4f}")
        
        # Track best model based on recall (catching dropouts is priority)
        if recall > best_recall:
            best_recall = recall
            best_model = model
            best_score = accuracy
    
    # Hyperparameter tuning for best model
    print(f"\n🔧 Fine-tuning best model ({best_model.__class__.__name__})...")
    
    if isinstance(best_model, RandomForestClassifier):
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [5, 8, 10],
            'min_samples_split': [2, 3, 5],
            'class_weight': ['balanced', 'balanced_subsample']
        }
        
        grid_search = GridSearchCV(
            best_model, param_grid, cv=3, 
            scoring='recall', n_jobs=-1
        )
        grid_search.fit(X_train_resampled, y_train_resampled)
        
        best_model = grid_search.best_estimator_
        print(f"  Best parameters: {grid_search.best_params_}")
    
    # Final evaluation
    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)[:, 1]
    
    print("\n" + "="*60)
    print("📊 FINAL MODEL EVALUATION")
    print("="*60)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Recall (Dropout detection): {recall_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"F1-Score: {f1_score(y_test, y_pred):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Dropout', 'Dropout']))
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print(f"\n  True Negatives: {cm[0][0]} | False Positives: {cm[0][1]}")
    print(f"  False Negatives: {cm[1][0]} | True Positives: {cm[1][1]}")
    
    # Feature importance
    if hasattr(best_model, 'feature_importances_'):
        importance_df = pd.DataFrame({
            'feature': feature_cols,
            'importance': best_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n📈 Feature Importance:")
        print(importance_df.to_string(index=False))
        
        # Add interpretation
        print("\n💡 Insights:")
        top_features = importance_df.head(3)['feature'].tolist()
        print(f"  Top 3 important features: {', '.join(top_features)}")
        
        if importance_df[importance_df['feature'] == 'marks_trend']['importance'].values[0] < 0.01:
            print("  ⚠️ 'marks_trend' has low importance - Consider removing it")
    
    # Cross-validation
    try:
        cv_scores = cross_val_score(best_model, X, y, cv=5, scoring='recall')
        print(f"\n📊 5-Fold Cross-Validation (Recall):")
        print(f"  Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        print(f"  Scores: {cv_scores}")
    except Exception as e:
        print(f"\n⚠️ Cross-validation skipped: {e}")
    
    # Save model and metadata
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    model_dir = BASE_DIR / "models"
    model_dir.mkdir(exist_ok=True)
    
    model_path = model_dir / "model.pkl"
    joblib.dump(best_model, model_path)
    
    feature_path = model_dir / "feature_columns.pkl"
    joblib.dump(feature_cols, feature_path)
    
    # Save performance metrics
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'f1_score': f1_score(y_test, y_pred),
        'confusion_matrix': cm.tolist(),
        'feature_importance': importance_df.to_dict('records') if 'importance_df' in locals() else None,
        'model_type': best_model.__class__.__name__
    }
    
    metrics_path = model_dir / "model_metrics.pkl"
    joblib.dump(metrics, metrics_path)
    
    print(f"\n✅ Model saved to: {model_path}")
    print(f"✅ Features saved to: {feature_path}")
    print(f"✅ Metrics saved to: {metrics_path}")
    
    return best_model

if __name__ == "__main__":
    model = train_model()
    
    if model:
        print("\n" + "="*60)
        print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\nNext steps:")
        print("1. Run: python app.py")
        print("2. Test with: curl -X POST http://localhost:7860/predict ...")
    else:
        print("\n❌ Training failed!")