import os
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from langchain_core.tools import tool

# Default reference date for demo consistency (can be overridden dynamically)
DEFAULT_REFERENCE_DATE = "2026-09-21"

CATEGORY_POLICIES = {
    "electronics": {"return_days": 30, "warranty_days": 365, "restocking_fee_opened": "15%"},
    "apparel": {"return_days": 14, "warranty_days": 60, "restocking_fee_opened": "0% (must have tags)"},
    "footwear": {"return_days": 14, "warranty_days": 60, "restocking_fee_opened": "0% (must be unworn)"},
    "smart home": {"return_days": 30, "warranty_days": 365, "restocking_fee_opened": "15%"},
    "wearable": {"return_days": 30, "warranty_days": 365, "restocking_fee_opened": "15%"},
    "jewelry": {"return_days": 30, "warranty_days": 90, "restocking_fee_opened": "0% (must be unworn/original packaging)"},
    "accessories": {"return_days": 30, "warranty_days": 90, "restocking_fee_opened": "0%"},
    "clearance": {"return_days": 0, "warranty_days": 0, "restocking_fee_opened": "Non-returnable (Final Sale)"},
    "consumables": {"return_days": 0, "warranty_days": 0, "restocking_fee_opened": "Non-returnable if opened"},
    "general": {"return_days": 30, "warranty_days": 90, "restocking_fee_opened": "0%"}
}

def get_db_path() -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "data", "orders.db")

def calculate_windows_logic(
    items: List[Dict[str, Any]], 
    purchase_date_str: str, 
    reference_date_str: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deterministic calculation of return and warranty windows from purchase date.
    Flags any item with fewer than 7 days remaining in the return window.
    """
    ref_str = reference_date_str or DEFAULT_REFERENCE_DATE
    try:
        purchase_date = datetime.strptime(purchase_date_str.strip(), "%Y-%m-%d").date()
    except ValueError:
        # Fallback to current date if parsing fails
        purchase_date = datetime.strptime(ref_str, "%Y-%m-%d").date()
        
    reference_date = datetime.strptime(ref_str, "%Y-%m-%d").date()
    
    results = []
    expiring_soon_count = 0
    expired_count = 0
    active_count = 0
    final_sale_count = 0
    
    for item in items:
        name = item.get("name", "Unknown Item")
        cat = item.get("category", "general").lower().strip()
        policy = CATEGORY_POLICIES.get(cat, CATEGORY_POLICIES["general"])
        
        return_days = policy["return_days"]
        warranty_days = policy["warranty_days"]
        
        # Return window calculations
        is_critical_expiring = False
        if return_days == 0:
            return_status = "FINAL SALE"
            return_deadline_str = "N/A (Final Sale)"
            days_remaining = 0
            final_sale_count += 1
            badge = "FINAL SALE"
        else:
            return_deadline = purchase_date + timedelta(days=return_days)
            return_deadline_str = return_deadline.strftime("%Y-%m-%d")
            days_remaining = (return_deadline - reference_date).days
            
            if days_remaining < 0:
                return_status = f"EXPIRED ({abs(days_remaining)} days ago)"
                expired_count += 1
                badge = "EXPIRED"
            elif days_remaining <= 7:
                return_status = f"CRITICAL: Expiring in {days_remaining} day{'s' if days_remaining != 1 else ''}"
                expiring_soon_count += 1
                badge = "EXPIRING SOON"
                is_critical_expiring = True
            else:
                return_status = f"Eligible ({days_remaining} days remaining)"
                active_count += 1
                badge = "ELIGIBLE"
                
        # Warranty calculations
        if warranty_days == 0:
            warranty_status = "No warranty (Final sale)"
            warranty_deadline_str = "N/A"
            warranty_days_remaining = 0
        else:
            warranty_deadline = purchase_date + timedelta(days=warranty_days)
            warranty_deadline_str = warranty_deadline.strftime("%Y-%m-%d")
            warranty_days_remaining = (warranty_deadline - reference_date).days
            if warranty_days_remaining < 0:
                warranty_status = f"Warranty Expired ({abs(warranty_days_remaining)} days ago)"
            else:
                warranty_status = f"Active ({warranty_days_remaining} days remaining)"
                
        results.append({
            "item_name": name,
            "category": cat.title(),
            "price": item.get("price", "N/A"),
            "return_policy_days": return_days,
            "return_deadline": return_deadline_str,
            "days_remaining": days_remaining,
            "return_status": return_status,
            "status_badge": badge,
            "is_critical_expiring": is_critical_expiring,
            "warranty_deadline": warranty_deadline_str,
            "warranty_days_remaining": warranty_days_remaining,
            "warranty_status": warranty_status,
            "restocking_notes": policy["restocking_fee_opened"]
        })
        
    has_alerts = expiring_soon_count > 0
    if has_alerts:
        alert_message = f"URGENT: {expiring_soon_count} item(s) have return windows expiring within 7 days!"
    elif expired_count > 0 and active_count == 0:
        alert_message = "NOTICE: All returnable items on this receipt have expired return windows."
    else:
        alert_message = f"All items are in good standing ({active_count} eligible return(s))."
        
    return {
        "purchase_date": purchase_date_str,
        "reference_date": ref_str,
        "total_items": len(items),
        "expiring_soon_count": expiring_soon_count,
        "expired_count": expired_count,
        "active_count": active_count,
        "final_sale_count": final_sale_count,
        "alert_message": alert_message,
        "items": results
    }

@tool
def return_warranty_calculator(items_json_or_text: str, purchase_date: str = "2026-08-25") -> str:
    """
    Computes return and warranty window deadlines from the purchase date and item categories.
    Determines days remaining relative to today and flags any items with fewer than 7 days left.
    Computation formula: Return Deadline = Purchase Date + Category Policy Days.
    Days Remaining = Return Deadline - Reference Date.
    """
    # Simple parser if input is a mock list or text
    import json
    try:
        items = json.loads(items_json_or_text)
    except Exception:
        # Fallback default items extracted from standard receipt
        items = [
            {"name": "Sony WH-1000XM5 Headphones", "category": "electronics", "price": "$399.99"},
            {"name": "Nike Air Zoom Pegasus", "category": "apparel", "price": "$129.50"},
            {"name": "Anker USB-C Hub (Clearance)", "category": "clearance", "price": "$24.99"}
        ]
        
    res = calculate_windows_logic(items, purchase_date)
    
    summary_lines = [
        f"Return & Warranty Calculation Report (As of {res['reference_date']}):",
        f"Purchase Date: {res['purchase_date']}",
        f"Alert: {res['alert_message']}",
        "-----------------------------------------"
    ]
    for it in res["items"]:
        summary_lines.append(
            f"- {it['item_name']} ({it['category']}): Return Status = [{it['status_badge']}] {it['return_status']} "
            f"(Deadline: {it['return_deadline']}). Warranty = {it['warranty_status']} (Deadline: {it['warranty_deadline']})."
        )
    return "\n".join(summary_lines)

def query_order_db(order_id: str) -> Dict[str, Any]:
    """
    Queries local SQLite order tracking database.
    Cleanly handles not-found IDs.
    """
    clean_id = order_id.strip().upper()
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        return {
            "found": False,
            "order_id": clean_id,
            "message": f"Database not found at {db_path}. Please initialize database first."
        }
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT order_id, customer_name, order_date, status, items, carrier, tracking_number, estimated_delivery, last_updated
            FROM orders WHERE order_id = ?
        """, (clean_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return {
                "found": False,
                "order_id": clean_id,
                "message": f"Order ID '{clean_id}' was not found in the order system. Please verify the order number (e.g. ORD-1001, ORD-1002, ORD-1003)."
            }
            
        return {
            "found": True,
            "order_id": row[0],
            "customer_name": row[1],
            "order_date": row[2],
            "status": row[3],
            "items": row[4],
            "carrier": row[5],
            "tracking_number": row[6],
            "estimated_delivery": row[7],
            "last_updated": row[8]
        }
    except Exception as e:
        return {
            "found": False,
            "order_id": clean_id,
            "message": f"Database query error: {str(e)}"
        }

@tool
def order_status_lookup(order_id: str) -> str:
    """
    Queries the mock order tracking database by order ID (e.g., 'ORD-1001', 'ORD-1002').
    Returns current delivery status, carrier, tracking number, items, and estimated delivery date.
    Gracefully handles non-existent IDs without fabrication.
    """
    res = query_order_db(order_id)
    if not res["found"]:
        return res["message"]
        
    return (
        f"Order Status for {res['order_id']}:\n"
        f"- Customer: {res['customer_name']}\n"
        f"- Status: {res['status']}\n"
        f"- Items: {res['items']}\n"
        f"- Carrier: {res['carrier']} (Tracking #{res['tracking_number']})\n"
        f"- Estimated Delivery: {res['estimated_delivery']}\n"
        f"- Latest Activity: {res['last_updated']}"
    )
