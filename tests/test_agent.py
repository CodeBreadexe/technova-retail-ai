import unittest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.rag_pipeline import build_vector_store
from src.agent import build_agent_executor, run_agent_query

SAMPLE_RECEIPT = """===================================================
                  TECHNOVA RETAIL
===================================================
Receipt Number: REC-84920-A
Order ID: ORD-1001
Date of Purchase: 2026-08-25

ITEMS PURCHASED:
1. Item: Sony WH-1000XM5 Wireless Headphones
   Category: Electronics
   Price: $399.99
   Warranty: 1-Year Limited Warranty
"""

class TestReActAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Build vector store with receipt
        build_vector_store(SAMPLE_RECEIPT)
        # Build agent
        cls.executor = build_agent_executor()

    def test_agent_order_lookup_tool(self):
        query = "What is the shipping status for order ORD-1002?"
        result = run_agent_query(self.executor, query)
        
        self.assertTrue(result["success"])
        self.assertTrue(len(result["intermediate_steps"]) > 0)
        action, obs = result["intermediate_steps"][0]
        self.assertEqual(action.tool, "order_status_lookup")
        self.assertIn("In Transit", obs)
        self.assertIn("In Transit", result["output"])

    def test_agent_policy_rag_tool(self):
        query = "Can I return opened headphones and is there a restocking fee?"
        result = run_agent_query(self.executor, query)
        
        self.assertTrue(result["success"])
        self.assertTrue(len(result["intermediate_steps"]) > 0)
        action, obs = result["intermediate_steps"][0]
        self.assertEqual(action.tool, "search_store_policy")
        self.assertIn("15%", result["output"])

    def test_agent_order_not_found(self):
        query = "Check status for order ORD-9999"
        result = run_agent_query(self.executor, query)
        
        self.assertTrue(result["success"])
        self.assertIn("not found", result["output"].lower())

if __name__ == "__main__":
    unittest.main()
