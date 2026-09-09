"""
Declarations Rule Implementations
Statute: Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)

Rules:
1. Rule 6(1)(a): Manufacturer / Packer / Importer Name & Postal Address
2. Rule 6(1)(b): Generic or Common Name of Commodity
3. Rule 6(1)(c): Net Quantity in Standard Metric Units (Schedule II)
4. Rule 6(1)(d): Month & Year of Manufacture / Packing (and Expiry)
5. Rule 6(1)(e): Maximum Retail Price (MRP)
6. Rule 6(11): Unit Sale Price (USP)
7. Rule 9: Consumer Care Contact Details
8. Rule 14 & Rule 6(10): Country of Origin
9. Rule 6(1)(g): Batch / Lot Number
10. Rule 6(1)(f): Dimensions (where applicable)
"""

import re
from typing import Dict, Any, Optional
from .base_rule import (
    BaseRule,
    RuleCheckFinding,
    ComplianceControlledStatus,
    ApplicabilityStatus,
    DeclarationInput,
)
from .applicability_rules import ApplicabilityMatrix


def _resolve_target_value(decl: Optional[DeclarationInput]) -> str:
    """Returns officer verified value if provided; otherwise extracted value or detected value."""
    if not decl:
        return ""
    if decl.officer_verified_value is not None and decl.officer_verified_value.strip():
        return decl.officer_verified_value.strip()
    if decl.extracted_value is not None and decl.extracted_value.strip():
        return decl.extracted_value.strip()
    return (decl.detected_value or "").strip()


class ManufacturerRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-6-1-A",
            rule_number="Rule 6(1)(a)",
            title="Name and Address of Manufacturer, Packer or Importer",
            legal_ground="Rule 6(1)(a) of PCR 2011 read with Section 18 of Legal Metrology Act, 2009"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("manufacturer", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if applicability == ApplicabilityStatus.NOT_APPLICABLE:
            return RuleCheckFinding(
                check_id="chk-mfg-addr", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Manufacturer Name & Address",
                extracted_value=extracted or "N/A", officer_verified_value=verified or "N/A",
                expected_condition="Statutory declaration of manufacturer/packer name and address",
                status=ComplianceControlledStatus.NOT_APPLICABLE, applicability=applicability,
                confidence=100.0, explanation="Commodity category exempt from standard manufacturer address display.",
                legal_ground=self.legal_ground, recommendation="No action required.",
                evidence_side="declaration_area"
            )

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-mfg-addr", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Manufacturer Name & Address",
                extracted_value=extracted or "Not detected in OCR result",
                officer_verified_value=verified or "Unverified / Missing",
                expected_condition="Complete legal name and physical postal address with PIN code",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE,
                applicability=applicability, confidence=88.0,
                explanation="Mandatory manufacturer/packer/importer name and postal address not detected on package evidence.",
                legal_ground=self.legal_ground, recommendation="Verify physical container and issue notice under Section 36(1) if absent.",
                evidence_side="declaration_area"
            )

        has_pin = bool(re.search(r"\b[1-9]\d{5}\b", val))
        has_adequate_length = len(val) >= 15

        if has_adequate_length and has_pin:
            return RuleCheckFinding(
                check_id="chk-mfg-addr", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Manufacturer Name & Address",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Complete legal name and physical postal address with PIN code",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=95.0, explanation="Complete legal name and physical address with 6-digit postal PIN code identified.",
                legal_ground=self.legal_ground, recommendation="Passed statutory requirement.",
                evidence_side="declaration_area"
            )
        else:
            return RuleCheckFinding(
                check_id="chk-mfg-addr", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Manufacturer Address Completeness",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Complete address specifying premises, city, state and valid 6-digit PIN code",
                status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
                confidence=75.0, explanation="Address appears abbreviated or lacks verified 6-digit postal PIN code.",
                legal_ground=self.legal_ground, recommendation="Inspect packaging reverse side for complete jurisdictional address.",
                evidence_side="declaration_area"
            )


class GenericNameRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-6-1-B",
            rule_number="Rule 6(1)(b)",
            title="Generic or Common Name of Commodity",
            legal_ground="Rule 6(1)(b) of PCR 2011"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("product_name", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-generic-name", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Generic / Common Name",
                extracted_value=extracted or "Not detected", officer_verified_value=verified or "Missing",
                expected_condition="Common or generic name prominently placed on Principal Display Panel",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=85.0, explanation="Generic commodity name could not be detected on the package front.",
                legal_ground=self.legal_ground, recommendation="Verify whether generic descriptor is obscured by trademark brand graphics.",
                evidence_side="front"
            )

        if len(val) >= 3:
            return RuleCheckFinding(
                check_id="chk-generic-name", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Generic / Common Name",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Common or generic commodity name clearly placed on PDP",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=94.0, explanation="Generic commodity name conspicuously identified.",
                legal_ground=self.legal_ground, recommendation="Compliant under Rule 6(1)(b).",
                evidence_side="front"
            )

        return RuleCheckFinding(
            check_id="chk-generic-name", rule_id=self.rule_id, rule_number=self.rule_number,
            rule_title=self.title, field_checked="Generic / Common Name",
            extracted_value=extracted, officer_verified_value=verified,
            expected_condition="Conspicuous generic name",
            status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
            confidence=68.0, explanation="Generic name text is ambiguous or very short.",
            legal_ground=self.legal_ground, recommendation="Officer manual review required on physical package.",
            evidence_side="front"
        )


class NetQuantityRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-6-1-C",
            rule_number="Rule 6(1)(c)",
            title="Net Quantity Declaration in Standard SI Metric Units",
            legal_ground="Rule 6(1)(c) of PCR 2011 & Schedule II read with Section 18 of LM Act, 2009"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("net_quantity", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-net-quantity", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Net Quantity Metric Units",
                extracted_value=extracted or "Not detected", officer_verified_value=verified or "Missing",
                expected_condition="Net weight, volume or measure in standard SI units (g, kg, ml, l, N)",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=90.0, explanation="Mandatory net quantity declaration not detected in OCR text.",
                legal_ground=self.legal_ground, recommendation="Inspect PDP for net weight/measure indicator.",
                evidence_side="front"
            )

        # Standard legal SI units under Schedule II
        valid_unit_pattern = r"\b\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|pieces|units|n)\b"
        is_match = bool(re.search(valid_unit_pattern, val, re.IGNORECASE))

        if is_match:
            return RuleCheckFinding(
                check_id="chk-net-quantity", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Net Quantity Metric Units",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Standard SI metric units without non-standard symbols or misleading qualifiers",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=96.0, explanation="Net quantity declared in legal metric SI units conforming to Schedule II.",
                legal_ground=self.legal_ground, recommendation="Compliant standard verified.",
                evidence_side="front"
            )
        else:
            return RuleCheckFinding(
                check_id="chk-net-quantity", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Net Quantity Metric Units",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Standard SI metric units (g, kg, ml, L)",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=84.0, explanation="Non-standard abbreviation, illegal unit symbol, or misleading qualification observed.",
                legal_ground=self.legal_ground, recommendation="Non-standard units contravene Section 18 and are punishable under Section 36(2).",
                evidence_side="front"
            )


class MrpRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-6-1-E",
            rule_number="Rule 6(1)(e)",
            title="Maximum Retail Price (MRP Inclusive of All Taxes)",
            legal_ground="Rule 6(1)(e) of PCR 2011 read with Section 18 of LM Act, 2009"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("mrp", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-mrp", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Maximum Retail Price",
                extracted_value=extracted or "Not detected", officer_verified_value=verified or "Missing",
                expected_condition="MRP declared in Indian Rupees with 'inclusive of all taxes'",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=92.0, explanation="Mandatory retail sale price declaration missing from OCR extraction.",
                legal_ground=self.legal_ground, recommendation="Examine package for price sticker or overprinting violation.",
                evidence_side="declaration_area"
            )

        has_currency_or_price = bool(re.search(r"(?:₹|rs\.?|inr|mrp)\s*[:=]?\s*\d+", val, re.IGNORECASE)) or bool(re.search(r"\d+(?:\.\d{2})?", val))

        if has_currency_or_price:
            return RuleCheckFinding(
                check_id="chk-mrp", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Maximum Retail Price",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Maximum Retail Price declared unambiguously inclusive of all taxes",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=95.0, explanation="MRP clearly indicated with standard currency representation.",
                legal_ground=self.legal_ground, recommendation="Compliant retail sale price declaration verified.",
                evidence_side="declaration_area"
            )
        else:
            return RuleCheckFinding(
                check_id="chk-mrp", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Maximum Retail Price",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="MRP declared unambiguously",
                status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
                confidence=72.0, explanation="Price numeral is ambiguous, smudged, or missing explicit currency symbol.",
                legal_ground=self.legal_ground, recommendation="Officer manual verification required on physical package.",
                evidence_side="declaration_area"
            )


class UnitSalePriceRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-6-11",
            rule_number="Rule 6(11)",
            title="Unit Sale Price (USP) Declaration",
            legal_ground="Rule 6(11) of PCR 2011 (Amended 2022)"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("unit_sale_price", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if applicability == ApplicabilityStatus.NOT_APPLICABLE:
            return RuleCheckFinding(
                check_id="chk-usp", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Unit Sale Price",
                extracted_value=extracted or "N/A", officer_verified_value=verified or "N/A",
                expected_condition="USP required only where commodity net quantity exceeds statutory threshold",
                status=ComplianceControlledStatus.NOT_APPLICABLE, applicability=applicability,
                confidence=95.0, explanation="Package volume/mass exempt from mandatory Unit Sale Price declaration under Rule 6(11).",
                legal_ground=self.legal_ground, recommendation="No violation.",
                evidence_side="declaration_area"
            )

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-usp", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Unit Sale Price",
                extracted_value=extracted or "Not detected", officer_verified_value=verified or "Not detected",
                expected_condition="Unit Sale Price per g/kg/ml/l/piece prominently declared alongside MRP",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=86.0, explanation="Applicable Unit Sale Price (USP) declaration not detected in OCR extraction.",
                legal_ground=self.legal_ground, recommendation="Check whether USP is declared adjacent to MRP as per 2022 amendment.",
                evidence_side="declaration_area"
            )

        has_usp_format = bool(re.search(r"/\s*(?:g|kg|ml|l|piece|unit|item|n)\b", val, re.IGNORECASE))
        if has_usp_format:
            return RuleCheckFinding(
                check_id="chk-usp", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Unit Sale Price",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="USP expressed in standard unit rates (/g, /kg, /ml, /l, /piece)",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=92.0, explanation="Unit Sale Price complies with Rule 6(11) standard unit metrics.",
                legal_ground=self.legal_ground, recommendation="Passed statutory requirement.",
                evidence_side="declaration_area"
            )

        return RuleCheckFinding(
            check_id="chk-usp", rule_id=self.rule_id, rule_number=self.rule_number,
            rule_title=self.title, field_checked="Unit Sale Price Format",
            extracted_value=extracted, officer_verified_value=verified,
            expected_condition="Standard USP unit representation",
            status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
            confidence=70.0, explanation="Unit Sale Price expression format is unclear or missing denominator unit.",
            legal_ground=self.legal_ground, recommendation="Officer manual review required.",
            evidence_side="declaration_area"
        )


class ManufacturingDateRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-6-1-D",
            rule_number="Rule 6(1)(d)",
            title="Month and Year of Manufacture or Packing",
            legal_ground="Rule 6(1)(d) of PCR 2011"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("mfg_date", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-mfg-date", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Date of Manufacture / Packing",
                extracted_value=extracted or "Not detected", officer_verified_value=verified or "Missing",
                expected_condition="Month and Year of manufacture/packing prominently indicated",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=88.0, explanation="Mandatory manufacturing/packing date declaration not found.",
                legal_ground=self.legal_ground, recommendation="Verify crimp seal or packaging rim for ink-jet date stamp.",
                evidence_side="declaration_area"
            )

        has_date_format = bool(re.search(r"(?:\d{1,2}[/-]\d{2,4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{2,4})", val, re.IGNORECASE))
        if has_date_format:
            return RuleCheckFinding(
                check_id="chk-mfg-date", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Date of Manufacture / Packing",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Valid month and year designation (MM/YYYY or Month YYYY)",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=94.0, explanation="Month and year of manufacture or packing clearly stated.",
                legal_ground=self.legal_ground, recommendation="Compliant standard verified.",
                evidence_side="declaration_area"
            )

        return RuleCheckFinding(
            check_id="chk-mfg-date", rule_id=self.rule_id, rule_number=self.rule_number,
            rule_title=self.title, field_checked="Date of Manufacture / Packing",
            extracted_value=extracted, officer_verified_value=verified,
            expected_condition="Valid month and year designation",
            status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
            confidence=68.0, explanation="Date characters detected but format requires officer visual confirmation.",
            legal_ground=self.legal_ground, recommendation="Inspect physical date stamp.",
            evidence_side="declaration_area"
        )


class ConsumerCareRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-9",
            rule_number="Rule 9",
            title="Consumer Care Redressal Details",
            legal_ground="Rule 9 of PCR 2011"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("consumer_care", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-consumer-care", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Consumer Care Cell",
                extracted_value=extracted or "Not detected", officer_verified_value=verified or "Missing",
                expected_condition="Name, address, telephone number and email of grievance redressal officer",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE, applicability=applicability,
                confidence=85.0, explanation="Statutory consumer grievance cell contact details missing from OCR text.",
                legal_ground=self.legal_ground, recommendation="Check reverse panel for consumer helpline or email.",
                evidence_side="back"
            )

        has_phone_or_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", val)) or bool(re.search(r"\b\d{3,5}[-\s]?\d{3,8}\b", val)) or "toll free" in val.lower()
        if has_phone_or_email:
            return RuleCheckFinding(
                check_id="chk-consumer-care", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Consumer Care Cell",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Functional phone number, email address or postal contact",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=91.0, explanation="Verified consumer helpline / email identified.",
                legal_ground=self.legal_ground, recommendation="Compliant consumer care declaration verified.",
                evidence_side="back"
            )

        return RuleCheckFinding(
            check_id="chk-consumer-care", rule_id=self.rule_id, rule_number=self.rule_number,
            rule_title=self.title, field_checked="Consumer Care Cell",
            extracted_value=extracted, officer_verified_value=verified,
            expected_condition="Functional telephone number and email",
            status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
            confidence=68.0, explanation="Grievance text present but lacks complete telephone or email coordinates.",
            legal_ground=self.legal_ground, recommendation="Officer visual check required on packaging back panel.",
            evidence_side="back"
        )


class CountryOfOriginRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-14",
            rule_number="Rule 14 & Rule 6(10)",
            title="Country of Origin Declaration",
            legal_ground="Rule 14 and Rule 6(10) of PCR 2011"
        )

    def evaluate(self, decl: Optional[DeclarationInput], context: Dict[str, Any]) -> RuleCheckFinding:
        applicability = ApplicabilityMatrix.determine_applicability("country_of_origin", decl, context)
        extracted = (decl.extracted_value or decl.detected_value or "") if decl else ""
        verified = decl.officer_verified_value if (decl and decl.officer_verified_value is not None) else extracted
        val = _resolve_target_value(decl)

        if applicability == ApplicabilityStatus.NOT_APPLICABLE:
            return RuleCheckFinding(
                check_id="chk-origin", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Country of Origin",
                extracted_value=extracted or "N/A", officer_verified_value=verified or "N/A",
                expected_condition="Mandatory for imported commodities",
                status=ComplianceControlledStatus.NOT_APPLICABLE, applicability=applicability,
                confidence=95.0, explanation="Not mandatory for verified domestic commodities.",
                legal_ground=self.legal_ground, recommendation="No action required.",
                evidence_side="declaration_area"
            )

        if not val or "not detected" in val.lower():
            return RuleCheckFinding(
                check_id="chk-origin", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Country of Origin",
                extracted_value=extracted or "Not detected in OCR result",
                officer_verified_value=verified or "Unconfirmed",
                expected_condition="Explicit statement of Country of Origin / Manufacture",
                status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
                confidence=75.0, explanation="Country of origin not detected; verify whether product is imported or domestic.",
                legal_ground=self.legal_ground, recommendation="Inspect packaging for 'Made in India' or import declaration.",
                evidence_side="declaration_area"
            )

        if len(val) >= 2 and not any(kw in val.lower() for kw in ["missing", "unknown"]):
            return RuleCheckFinding(
                check_id="chk-origin", rule_id=self.rule_id, rule_number=self.rule_number,
                rule_title=self.title, field_checked="Country of Origin",
                extracted_value=extracted, officer_verified_value=verified,
                expected_condition="Explicit declaration of Country of Origin",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT, applicability=applicability,
                confidence=95.0, explanation=f"Country of origin identified: '{val}'.",
                legal_ground=self.legal_ground, recommendation="Compliant standard verified.",
                evidence_side="declaration_area"
            )

        return RuleCheckFinding(
            check_id="chk-origin", rule_id=self.rule_id, rule_number=self.rule_number,
            rule_title=self.title, field_checked="Country of Origin",
            extracted_value=extracted, officer_verified_value=verified,
            expected_condition="Clear country of origin",
            status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW, applicability=applicability,
            confidence=65.0, explanation="Country of origin text is ambiguous.",
            legal_ground=self.legal_ground, recommendation="Officer review required.",
            evidence_side="declaration_area"
        )
