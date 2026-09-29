import unittest
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.tools import (
    calculate_windows_logic, 
    query_order_db, 
    return_warranty_calculator, 
    order_status_lookup
)

class TestEcommerceTools(unittest.TestCase):
    def setUp(self):
        self.ref_date = "2026-09-21"
        self.test_items = [
            {"name": "Sony Headphones", "category": "electronics", "price": "$399.99"}, # 30d window
            {"name": "Nike Shoes", "category": "apparel", "price": "$129.50"},        # 14d window
            {"name": "Clearance Cable", "category": "clearance", "price": "$15.00"}     # 0d window
        ]

    def test_expiring_soon_calculation(self):
        # Purchased 27 days ago (2026-08-25).
        # Electronics: 30 days window -> 3 days remaining (< 7 days -> EXPIRING SOON)
        # Apparel: 14 days window -> expired 13 days ago (EXPIRED)
        # Clearance: 0 days -> FINAL SALE
        res = calculate_windows_logic(self.test_items, "2026-08-25", self.ref_date)
        
        self.assertEqual(res["total_items"], 3)
        self.assertEqual(res["expiring_soon_count"], 1)
        self.assertEqual(res["expired_count"], 1)
        self.assertEqual(res["final_sale_count"], 1)
        
        sony = res["items"][0]
        self.assertEqual(sony["item_name"], "Sony Headphones")
        self.assertEqual(sony["days_remaining"], 3)
        self.assertEqual(sony["status_badge"], "EXPIRING SOON")
        self.assertEqual(sony["return_deadline"], "2026-09-24")
        self.assertTrue(sony["is_critical_expiring"])
        
        nike = res["items"][1]
        self.assertEqual(nike["status_badge"], "EXPIRED")
        self.assertLess(nike["days_remaining"], 0)
        self.assertFalse(nike["is_critical_expiring"])
        
        cable = res["items"][2]
        self.assertEqual(cable["status_badge"], "FINAL SALE")
        self.assertEqual(cable["return_policy_days"], 0)

    def test_active_window_calculation(self):
        # Purchased 3 days ago (2026-09-18).
        # Electronics: 30 days -> 27 days remaining (ELIGIBLE)
        # Apparel: 14 days -> 11 days remaining (ELIGIBLE)
        res = calculate_windows_logic(self.test_items[:2], "2026-09-18", self.ref_date)
        self.assertEqual(res["expiring_soon_count"], 0)
        self.assertEqual(res["active_count"], 2)
        self.assertEqual(res["items"][0]["status_badge"], "ELIGIBLE")
        self.assertEqual(res["items"][1]["status_badge"], "ELIGIBLE")

    def test_order_db_found(self):
        res = query_order_db("ORD-1001")
        self.assertTrue(res["found"])
        self.assertEqual(res["order_id"], "ORD-1001")
        self.assertEqual(res["status"], "Delivered")
        self.assertEqual(res["carrier"], "FedEx")

    def test_order_db_not_found(self):
        res = query_order_db("ORD-9999")
        self.assertFalse(res["found"])
        self.assertIn("was not found", res["message"])

    def test_tool_invocations(self):
        calc_out = return_warranty_calculator.invoke({"items_json_or_text": "[]", "purchase_date": "2026-08-25"})
        self.assertIn("Return & Warranty Calculation Report", calc_out)
        
        order_out = order_status_lookup.invoke({"order_id": "ORD-1002"})
        self.assertIn("In Transit", order_out)
        self.assertIn("UPS Ground", order_out)

if __name__ == "__main__":
    unittest.main()
