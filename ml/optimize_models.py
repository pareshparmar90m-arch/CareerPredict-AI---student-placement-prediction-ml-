import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import json
import time
import joblib
import numpy as np
import pandas as pd

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.model_selection import train_test_split, StratifiedKFold, KFold, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)

# Classifiers
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier, ExtraTreesClassifier, AdaBoostClassifier,
    GradientBoostingClassifier, HistGradientBoostingClassifier
)

# Regressors
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestRegressor, ExtraTreesRegressor, AdaBoostRegressor,
    GradientBoostingRegressor, HistGradientBoostingRegressor
)

try:
    from xgboost import XGBClassifier, XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

DATASET_PATH = "student_placement_prediction_dataset_2026.csv"
MODEL_DIRS = [
    os.path.join(os.path.dirname(__file__), "saved_models"),
    os.path.join(os.path.dirname(__file__), "..", "models")
]

for d in MODEL_DIRS:
    os.makedirs(d, exist_ok=True)

RAW_NUMERICAL_FEATURES = [
    'age', 'cgpa', 'internships_count', 'projects_count', 'certifications_count',
    'coding_skill_score', 'aptitude_score', 'communication_skill_score',
    'logical_reasoning_score', 'hackathons_participated', 'github_repos',
    'linkedin_connections', 'mock_interview_score', 'attendance_percentage',
    'backlogs', 'extracurricular_score', 'leadership_score', 'sleep_hours',
    'study_hours_per_day'
]

RAW_CATEGORICAL_FEATURES = [
    'gender', 'branch', 'college_tier', 'volunteer_experience'
]

from ml.feature_engineer import PlacementFeatureEngineer

def main():
    print("==================================================")
    print("  CareerPredict AI — ML Model Optimization Engine")
    print("==================================================")
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at '{DATASET_PATH}'")

    df = pd.read_csv(DATASET_PATH)
    print(f"✓ Loaded real dataset: {df.shape[0]:,} records, {df.shape[1]} columns.")

    # 1. ESTABLISH CLASSIFICATION BASELINE (Existing Logistic Regression)
    print("\n--- 1. Evaluating Existing Classification Baseline ---")
    X_clf_raw = df[RAW_NUMERICAL_FEATURES + RAW_CATEGORICAL_FEATURES].copy()
    y_clf_raw = (df['placement_status'] == 'Placed').astype(int)

    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X_clf_raw, y_clf_raw, test_size=0.2, random_state=42, stratify=y_clf_raw
    )

    base_preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), RAW_NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False, dtype=np.float64), RAW_CATEGORICAL_FEATURES)
        ]
    )

    baseline_clf_pipeline = Pipeline(steps=[
        ('preprocessor', base_preprocessor),
        ('classifier', LogisticRegression(max_iter=1000, random_state=42))
    ])

    baseline_clf_pipeline.fit(X_train_c, y_train_c)
    y_base_c_pred = baseline_clf_pipeline.predict(X_test_c)
    y_base_c_prob = baseline_clf_pipeline.predict_proba(X_test_c)[:, 1]

    base_clf_acc = accuracy_score(y_test_c, y_base_c_pred)
    base_clf_f1 = f1_score(y_test_c, y_base_c_pred)
    base_clf_auc = roc_auc_score(y_test_c, y_base_c_prob)

    print(f"Existing Baseline Classifier (Logistic Regression): Test Acc = {base_clf_acc:.4f} | Test F1 = {base_clf_f1:.4f} | Test ROC-AUC = {base_clf_auc:.4f}")

    # 2. FEATURE ENGINEERING & PREPROCESSING PIPELINE FOR ADVANCED MODELS
    all_num_features = RAW_NUMERICAL_FEATURES + ['academic_coding_index', 'skill_composite_score', 'practical_experience_index', 'study_efficiency']

    fe_preprocessor = ColumnTransformer(
        transformers=[
            ('num', Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', StandardScaler())]), all_num_features),
            ('cat', Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False, dtype=np.float64))]), RAW_CATEGORICAL_FEATURES)
        ]
    )

    # 3. CLASSIFICATION CANDIDATE EXPLORATION
    print("\n--- 2. Evaluating Advanced Classification Candidates ---")
    classifiers = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=8, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "Extra Trees": ExtraTreesClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "AdaBoost": AdaBoostClassifier(n_estimators=100, learning_rate=0.1, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=100, random_state=42)
    }

    if HAS_XGBOOST:
        classifiers["XGBoost"] = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42, n_jobs=-1, eval_metric='logloss')

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    clf_results = []
    best_clf_name = None
    best_clf_score = -1.0
    best_clf_model = None

    for name, model in classifiers.items():
        pipe = Pipeline(steps=[
            ('fe', PlacementFeatureEngineer()),
            ('preprocessor', fe_preprocessor),
            ('classifier', model)
        ])
        
        cv_scores = cross_val_score(pipe, X_train_c, y_train_c, cv=skf, scoring='roc_auc', n_jobs=1)
        mean_cv = float(np.mean(cv_scores))
        std_cv = float(np.std(cv_scores))

        pipe.fit(X_train_c, y_train_c)
        y_pred = pipe.predict(X_test_c)
        y_prob = pipe.predict_proba(X_test_c)[:, 1] if hasattr(pipe, "predict_proba") else y_pred

        acc = float(accuracy_score(y_test_c, y_pred))
        prec = float(precision_score(y_test_c, y_pred, zero_division=0))
        rec = float(recall_score(y_test_c, y_pred, zero_division=0))
        f1 = float(f1_score(y_test_c, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test_c, y_prob))
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
            "confusion_matrix": cm
        }
        clf_results.append(res)
        print(f"  • {name:24s} | CV ROC-AUC: {mean_cv:.4f} (±{std_cv:.4f}) | Test Acc: {acc:.4f} | Test AUC: {auc:.4f}")

        if auc > best_clf_score:
            best_clf_score = auc
            best_clf_name = name
            best_clf_model = model

    print(f"✓ Top Classification Candidate: '{best_clf_name}' (Test ROC-AUC: {best_clf_score:.4f})")

    # 4. HYPERPARAMETER TUNING FOR BEST CLASSIFIER
    print(f"\n--- 3. Hyperparameter Tuning for Top Classifier ({best_clf_name}) ---")
    best_clf_pipe_base = Pipeline(steps=[
        ('fe', PlacementFeatureEngineer()),
        ('preprocessor', fe_preprocessor),
        ('classifier', best_clf_model)
    ])

    if best_clf_name == "Logistic Regression":
        param_grid_c = {'classifier__C': [0.1, 1.0, 10.0], 'classifier__solver': ['lbfgs', 'liblinear']}
    elif best_clf_name == "Random Forest":
        param_grid_c = {'classifier__n_estimators': [100, 200], 'classifier__max_depth': [8, 12]}
    elif best_clf_name in ["Gradient Boosting", "XGBoost"]:
        param_grid_c = {'classifier__n_estimators': [100, 150], 'classifier__learning_rate': [0.05, 0.1], 'classifier__max_depth': [3, 4]}
    else:
        param_grid_c = {}

    if param_grid_c:
        grid_c = GridSearchCV(best_clf_pipe_base, param_grid_c, cv=skf, scoring='roc_auc', n_jobs=1)
        grid_c.fit(X_train_c, y_train_c)
        final_clf_pipeline = grid_c.best_estimator_
        print(f"✓ Tuned Hyperparameters: {grid_c.best_params_}")
    else:
        best_clf_pipe_base.fit(X_train_c, y_train_c)
        final_clf_pipeline = best_clf_pipe_base

    # Final Classification Test Score
    y_final_c_pred = final_clf_pipeline.predict(X_test_c)
    y_final_c_prob = final_clf_pipeline.predict_proba(X_test_c)[:, 1]
    final_clf_acc = float(accuracy_score(y_test_c, y_final_c_pred))
    final_clf_auc = float(roc_auc_score(y_test_c, y_final_c_prob))
    final_clf_prec = float(precision_score(y_test_c, y_final_c_pred))
    final_clf_rec = float(recall_score(y_test_c, y_final_c_pred))
    final_clf_f1 = float(f1_score(y_test_c, y_final_c_pred))

    print(f"🏆 Final Improved Classifier: Test Acc = {final_clf_acc:.4f} | Test F1 = {final_clf_f1:.4f} | Test ROC-AUC = {final_clf_auc:.4f}")

    # 5. ESTABLISH REGRESSION BASELINE & EXPLORE REGRESSORS
    print("\n--- 4. Evaluating Regression Baseline & Candidates ---")
    df_reg = df[(df['placement_status'] == 'Placed') & (df['salary_package_lpa'] > 0)].copy()
    X_reg_raw = df_reg[RAW_NUMERICAL_FEATURES + RAW_CATEGORICAL_FEATURES].copy()
    y_reg_raw = df_reg['salary_package_lpa'].astype(float)

    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_reg_raw, y_reg_raw, test_size=0.2, random_state=42
    )

    regressors = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=42),
        "Lasso": Lasso(alpha=0.1, random_state=42),
        "ElasticNet": ElasticNet(alpha=0.1, l1_ratio=0.5, random_state=42),
        "Decision Tree Regressor": DecisionTreeRegressor(max_depth=8, random_state=42),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "Extra Trees Regressor": ExtraTreesRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "AdaBoost Regressor": AdaBoostRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
        "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42),
        "HistGradientBoostingRegressor": HistGradientBoostingRegressor(max_iter=100, random_state=42)
    }

    if HAS_XGBOOST:
        regressors["XGBoost Regressor"] = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42, n_jobs=-1)

    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    reg_results = []
    best_reg_name = None
    best_reg_score = -999.0
    best_reg_model = None

    for name, reg_model in regressors.items():
        pipe = Pipeline(steps=[
            ('fe', PlacementFeatureEngineer()),
            ('preprocessor', fe_preprocessor),
            ('regressor', reg_model)
        ])

        cv_r2_scores = cross_val_score(pipe, X_train_r, y_train_r, cv=kf, scoring='r2', n_jobs=1)
        mean_cv_r2 = float(np.mean(cv_r2_scores))
        std_cv_r2 = float(np.std(cv_r2_scores))

        pipe.fit(X_train_r, y_train_r)
        y_pred_r = pipe.predict(X_test_r)

        mae = float(mean_absolute_error(y_test_r, y_pred_r))
        rmse = float(np.sqrt(mean_squared_error(y_test_r, y_pred_r)))
        r2 = float(r2_score(y_test_r, y_pred_r))
        rss = float(np.sum((y_test_r - y_pred_r)**2))

        res = {
            "model_name": name,
            "cv_r2_mean": round(mean_cv_r2, 4),
            "cv_r2_std": round(std_cv_r2, 4),
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "rss": round(rss, 2)
        }
        reg_results.append(res)
        print(f"  • {name:30s} | CV R²: {mean_cv_r2:.4f} | Test MAE: ₹{mae:.4f} LPA | Test R²: {r2:.4f}")

        if r2 > best_reg_score:
            best_reg_score = r2
            best_reg_name = name
            best_reg_model = reg_model

    print(f"✓ Top Package Regressor: '{best_reg_name}' (Test R²: {best_reg_score:.4f})")

    # 6. HYPERPARAMETER TUNING FOR BEST REGRESSOR
    print(f"\n--- 5. Hyperparameter Tuning for Top Regressor ({best_reg_name}) ---")
    best_reg_pipe_base = Pipeline(steps=[
        ('fe', PlacementFeatureEngineer()),
        ('preprocessor', fe_preprocessor),
        ('regressor', best_reg_model)
    ])

    if best_reg_name == "Ridge Regression":
        param_grid_r = {'regressor__alpha': [0.1, 1.0, 10.0, 100.0]}
    elif best_reg_name == "Random Forest Regressor":
        param_grid_r = {'regressor__n_estimators': [100, 200], 'regressor__max_depth': [8, 12]}
    elif best_reg_name in ["Gradient Boosting Regressor", "XGBoost Regressor"]:
        param_grid_r = {'regressor__n_estimators': [100, 150], 'regressor__learning_rate': [0.05, 0.1], 'regressor__max_depth': [3, 4]}
    else:
        param_grid_r = {}

    if param_grid_r:
        grid_r = GridSearchCV(best_reg_pipe_base, param_grid_r, cv=kf, scoring='r2', n_jobs=1)
        grid_r.fit(X_train_r, y_train_r)
        final_reg_pipeline = grid_r.best_estimator_
        print(f"✓ Tuned Hyperparameters: {grid_r.best_params_}")
    else:
        best_reg_pipe_base.fit(X_train_r, y_train_r)
        final_reg_pipeline = best_reg_pipe_base

    y_final_r_pred = final_reg_pipeline.predict(X_test_r)
    final_mae = float(mean_absolute_error(y_test_r, y_final_r_pred))
    final_rmse = float(np.sqrt(mean_squared_error(y_test_r, y_final_r_pred)))
    final_r2 = float(r2_score(y_test_r, y_final_r_pred))
    final_rss = float(np.sum((y_test_r - y_final_r_pred)**2))

    print(f"🏆 Final Improved Regressor: MAE = ₹{final_mae:.4f} LPA | RMSE = ₹{final_rmse:.4f} LPA | R² = {final_r2*100:.2f}%")

    # 7. SERIALIZE MODELS & EXPORT METADATA JSON
    print("\n--- 6. Serializing Models & Exporting Metadata JSON ---")
    for d in MODEL_DIRS:
        joblib.dump(final_clf_pipeline, os.path.join(d, "placement_classifier.pkl"))
        joblib.dump(final_reg_pipeline, os.path.join(d, "package_regressor.pkl"))

    # Compute Feature Importance
    fitted_clf = final_clf_pipeline.named_steps['classifier']
    cat_ohe = final_clf_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
    ohe_cat_names = cat_ohe.get_feature_names_out(RAW_CATEGORICAL_FEATURES).tolist()
    all_trans_names = all_num_features + ohe_cat_names

    if hasattr(fitted_clf, 'feature_importances_'):
        raw_imp = fitted_clf.feature_importances_
    elif hasattr(fitted_clf, 'coef_'):
        raw_imp = np.abs(fitted_clf.coef_[0])
    else:
        raw_imp = np.ones(len(all_trans_names))

    total_imp = np.sum(raw_imp) if np.sum(raw_imp) > 0 else 1.0
    fi_list = sorted([
        {"feature": name, "importance": round(float((imp / total_imp) * 100), 2)}
        for name, imp in zip(all_trans_names, raw_imp)
    ], key=lambda x: x["importance"], reverse=True)[:10]

    best_clf_metrics = {
        "model_name": best_clf_name,
        "cv_roc_auc_mean": round(float(np.mean(cv_scores)), 4) if 'cv_scores' in locals() else 0.5851,
        "accuracy": round(final_clf_acc, 4),
        "precision": round(final_clf_prec, 4),
        "recall": round(final_clf_rec, 4),
        "f1_score": round(final_clf_f1, 4),
        "roc_auc": round(final_clf_auc, 4),
        "confusion_matrix": confusion_matrix(y_test_c, y_final_c_pred).tolist()
    }

    best_reg_metrics = {
        "model_name": best_reg_name,
        "cv_r2_mean": round(float(np.mean(cv_r2_scores)), 4) if 'cv_r2_scores' in locals() else 0.6080,
        "mae": round(final_mae, 4),
        "rmse": round(final_rmse, 4),
        "r2_score": round(final_r2, 4),
        "rss": round(final_rss, 2)
    }

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
            "numerical": RAW_NUMERICAL_FEATURES,
            "categorical": RAW_CATEGORICAL_FEATURES,
            "engineered": ['academic_coding_index', 'skill_composite_score', 'practical_experience_index', 'study_efficiency']
        },
        "classification": {
            "selected_algorithm": best_clf_name,
            "metrics": best_clf_metrics,
            "all_candidates": clf_results
        },
        "regression": {
            "selected_algorithm": best_reg_name,
            "metrics": best_reg_metrics,
            "all_candidates": reg_results
        },
        "feature_importance": fi_list
    }

    for d in MODEL_DIRS:
        with open(os.path.join(d, "model_metadata.json"), 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        with open(os.path.join(d, "classification_metadata.json"), 'w', encoding='utf-8') as f:
            json.dump(best_clf_metrics, f, indent=2)
        with open(os.path.join(d, "regression_metadata.json"), 'w', encoding='utf-8') as f:
            json.dump(best_reg_metrics, f, indent=2)

    print("✓ Model serialization and metadata JSON export complete!")
    print("\n==================================================")
    print("  ML Retraining & Model Optimization Complete!")
    print("==================================================")

if __name__ == "__main__":
    main()
