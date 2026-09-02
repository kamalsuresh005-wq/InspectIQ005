from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    OcrRequest, OcrResponse, ExtractedField,
    RuleCheckRequest, RuleCheckResponse,
    EcommerceScrapeRequest, EcommerceScrapeResponse
)
from ..core.rule_matrix import evaluate_legal_metrology_rules

router = APIRouter(prefix="/api/v1")

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Legal Metrology Inspection Intelligence API",
        "version": "1.0.4",
        "statute": "Legal Metrology Act, 2009 & PCR 2011",
        "prototype_project": "SIH26034"
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
    checks = evaluate_legal_metrology_rules(
        request.declarations,
        request.pdp_area_cm2,
        request.net_quantity
    )

    passed_count = sum(1 for c in checks if c.result == "COMPLIANT")
    review_count = sum(1 for c in checks if c.result == "REVIEW_REQUIRED")
    violation_count = sum(1 for c in checks if c.result == "POTENTIAL_NON_COMPLIANCE")

    overall_status = "Compliant"
    if violation_count > 0:
        overall_status = "Potential Non-Compliance"
    elif review_count > 0:
        overall_status = "Review Required"

    return RuleCheckResponse(
        inspection_id=request.inspection_id,
        overall_status=overall_status,
        passed_count=passed_count,
        review_count=review_count,
        violation_count=violation_count,
        checks=checks
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
