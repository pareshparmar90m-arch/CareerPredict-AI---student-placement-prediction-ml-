import os
import json
import joblib
import numpy as np
import pandas as pd
from backend.schemas.prediction_schema import StudentPredictionInput, PredictionResponse
from ml.feature_engineer import PlacementFeatureEngineer

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "saved_models")

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
        
        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
        print("FastAPI Backend: Loaded ML models successfully.")

    def predict(self, student_input: StudentPredictionInput) -> PredictionResponse:
        if self.clf_pipeline is None or self.reg_pipeline is None:
            self.load_models()

        input_dict = student_input.dict()
        df_input = pd.DataFrame([input_dict])

        # Stage 1: Classification Prediction
        clf_pred_class = self.clf_pipeline.predict(df_input)[0]
        
        if hasattr(self.clf_pipeline, "predict_proba"):
            proba = float(self.clf_pipeline.predict_proba(df_input)[0][1])
        else:
            proba = 1.0 if clf_pred_class == 1 else 0.0

        placement_status = "Placed" if proba >= 0.5 else "Not Placed"
        proba_pct = round(proba * 100, 1)

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
            estimated_lpa = round(max(3.0, min(25.0, raw_lpa)), 2)

        stage_breakdown = {
            "stage_1_classification": {
                "status": "Executed",
                "predicted_status": placement_status,
                "raw_probability": proba,
                "algorithm": self.metadata["classification"]["selected_algorithm"] if self.metadata else "Saved Pipeline"
            },
            "stage_2_regression": {
                "status": "Executed" if placement_status == "Placed" else "Skipped (Not Placed)",
                "estimated_lpa": estimated_lpa,
                "algorithm": self.metadata["regression"]["selected_algorithm"] if self.metadata else "Saved Pipeline"
            }
        }

        return PredictionResponse(
            placement_prediction=placement_status,
            placement_probability=round(proba, 4),
            placement_probability_pct=proba_pct,
            estimated_package_lpa=estimated_lpa,
            confidence_level=confidence,
            stage_breakdown=stage_breakdown
        )

# Global singleton service
prediction_service = PredictionService()
