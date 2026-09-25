# 🚀 CareerPredict AI — Production Deployment Guide & Architecture

This document provides a complete, production-ready deployment guide for **CareerPredict AI** (Student Placement Probability & Package LPA Prediction System).

---

## 🏗️ 1. Architecture Overview

- **Frontend**: React (Vite) + TailwindCSS (Deployed on **Vercel** / CDN)
- **Backend**: FastAPI + Uvicorn + Scikit-Learn Pipelines (Deployed on **Render**)
- **ML Models**: Two-Stage Serialized Pipelines (`placement_classifier.pkl` & `package_regressor.pkl` stored in `ml/saved_models/` with `models/` backup)

```
React Frontend (Vercel CDN)
       |
       |  HTTPS API requests (configured via VITE_API_URL)
       v
FastAPI Backend (Render Web Service)
       |
       +---> ml/saved_models/placement_classifier.pkl  (Stage 1: Classification)
       +---> ml/saved_models/package_regressor.pkl     (Stage 2: Package Regression)
```

---

## 💻 2. Local Setup & Execution

### Backend Setup:
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start FastAPI local server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- **API Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`

### Frontend Setup:
```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start Vite dev server
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 🌐 3. Production Deployment Guide

### A. Backend Deployment on Render (Free Tier)
1. Log in to [Render](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub Repository (`origin/main`).
3. Set the following settings:
   - **Name**: `careerpredict-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Deploy the service and note your live URL (e.g. `https://careerpredict-api.onrender.com`).

### B. Frontend Deployment on Vercel
1. Log in to [Vercel](https://vercel.com) and import your GitHub Repository.
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://careerpredict-api.onrender.com/api`
4. Click **Deploy**.

---

## 🔒 4. CORS & Environment Variable Safety

- **Backend CORS**: Configured dynamically via `ALLOWED_ORIGINS` in `backend/main.py`.
- **Git Safety**: `.env`, `.env.local`, `.venv`, and `node_modules` are excluded in `.gitignore`.

---

## 📋 5. Final Production Deployment Checklist

- [x] GitHub repository ready (`origin/main`)
- [x] `backend/requirements.txt` created with exact versions
- [x] Backend tested locally (`http://127.0.0.1:8000`)
- [x] Classification tested (`placement_classifier.pkl`)
- [x] Regression tested (`package_regressor.pkl`)
- [x] Frontend tested locally (`http://localhost:5173`)
- [x] Production build tested (`npm run build` succeeded)
- [x] Render backend start command set (`--port $PORT`)
- [x] Health check verified (`/health`)
- [x] Vercel frontend build configured (`VITE_API_URL`)
- [x] CORS environment configuration ready
- [x] Git staging verified clean
