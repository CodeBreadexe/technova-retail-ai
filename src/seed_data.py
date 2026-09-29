import os
import sqlite3
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
RECEIPTS_DIR = os.path.join(DATA_DIR, "sample_receipts")
DB_PATH = os.path.join(DATA_DIR, "orders.db")

def init_mock_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            order_date TEXT NOT NULL,
            status TEXT NOT NULL,
            items TEXT NOT NULL,
            carrier TEXT NOT NULL,
            tracking_number TEXT NOT NULL,
            estimated_delivery TEXT NOT NULL,
            last_updated TEXT NOT NULL
        )
    """)
    
    # Sample orders
    orders_data = [
        (
            "ORD-1001",
            "Alex Mercer",
            "2026-09-15",
            "Delivered",
            "Sony WH-1000XM5 Headphones, USB-C Cable",
            "FedEx",
            "FDX-9821389472",
            "2026-09-18",
            "Delivered to front porch at 2:15 PM"
        ),
        (
            "ORD-1002",
            "Alex Mercer",
            "2026-09-18",
            "In Transit",
            "Nike Air Zoom Pegasus (Size 10)",
            "UPS Ground",
            "1Z999AA10123456784",
            "2026-09-23",
            "Arrived at Sorting Facility - Dallas, TX"
        ),
        (
            "ORD-1003",
            "Alex Mercer",
            "2026-09-20",
            "Processing",
            "Logitech MX Master 3S Mouse",
            "USPS Priority",
            "9400111899223190000000",
            "2026-09-25",
            "Order packed and awaiting carrier pickup"
        ),
        (
            "ORD-1004",
            "Samantha Vance",
            "2026-09-19",
            "Out for Delivery",
            "Apple Watch SE 40mm",
            "DHL Express",
            "DHL-55421098",
            "2026-09-21",
            "With courier for delivery by 8:00 PM"
        ),
        (
            "7714419343656",
            "Sidharth SIDDU",
            "2026-08-18",
            "In Transit",
            "White Flower Name Necklace",
            "Delhivery",
            "22017731381544",
            "2026-08-23",
            "In Transit via Delhivery - Package on the way from Glamorizee. Tracking: https://www.delhivery.com/track/package/22017731381544"
        )
    ]
    
    cursor.executemany("""
        INSERT OR REPLACE INTO orders 
        (order_id, customer_name, order_date, status, items, carrier, tracking_number, estimated_delivery, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, orders_data)
    
    conn.commit()
    conn.close()
    print(f"Mock database initialized at: {DB_PATH} with {len(orders_data)} records.")

def init_sample_receipts():
    os.makedirs(RECEIPTS_DIR, exist_ok=True)
    
    # Receipt 1: One item expiring soon (Sony Headphones: 3 days left), one active (Nike shoes), one clearance
    receipt_1 = """===================================================
                  TECHNOVA RETAIL
             STORE #402 - METROPOLIS CENTER
===================================================
Receipt Number: REC-84920-A
Order ID: ORD-1001
Customer: Alex Mercer
Date of Purchase: 2026-08-25
Payment Method: VISA ending in 4102

ITEMS PURCHASED:
---------------------------------------------------
1. Item: Sony WH-1000XM5 Wireless Headphones
   Category: Electronics
   SKU: EL-99410
   Quantity: 1
   Unit Price: $399.99
   Warranty: 1-Year Store/Manufacturer Limited Warranty

2. Item: Nike Air Zoom Pegasus Running Shoes
   Category: Apparel
   SKU: AP-12094
   Quantity: 1
   Unit Price: $129.50
   Warranty: 60-Day Limited Workmanship Warranty

3. Item: Anker USB-C Multiport Hub (Clearance)
   Category: Clearance
   SKU: CL-00321
   Quantity: 1
   Unit Price: $24.99
   Warranty: None - Final Sale

---------------------------------------------------
Subtotal: $554.48
Tax (8.25%): $45.74
Total Paid: $600.22
===================================================
Keep this receipt for all returns, exchanges, and warranty claims.
Return windows: Electronics 30 days, Apparel 14 days, Clearance 0 days.
===================================================
"""
    with open(os.path.join(RECEIPTS_DIR, "receipt_expiring_soon.txt"), "w", encoding="utf-8") as f:
        f.write(receipt_1)
        
    # Receipt 2: Fresh purchase, plenty of days left
    receipt_2 = """===================================================
                  TECHNOVA RETAIL
             STORE #108 - DOWNTOWN SQUARE
===================================================
Receipt Number: REC-99214-B
Order ID: ORD-1003
Customer: Alex Mercer
Date of Purchase: 2026-09-18
Payment Method: Apple Pay (Mastercard 9912)

ITEMS PURCHASED:
---------------------------------------------------
1. Item: Logitech MX Master 3S Performance Mouse
   Category: Electronics
   SKU: EL-44912
   Quantity: 1
   Unit Price: $99.99
   Warranty: 1-Year Manufacturer Warranty

2. Item: Levi's 511 Slim Fit Stretch Jeans
   Category: Apparel
   SKU: AP-88310
   Quantity: 2
   Unit Price: $69.50
   Warranty: 60-Day Workmanship Warranty

---------------------------------------------------
Subtotal: $238.99
Tax (8.25%): $19.72
Total Paid: $258.71
===================================================
"""
    with open(os.path.join(RECEIPTS_DIR, "receipt_active_window.txt"), "w", encoding="utf-8") as f:
        f.write(receipt_2)
        
    print(f"Sample receipts generated in: {RECEIPTS_DIR}")

if __name__ == "__main__":
    init_mock_db()
    init_sample_receipts()
