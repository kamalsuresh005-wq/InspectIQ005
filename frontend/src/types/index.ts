export type InspectionType = 'physical' | 'ecommerce';

export type PremisesType = 
  | 'Retail Store'
  | 'Supermarket / Hypermarket'
  | 'Wholesale Dealer'
  | 'Warehouse / Godown'
  | 'E-Commerce Fulfillment Center'
  | 'Manufacturing Unit'
  | 'Other';

export type InspectionPurpose = 
  | 'Routine Market Surveillance'
  | 'Consumer Complaint'
  | 'Re-Verification'
  | 'Special Enforcement Drive'
  | 'Random Spot Check';

export type ComplianceStatus = 
  | 'Compliant'
  | 'Review Required'
  | 'Potential Non-Compliance'
  | 'Under Review'
  | 'Notice Issued'
  | 'Pending';

export type ComplianceControlledStatus = 
  | 'APPEARS_COMPLIANT'
  | 'POTENTIAL_NON_COMPLIANCE'
  | 'REQUIRES_OFFICER_REVIEW'
  | 'NOT_APPLICABLE'
  | 'NOT_DETECTED';

export type ApplicabilityStatus = 
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'REQUIRES_OFFICER_REVIEW'
  | 'NOT_DETECTED';

export type ReadabilityAssessmentStatus = 
  | 'Acceptable'
  | 'Needs Review'
  | 'Not Assessable';

export type CheckResult = 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE';

export type ViolationSeverity = 'High' | 'Medium' | 'Low';

export type PackageSide = 
  | 'front' 
  | 'back' 
  | 'side' 
  | 'left' 
  | 'right' 
  | 'top' 
  | 'bottom' 
  | 'declaration_area' 
  | 'additional_evidence' 
  | 'screenshot' 
  | 'listing_pdp'
  | 'other';

export type ImageCategory = 'front' | 'back' | 'side' | 'declaration_area' | 'additional_evidence';

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
  url: string; // Persistent Base64 or Blob URL of captured/uploaded image
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
  description?: string;
  linkedFindingIds?: string[];
  timestamp?: string;
  resolution?: string;
}

export interface ImageQualityAnalysis {
  hasImage: boolean;
  width: number;
  height: number;
  blurStatus: 'clear' | 'may_be_blurry' | 'blurry';
  brightnessStatus: 'optimal' | 'too_dark' | 'too_bright';
  usabilityStatus: 'ready' | 'retake_recommended';
  message: string;
  avgBrightness: number;
  contrastScore: number;
}

export type OcrProcessingState = 
  | 'ready'
  | 'processing'
  | 'success'
  | 'failed'
  | 'requires_retake'
  | 'not_configured';

export interface ProductDetails {
  productName: string;
  brand: string;
  category: string;
  specifications?: string;
  netQuantity?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  manufacturerDetails?: string;
  mrp?: string;
  unitSalePrice?: string;
  countryOfOrigin?: string;
  consumerCare?: string;
}

export interface ExtractedDeclaration {
  id: string;
  fieldKey: string;
  fieldName: string;
  detectedValue: string;
  rawOcrText?: string;
  extractedValue?: string;
  officerVerifiedValue?: string;
  applicabilityStatus?: ApplicabilityStatus;
  readabilityAssessment?: ReadabilityAssessmentStatus;
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
  extractedValue?: string;
  officerVerifiedValue?: string;
  expectedCondition: string;
  result: CheckResult | ComplianceControlledStatus;
  controlledStatus?: ComplianceControlledStatus;
  applicabilityStatus?: ApplicabilityStatus;
  readabilityAssessment?: ReadabilityAssessmentStatus;
  confidence: number;
  evidenceId?: string;
  evidenceIds?: string[];
  evidenceSide?: PackageSide;
  explanation: string;
  legalGround: string;
  statutoryProvision?: string;
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
  decision: 'Appears Compliant' | 'Requires Further Review' | 'Potential Non-Compliance' | 'Compliant' | 'Non-Compliant' | 'Needs Clarification' | 'Compoundable Notice (Sec 48)' | 'Regular Notice (Sec 36)';
  remarks: string;
  officerName: string;
  designation: string;
  officerId: string;
  decisionTimestamp: string;
  digitalSignatureRef: string;
  finalDecision?: string;
  reviewedAt?: string;
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
  source: 'Catalog Search' | 'Product Search' | 'Manual Entry' | 'Package Inspection';
  status: 'Confirmed' | 'Needs Confirmation' | 'Pending';
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number; // meters
  timestamp?: string;
  status: 'Detecting' | 'Captured' | 'Acquired' | 'Denied' | 'Unavailable' | 'Manual' | 'Awaiting Capture' | 'Confirmed';
  resolvedAddress?: string;
  isConfirmed?: boolean;
}

export interface QualityGateResult {
  status: 'Ready' | 'Retake Required';
  issue?: string;
  checkedAt: string;
  evaluatedSides: PackageSide[];
  analysis?: ImageQualityAnalysis;
}

export interface Inspection {
  id: string;
  inspectionNumber: string; // e.g. "INSP-2026-0902-129"
  createdAt: string;
  updatedAt: string;
  inspectionType: InspectionType;
  inspectionPurpose?: InspectionPurpose;
  
  // Location & Premises
  locationData?: LocationData;
  premisesName?: string;
  premisesType?: PremisesType;
  premisesAddress?: string;
  retailerGstin?: string;
  officerRemarks?: string;

  // Manual Product Details (Stage 2)
  productDetails?: ProductDetails;

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

  // OCR Extraction State (Stage 2)
  rawOcrText?: string;
  ocrStatus?: OcrProcessingState;

  // Officer Details
  officerId: string;
  officerName: string;
  officerDesignation: string;
  
  // Inspection State & Findings
  status: ComplianceStatus;
  systemAssessment?: string;
  finalDecision?: string;
  reviewedAt?: string;
  reviewChecklist?: Record<string, boolean>;
  reportGeneratedAt?: string;
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
