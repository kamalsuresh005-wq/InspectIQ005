"""
Unit Tests for Legal Metrology Rule Engine
Tests the 10 required scenarios mandated by InspectIQ Stage 3 specification.
"""

import unittest
from app.rules import (
    LegalMetrologyRuleEngine,
    DeclarationInput,
    ComplianceControlledStatus,
    ApplicabilityStatus,
    ReadabilityStatus,
)


class TestLegalMetrologyRuleEngine(unittest.TestCase):
    def setUp(self):
        self.engine = LegalMetrologyRuleEngine()
        self.standard_context = {
            "product_name": "Premium Tea",
            "category": "Packaged Food",
            "net_quantity": "500 g",
            "mrp": "₹ 250.00",
            "pdp_area_cm2": 224.0,
        }

    def test_scenario_1_all_required_detected(self):
        """Scenario 1: All required declarations detected with valid standard formatting."""
        declarations = [
            DeclarationInput(
                field_key="product_name", field_name="Generic Name",
                extracted_value="Assam CTC Black Tea", detected_value="Assam CTC Black Tea",
                status="detected"
            ),
            DeclarationInput(
                field_key="manufacturer", field_name="Manufacturer",
                extracted_value="Tata Consumer Products Ltd, 1 Bishop Lefroy Road, Kolkata - 700020",
                detected_value="Tata Consumer Products Ltd, 1 Bishop Lefroy Road, Kolkata - 700020",
                status="detected"
            ),
            DeclarationInput(
                field_key="net_quantity", field_name="Net Quantity",
                extracted_value="500 g", detected_value="500 g", status="detected"
            ),
            DeclarationInput(
                field_key="mrp", field_name="MRP",
                extracted_value="₹ 250.00 (incl. of all taxes)", detected_value="₹ 250.00 (incl. of all taxes)",
                status="detected"
            ),
            DeclarationInput(
                field_key="unit_sale_price", field_name="USP",
                extracted_value="₹ 0.50 / g", detected_value="₹ 0.50 / g", status="detected"
            ),
            DeclarationInput(
                field_key="mfg_date", field_name="Date of Mfg",
                extracted_value="08/2026", detected_value="08/2026", status="detected"
            ),
            DeclarationInput(
                field_key="consumer_care", field_name="Consumer Care",
                extracted_value="care@tataconsumer.com / 1800 345 1720", detected_value="care@tataconsumer.com / 1800 345 1720",
                status="detected"
            ),
            DeclarationInput(
                field_key="country_of_origin", field_name="Country of Origin",
                extracted_value="India", detected_value="India", status="detected"
            ),
        ]

        result = self.engine.evaluate_inspection("INSP-001", declarations, self.standard_context)
        mrp_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-E")
        net_qty_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-C")
        mfg_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-A")

        self.assertEqual(mrp_finding.status, ComplianceControlledStatus.APPEARS_COMPLIANT)
        self.assertEqual(net_qty_finding.status, ComplianceControlledStatus.APPEARS_COMPLIANT)
        self.assertEqual(mfg_finding.status, ComplianceControlledStatus.APPEARS_COMPLIANT)

    def test_scenario_2_required_declaration_missing(self):
        """Scenario 2: Required declaration (MRP) missing from OCR extraction."""
        declarations = [
            DeclarationInput(
                field_key="product_name", field_name="Generic Name",
                extracted_value="Assam CTC Black Tea", detected_value="Assam CTC Black Tea"
            ),
            DeclarationInput(
                field_key="mrp", field_name="MRP",
                extracted_value="", detected_value="", status="not_detected"
            ),
        ]

        result = self.engine.evaluate_inspection("INSP-002", declarations, self.standard_context)
        mrp_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-E")

        self.assertEqual(mrp_finding.status, ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE)
        self.assertEqual(result.overall_status, "Potential Non-Compliance")

    def test_scenario_3_ocr_text_unclear(self):
        """Scenario 3: OCR text unclear/ambiguous (e.g. incomplete address without PIN code)."""
        declarations = [
            DeclarationInput(
                field_key="manufacturer", field_name="Manufacturer",
                extracted_value="ABC Foods, Indl Area", detected_value="ABC Foods, Indl Area",
                status="review"
            ),
        ]

        result = self.engine.evaluate_inspection("INSP-003", declarations, self.standard_context)
        mfg_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-A")

        self.assertEqual(mfg_finding.status, ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW)

    def test_scenario_4_not_applicable_declaration(self):
        """Scenario 4: Declaration not applicable (e.g. Unit Sale Price on small pack < 10g)."""
        declarations = [
            DeclarationInput(
                field_key="unit_sale_price", field_name="USP",
                extracted_value="", detected_value="", status="not_detected"
            ),
        ]
        context = {**self.standard_context, "net_quantity": "5 g"}

        result = self.engine.evaluate_inspection("INSP-004", declarations, context)
        usp_finding = next(f for f in result.findings if f.rule_id == "RULE-6-11")

        self.assertEqual(usp_finding.status, ComplianceControlledStatus.NOT_APPLICABLE)
        self.assertEqual(usp_finding.applicability, ApplicabilityStatus.NOT_APPLICABLE)

    def test_scenario_5_officer_edits_ocr_value(self):
        """Scenario 5: Officer edits erroneous OCR value ("1 k9" -> "1 kg")."""
        declarations = [
            DeclarationInput(
                field_key="net_quantity", field_name="Net Quantity",
                raw_ocr_text="NET WT: 1 k9",
                extracted_value="1 k9",
                officer_verified_value="1 kg",  # Officer corrected the typo
                status="detected"
            ),
        ]

        result = self.engine.evaluate_inspection("INSP-005", declarations, self.standard_context)
        net_qty_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-C")

        # The engine must validate the officer-verified value ("1 kg") and pass it
        self.assertEqual(net_qty_finding.status, ComplianceControlledStatus.APPEARS_COMPLIANT)
        self.assertEqual(net_qty_finding.extracted_value, "1 k9")
        self.assertEqual(net_qty_finding.officer_verified_value, "1 kg")

    def test_scenario_6_officer_overrides_finding(self):
        """Scenario 6: Officer marks a finding as reviewed/verified."""
        declarations = [
            DeclarationInput(
                field_key="manufacturer", field_name="Manufacturer",
                extracted_value="Factory Plot 42",
                officer_verified_value="Tata Consumer Products Ltd, Plot 42, Kolkata - 700020",
                status="detected"
            ),
        ]

        result = self.engine.evaluate_inspection("INSP-006", declarations, self.standard_context)
        mfg_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-A")

        self.assertEqual(mfg_finding.status, ComplianceControlledStatus.APPEARS_COMPLIANT)

    def test_scenario_7_evidence_linked_to_finding(self):
        """Scenario 7: Evidence sides are cleanly linked to findings."""
        declarations = [
            DeclarationInput(
                field_key="consumer_care", field_name="Consumer Care",
                extracted_value="1800 123 4567", detected_value="1800 123 4567"
            ),
        ]

        result = self.engine.evaluate_inspection("INSP-007", declarations, self.standard_context)
        care_finding = next(f for f in result.findings if f.rule_id == "RULE-9")

        self.assertEqual(care_finding.evidence_side, "back")

    def test_scenario_8_rule_engine_failure_fallback(self):
        """Scenario 8: Robust evaluation handles None or malformed inputs without crashing."""
        result = self.engine.evaluate_inspection("INSP-008", [], {})
        self.assertIsNotNone(result)
        self.assertIn(result.overall_status, ["Potential Non-Compliance", "Requires Officer Review"])

    def test_scenario_9_empty_ocr_result(self):
        """Scenario 9: Empty OCR result flags missing mandatory items."""
        declarations = []
        result = self.engine.evaluate_inspection("INSP-009", declarations, self.standard_context)

        # Core mandatory declarations should be flagged as potential non-compliance
        mrp_finding = next(f for f in result.findings if f.rule_id == "RULE-6-1-E")
        self.assertEqual(mrp_finding.status, ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE)

    def test_scenario_10_readability_uncalibrated_guard(self):
        """Scenario 10: Uncalibrated phone photo cannot assert physical mm font size."""
        declarations = []
        context = {**self.standard_context, "has_physical_calibration": False}

        result = self.engine.evaluate_inspection("INSP-010", declarations, context)
        readability_finding = next(f for f in result.findings if f.rule_id == "RULE-5-7-READABILITY")

        self.assertEqual(readability_finding.status, ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW)
        self.assertEqual(readability_finding.readability, ReadabilityStatus.NEEDS_REVIEW)


if __name__ == "__main__":
    unittest.main()
