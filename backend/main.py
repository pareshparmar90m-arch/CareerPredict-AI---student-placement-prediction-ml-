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

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)

@app.get("/")
@app.get("/health")
async def root():
    return {
        "title": "Student Placement & Package Prediction System API",
        "status": "online",
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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
