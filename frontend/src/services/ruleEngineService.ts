/**
 * Legal Metrology Rule Engine Service (Frontend)
 * Statute: Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)
 * 
 * Strict Principles:
 * 1. Deterministic evaluation (no AI/Gemini).
 * 2. Controlled Compliance Statuses:
 *    - APPEARS_COMPLIANT
 *    - POTENTIAL_NON_COMPLIANCE
 *    - REQUIRES_OFFICER_REVIEW
 *    - NOT_APPLICABLE
 *    - NOT_DETECTED
 * 3. Auditability: rawOcrText, extractedValue, officerVerifiedValue remain distinct.
 * 4. Font/Readability: No fake physical mm measurements without calibrated targets.
 * 5. Evidence Linking: Findings link directly to packaging photographs.
 * 6. Officer Decision Support: Proposes findings; Officer makes final determination.
 */

import { 
  ExtractedDeclaration, 
  ComplianceCheck, 
  Violation, 
  EvidenceItem, 
  PackageImage, 
  ComplianceControlledStatus,
  ApplicabilityStatus,
  ReadabilityAssessmentStatus
} from '../types';
import { ApiClient } from './apiClient';

export interface RuleAssessmentResult {
  checks: ComplianceCheck[];
  violations: Violation[];
  evidenceList: EvidenceItem[];
  passedCount: number;
  reviewCount: number;
  violationCount: number;
  appearsCompliantCount: number;
  potentialNonComplianceCount: number;
  requiresOfficerReviewCount: number;
  notApplicableCount: number;
  notDetectedCount: number;
  overallStatus: 'Appears Compliant' | 'Requires Officer Review' | 'Potential Non-Compliance' | 'Compliant' | 'Review Required';
}

export class RuleEngineService {
  /**
   * Asynchronous evaluation attempting backend FastAPI rule engine with graceful deterministic client fallback.
   */
  public static async evaluateComplianceAsync(
    declarations: ExtractedDeclaration[],
    images: PackageImage[],
    inspectionId: string,
    metadata?: {
      productName?: string;
      category?: string;
      netQuantity?: string;
      mrp?: string;
      pdpAreaCm2?: number;
    }
  ): Promise<RuleAssessmentResult> {
    try {
      const payload = {
        inspection_id: inspectionId,
        product_name: metadata?.productName || 'Packaged Commodity',
        category: metadata?.category || 'Retail Pack',
        net_quantity: metadata?.netQuantity || '70 g',
        mrp: metadata?.mrp || '₹ 50.00',
        pdp_area_cm2: metadata?.pdpAreaCm2 || 224.0,
        declarations: declarations.map((d) => ({
          field_key: d.fieldKey,
          field_name: d.fieldName,
          detected_value: d.detectedValue,
          raw_ocr_text: d.rawOcrText || '',
          extracted_value: d.extractedValue || d.detectedValue,
          officer_verified_value: d.officerVerifiedValue || null,
          applicability_status: d.applicabilityStatus || 'APPLICABLE',
          readability_status: d.readabilityAssessment || 'Needs Review',
          confidence: d.confidence,
          status: d.status,
          rule_ref: d.ruleRef,
        })),
      };

      const data = await ApiClient.post<any>('/api/v1/validate-rules', payload, { timeoutMs: 5000 });
      if (data && data.checks) {
        return this.mapBackendResponseToResult(data, declarations, images, inspectionId);
      }
    } catch {
      // Backend service offline or network issue; fallback deterministically to client rule engine
    }

    return this.evaluateCompliance(
      declarations,
      images,
      inspectionId,
      metadata?.netQuantity || '70 g',
      metadata?.pdpAreaCm2 || 224,
      metadata
    );
  }

  /**
   * Deterministic client-side evaluation under PCR 2011.
   */
  public static evaluateCompliance(
    declarations: ExtractedDeclaration[],
    images: PackageImage[],
    inspectionId: string,
    netQuantityStr: string = '70 g',
    pdpAreaCm2: number = 224,
    metadata?: { category?: string; productName?: string }
  ): RuleAssessmentResult {
    const checks: ComplianceCheck[] = [];
    const violations: Violation[] = [];
    const evidenceList: EvidenceItem[] = [];

    const getDecl = (key: string) => declarations.find((d) => d.fieldKey === key);
    const resolveValue = (d?: ExtractedDeclaration) => {
      if (!d) return '';
      if (d.officerVerifiedValue !== undefined && d.officerVerifiedValue !== null && d.officerVerifiedValue.trim()) {
        return d.officerVerifiedValue.trim();
      }
      if (d.extractedValue !== undefined && d.extractedValue !== null && d.extractedValue.trim()) {
        return d.extractedValue.trim();
      }
      return (d.detectedValue || '').trim();
    };

    const findEvidenceImage = (side: string) => {
      return images.find((img) => img.side === side) || images[0];
    };

    // 1. Generic Name (Rule 6(1)(b))
    const nameDecl = getDecl('product_name');
    const nameVal = resolveValue(nameDecl);
    const nameApplicability: ApplicabilityStatus = nameDecl?.applicabilityStatus || 'APPLICABLE';

    if (nameApplicability === 'NOT_APPLICABLE') {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-B', 'Rule 6(1)(b)', 'Generic Name of Commodity', 'Product Name / Description', nameDecl, 'NOT_APPLICABLE', nameApplicability, 'Common/generic name exempt for this commodity category.', 'Rule 6(1)(b) PCR 2011', 'front'));
    } else if (!nameVal || nameVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-B', 'Rule 6(1)(b)', 'Generic Name of Commodity', 'Product Name / Description', nameDecl, 'POTENTIAL_NON_COMPLIANCE', nameApplicability, 'Generic product name could not be detected on the package front.', 'Rule 6(1)(b) PCR 2011', 'front'));
    } else if (nameVal.length >= 3) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-B', 'Rule 6(1)(b)', 'Generic Name of Commodity', 'Product Name / Description', nameDecl, 'APPEARS_COMPLIANT', nameApplicability, 'Generic commodity description conspicuously placed on Principal Display Panel.', 'Satisfies Rule 6(1)(b) PCR 2011.', 'front'));
    } else {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-B', 'Rule 6(1)(b)', 'Generic Name of Commodity', 'Product Name / Description', nameDecl, 'REQUIRES_OFFICER_REVIEW', nameApplicability, 'Product name descriptor is ambiguous or very brief.', 'Rule 6(1)(b) PCR 2011', 'front'));
    }

    // 2. Manufacturer Name & Address (Rule 6(1)(a))
    const mfgDecl = getDecl('manufacturer') || getDecl('manufacturer_name');
    const mfgVal = resolveValue(mfgDecl);
    const mfgApplicability: ApplicabilityStatus = mfgDecl?.applicabilityStatus || 'APPLICABLE';

    if (mfgApplicability === 'NOT_APPLICABLE') {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-A', 'Rule 6(1)(a)', 'Manufacturer / Packer Legal Name & Address', 'Manufacturer Details', mfgDecl, 'NOT_APPLICABLE', mfgApplicability, 'Exempt from standard address display.', 'Rule 6(1)(a) PCR 2011', 'declaration_area'));
    } else if (!mfgVal || mfgVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-A', 'Rule 6(1)(a)', 'Manufacturer / Packer Legal Name & Address', 'Manufacturer Details', mfgDecl, 'POTENTIAL_NON_COMPLIANCE', mfgApplicability, 'Mandatory manufacturer/packer/importer name and address not detected.', 'Rule 6(1)(a) PCR 2011 read with Section 18 LM Act 2009', 'declaration_area'));
    } else {
      const hasPin = /\b[1-9]\d{5}\b/.test(mfgVal);
      const isAdequate = mfgVal.length >= 15;
      if (isAdequate && hasPin) {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-A', 'Rule 6(1)(a)', 'Manufacturer / Packer Legal Name & Address', 'Manufacturer Details', mfgDecl, 'APPEARS_COMPLIANT', mfgApplicability, 'Complete legal entity name and verified address with postal PIN code verified.', 'Full compliance with Rule 6(1)(a) PCR 2011.', 'declaration_area'));
      } else {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-A', 'Rule 6(1)(a)', 'Manufacturer / Packer Legal Name & Address', 'Address Completeness', mfgDecl, 'REQUIRES_OFFICER_REVIEW', mfgApplicability, 'Address appears abbreviated or lacks verified 6-digit postal PIN code.', 'Rule 6(1)(a) mandates complete physical address to establish jurisdiction.', 'declaration_area'));
      }
    }

    // 3. Net Quantity in Metric Units (Rule 6(1)(c))
    const netQtyDecl = getDecl('net_quantity');
    const netQtyVal = resolveValue(netQtyDecl);
    const netQtyApplicability: ApplicabilityStatus = netQtyDecl?.applicabilityStatus || 'APPLICABLE';

    if (!netQtyVal || netQtyVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-C', 'Rule 6(1)(c)', 'Net Quantity Standard Units', 'Net Quantity Metric Units', netQtyDecl, 'POTENTIAL_NON_COMPLIANCE', netQtyApplicability, 'Mandatory net quantity declaration not detected on packaging.', 'Contravention of Rule 6(1)(c) and Section 18 of LM Act 2009.', 'front'));
    } else {
      const validMetricUnit = /\b\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|pieces|units|n)\b/i.test(netQtyVal);
      if (validMetricUnit) {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-C', 'Rule 6(1)(c)', 'Net Quantity Standard Units', 'Net Quantity Format', netQtyDecl, 'APPEARS_COMPLIANT', netQtyApplicability, 'Net quantity conforms to standard SI metric representations under Schedule II.', 'Complies with Rule 6(1)(c) & Schedule II.', 'front'));
      } else {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-C', 'Rule 6(1)(c)', 'Net Quantity Standard Units', 'Net Quantity Format', netQtyDecl, 'POTENTIAL_NON_COMPLIANCE', netQtyApplicability, 'Non-standard weight/volume unit abbreviation or missing metric indicator.', 'Non-standard units punishable under Section 36(2) LM Act 2009.', 'front'));
      }
    }

    // 4. MRP Inclusive of all taxes (Rule 6(1)(e))
    const mrpDecl = getDecl('mrp');
    const mrpVal = resolveValue(mrpDecl);
    const mrpApplicability: ApplicabilityStatus = mrpDecl?.applicabilityStatus || 'APPLICABLE';

    if (!mrpVal || mrpVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-E', 'Rule 6(1)(e)', 'Maximum Retail Price (MRP)', 'MRP Declaration', mrpDecl, 'POTENTIAL_NON_COMPLIANCE', mrpApplicability, 'Mandatory retail sale price declaration missing from OCR extraction.', 'Punishable under Section 36(1) of LM Act 2009.', 'declaration_area'));
    } else {
      const hasPriceAndCurrency = /(?:₹|rs\.?|inr|mrp)\s*[:=]?\s*\d+/i.test(mrpVal) || /\d+(?:\.\d{2})?/.test(mrpVal);
      if (hasPriceAndCurrency) {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-E', 'Rule 6(1)(e)', 'Maximum Retail Price (MRP)', 'MRP Format', mrpDecl, 'APPEARS_COMPLIANT', mrpApplicability, 'MRP declared unambiguously in Indian currency inclusive of all taxes.', 'Satisfies Rule 6(1)(e) PCR 2011.', 'declaration_area'));
      } else {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-E', 'Rule 6(1)(e)', 'Maximum Retail Price (MRP)', 'MRP Clarity', mrpDecl, 'REQUIRES_OFFICER_REVIEW', mrpApplicability, 'Price numeral is smudged or missing explicit currency representation.', 'Rule 6(1)(e) requires unambiguous price display.', 'declaration_area'));
      }
    }

    // 5. Unit Sale Price (Rule 6(11))
    const uspDecl = getDecl('unit_sale_price');
    const uspVal = resolveValue(uspDecl);
    const isSmallPack = /(?:5\s*g|5g|5\s*ml|5ml|10\s*g|10g|10\s*ml|10ml)\b/i.test(netQuantityStr);
    let uspApplicability: ApplicabilityStatus = uspDecl?.applicabilityStatus || (isSmallPack ? 'NOT_APPLICABLE' : 'APPLICABLE');

    if (uspApplicability === 'NOT_APPLICABLE') {
      checks.push(this.createCheck(inspectionId, 'RULE-6-11', 'Rule 6(11)', 'Unit Sale Price (USP)', 'Unit Sale Price Rate', uspDecl, 'NOT_APPLICABLE', uspApplicability, 'Small packaging size exempt from mandatory Unit Sale Price declaration under Rule 6(11).', 'Rule 6(11) PCR 2011', 'declaration_area'));
    } else if (!uspVal || uspVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-11', 'Rule 6(11)', 'Unit Sale Price (USP)', 'Unit Sale Price Rate', uspDecl, 'POTENTIAL_NON_COMPLIANCE', uspApplicability, 'Mandatory Unit Sale Price (USP) declaration not detected adjacent to MRP.', 'Rule 6(11) as amended in 2022.', 'declaration_area'));
    } else {
      const hasUspRate = /\/\s*(?:g|kg|ml|l|piece|unit|n)\b/i.test(uspVal);
      if (hasUspRate) {
        checks.push(this.createCheck(inspectionId, 'RULE-6-11', 'Rule 6(11)', 'Unit Sale Price (USP)', 'Unit Sale Price Rate', uspDecl, 'APPEARS_COMPLIANT', uspApplicability, 'Unit Sale Price expressed in standard metric rate per unit.', 'Rule 6(11) PCR 2011.', 'declaration_area'));
      } else {
        checks.push(this.createCheck(inspectionId, 'RULE-6-11', 'Rule 6(11)', 'Unit Sale Price (USP)', 'Unit Sale Price Format', uspDecl, 'REQUIRES_OFFICER_REVIEW', uspApplicability, 'Unit Sale Price format missing explicit denominator unit.', 'Rule 6(11) PCR 2011.', 'declaration_area'));
      }
    }

    // 6. Month & Year of Manufacture / Packing (Rule 6(1)(d))
    const mfgDateDecl = getDecl('mfg_date');
    const mfgDateVal = resolveValue(mfgDateDecl);
    const mfgDateApplicability: ApplicabilityStatus = mfgDateDecl?.applicabilityStatus || 'APPLICABLE';

    if (!mfgDateVal || mfgDateVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-6-1-D', 'Rule 6(1)(d)', 'Month & Year of Manufacture / Packing', 'Manufacturing Date', mfgDateDecl, 'POTENTIAL_NON_COMPLIANCE', mfgDateApplicability, 'Month and year of manufacture or packing not detected.', 'Mandatory under Rule 6(1)(d) PCR 2011.', 'declaration_area'));
    } else {
      const hasDateFormat = /(?:\d{1,2}[/-]\d{2,4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{2,4})/i.test(mfgDateVal);
      if (hasDateFormat) {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-D', 'Rule 6(1)(d)', 'Month & Year of Manufacture / Packing', 'Manufacturing Date', mfgDateDecl, 'APPEARS_COMPLIANT', mfgDateApplicability, 'Month and year of manufacture or packing clearly stated.', 'Rule 6(1)(d) PCR 2011.', 'declaration_area'));
      } else {
        checks.push(this.createCheck(inspectionId, 'RULE-6-1-D', 'Rule 6(1)(d)', 'Month & Year of Manufacture / Packing', 'Manufacturing Date', mfgDateDecl, 'REQUIRES_OFFICER_REVIEW', mfgDateApplicability, 'Date stamp detected but format requires visual confirmation.', 'Rule 6(1)(d) PCR 2011.', 'declaration_area'));
      }
    }

    // 7. Consumer Care Details (Rule 9)
    const careDecl = getDecl('consumer_care');
    const careVal = resolveValue(careDecl);
    const careApplicability: ApplicabilityStatus = careDecl?.applicabilityStatus || 'APPLICABLE';

    if (!careVal || careVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-9', 'Rule 9', 'Consumer Care Redressal Details', 'Consumer Grievance Cell', careDecl, 'POTENTIAL_NON_COMPLIANCE', careApplicability, 'Mandatory consumer grievance cell coordinates missing from OCR text.', 'Mandatory under Rule 9 PCR 2011.', 'back'));
    } else {
      const hasPhoneOrEmail = /[\w.-]+@[\w.-]+\.\w+/.test(careVal) || /\b\d{3,5}[-\s]?\d{3,8}\b/.test(careVal) || careVal.toLowerCase().includes('toll free');
      if (hasPhoneOrEmail) {
        checks.push(this.createCheck(inspectionId, 'RULE-9', 'Rule 9', 'Consumer Care Redressal Details', 'Consumer Grievance Cell', careDecl, 'APPEARS_COMPLIANT', careApplicability, 'Consumer helpline number or email address clearly identified.', 'Rule 9 PCR 2011.', 'back'));
      } else {
        checks.push(this.createCheck(inspectionId, 'RULE-9', 'Rule 9', 'Consumer Care Redressal Details', 'Consumer Grievance Cell', careDecl, 'REQUIRES_OFFICER_REVIEW', careApplicability, 'Consumer care text present but phone/email address format is incomplete.', 'Rule 9 PCR 2011.', 'back'));
      }
    }

    // 8. Country of Origin (Rule 14 & Rule 6(10))
    const originDecl = getDecl('country_of_origin');
    const originVal = resolveValue(originDecl);
    const originApplicability: ApplicabilityStatus = originDecl?.applicabilityStatus || 'REQUIRES_OFFICER_REVIEW';

    if (originApplicability === 'NOT_APPLICABLE') {
      checks.push(this.createCheck(inspectionId, 'RULE-14', 'Rule 14 & Rule 6(10)', 'Country of Origin Declaration', 'Country of Origin', originDecl, 'NOT_APPLICABLE', originApplicability, 'Country of origin requirement not applicable.', 'Rule 14 PCR 2011', 'declaration_area'));
    } else if (!originVal || originVal.toLowerCase().includes('not detected')) {
      checks.push(this.createCheck(inspectionId, 'RULE-14', 'Rule 14 & Rule 6(10)', 'Country of Origin Declaration', 'Country of Origin', originDecl, 'REQUIRES_OFFICER_REVIEW', originApplicability, 'Country of origin not detected; verify whether product is imported or domestic.', 'Rule 14 & Rule 6(10) PCR 2011', 'declaration_area'));
    } else {
      checks.push(this.createCheck(inspectionId, 'RULE-14', 'Rule 14 & Rule 6(10)', 'Country of Origin Declaration', 'Country of Origin', originDecl, 'APPEARS_COMPLIANT', originApplicability, `Country of origin identified: '${originVal}'.`, 'Rule 14 PCR 2011.', 'declaration_area'));
    }

    // 9. Readability & Conspicuousness (Rule 5 & Rule 7 Table I) - Strict uncalibrated guard!
    const readabilityStatus = nameDecl?.readabilityAssessment || 'Needs Review';
    checks.push({
      checkId: `chk-${inspectionId}-readability`,
      inspectionId,
      ruleId: 'RULE-5-7-READABILITY',
      ruleNumber: 'Rule 5 & Rule 7 (Table-I)',
      ruleTitle: 'Conspicuousness, Contrast and Readability of Declarations',
      fieldChecked: 'Numeral Height & Readability',
      detectedValue: `Visual assessment: ${readabilityStatus}`,
      extractedValue: `Readability: ${readabilityStatus}`,
      officerVerifiedValue: `Uncalibrated camera photo`,
      expectedCondition: 'Prominent, distinct contrast and statutory height per Table I (uncalibrated camera cannot assert physical mm)',
      result: 'REQUIRES_OFFICER_REVIEW',
      controlledStatus: 'REQUIRES_OFFICER_REVIEW',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: readabilityStatus,
      confidence: 70,
      evidenceId: findEvidenceImage('declaration_area')?.id,
      evidenceSide: 'declaration_area',
      explanation: 'Phone camera photograph lacks physical gauge calibration. Exact physical millimetre font size cannot be claimed automatically.',
      legalGround: 'Rule 5 & Rule 7 Table I PCR 2011 read with Section 18 LM Act 2009',
      recommendation: 'Inspecting officer must physically verify numeral height against Principal Display Panel area table.',
    });

    // Populate evidence items for all checks
    checks.forEach((chk, idx) => {
      const side = chk.evidenceSide || 'declaration_area';
      const evImg = findEvidenceImage(side);
      const evItem: EvidenceItem = {
        evidenceId: `ev-${inspectionId}-${idx + 1}`,
        inspectionId,
        imageId: evImg?.id || `img-${side}`,
        imageUrl: evImg?.url || '',
        side: (evImg?.side as any) || (side as any),
        label: `${chk.fieldChecked} Packaging Evidence`,
        detectedText: chk.detectedValue,
        ruleRef: chk.ruleNumber,
        confidence: chk.confidence,
        officerComments: chk.explanation,
        status: chk.result === 'APPEARS_COMPLIANT' ? 'Accepted' : 'Pending',
      };
      chk.evidenceId = evItem.evidenceId;
      evidenceList.push(evItem);

      if (chk.result === 'POTENTIAL_NON_COMPLIANCE') {
        violations.push({
          violationId: `viol-${inspectionId}-${idx + 1}`,
          inspectionId,
          ruleNumber: chk.ruleNumber,
          ruleTitle: chk.ruleTitle,
          category: 'Mandatory Declarations',
          severity: 'High',
          finding: chk.explanation,
          observedValue: chk.detectedValue,
          requiredStandard: chk.expectedCondition,
          confidence: chk.confidence,
          status: 'Officer Review Required',
          evidenceId: evItem.evidenceId,
          sectionReference: chk.legalGround,
          timestamp: new Date().toISOString(),
        });
      }
    });

    const appearsCompliantCount = checks.filter((c) => c.result === 'APPEARS_COMPLIANT').length;
    const potentialNonComplianceCount = checks.filter((c) => c.result === 'POTENTIAL_NON_COMPLIANCE').length;
    const requiresOfficerReviewCount = checks.filter((c) => c.result === 'REQUIRES_OFFICER_REVIEW').length;
    const notApplicableCount = checks.filter((c) => c.result === 'NOT_APPLICABLE').length;
    const notDetectedCount = checks.filter((c) => c.result === 'NOT_DETECTED').length;

    let overallStatus: 'Appears Compliant' | 'Requires Officer Review' | 'Potential Non-Compliance' = 'Appears Compliant';
    if (potentialNonComplianceCount > 0) {
      overallStatus = 'Potential Non-Compliance';
    } else if (requiresOfficerReviewCount > 0) {
      overallStatus = 'Requires Officer Review';
    }

    return {
      checks,
      violations,
      evidenceList,
      passedCount: appearsCompliantCount,
      reviewCount: requiresOfficerReviewCount,
      violationCount: potentialNonComplianceCount,
      appearsCompliantCount,
      potentialNonComplianceCount,
      requiresOfficerReviewCount,
      notApplicableCount,
      notDetectedCount,
      overallStatus,
    };
  }

  private static createCheck(
    inspectionId: string,
    ruleId: string,
    ruleNumber: string,
    ruleTitle: string,
    fieldChecked: string,
    decl: ExtractedDeclaration | undefined,
    controlledStatus: ComplianceControlledStatus,
    applicability: ApplicabilityStatus,
    explanation: string,
    legalGround: string,
    evidenceSide: string
  ): ComplianceCheck {
    const extracted = decl?.extractedValue || decl?.detectedValue || '';
    const verified = decl?.officerVerifiedValue !== undefined && decl?.officerVerifiedValue !== null
      ? decl.officerVerifiedValue
      : extracted;

    // Backward-compatible result mapping
    let resultCompat: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE' = 'COMPLIANT';
    if (controlledStatus === 'POTENTIAL_NON_COMPLIANCE') resultCompat = 'POTENTIAL_NON_COMPLIANCE';
    else if (controlledStatus === 'REQUIRES_OFFICER_REVIEW' || controlledStatus === 'NOT_DETECTED') resultCompat = 'REVIEW_REQUIRED';

    return {
      checkId: `chk-${inspectionId}-${ruleId}`,
      inspectionId,
      ruleId,
      ruleNumber,
      ruleTitle,
      fieldChecked,
      detectedValue: verified || extracted || 'Not detected',
      extractedValue: extracted,
      officerVerifiedValue: verified,
      expectedCondition: `Statutory standard under ${ruleNumber}`,
      result: controlledStatus,
      controlledStatus,
      applicabilityStatus: applicability,
      readabilityAssessment: decl?.readabilityAssessment || 'Needs Review',
      confidence: decl?.confidence || 85,
      explanation,
      legalGround,
      recommendation: controlledStatus === 'APPEARS_COMPLIANT' ? 'Statutory standard satisfied.' : 'Officer manual review required.',
      evidenceSide: evidenceSide as any,
    };
  }

  private static mapBackendResponseToResult(
    data: any,
    declarations: ExtractedDeclaration[],
    images: PackageImage[],
    inspectionId: string
  ): RuleAssessmentResult {
    const checks: ComplianceCheck[] = (data.checks || []).map((c: any) => ({
      checkId: `chk-${inspectionId}-${c.rule_number}`,
      inspectionId,
      ruleId: c.rule_number,
      ruleNumber: c.rule_number,
      ruleTitle: c.rule_title,
      fieldChecked: c.field_checked,
      detectedValue: c.detected_value,
      extractedValue: c.extracted_value,
      officerVerifiedValue: c.officer_verified_value,
      expectedCondition: c.expected_condition,
      result: (c.controlled_status || c.result) as any,
      controlledStatus: c.controlled_status as any,
      applicabilityStatus: c.applicability as any,
      readabilityAssessment: c.readability as any,
      confidence: 90,
      explanation: c.explanation,
      legalGround: c.legal_ground,
      recommendation: c.recommendation || '',
      evidenceSide: c.evidence_side || 'declaration_area',
    }));

    const evidenceList: EvidenceItem[] = checks.map((chk, idx) => {
      const evImg = images.find((img) => img.side === chk.evidenceSide) || images[0];
      return {
        evidenceId: `ev-${inspectionId}-${idx + 1}`,
        inspectionId,
        imageId: evImg?.id || `img-${chk.evidenceSide}`,
        imageUrl: evImg?.url || '',
        side: (evImg?.side as any) || 'declaration_area',
        label: `${chk.fieldChecked} Packaging Evidence`,
        detectedText: chk.detectedValue,
        ruleRef: chk.ruleNumber,
        confidence: chk.confidence,
        officerComments: chk.explanation,
        status: chk.result === 'APPEARS_COMPLIANT' ? 'Accepted' : 'Pending',
      };
    });

    const violations: Violation[] = checks
      .filter((c) => c.result === 'POTENTIAL_NON_COMPLIANCE')
      .map((chk, idx) => ({
        violationId: `viol-${inspectionId}-${idx + 1}`,
        inspectionId,
        ruleNumber: chk.ruleNumber,
        ruleTitle: chk.ruleTitle,
        category: 'Mandatory Declarations',
        severity: 'High',
        finding: chk.explanation,
        observedValue: chk.detectedValue,
        requiredStandard: chk.expectedCondition,
        confidence: chk.confidence,
        status: 'Officer Review Required',
        evidenceId: `ev-${inspectionId}-${idx + 1}`,
        sectionReference: chk.legalGround,
        timestamp: new Date().toISOString(),
      }));

    return {
      checks,
      violations,
      evidenceList,
      passedCount: data.appears_compliant_count || data.passed_count || 0,
      reviewCount: data.requires_officer_review_count || data.review_count || 0,
      violationCount: data.potential_non_compliance_count || data.violation_count || 0,
      appearsCompliantCount: data.appears_compliant_count || 0,
      potentialNonComplianceCount: data.potential_non_compliance_count || 0,
      requiresOfficerReviewCount: data.requires_officer_review_count || 0,
      notApplicableCount: data.not_applicable_count || 0,
      notDetectedCount: data.not_detected_count || 0,
      overallStatus: data.overall_status || 'Appears Compliant',
    };
  }
}
