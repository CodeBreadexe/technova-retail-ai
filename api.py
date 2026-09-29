import os
import sys
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.tools import calculate_windows_logic, query_order_db, DEFAULT_REFERENCE_DATE
from src.rag_pipeline import build_vector_store, parse_receipt_text
from src.agent import build_agent_executor, get_llm, run_agent_query

app = FastAPI(title="TechNova Agent REST API", version="1.0.0")

# Enable CORS for React frontend (Vite defaults to 5173, Next defaults to 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
RECEIPTS_DIR = os.path.join(DATA_DIR, "sample_receipts")

# Global singleton agent executor
_AGENT_EXECUTOR = None

def get_cached_agent():
    global _AGENT_EXECUTOR
    if _AGENT_EXECUTOR is None:
        llm = get_llm()
        _AGENT_EXECUTOR = build_agent_executor(llm)
    return _AGENT_EXECUTOR

class IngestRequest(BaseModel):
    receipt_text: str
    reference_date: Optional[str] = DEFAULT_REFERENCE_DATE

class ChatRequest(BaseModel):
    query: str
    chat_history: Optional[List[List[str]]] = []

class CalculateRequest(BaseModel):
    items: List[Dict[str, Any]]
    purchase_date: str
    reference_date: Optional[str] = DEFAULT_REFERENCE_DATE

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "TechNova Agent API", "timestamp": datetime.now().isoformat()}

@app.get("/api/samples")
def get_sample_receipts():
    samples = {}
    if os.path.exists(RECEIPTS_DIR):
        for f in os.listdir(RECEIPTS_DIR):
            if f.endswith(".txt"):
                with open(os.path.join(RECEIPTS_DIR, f), "r", encoding="utf-8") as file:
                    samples[f] = file.read()
    return samples

@app.post("/api/ingest")
def ingest_receipt(req: IngestRequest):
    if not req.receipt_text.strip():
        raise HTTPException(status_code=400, detail="Receipt text is empty")
    try:
        vectorstore, meta = build_vector_store(req.receipt_text)
        calc_results = calculate_windows_logic(
            meta["items"],
            meta["purchase_date"],
            reference_date_str=req.reference_date
        )
        return {
            "success": True,
            "metadata": meta,
            "calculations": calc_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders")
def get_all_orders():
    db_path = os.path.join(DATA_DIR, "orders.db")
    if not os.path.exists(db_path):
        return []
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT order_id, customer_name, order_date, status, items, carrier, tracking_number, estimated_delivery, last_updated FROM orders ORDER BY order_date DESC")
        rows = cur.fetchall()
        conn.close()
        return [
            {
                "order_id": r[0],
                "customer_name": r[1],
                "order_date": r[2],
                "status": r[3],
                "items": r[4],
                "carrier": r[5],
                "tracking_number": r[6],
                "estimated_delivery": r[7],
                "last_updated": r[8]
            }
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders/{order_id}")
def get_order(order_id: str):
    res = query_order_db(order_id)
    if not res.get("found"):
        raise HTTPException(status_code=404, detail=res.get("message", "Order not found"))
    return res

@app.post("/api/calculate")
def calculate_deadlines(req: CalculateRequest):
    return calculate_windows_logic(req.items, req.purchase_date, req.reference_date)

@app.post("/api/chat")
def chat_with_copilot(req: ChatRequest):
    try:
        agent = get_cached_agent()
        result = run_agent_query(agent, req.query, req.chat_history)
        
        tool_calls = []
        if result.get("intermediate_steps"):
            for step in result["intermediate_steps"]:
                action, observation = step
                tool_calls.append({"tool": getattr(action, "tool", str(action)), "output": observation})
                
        return {
            "output": result["output"],
            "tool_calls": tool_calls
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
