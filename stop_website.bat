@echo off
setlocal enabledelayedexpansion
title TechNova Website - Stop
cd /d "%~dp0"

echo ==========================================================
echo           TechNova Retail - Stopping Website
echo ==========================================================
echo.

set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8501 ^| findstr LISTENING') do (
    set FOUND=1
    echo Terminating Streamlit server process PID: %%a...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    set FOUND=1
    echo Terminating FastAPI backend process PID: %%a...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    set FOUND=1
    echo Terminating Vite React frontend process PID: %%a...
    taskkill /F /PID %%a >nul 2>&1
)

if "!FOUND!"=="1" (
    echo.
    echo ==========================================================
    echo [SUCCESS] TechNova web services have been stopped.
    echo ==========================================================
) else (
    echo [INFO] No active TechNova web services found on ports 8501, 8000, or 5173.
)

echo.
echo Closing in 2 seconds...
ping 127.0.0.1 -n 3 >nul