#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "      TechNova Retail - Order & Warranty AI Agent"
echo "=========================================================="
echo ""

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 could not be found. Please install Python 3.10+."
    exit 1
fi

echo "[1/3] Checking virtual environment..."
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment in .venv..."
    python3 -m venv .venv
fi

echo "[2/3] Activating virtual environment and installing dependencies..."
source .venv/bin/activate
pip install -r requirements.txt

echo ""
echo "[3/3] Launching TechNova Web Application..."
echo "Opening in your browser at http://localhost:8501"
echo ""
streamlit run app.py
