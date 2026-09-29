@echo off
setlocal enabledelayedexpansion
title TechNova React AI Portal
cd /d "%~dp0"

echo ==========================================================
echo        TechNova AI Agent - React & FastAPI Edition
echo ==========================================================
echo.

if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment .venv...
    call .venv\Scripts\activate.bat
)

echo [INFO] Starting FastAPI Backend on http://localhost:8000 ...
start "TechNova FastAPI Backend" cmd /k "title TechNova API Backend && cd /d "%~dp0" && python -m uvicorn api:app --port 8000 --host 127.0.0.1"

echo [INFO] Starting Vite React Frontend on http://localhost:5173 ...
start "TechNova React Frontend" cmd /k "title TechNova React Frontend && cd /d "%~dp0frontend" && npm run dev -- --port 5173"

echo [INFO] Opening React Portal in your browser...
ping 127.0.0.1 -n 3 >nul
start http://localhost:5173

echo ==========================================================
echo [SUCCESS] TechNova React Portal launched!
echo - React Web App:      http://localhost:5173
echo - Python REST API:    http://localhost:8000/docs
echo - Streamlit Edition:  Run start_website.bat (port 8501)
echo ==========================================================
