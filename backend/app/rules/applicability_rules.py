"""
Legal Metrology Applicability Rules
Statute: Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)

Determines whether specific statutory declarations apply to the commodity being inspected.
Follows strict rule:
- Do not invent exemptions.
- If applicability cannot be confidently determined from available information:
  Status = REQUIRES_OFFICER_REVIEW.
"""

from typing import Dict, Any, Optional
from .base_rule import ApplicabilityStatus, DeclarationInput


class ApplicabilityMatrix:
    """Evaluates statutory applicability of declaration requirements under PCR 2011."""

    @staticmethod
    def determine_applicability(
        field_key: str,
        decl: Optional[DeclarationInput],
        context: Dict[str, Any]
    ) -> ApplicabilityStatus:
        # 1. If officer explicitly set applicability in inspection session, respect officer determination
        if decl and decl.applicability_status:
            try:
                return ApplicabilityStatus(decl.applicability_status)
            except ValueError:
                pass

        category = (context.get("category") or "").lower()
        net_quantity = (context.get("net_quantity") or "").lower()
        commodity_type = (context.get("commodity_type") or "").lower()

        # Core Mandatory Declarations for all retail packages (Rule 6(1))
        universal_mandatory = {
            "mrp",
            "net_quantity",
            "product_name",
            "manufacturer",
            "manufacturer_name",
            "mfg_date",
            "consumer_care"
        }

        if field_key in universal_mandatory:
            return ApplicabilityStatus.APPLICABLE

        # Unit Sale Price (Rule 6(11))
        if field_key == "unit_sale_price":
            # Mandatory for retail packages unless small pack (<10g / <10ml)
            if any(small in net_quantity for small in ["5 g", "5g", "5 ml", "5ml", "10 g", "10g", "10 ml", "10ml"]):
                return ApplicabilityStatus.NOT_APPLICABLE
            return ApplicabilityStatus.APPLICABLE

        # Country of Origin (Rule 14 & Rule 6(10))
        if field_key == "country_of_origin":
            # Mandatory for all imported goods; standard for domestic
            is_imported = context.get("is_imported")
            if is_imported is not None:
                return ApplicabilityStatus.APPLICABLE
            # If origin context is unconfirmed, flag for officer review
            return ApplicabilityStatus.REQUIRES_OFFICER_REVIEW

        # Best Before / Expiry Date (Rule 6(1)(d) proviso)
        if field_key == "expiry_date":
            perishable_indicators = ["food", "beverage", "dairy", "cosmetic", "pharma", "medicine", "perishable", "edible"]
            durable_indicators = ["electronic", "hardware", "tool", "stationery", "steel", "plasticware"]

            if any(ind in category for ind in perishable_indicators):
                return ApplicabilityStatus.APPLICABLE
            if any(ind in category for ind in durable_indicators):
                return ApplicabilityStatus.NOT_APPLICABLE
            return ApplicabilityStatus.REQUIRES_OFFICER_REVIEW

        # Batch / Lot Number (Rule 6(1)(g))
        if field_key == "batch_number":
            return ApplicabilityStatus.APPLICABLE

        # Dimensions (Rule 6(1)(f))
        if field_key == "dimensions":
            dimensional_goods = ["fabric", "cloth", "textile", "pipe", "wire", "cable", "sheet", "rope", "tile"]
            if any(d in category for d in dimensional_goods):
                return ApplicabilityStatus.APPLICABLE
            return ApplicabilityStatus.NOT_APPLICABLE

        return ApplicabilityStatus.REQUIRES_OFFICER_REVIEW
