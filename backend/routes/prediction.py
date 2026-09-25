from fastapi import APIRouter, HTTPException, status
from backend.schemas.prediction_schema import StudentPredictionInput, PredictionResponse
from backend.services.prediction_service import prediction_service

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "online",
        "service": "Student Placement Predictor ML API",
        "stage1_model_loaded": prediction_service.clf_pipeline is not None,
        "stage2_model_loaded": prediction_service.reg_pipeline is not None
    }

@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_placement(student_data: StudentPredictionInput):
    try:
        response = prediction_service.predict(student_data)
        return response
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"[FastAPI Prediction Error]:\n{error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing placement prediction pipeline: {str(e)}"
        )

@router.get("/model-info", status_code=status.HTTP_200_OK)
async def get_model_info():
    if not prediction_service.metadata:
        try:
            prediction_service.load_models()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model metadata currently unavailable: {str(e)}"
            )
    return {
        "status": "success",
        "metadata": prediction_service.metadata
    }

@router.get("/statistics", status_code=status.HTTP_200_OK)
async def get_statistics():
    if not prediction_service.metadata:
        try:
            prediction_service.load_models()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Metadata currently unavailable: {str(e)}"
            )
    stats_data = prediction_service.metadata.get("statistical_analysis", {})
    return {
        "status": "success",
        "statistical_analysis": stats_data,
        "dataset_summary": prediction_service.metadata.get("dataset_info", {})
    }

@router.get("/analytics", status_code=status.HTTP_200_OK)
async def get_analytics():
    if not prediction_service.metadata:
        try:
            prediction_service.load_models()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Metadata currently unavailable: {str(e)}"
            )
    return {
        "status": "success",
        "feature_importance": prediction_service.metadata.get("feature_importance", []),
        "classification_candidates": prediction_service.metadata.get("classification", {}).get("all_candidates", []),
        "regression_candidates": prediction_service.metadata.get("regression", {}).get("all_candidates", [])
    }
