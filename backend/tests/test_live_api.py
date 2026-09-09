import unittest
import requests

class TestLiveApi(unittest.TestCase):
    BASE_URL = "http://127.0.0.1:8000"

    def test_01_health_check(self):
        res = requests.get(
            f"{self.BASE_URL}/api/v1/health",
            headers={"Origin": "http://localhost:3000"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertIn("InspectIQ", data.get("service"))
        # Verify CORS headers
        self.assertEqual(res.headers.get("access-control-allow-origin"), "http://localhost:3000")
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")

    def test_02_validate_rules_endpoint(self):
        payload = {
            "inspection_id": "INSP-2026-TEST01",
            "product_name": "Wheat Flour 5kg",
            "category": "Packaged Food",
            "net_quantity": "5 kg",
            "mrp": "Rs 250.00",
            "pdp_area_cm2": 350.0,
            "declarations": [
                {
                    "field_key": "net_quantity",
                    "field_name": "Net Quantity",
                    "detected_value": "5 kg",
                    "raw_ocr_text": "Net Qty: 5 kg",
                    "extracted_value": "5 kg",
                    "officer_verified_value": "5 kg",
                    "applicability_status": "APPLICABLE",
                    "readability_status": "Acceptable",
                    "confidence": 95.0,
                    "status": "detected",
                    "rule_ref": "Rule 6(1)(c)"
                },
                {
                    "field_key": "mrp",
                    "field_name": "Maximum Retail Price",
                    "detected_value": "Rs 250.00",
                    "raw_ocr_text": "MRP Rs 250.00 incl taxes",
                    "extracted_value": "Rs 250.00",
                    "officer_verified_value": "Rs 250.00",
                    "applicability_status": "APPLICABLE",
                    "readability_status": "Acceptable",
                    "confidence": 92.0,
                    "status": "detected",
                    "rule_ref": "Rule 6(1)(e)"
                }
            ]
        }

        res = requests.post(
            f"{self.BASE_URL}/api/v1/validate-rules",
            json=payload,
            headers={"Origin": "http://localhost:3000"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("inspection_id"), "INSP-2026-TEST01")
        self.assertIn("overall_status", data)
        self.assertTrue(len(data.get("checks", [])) > 0)
        # Verify CORS headers on POST
        self.assertEqual(res.headers.get("access-control-allow-origin"), "http://localhost:3000")

    def test_03_cors_preflight(self):
        res = requests.options(
            f"{self.BASE_URL}/api/v1/validate-rules",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), "http://localhost:3000")
        self.assertIn("POST", res.headers.get("access-control-allow-methods", ""))

if __name__ == "__main__":
    unittest.main()
