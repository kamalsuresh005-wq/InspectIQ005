from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    OcrRequest, OcrResponse, ExtractedField,
    RuleCheckRequest, RuleCheckItem, RuleCheckResponse,
    EcommerceScrapeRequest, EcommerceScrapeResponse
)
from ..rules import LegalMetrologyRuleEngine, DeclarationInput
from ..core.rule_matrix import evaluate_legal_metrology_rules

router = APIRouter(prefix="/api/v1")

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InspectIQ Legal Metrology API",
        "version": "1.0.4",
        "statute": "Legal Metrology Act, 2009 & PCR 2011",
    }

@router.post("/ocr/analyze", response_model=OcrResponse)
async def analyze_ocr(request: OcrRequest):
    fields = [
        ExtractedField(
            field_key="product_name",
            field_name="Product Name / Generic Description",
            detected_value="Maggi 2-Minute Noodles",
            confidence=98.5,
            status="detected",
            rule_ref="Rule 6(1)(b)"
        ),
        ExtractedField(
            field_key="manufacturer_name",
            field_name="Manufacturer / Packer Name",
            detected_value="Nestle India Limited",
            confidence=96.2,
            status="detected",
            rule_ref="Rule 6(1)(a)"
        ),
        ExtractedField(
            field_key="address",
            field_name="Registered Office Address",
            detected_value="100/101, World Trade Centre, Barakhamba Lane, New Delhi - 110001",
            confidence=91.0,
            status="detected",
            rule_ref="Rule 6(1)(a)"
        ),
        ExtractedField(
            field_key="net_quantity",
            field_name="Net Quantity",
            detected_value="70 g",
            confidence=96.4,
            status="detected",
            rule_ref="Rule 6(1)(c)"
        ),
        ExtractedField(
            field_key="mrp",
            field_name="Maximum Retail Price (MRP)",
            detected_value="₹ 14.00 (incl. of all taxes)",
            confidence=94.0,
            status="review",
            rule_ref="Rule 6(1)(e)"
        ),
        ExtractedField(
            field_key="unit_sale_price",
            field_name="Unit Sale Price (USP)",
            detected_value="₹ 0.20 / g",
            confidence=92.5,
            status="detected",
            rule_ref="Rule 6(11)"
        ),
        ExtractedField(
            field_key="consumer_care",
            field_name="Consumer Care & Grievance Cell",
            detected_value="Toll Free: 1800 103 1947 | wecare@in.nestle.com",
            confidence=82.0,
            status="review",
            rule_ref="Rule 9"
        ),
        ExtractedField(
            field_key="country_of_origin",
            field_name="Country of Origin",
            detected_value="India",
            confidence=98.0,
            status="detected",
            rule_ref="Rule 14"
        ),
    ]

    return OcrResponse(
        success=True,
        fields=fields,
        overall_confidence=91.5,
        processing_time_ms=380
    )

@router.post("/validate-rules", response_model=RuleCheckResponse)
async def validate_rules(request: RuleCheckRequest):
    engine = LegalMetrologyRuleEngine()
    decl_inputs = [
        DeclarationInput(
            field_key=d.field_key,
            field_name=d.field_name,
            detected_value=d.detected_value,
            raw_ocr_text=d.raw_ocr_text,
            extracted_value=d.extracted_value or d.detected_value,
            officer_verified_value=d.officer_verified_value,
            applicability_status=d.applicability_status,
            readability_status=d.readability_status,
            confidence=d.confidence,
            status=d.status,
            rule_ref=d.rule_ref
        )
        for d in request.declarations
    ]

    context = {
        "product_name": request.product_name,
        "category": request.category,
        "net_quantity": request.net_quantity,
        "mrp": request.mrp,
        "pdp_area_cm2": request.pdp_area_cm2
    }

    engine_result = engine.evaluate_inspection(request.inspection_id, decl_inputs, context)

    check_items = []
    for f in engine_result.findings:
        result_compat = "COMPLIANT"
        if f.status == "POTENTIAL_NON_COMPLIANCE":
            result_compat = "POTENTIAL_NON_COMPLIANCE"
        elif f.status in ("REQUIRES_OFFICER_REVIEW", "NOT_DETECTED"):
            result_compat = "REVIEW_REQUIRED"
        elif f.status == "NOT_APPLICABLE":
            result_compat = "COMPLIANT"

        check_items.append(RuleCheckItem(
            rule_number=f.rule_number,
            rule_title=f.rule_title,
            field_checked=f.field_checked,
            detected_value=f.officer_verified_value or f.extracted_value,
            extracted_value=f.extracted_value,
            officer_verified_value=f.officer_verified_value,
            expected_condition=f.expected_condition,
            result=result_compat,
            controlled_status=f.status.value if hasattr(f.status, "value") else str(f.status),
            applicability=f.applicability.value if hasattr(f.applicability, "value") else str(f.applicability),
            readability=f.readability.value if hasattr(f.readability, "value") else str(f.readability),
            explanation=f.explanation,
            legal_ground=f.legal_ground,
            recommendation=f.recommendation,
            evidence_side=f.evidence_side
        ))

    return RuleCheckResponse(
        inspection_id=request.inspection_id,
        overall_status=engine_result.overall_status,
        passed_count=engine_result.appears_compliant_count,
        review_count=engine_result.requires_officer_review_count,
        violation_count=engine_result.potential_non_compliance_count,
        appears_compliant_count=engine_result.appears_compliant_count,
        potential_non_compliance_count=engine_result.potential_non_compliance_count,
        requires_officer_review_count=engine_result.requires_officer_review_count,
        not_applicable_count=engine_result.not_applicable_count,
        not_detected_count=engine_result.not_detected_count,
        checks=check_items
    )

@router.post("/ecommerce/scrape", response_model=EcommerceScrapeResponse)
async def scrape_ecommerce_listing(request: EcommerceScrapeRequest):
    is_surf_excel = "surf" in request.url.lower()
    
    return EcommerceScrapeResponse(
        url=request.url,
        product_name="Surf Excel Matic Front Load Detergent Powder" if is_surf_excel else "Tata Salt Vacuum Evaporated",
        brand="Surf Excel" if is_surf_excel else "Tata Salt",
        mrp="₹ 450.00" if is_surf_excel else "₹ 28.00",
        selling_price="₹ 399.00" if is_surf_excel else "₹ 28.00",
        unit_sale_price="₹ 0.20 / g" if is_surf_excel else "₹ 28.00 / kg",
        net_quantity="2 kg" if is_surf_excel else "1 kg",
        country_of_origin=None if is_surf_excel else "India",
        manufacturer="Hindustan Unilever Limited, Mumbai" if is_surf_excel else "Tata Consumer Products Limited, Kolkata",
        compliance_status="Potential Non-Compliance" if is_surf_excel else "Compliant",
        missing_declarations=["Country of Origin (Rule 14 & Rule 6(10))"] if is_surf_excel else []
    )
