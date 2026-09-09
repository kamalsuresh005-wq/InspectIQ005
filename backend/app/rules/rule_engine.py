"""
Legal Metrology Rule Engine Orchestrator
Statute: Legal Metrology Act, 2009 & PCR 2011

Orchestrates deterministic rule evaluation:
Declarations Input -> Applicability Check -> Statutory Rule Validation -> Readability Assessment -> Controlled Findings
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from .base_rule import (
    DeclarationInput,
    RuleCheckFinding,
    ComplianceControlledStatus,
    ApplicabilityStatus,
)
from .declaration_rules import (
    ManufacturerRule,
    GenericNameRule,
    NetQuantityRule,
    MrpRule,
    UnitSalePriceRule,
    ManufacturingDateRule,
    ConsumerCareRule,
    CountryOfOriginRule,
)
from .readability_rules import ReadabilityRule


class RuleEngineResult(BaseModel):
    inspection_id: str
    overall_status: str  # 'Appears Compliant' | 'Requires Officer Review' | 'Potential Non-Compliance'
    findings: List[RuleCheckFinding]
    appears_compliant_count: int
    potential_non_compliance_count: int
    requires_officer_review_count: int
    not_applicable_count: int
    not_detected_count: int


class LegalMetrologyRuleEngine:
    """Deterministic Rule Engine orchestrating statutory PCR 2011 validations."""

    def __init__(self):
        self.rules = [
            GenericNameRule(),
            ManufacturerRule(),
            NetQuantityRule(),
            MrpRule(),
            UnitSalePriceRule(),
            ManufacturingDateRule(),
            ConsumerCareRule(),
            CountryOfOriginRule(),
            ReadabilityRule(),
        ]

    def evaluate_inspection(
        self,
        inspection_id: str,
        declarations: List[DeclarationInput],
        context: Optional[Dict[str, Any]] = None
    ) -> RuleEngineResult:
        ctx = context or {}
        decl_map = {d.field_key: d for d in declarations}

        findings: List[RuleCheckFinding] = []

        for rule in self.rules:
            # Map rule to its primary declaration field
            field_key = self._map_rule_to_field(rule.rule_id)
            decl = decl_map.get(field_key)

            # Special case for manufacturer address if passed separately
            if field_key == "manufacturer" and not decl:
                decl = decl_map.get("manufacturer_name")

            finding = rule.evaluate(decl, ctx)
            findings.append(finding)

        # Calculate controlled counts
        appears_compliant = sum(1 for f in findings if f.status == ComplianceControlledStatus.APPEARS_COMPLIANT)
        potential_non_compliance = sum(1 for f in findings if f.status == ComplianceControlledStatus.POTENTIAL_NON_COMPLIANCE)
        requires_review = sum(1 for f in findings if f.status == ComplianceControlledStatus.REQUIRES_OFFICER_REVIEW)
        not_applicable = sum(1 for f in findings if f.status == ComplianceControlledStatus.NOT_APPLICABLE)
        not_detected = sum(1 for f in findings if f.status == ComplianceControlledStatus.NOT_DETECTED)

        # Deterministic overall status
        if potential_non_compliance > 0:
            overall_status = "Potential Non-Compliance"
        elif requires_review > 0:
            overall_status = "Requires Officer Review"
        else:
            overall_status = "Appears Compliant"

        return RuleEngineResult(
            inspection_id=inspection_id,
            overall_status=overall_status,
            findings=findings,
            appears_compliant_count=appears_compliant,
            potential_non_compliance_count=potential_non_compliance,
            requires_officer_review_count=requires_review,
            not_applicable_count=not_applicable,
            not_detected_count=not_detected,
        )

    def _map_rule_to_field(self, rule_id: str) -> str:
        mapping = {
            "RULE-6-1-B": "product_name",
            "RULE-6-1-A": "manufacturer",
            "RULE-6-1-C": "net_quantity",
            "RULE-6-1-E": "mrp",
            "RULE-6-11": "unit_sale_price",
            "RULE-6-1-D": "mfg_date",
            "RULE-9": "consumer_care",
            "RULE-14": "country_of_origin",
            "RULE-5-7-READABILITY": "readability",
        }
        return mapping.get(rule_id, "")
