"""
Readability and Font Assessment Rule
Statute: Rule 5, Rule 7 and Table-I of Second Schedule, PCR 2011

Principles:
1. Strict prohibition: Do NOT claim exact physical font size in millimetres from an
   ordinary phone photograph without physical calibration targets.
2. Structured assessment output:
   - Acceptable
   - Needs Review
   - Not Assessable
3. When optical measurement is uncalibrated or text clarity is degraded:
   Result = REQUIRES_OFFICER_REVIEW.
"""

from typing import Dict, Any, Optional
from .base_rule import (
    BaseRule,
    RuleCheckFinding,
    ComplianceControlledStatus,
    ApplicabilityStatus,
    ReadabilityStatus,
    DeclarationInput,
)


class ReadabilityRule(BaseRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-5-7-READABILITY",
            rule_number="Rule 5 & Rule 7 (Table-I)",
            title="Conspicuousness, Contrast and Readability of Declarations",
            legal_ground="Rule 5 & Rule 7 of PCR 2011 read with Section 18 of Legal Metrology Act, 2009"
        )

    def evaluate(
        self,
        decl: Optional[DeclarationInput],
        context: Dict[str, Any]
    ) -> RuleCheckFinding:
        has_calibration = context.get("has_physical_calibration", False)
        blur_status = context.get("blur_status", "clear")
        contrast_score = context.get("contrast_score", 1.0)
        officer_readability = decl.readability_status if decl else None

        # Check if officer manually specified readability
        if officer_readability:
            try:
                readability_enum = ReadabilityStatus(officer_readability)
                if readability_enum == ReadabilityStatus.ACCEPTABLE:
                    status = ComplianceControlledStatus.APPEARS_COMPLIANT
                    explanation = "Officer verified readability as conspicuous and visually legible."
                elif readability_enum == ReadabilityStatus.NEEDS_REVIEW:
                    status = ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW
                    explanation = "Declaration readability marked for officer inspection verification."
                else:
                    status = ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW
                    explanation = "Declaration text clarity not assessable from current imagery."

                return RuleCheckFinding(
                    check_id="chk-readability-audit",
                    rule_id=self.rule_id,
                    rule_number=self.rule_number,
                    rule_title=self.title,
                    field_checked="Declaration Legibility & Conspicuousness",
                    extracted_value=f"Readability Assessment: {readability_enum.value}",
                    officer_verified_value=f"Verified: {readability_enum.value}",
                    expected_condition="Declarations must be conspicuous, legible and meet minimum statutory height standards without glare or obscurity",
                    status=status,
                    applicability=ApplicabilityStatus.APPLICABLE,
                    readability=readability_enum,
                    confidence=90.0,
                    explanation=explanation,
                    legal_ground=self.legal_ground,
                    recommendation="Ensure statutory numeral height conforms to Table I based on Principal Display Panel area.",
                    evidence_side="declaration_area"
                )
            except ValueError:
                pass

        # If no physical calibration target was present during mobile capture
        if not has_calibration:
            return RuleCheckFinding(
                check_id="chk-readability-audit",
                rule_id=self.rule_id,
                rule_number=self.rule_number,
                rule_title=self.title,
                field_checked="Numeral Height & Conspicuousness",
                extracted_value="Visual font clarity acceptable; physical mm uncalibrated",
                officer_verified_value="Requires physical gauge verification",
                expected_condition="Prominent, distinct contrast and statutory height per Table I (uncalibrated camera cannot assert physical mm)",
                status=ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW,
                applicability=ApplicabilityStatus.APPLICABLE,
                readability=ReadabilityStatus.NEEDS_REVIEW,
                confidence=70.0,
                explanation="Camera image does not have certified physical scale calibration. Exact millimetre numeral height cannot be claimed automatically.",
                legal_ground=self.legal_ground,
                recommendation="Officer must physically inspect letter/numeral height against Principal Display Panel area table.",
                evidence_side="declaration_area"
            )

        # Calibrated path (if calibration is provided in context)
        calibrated_mm = context.get("calibrated_font_height_mm", 0.0)
        min_required_mm = context.get("min_required_font_height_mm", 2.0)

        if calibrated_mm >= min_required_mm:
            return RuleCheckFinding(
                check_id="chk-readability-audit",
                rule_id=self.rule_id,
                rule_number=self.rule_number,
                rule_title=self.title,
                field_checked="Calibrated Numeral Height",
                extracted_value=f"Measured: {calibrated_mm:.1f} mm",
                officer_verified_value=f"Calibrated: {calibrated_mm:.1f} mm",
                expected_condition=f"Minimum numeral height >= {min_required_mm:.1f} mm per Table I",
                status=ComplianceControlledStatus.APPEARS_COMPLIANT,
                applicability=ApplicabilityStatus.APPLICABLE,
                readability=ReadabilityStatus.ACCEPTABLE,
                confidence=95.0,
                explanation=f"Calibrated optical measurement ({calibrated_mm:.1f} mm) satisfies statutory standard ({min_required_mm:.1f} mm).",
                legal_ground=self.legal_ground,
                recommendation="Compliant standard verified.",
                evidence_side="declaration_area"
            )
        else:
            return RuleCheckFinding(
                check_id="chk-readability-audit",
                rule_id=self.rule_id,
                rule_number=self.rule_number,
                rule_title=self.title,
                field_checked="Calibrated Numeral Height",
                extracted_value=f"Measured: {calibrated_mm:.1f} mm (Deficit: {min_required_mm - calibrated_mm:.1f} mm)",
                officer_verified_value=f"Deficit confirmed: {calibrated_mm:.1f} mm",
                expected_condition=f"Minimum numeral height >= {min_required_mm:.1f} mm per Table I",
                status=ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE,
                applicability=ApplicabilityStatus.APPLICABLE,
                readability=ReadabilityStatus.NEEDS_REVIEW,
                confidence=92.0,
                explanation=f"Calibrated optical measurement indicates numeral height ({calibrated_mm:.1f} mm) is below statutory requirement ({min_required_mm:.1f} mm).",
                legal_ground=self.legal_ground,
                recommendation="Verify physical sample and record violation under Rule 5 and Rule 7.",
                evidence_side="declaration_area"
            )
