@echo off
setlocal enabledelayedexpansion
title TechNova Retail AI Web Server
cd /d "%~dp0"

echo ==========================================================
echo       TechNova Retail - Order & Warranty AI Agent
echo ==========================================================
echo.

netstat -aon | findstr :8501 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] TechNova website is ALREADY running on http://localhost:8501
    echo Opening browser...
    start http://localhost:8501
    ping 127.0.0.1 -n 3 >nul
    exit /b 0
)

if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment .venv...
    call .venv\Scripts\activate.bat
)

netstat -aon | findstr :11434 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Starting Ollama local engine in background...
    where ollama >nul 2>&1
    if %errorlevel% equ 0 (
        start "" /b ollama serve >nul 2>&1
    ) else if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        start "" /b "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve >nul 2>&1
    )
)

set "STREAMLIT_CMD=streamlit"
where streamlit >nul 2>&1
if %errorlevel% neq 0 (
    set "STREAMLIT_CMD=python -m streamlit"
)

start "" cmd /c "ping 127.0.0.1 -n 4 >nul & start http://localhost:8501"

echo [INFO] Starting web server on http://localhost:8501 ...
echo [INFO] Your browser will open automatically in a moment.
echo [TIP]  To turn off: Close this window or run 'Stop TechNova Website'.
echo ==========================================================
echo.

%STREAMLIT_CMD% run app.py --server.headless=true --server.port=8501