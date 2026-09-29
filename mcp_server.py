import os
import sys
from fastmcp import FastMCP

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.tools import calculate_windows_logic, query_order_db

# Initialize FastMCP Server
mcp = FastMCP("TechNova-Order-Warranty-Tools")

@mcp.tool()
def return_warranty_calculator(
    items: list, 
    purchase_date: str, 
    reference_date: str = "2026-09-21"
) -> dict:
    """
    Computes return and warranty window deadlines from purchase date and item categories.
    Flags any items with fewer than 7 days remaining in the return window.
    """
    return calculate_windows_logic(items, purchase_date, reference_date)

@mcp.tool()
def order_status_lookup(order_id: str) -> dict:
    """
    Queries mock SQLite order tracking database by order ID (e.g. 'ORD-1001', 'ORD-1002').
    Returns live shipment status, courier, tracking number, and delivery date.
    """
    return query_order_db(order_id)

if __name__ == "__main__":
    print("Starting TechNova FastMCP Server...")
    mcp.run()
