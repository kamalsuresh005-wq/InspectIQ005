"""
Legal Metrology Rule Engine - Base Classes
Statutory Authority: Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)

Strict Principles:
1. Deterministic evaluation (no AI/ML).
2. Controlled Compliance Statuses:
   - APPEARS_COMPLIANT
   - POTENTIAL_NON_COMPLIANCE
   - REQUIRES_OFFICER_REVIEW
   - NOT_APPLICABLE
   - NOT_DETECTED
3. Auditability: rawOcrText, extractedValue, officerVerifiedValue remain distinct.
4. Assistant role: System proposes findings; Officer retains sole legal determination authority.
"""

from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel


class ComplianceControlledStatus(str, Enum):
    APPEARS_COMPLIANT = "APPEARS_COMPLIANT"
    POTENTIAL_NON_COMPLIANCE = "POTENTIAL_NON_COMPLIANCE"
    REQUIRES_OFFICER_REVIEW = "REQUIRES_OFFICER_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    NOT_DETECTED = "NOT_DETECTED"


class ApplicabilityStatus(str, Enum):
    APPLICABLE = "APPLICABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    REQUIRES_OFFICER_REVIEW = "REQUIRES_OFFICER_REVIEW"
    NOT_DETECTED = "NOT_DETECTED"


class ReadabilityStatus(str, Enum):
    ACCEPTABLE = "Acceptable"
    NEEDS_REVIEW = "Needs Review"
    NOT_ASSESSABLE = "Not Assessable"


class DeclarationInput(BaseModel):
    field_key: str
    field_name: str
    detected_value: Optional[str] = ""
    raw_ocr_text: Optional[str] = ""
    extracted_value: Optional[str] = ""
    officer_verified_value: Optional[str] = None
    applicability_status: Optional[str] = None
    readability_status: Optional[str] = None
    confidence: Optional[float] = 85.0
    status: Optional[str] = "detected"  # 'detected' | 'review' | 'not_detected'
    is_mandatory: bool = True
    side_found: Optional[str] = "declaration_area"
    rule_ref: Optional[str] = ""


class RuleCheckFinding(BaseModel):
    check_id: str
    rule_id: str
    rule_number: str
    rule_title: str
    field_checked: str
    extracted_value: str
    officer_verified_value: str
    expected_condition: str
    status: ComplianceControlledStatus
    applicability: ApplicabilityStatus
    readability: Optional[ReadabilityStatus] = ReadabilityStatus.NEEDS_REVIEW
    confidence: float
    explanation: str
    legal_ground: str
    recommendation: str
    evidence_side: str = "declaration_area"


class BaseRule:
    """Base class for all Legal Metrology statutory rules."""

    def __init__(self, rule_id: str, rule_number: str, title: str, legal_ground: str):
        self.rule_id = rule_id
        self.rule_number = rule_number
        self.title = title
        self.legal_ground = legal_ground

    def evaluate(
        self,
        decl: Optional[DeclarationInput],
        context: Dict[str, Any]
    ) -> RuleCheckFinding:
        raise NotImplementedError("Subclasses must implement evaluate()")
