@echo off
title TechNova Retail - Order & Warranty AI Agent
echo ==========================================================
echo       TechNova Retail - Order ^& Warranty AI Agent
echo ==========================================================
echo.

:: Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    echo Be sure to check "Add Python to PATH" during setup.
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking virtual environment...
if not exist ".venv" (
    echo Creating virtual environment in .venv...
    python -m venv .venv
)

echo [2/3] Activating virtual environment and installing dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [3/3] Launching TechNova Web Application...
echo Opening in your browser at http://localhost:8501
echo.
streamlit run app.py

pause
