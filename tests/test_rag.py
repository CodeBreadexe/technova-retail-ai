import unittest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.rag_pipeline import (
    parse_receipt_text,
    split_policy_into_sections,
    build_vector_store,
    retrieve_grounded_context,
    search_store_policy
)

SAMPLE_RECEIPT = """===================================================
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
"""

class TestRagPipeline(unittest.TestCase):
    def test_parse_receipt(self):
        meta, docs = parse_receipt_text(SAMPLE_RECEIPT)
        self.assertEqual(meta["order_id"], "ORD-1001")
        self.assertEqual(meta["purchase_date"], "2026-08-25")
        self.assertEqual(len(meta["items"]), 3)
        self.assertEqual(len(docs), 3)
        
        self.assertEqual(meta["items"][0]["name"], "Sony WH-1000XM5 Wireless Headphones")
        self.assertEqual(meta["items"][0]["category"], "Electronics")
        self.assertEqual(docs[0].metadata["doc_type"], "receipt_item")

    def test_split_policy(self):
        sample_policy = """## SECTION 1: GENERAL
- **General Window**: 30 days return window.

## SECTION 2: ELECTRONICS
- **Electronics**: 15% restocking fee for opened items.
"""
        docs = split_policy_into_sections(sample_policy)
        self.assertTrue(len(docs) >= 2)
        self.assertIn("restocking fee", docs[1].page_content)

    def test_vectorstore_and_retrieval(self):
        vs, meta = build_vector_store(SAMPLE_RECEIPT)
        self.assertIsNotNone(vs)
        
        # Test query 1: Restocking fee for electronics
        res1 = retrieve_grounded_context("What is the restocking fee for opened electronics?")
        self.assertIn("15%", res1)
        self.assertIn("TechNova Return & Warranty Policy", res1)
        
        # Test query 2: Item specific from receipt
        res2 = retrieve_grounded_context("What price did I pay for the Nike shoes?")
        self.assertIn("Nike", res2)
        self.assertIn("$129.50", res2)
        
    def test_parse_whatsapp_notification(self):
        msg = """Hey *Sidharth SIDDU*
📦 Great news! Your package from *Glamorizee* is on its way. Below are the product details
Order ID: *7714419343656*
Product Name: *White Flower Name Necklace*
Amount: Rs.*219*
Tracking Link:  *https://www.delhivery.com/track/package/22017731381544*
Track your order by clicking on the above link. Thank you for choosing us! 
this is a actual reciept i want to use it was in 18 august i ordered this"""
        meta, docs = parse_receipt_text(msg)
        self.assertEqual(meta["order_id"], "7714419343656")
        self.assertEqual(meta["customer"], "Sidharth SIDDU")
        self.assertEqual(meta["purchase_date"], "2026-08-18")
        self.assertEqual(len(meta["items"]), 1)
        self.assertEqual(meta["items"][0]["name"], "White Flower Name Necklace")
        self.assertEqual(meta["items"][0]["category"], "Jewelry")
        self.assertEqual(meta["items"][0]["price"], "Rs. 219")

if __name__ == "__main__":
    unittest.main()
