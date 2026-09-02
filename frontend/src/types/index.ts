export type InspectionType = 'physical' | 'ecommerce';

export type ComplianceStatus = 
  | 'Compliant'
  | 'Review Required'
  | 'Potential Non-Compliance'
  | 'Under Review'
  | 'Notice Issued';

export type CheckResult = 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE';

export type ViolationSeverity = 'High' | 'Medium' | 'Low';

export type PackageSide = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'screenshot' | 'listing_pdp';

export interface Officer {
  id: string;
  name: string;
  designation: string;
  badgeNumber: string;
  zone: string;
  state: string;
  email: string;
  role: 'Enforcement Officer' | 'Senior Legal Metrology Inspector' | 'Zonal Controller' | 'Admin';
  avatarUrl?: string;
}

export interface BoundingBox {
  id: string;
  label: string;
  fieldKey: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  confidence: number;
  detectedText: string;
  ruleRef?: string;
  status: 'pass' | 'review' | 'violation';
}

export interface PackageImage {
  id: string;
  side: PackageSide;
  label: string;
  url: string; // Persistent Base64 or Blob URL of ACTUAL captured/uploaded image
  capturedAt: string;
  captureMethod?: 'camera' | 'upload';
  qualityStatus?: 'Ready' | 'Retake Required';
  qualityIssue?: string;
  qualityScore: number; // 0-100
  blurScore: 'Low' | 'Moderate' | 'High';
  glareScore: 'None' | 'Minor' | 'Severe';
  lightingScore: 'Optimal' | 'Sub-optimal' | 'Poor';
  textVisibilityScore: 'Crisp' | 'Adequate' | 'Degraded';
  boundingBoxes: BoundingBox[];
}

export interface ExtractedDeclaration {
  id: string;
  fieldKey: string;
  fieldName: string;
  detectedValue: string;
  normalizedValue?: string;
  confidence: number; // 0-100
  status: 'detected' | 'review' | 'not_detected';
  isMandatory: boolean;
  sideFound: PackageSide;
  ruleRef: string;
  isEdited?: boolean;
  originalValue?: string;
  officerNotes?: string;
  evidenceImageId?: string;
  boundingBox?: BoundingBox;
}

export interface LegalRule {
  ruleId: string;
  ruleNumber: string;
  title: string;
  requirement: string;
  appliesWhen: string;
  exception: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'Active' | 'Future' | 'Superseded';
  sectionRef: string; // e.g. "Section 18 & 36 of Legal Metrology Act, 2009"
  scheduleRef?: string;
  category: 'Mandatory Declarations' | 'Font & Numerals' | 'Net Quantity' | 'E-commerce' | 'MRP & Unit Price' | 'Consumer Redressal' | 'Country of Origin';
  penaltyText: string;
}

export interface ComplianceCheck {
  checkId: string;
  inspectionId: string;
  ruleId: string;
  ruleNumber: string;
  ruleTitle: string;
  fieldChecked: string;
  detectedValue: string;
  expectedCondition: string;
  result: CheckResult;
  confidence: number;
  evidenceId?: string;
  explanation: string;
  legalGround: string;
  recommendation: string;
  officerStatus?: 'Verified' | 'Overridden' | 'Pending';
  officerRemarks?: string;
}

export interface Violation {
  violationId: string;
  inspectionId: string;
  ruleNumber: string;
  ruleTitle: string;
  category: string;
  severity: ViolationSeverity;
  finding: string;
  observedValue: string;
  requiredStandard: string;
  confidence: number;
  status: 'Officer Review Required' | 'Confirmed Violation' | 'Dismissed' | 'Compoundable Notice Issued';
  evidenceId: string;
  sectionReference: string;
  timestamp: string;
}

export interface EvidenceItem {
  evidenceId: string;
  inspectionId: string;
  violationId?: string;
  imageId: string;
  imageUrl: string;
  side: PackageSide;
  label: string;
  detectedText: string;
  ruleRef: string;
  confidence: number;
  boundingBox?: BoundingBox;
  pdpAreaCm2?: number;
  measuredFontHeightMm?: number;
  requiredFontHeightMm?: number;
  contrastRatio?: string;
  officerComments: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Needs Re-inspection';
}

export interface OfficerDecision {
  decision: 'Compliant' | 'Non-Compliant' | 'Needs Clarification' | 'Requires Further Review' | 'Potential Non-Compliance' | 'Compoundable Notice (Sec 48)' | 'Regular Notice (Sec 36)';
  remarks: string;
  officerName: string;
  designation: string;
  officerId: string;
  decisionTimestamp: string;
  digitalSignatureRef: string;
  compoundableFeeEstimate?: string;
  noticeRefNumber?: string;
}

export interface IdentifiedProduct {
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  productType?: string;
  variant?: string;
  flavour?: string;
  colour?: string;
  packSize?: string;
  unit?: string;
  mrp?: string;
  barcode?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  visibleText?: string[];
  confidence?: number;
  source: 'AI Identification' | 'Product Search' | 'Manual Entry';
  status: 'Confirmed' | 'Needs Confirmation' | 'Pending';
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number; // meters
  timestamp?: string;
  status: 'Acquired' | 'Denied' | 'Unavailable' | 'Manual' | 'Awaiting Capture';
  resolvedAddress?: string;
}

export interface QualityGateResult {
  status: 'Ready' | 'Retake Required';
  issue?: string;
  checkedAt: string;
  evaluatedSides: PackageSide[];
}

export interface Inspection {
  id: string;
  inspectionNumber: string; // e.g. "INSP-2026-0902-129"
  createdAt: string;
  updatedAt: string;
  inspectionType: InspectionType;
  
  // Location & Premises (Stored separately)
  locationData?: LocationData;
  premisesName?: string;
  premisesAddress?: string;
  retailerGstin?: string;

  // Product Identification
  identifiedProduct?: IdentifiedProduct;
  productName: string;
  brand: string;
  category: string;
  subCategory: string;
  mrp: string;
  netQuantity: string;
  batchNumber?: string;
  manufacturerName: string;
  retailerName: string;
  location: string;
  ecommerceUrl?: string;

  // Quality Assessment
  qualityAssessment?: QualityGateResult;

  // Officer Details
  officerId: string;
  officerName: string;
  officerDesignation: string;
  
  // Inspection State & Findings
  status: ComplianceStatus;
  overallConfidence: number;
  images: PackageImage[];
  declarations: ExtractedDeclaration[];
  complianceChecks: ComplianceCheck[];
  violations: Violation[];
  evidenceList: EvidenceItem[];
  officerDecision?: OfficerDecision;
  remarks?: string;
}

export interface ProductCatalogItem {
  id: string;
  productName: string;
  brand: string;
  category: string;
  manufacturer: string;
  mrp: string;
  netQuantity: string;
  lastInspectionDate: string;
  lastInspectionId: string;
  complianceStatus: ComplianceStatus;
  inspectionCount: number;
  violationsCount: number;
  imageUrl: string;
}

export interface AnalyticsSummary {
  totalInspections: number;
  compliantCount: number;
  potentialNonComplianceCount: number;
  underReviewCount: number;
  violationsDetectedCount: number;
  inspectionsOverTime: { date: string; physical: number; ecommerce: number; violations: number }[];
  violationCategories: { category: string; count: number; percentage: number; color: string }[];
  inspectionsByCategory: { category: string; total: number; compliant: number; violations: number }[];
  complianceRateByZone: { zone: string; complianceRate: number; total: number }[];
}
