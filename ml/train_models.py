import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd

# Add root directory to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from sklearn.model_selection import train_test_split, StratifiedKFold, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)

from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor

try:
    from xgboost import XGBClassifier, XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

from ml.statistical_analysis import run_statistical_analysis

DATASET_PATH = "student_placement_prediction_dataset_2026.csv"
MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

NUMERICAL_FEATURES = [
    'age', 'cgpa', 'internships_count', 'projects_count', 'certifications_count',
    'coding_skill_score', 'aptitude_score', 'communication_skill_score',
    'logical_reasoning_score', 'hackathons_participated', 'github_repos',
    'linkedin_connections', 'mock_interview_score', 'attendance_percentage',
    'backlogs', 'extracurricular_score', 'leadership_score', 'sleep_hours',
    'study_hours_per_day'
]

CATEGORICAL_FEATURES = [
    'gender', 'branch', 'college_tier', 'volunteer_experience'
]

def main():
    print("==================================================")
    print("  CareerPredict AI — Production ML Training Script")
    print("==================================================")
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
    
    df = pd.read_csv(DATASET_PATH)
    print(f"✓ Loaded dataset: {df.shape[0]:,} records, {df.shape[1]} columns.")

    # Cast data types cleanly
    for col in NUMERICAL_FEATURES:
        df[col] = df[col].astype(float)
    for col in CATEGORICAL_FEATURES:
        df[col] = df[col].astype(str)

    print("\n[Step 1/4] Running Real Statistical Analysis (Chi-Square & Correlations)...")
    stats_data = run_statistical_analysis(DATASET_PATH)
    print("✓ Statistical testing complete.")

    # -------------------------------------------------------------
    # STAGE 1: CLASSIFICATION PIPELINE
    # Target: placement_status ('Placed' vs 'Not Placed')
    # -------------------------------------------------------------
    print("\n[Step 2/4] Training & Validating Stage 1 Classification Pipeline...")
    X_clf = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES].copy()
    y_clf = (df['placement_status'] == 'Placed').astype(int)

    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X_clf, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False, dtype=np.float64), CATEGORICAL_FEATURES)
        ]
    )

    classifiers = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
    }

    if HAS_XGBOOST:
        classifiers["XGBoost"] = XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42, n_jobs=-1, eval_metric='logloss')

    best_clf_name = None
    best_clf_score = -1.0
    best_clf_pipeline = None
    clf_results = []
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, clf_model in classifiers.items():
        t0 = time.time()
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf_model)
        ])
        
        cv_scores = cross_val_score(pipeline, X_train_c, y_train_c, cv=skf, scoring='roc_auc', n_jobs=1)
        mean_cv = float(np.mean(cv_scores))
        std_cv = float(np.std(cv_scores))

        pipeline.fit(X_train_c, y_train_c)
        train_time = round(time.time() - t0, 2)

        y_pred = pipeline.predict(X_test_c)
        if hasattr(pipeline, "predict_proba"):
            y_proba = pipeline.predict_proba(X_test_c)[:, 1]
            auc = float(roc_auc_score(y_test_c, y_proba))
        else:
            auc = float(roc_auc_score(y_test_c, y_pred))

        acc = float(accuracy_score(y_test_c, y_pred))
        prec = float(precision_score(y_test_c, y_pred))
        rec = float(recall_score(y_test_c, y_pred))
        f1 = float(f1_score(y_test_c, y_pred))
        cm = confusion_matrix(y_test_c, y_pred).tolist()

        res = {
            "model_name": name,
            "cv_roc_auc_mean": round(mean_cv, 4),
            "cv_roc_auc_std": round(std_cv, 4),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "training_time_sec": train_time
        }
        clf_results.append(res)
        print(f"  • {name:20s} | CV ROC-AUC: {mean_cv:.4f} (±{std_cv:.4f}) | Test Acc: {acc:.4f} | Test AUC: {auc:.4f}")

        if auc > best_clf_score:
            best_clf_score = auc
            best_clf_name = name
            best_clf_pipeline = pipeline

    print(f"✓ Selected Primary Classifier: {best_clf_name} (Test ROC-AUC = {best_clf_score:.4f})")
    clf_model_path = os.path.join(MODEL_DIR, "placement_classifier.pkl")
    joblib.dump(best_clf_pipeline, clf_model_path)

    # -------------------------------------------------------------
    # STAGE 2: REGRESSION PIPELINE
    # Target: salary_package_lpa (for Placed students with > 0 LPA)
    # -------------------------------------------------------------
    print("\n[Step 3/4] Training & Validating Stage 2 Regression Pipeline...")
    df_reg = df[(df['placement_status'] == 'Placed') & (df['salary_package_lpa'] > 0)].copy()
    X_reg = df_reg[NUMERICAL_FEATURES + CATEGORICAL_FEATURES].copy()
    y_reg = df_reg['salary_package_lpa'].astype(float)

    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_reg, y_reg, test_size=0.2, random_state=42
    )

    regressors = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0),
        "Decision Tree Regressor": DecisionTreeRegressor(max_depth=10, random_state=42),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
        "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    }

    if HAS_XGBOOST:
        regressors["XGBoost Regressor"] = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42, n_jobs=-1)

    best_reg_name = None
    best_reg_score = -999.0
    best_reg_pipeline = None
    reg_results = []
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    for name, reg_model in regressors.items():
        t0 = time.time()
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', reg_model)
        ])
        
        cv_r2_scores = cross_val_score(pipeline, X_train_r, y_train_r, cv=kf, scoring='r2', n_jobs=1)
        mean_cv_r2 = float(np.mean(cv_r2_scores))
        std_cv_r2 = float(np.std(cv_r2_scores))

        pipeline.fit(X_train_r, y_train_r)
        train_time = round(time.time() - t0, 2)

        y_pred_r = pipeline.predict(X_test_r)
        mae = float(mean_absolute_error(y_test_r, y_pred_r))
        rmse = float(np.sqrt(mean_squared_error(y_test_r, y_pred_r)))
        r2 = float(r2_score(y_test_r, y_pred_r))

        res = {
            "model_name": name,
            "cv_r2_mean": round(mean_cv_r2, 4),
            "cv_r2_std": round(std_cv_r2, 4),
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "training_time_sec": train_time
        }
        reg_results.append(res)
        print(f"  • {name:28s} | CV R²: {mean_cv_r2:.4f} | Test MAE: ₹{mae:.2f} LPA | Test R²: {r2:.4f}")

        if r2 > best_reg_score:
            best_reg_score = r2
            best_reg_name = name
            best_reg_pipeline = pipeline

    print(f"✓ Selected Primary Regressor: {best_reg_name} (Test R² = {best_reg_score:.4f})")
    reg_model_path = os.path.join(MODEL_DIR, "package_regressor.pkl")
    joblib.dump(best_reg_pipeline, reg_model_path)

    # Extract Feature Importances from Best Classifier
    print("\n[Step 4/4] Computing Feature Importance Weights & Exporting Metadata...")
    fitted_clf_model = best_clf_pipeline.named_steps['classifier']
    ohe_cat_cols = best_clf_pipeline.named_steps['preprocessor'].named_transformers_['cat'].get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    all_transformed_feature_names = NUMERICAL_FEATURES + ohe_cat_cols

    feature_importances = []
    if hasattr(fitted_clf_model, 'feature_importances_'):
        raw_importances = fitted_clf_model.feature_importances_
        for name, imp in zip(all_transformed_feature_names, raw_importances):
            feature_importances.append({"feature": name, "importance": round(float(imp * 100), 2)})
        feature_importances = sorted(feature_importances, key=lambda x: x["importance"], reverse=True)[:10]
    elif hasattr(fitted_clf_model, 'coef_'):
        raw_importances = np.abs(fitted_clf_model.coef_[0])
        total_imp = np.sum(raw_importances)
        for name, imp in zip(all_transformed_feature_names, raw_importances):
            feature_importances.append({"feature": name, "importance": round(float((imp / total_imp) * 100), 2)})
        feature_importances = sorted(feature_importances, key=lambda x: x["importance"], reverse=True)[:10]

    best_clf_info = next(item for item in clf_results if item["model_name"] == best_clf_name)
    best_reg_info = next(item for item in reg_results if item["model_name"] == best_reg_name)

    metadata = {
        "dataset_info": {
            "total_records": len(df),
            "classification_records": len(df),
            "regression_records": len(df_reg),
            "placed_count": int((df['placement_status'] == 'Placed').sum()),
            "not_placed_count": int((df['placement_status'] == 'Not Placed').sum()),
            "avg_placed_lpa": round(float(df_reg['salary_package_lpa'].mean()), 2),
            "min_placed_lpa": round(float(df_reg['salary_package_lpa'].min()), 2),
            "max_placed_lpa": round(float(df_reg['salary_package_lpa'].max()), 2)
        },
        "features": {
            "numerical": NUMERICAL_FEATURES,
            "categorical": CATEGORICAL_FEATURES
        },
        "classification": {
            "selected_algorithm": best_clf_name,
            "metrics": best_clf_info,
            "all_candidates": clf_results
        },
        "regression": {
            "selected_algorithm": best_reg_name,
            "metrics": best_reg_info,
            "all_candidates": reg_results
        },
        "feature_importance": feature_importances,
        "statistical_analysis": stats_data
    }

    metadata_path = os.path.join(MODEL_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✓ Saved updated metadata JSON to {metadata_path}")
    print("\n==================================================")
    print("  Production ML Pipeline Training Completed Successfully!")
    print("==================================================")

if __name__ == "__main__":
    main()
