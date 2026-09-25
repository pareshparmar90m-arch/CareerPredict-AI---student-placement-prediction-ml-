import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

# Ensure root project directory is in python path for unpickling custom transformers
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.schemas.prediction_schema import StudentPredictionInput, PredictionResponse
from ml.feature_engineer import PlacementFeatureEngineer

MODEL_DIR = os.path.join(ROOT_DIR, "ml", "saved_models")

def patch_sklearn_imputers(estimator):
    """Recursively patches SimpleImputer instances in scikit-learn pipelines to ensure cross-version compatibility (e.g. missing _fill_dtype attribute across sklearn versions)."""
    if estimator is None:
        return
    if not hasattr(estimator, "_fill_dtype") and hasattr(estimator, "statistics_"):
        try:
            setattr(estimator, "_fill_dtype", getattr(estimator, "statistics_", np.array([0.0])).dtype)
        except Exception:
            pass

    if hasattr(estimator, "named_steps"):
        for step_name, step in estimator.named_steps.items():
            patch_sklearn_imputers(step)
    elif hasattr(estimator, "transformers_"):
        for item in estimator.transformers_:
            if isinstance(item, (list, tuple)) and len(item) >= 2:
                patch_sklearn_imputers(item[1])
    elif hasattr(estimator, "named_transformers_"):
        for name, trans in estimator.named_transformers_.items():
            patch_sklearn_imputers(trans)
    elif hasattr(estimator, "steps"):
        for name, step in estimator.steps:
            patch_sklearn_imputers(step)

class PredictionService:
    def __init__(self, model_dir: str = MODEL_DIR):
        self.model_dir = model_dir
        self.clf_pipeline = None
        self.reg_pipeline = None
        self.metadata = None

    def load_models(self):
        clf_path = os.path.abspath(os.path.join(self.model_dir, "placement_classifier.pkl"))
        reg_path = os.path.abspath(os.path.join(self.model_dir, "package_regressor.pkl"))
        meta_path = os.path.abspath(os.path.join(self.model_dir, "model_metadata.json"))

        if not os.path.exists(clf_path) or not os.path.exists(reg_path):
            raise FileNotFoundError("Trained model files (.pkl) not found. Please train models first.")
        
        self.clf_pipeline = joblib.load(clf_path)
        self.reg_pipeline = joblib.load(reg_path)
        
        # Patch imputer version compatibility across scikit-learn releases
        patch_sklearn_imputers(self.clf_pipeline)
        patch_sklearn_imputers(self.reg_pipeline)

        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
        print("FastAPI Backend: Loaded ML models successfully.")

    def predict(self, student_input: StudentPredictionInput) -> PredictionResponse:
        if self.clf_pipeline is None or self.reg_pipeline is None:
            self.load_models()

        # Support both Pydantic v1 dict() and Pydantic v2 model_dump()
        if hasattr(student_input, "model_dump"):
            input_dict = student_input.model_dump()
        else:
            input_dict = student_input.dict()

        df_input = pd.DataFrame([input_dict])

        # Stage 1: Classification Prediction
        clf_pred_class = int(self.clf_pipeline.predict(df_input)[0])
        
        if hasattr(self.clf_pipeline, "predict_proba"):
            proba_raw = self.clf_pipeline.predict_proba(df_input)[0][1]
            proba = float(proba_raw)
        else:
            proba = 1.0 if clf_pred_class == 1 else 0.0

        placement_status = "Placed" if proba >= 0.5 else "Not Placed"
        proba_pct = float(round(proba * 100, 1))

        if proba >= 0.75 or proba <= 0.25:
            confidence = "High"
        elif 0.35 <= proba <= 0.65:
            confidence = "Moderate"
        else:
            confidence = "Medium"

        # Stage 2: Regression Prediction (Only if Placed)
        estimated_lpa = None
        if placement_status == "Placed":
            raw_lpa = float(self.reg_pipeline.predict(df_input)[0])
            # Ensure LPA is reasonably bounded within dataset ranges
            estimated_lpa = float(round(max(3.0, min(25.0, raw_lpa)), 2))

        # Safe metadata extraction
        clf_algo = "Saved Pipeline"
        reg_algo = "Saved Pipeline"
        if isinstance(self.metadata, dict):
            clf_algo = self.metadata.get("classification", {}).get("selected_algorithm", "Saved Pipeline")
            reg_algo = self.metadata.get("regression", {}).get("selected_algorithm", "Saved Pipeline")

        stage_breakdown = {
            "stage_1_classification": {
                "status": "Executed",
                "predicted_status": placement_status,
                "raw_probability": float(round(proba, 4)),
                "algorithm": clf_algo
            },
            "stage_2_regression": {
                "status": "Executed" if placement_status == "Placed" else "Skipped (Not Placed)",
                "estimated_lpa": estimated_lpa,
                "algorithm": reg_algo
            }
        }

        return PredictionResponse(
            placement_prediction=placement_status,
            placement_probability=float(round(proba, 4)),
            placement_probability_pct=proba_pct,
            estimated_package_lpa=estimated_lpa,
            confidence_level=confidence,
            stage_breakdown=stage_breakdown
        )

# Global singleton service
prediction_service = PredictionService()
