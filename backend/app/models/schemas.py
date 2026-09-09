from pydantic import BaseModel, Field
from typing import List, Optional

class OcrRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    side: str = "front"
    commodity_hint: Optional[str] = None

class ExtractedField(BaseModel):
    field_key: str
    field_name: str
    detected_value: Optional[str] = ""
    raw_ocr_text: Optional[str] = ""
    extracted_value: Optional[str] = ""
    officer_verified_value: Optional[str] = None
    applicability_status: Optional[str] = "APPLICABLE"
    readability_status: Optional[str] = "Needs Review"
    confidence: Optional[float] = 85.0
    status: Optional[str] = "detected"
    rule_ref: Optional[str] = ""

class OcrResponse(BaseModel):
    success: bool
    fields: List[ExtractedField]
    overall_confidence: float
    processing_time_ms: int

class RuleCheckRequest(BaseModel):
    inspection_id: str
    product_name: str
    category: str
    net_quantity: str
    mrp: str
    pdp_area_cm2: float = 224.0
    declarations: List[ExtractedField]

class RuleCheckItem(BaseModel):
    rule_number: str
    rule_title: str
    field_checked: str
    detected_value: str
    extracted_value: Optional[str] = None
    officer_verified_value: Optional[str] = None
    expected_condition: str
    result: str  # COMPLIANT, REVIEW_REQUIRED, POTENTIAL_NON_COMPLIANCE
    controlled_status: Optional[str] = None
    applicability: Optional[str] = None
    readability: Optional[str] = None
    explanation: str
    legal_ground: str
    recommendation: Optional[str] = ""
    evidence_side: Optional[str] = "declaration_area"

class RuleCheckResponse(BaseModel):
    inspection_id: str
    overall_status: str
    passed_count: int
    review_count: int
    violation_count: int
    appears_compliant_count: Optional[int] = 0
    potential_non_compliance_count: Optional[int] = 0
    requires_officer_review_count: Optional[int] = 0
    not_applicable_count: Optional[int] = 0
    not_detected_count: Optional[int] = 0
    checks: List[RuleCheckItem]

class EcommerceScrapeRequest(BaseModel):
    url: str
    platform_hint: Optional[str] = None

class EcommerceScrapeResponse(BaseModel):
    url: str
    product_name: str
    brand: str
    mrp: str
    selling_price: str
    unit_sale_price: Optional[str]
    net_quantity: str
    country_of_origin: Optional[str]
    manufacturer: str
    compliance_status: str
    missing_declarations: List[str]
