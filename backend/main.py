import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root project directory is in python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.routes.prediction import router as prediction_router
from backend.services.prediction_service import prediction_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup
    print("[FastAPI Startup] Pre-loading ML pipelines & metadata...")
    prediction_service.load_models()
    yield
    print("[FastAPI Shutdown] Shutting down placement prediction service.")

app = FastAPI(
    title="Student Placement & Package Prediction API",
    description="Two-Stage ML API predicting student placement probability and expected salary package LPA",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (supports ALLOWED_ORIGINS env variable)
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)

@app.get("/")
@app.get("/health")
async def root():
    models_ready = (
        prediction_service.clf_pipeline is not None and 
        prediction_service.reg_pipeline is not None
    )
    return {
        "status": "healthy",
        "title": "Student Placement & Package Prediction System API",
        "models_loaded": models_ready,
        "docs_url": "/docs",
        "health_check": "/api/health",
        "model_info": "/api/model-info",
        "predict_endpoint": "/api/predict"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred.", "details": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
