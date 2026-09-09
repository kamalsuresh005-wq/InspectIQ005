import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Inspection, 
  PackageImage, 
  ExtractedDeclaration, 
  Officer, 
  ProductCatalogItem, 
  EvidenceItem, 
  OfficerDecision,
  ComplianceStatus,
  IdentifiedProduct,
  LocationData,
  QualityGateResult,
  PremisesType,
  InspectionPurpose,
  ProductDetails,
  OcrProcessingState,
  ApplicabilityStatus,
  ComplianceControlledStatus,
  ImageOcrResult
} from '../types';
import { StorageService } from '../services/storageService';
import { AiOcrService } from '../services/aiOcrService';
import { RuleEngineService } from '../services/ruleEngineService';

export type NavigationTab = 
  | 'dashboard'
  | 'new_inspection'
  | 'inspections'
  | 'products'
  | 'violations'
  | 'reports'
  | 'rules'
  | 'analytics'
  | 'users'
  | 'settings'
  | 'profile';

export type InspectionFlowStep = 
  | 'new_inspection'
  | 'location'
  | 'package_capture'
  | 'image_quality'
  | 'product_details'
  | 'ocr_extraction'
  | 'declaration_verification'
  | 'compliance_analysis'
  | 'evidence_findings'
  | 'evidence'
  | 'officer_review'
  | 'final_decision'
  | 'report'
  | 'completion'
  | 'inspection_details'
  // Backward-compatible step aliases
  | 'capture'
  | 'quality_check'
  | 'ai_identification'
  | 'product_search'
  | 'product_confirmation'
  | 'finding_detail'
  | 'officer_verification'
  | 'create'
  | 'scan'
  | 'ecommerce_input'
  | 'analysis'
  | 'declarations'
  | 'compliance'
  | 'readability'
  | 'violations'
  | 'verification';

const createEmptyInspection = (officer: Officer, type: 'physical' | 'ecommerce' = 'physical'): Inspection => {
  const year = new Date().getFullYear();
  const randSeq = Math.floor(100000 + Math.random() * 900000);
  const inspNum = `INSP-${year}-${randSeq}`;

  return {
    id: inspNum.toLowerCase(),
    inspectionNumber: inspNum,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inspectionType: type,
    inspectionPurpose: 'Routine Market Surveillance',
    locationData: {
      status: 'Awaiting Capture',
      isConfirmed: false,
    },
    premisesName: '',
    premisesType: 'Retail Store',
    premisesAddress: '',
    officerRemarks: '',
    productName: 'Pending Capture',
    brand: 'Pending Capture',
    category: 'Packaged Commodity',
    subCategory: 'Retail SKU',
    mrp: '',
    netQuantity: '',
    manufacturerName: '',
    retailerName: '',
    location: '',
    officerId: officer.id,
    officerName: officer.name,
    officerDesignation: officer.designation,
    status: 'Pending',
    overallConfidence: 0,
    images: [],
    declarations: [],
    complianceChecks: [],
    violations: [],
    evidenceList: [],
    reviewChecklist: {
      locationVerified: false,
      productConfirmed: false,
      photosReviewed: false,
      ocrVerified: false,
      declarationsReviewed: false,
      findingsReviewed: false,
      evidenceExamined: false,
    },
  };
};

interface InspectionContextType {
  // Navigation & Auth
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isLoggedIn: boolean;
  currentUser: Officer;
  login: (officerId: string, email: string) => boolean;
  logout: () => void;
  
  // Data Repositories
  inspections: Inspection[];
  products: ProductCatalogItem[];
  currentInspection: Inspection;
  flowStep: InspectionFlowStep;
  setFlowStep: (step: InspectionFlowStep) => void;
  
  // Workflow Actions
  startNewInspection: (type?: 'physical' | 'ecommerce', presetId?: string) => void;
  updateInspectionMetadata: (fields: Partial<Inspection>) => void;
  runAiPipeline: () => Promise<void>;
  updateLocationData: (data: Partial<LocationData>) => void;
  confirmLocation: () => void;
  updatePremises: (
    premisesName: string, 
    premisesType?: PremisesType, 
    address?: string, 
    officerRemarks?: string,
    purpose?: InspectionPurpose,
    gstin?: string
  ) => void;
  addImage: (image: PackageImage) => void;
  updateImageQuality: (imageId: string, status: 'Ready' | 'Retake Required', issue?: string) => void;
  removeImage: (imageId: string) => void;
  runQualityGate: () => Promise<QualityGateResult>;
  runAiIdentification: () => Promise<IdentifiedProduct>;
  setConfirmedProduct: (product: IdentifiedProduct) => void;
  runOcrExtraction: () => Promise<void>;
  isValidatingRules: boolean;
  validationError: string | null;
  runComplianceValidation: () => Promise<void>;
  updateDeclaration: (
    id: string, 
    updatedValue: string, 
    status?: 'detected' | 'review' | 'not_detected',
    applicabilityStatus?: ApplicabilityStatus
  ) => void;
  updateDeclarationApplicability: (id: string, applicabilityStatus: ApplicabilityStatus) => void;
  overrideComplianceCheck: (
    checkId: string, 
    result: ComplianceControlledStatus | 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE', 
    remarks: string
  ) => void;
  selectEvidence: (evidence: EvidenceItem) => void;
  selectedEvidence: EvidenceItem | null;
  selectedFinding: any | null;
  setSelectedFinding: (finding: any | null) => void;
  updateEvidenceStatus: (evidenceId: string, status: 'Accepted' | 'Rejected' | 'Needs Re-inspection', comments?: string) => void;
  submitOfficerDecision: (decision: OfficerDecision) => void;
  viewExistingInspection: (inspectionId: string, targetStep?: InspectionFlowStep) => void;
  updateProductDetails: (details: ProductDetails) => void;
  updateRawOcrText: (text: string, status?: OcrProcessingState, ocrResults?: ImageOcrResult[], combinedText?: string) => void;
  updateDeclarationsList: (declarations: ExtractedDeclaration[]) => void;
  completeCurrentInspection: () => void;
  deleteEvidenceImage: (imageId: string) => void;
  updateEvidenceDescription: (imageId: string, description: string) => void;
  linkEvidenceToFinding: (imageId: string, findingId: string) => void;
  addAdditionalEvidenceImage: (image: PackageImage) => void;
  updateOfficerRemarks: (remarks: string) => void;
  updateReviewChecklist: (itemKey: string, checked: boolean) => void;
  submitFinalDecision: (
    finalDecision: 'APPEARS_COMPLIANT' | 'REQUIRES_FURTHER_REVIEW' | 'POTENTIAL_NON_COMPLIANCE', 
    remarks: string
  ) => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Officer>(StorageService.getCurrentOfficer());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => StorageService.getAuthSession() !== null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [inspections, setInspections] = useState<Inspection[]>(StorageService.getInspections());
  const [products, setProducts] = useState<ProductCatalogItem[]>(StorageService.getProducts());
  
  // Active Inspection flow
  const [currentInspection, setCurrentInspection] = useState<Inspection>(() => {
    const list = StorageService.getInspections();
    if (list.length > 0) return list[0];
    return createEmptyInspection(StorageService.getCurrentOfficer());
  });
  
  const [flowStep, setFlowStep] = useState<InspectionFlowStep>('new_inspection');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);
  const [isValidatingRules, setIsValidatingRules] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with storage on mount
  useEffect(() => {
    const freshInspections = StorageService.getInspections();
    setInspections(freshInspections);
  }, []);

  const login = (officerId: string, email: string): boolean => {
    if (!officerId.trim() || !email.trim()) {
      return false;
    }

    const officer: Officer = {
      id: officerId.trim().toUpperCase(),
      name: officerId.trim().toUpperCase() === 'OFF-DEL-408' ? 'R. Sharma' : `Officer ${officerId.trim()}`,
      designation: 'Legal Metrology Enforcement Officer',
      badgeNumber: `LM-ENF-${Math.floor(1000 + Math.random() * 9000)}`,
      zone: 'Enforcement Division',
      state: 'State Department of Legal Metrology',
      email: email.trim().toLowerCase(),
      role: 'Enforcement Officer',
    };

    setCurrentUser(officer);
    StorageService.setCurrentOfficer(officer);
    StorageService.setAuthSession({
      officerId: officer.id,
      email: officer.email,
      token: `token_${Date.now()}`
    });
    setIsLoggedIn(true);
    setActiveTab('dashboard');
    return true;
  };

  const logout = () => {
    StorageService.clearAuthSession();
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const startNewInspection = (type: 'physical' | 'ecommerce' = 'physical', _presetId?: string) => {
    const newInsp = createEmptyInspection(currentUser, type);
    setCurrentInspection(newInsp);
    setFlowStep('new_inspection');
    setActiveTab('new_inspection');
  };

  const updateInspectionMetadata = (fields: Partial<Inspection>) => {
    setCurrentInspection((prev) => ({ ...prev, ...fields, updatedAt: new Date().toISOString() }));
  };

  const runAiPipeline = async () => {
    await runOcrExtraction();
  };

  const updateLocationData = (data: Partial<LocationData>) => {
    setCurrentInspection((prev) => {
      const prevLoc: LocationData = prev.locationData || { status: 'Awaiting Capture' };
      const updatedLoc: LocationData = {
        ...prevLoc,
        ...data,
        status: data.status || prevLoc.status,
      };

      const resolvedLocString = data.resolvedAddress 
        || (data.latitude ? `${data.latitude.toFixed(5)}° N, ${data.longitude?.toFixed(5)}° E` : prev.location);

      return {
        ...prev,
        locationData: updatedLoc,
        location: resolvedLocString,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const confirmLocation = () => {
    setCurrentInspection((prev) => ({
      ...prev,
      locationData: {
        ...(prev.locationData || { status: 'Captured' }),
        status: 'Confirmed',
        isConfirmed: true,
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const updatePremises = (
    premisesName: string, 
    premisesType?: PremisesType, 
    address?: string, 
    officerRemarks?: string,
    purpose?: InspectionPurpose,
    gstin?: string
  ) => {
    setCurrentInspection((prev) => ({
      ...prev,
      premisesName: premisesName.trim(),
      retailerName: premisesName.trim(),
      premisesType: premisesType || prev.premisesType,
      premisesAddress: address !== undefined ? address : prev.premisesAddress,
      officerRemarks: officerRemarks !== undefined ? officerRemarks : prev.officerRemarks,
      inspectionPurpose: purpose || prev.inspectionPurpose,
      retailerGstin: gstin !== undefined ? gstin : prev.retailerGstin,
      updatedAt: new Date().toISOString()
    }));
  };

  const addImage = (image: PackageImage) => {
    setCurrentInspection((prev) => {
      const existingIdx = prev.images.findIndex(img => img.side === image.side);
      let updatedImages: PackageImage[];
      if (existingIdx >= 0) {
        updatedImages = [...prev.images];
        updatedImages[existingIdx] = image;
      } else {
        updatedImages = [...prev.images, image];
      }

      return {
        ...prev,
        images: updatedImages,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const updateImageQuality = (imageId: string, status: 'Ready' | 'Retake Required', issue?: string) => {
    setCurrentInspection((prev) => ({
      ...prev,
      images: prev.images.map(img => img.id === imageId ? { ...img, qualityStatus: status, qualityIssue: issue } : img),
      updatedAt: new Date().toISOString()
    }));
  };

  const removeImage = (imageId: string) => {
    setCurrentInspection((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
      updatedAt: new Date().toISOString()
    }));
  };

  const updateProductDetails = (details: ProductDetails) => {
    setCurrentInspection((prev) => ({
      ...prev,
      productDetails: details,
      productName: details.productName,
      brand: details.brand,
      category: details.category,
      mrp: details.mrp || prev.mrp,
      netQuantity: details.netQuantity || prev.netQuantity,
      batchNumber: details.batchNumber || prev.batchNumber,
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateRawOcrText = (
    text: string, 
    status?: OcrProcessingState,
    ocrResults?: ImageOcrResult[],
    combinedText?: string
  ) => {
    setCurrentInspection((prev) => ({
      ...prev,
      rawOcrText: text,
      combinedRawOcrText: combinedText || text,
      ocrResults: ocrResults || prev.ocrResults,
      ocrStatus: status || prev.ocrStatus || 'success',
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateDeclarationsList = (declarations: ExtractedDeclaration[]) => {
    setCurrentInspection((prev) => ({
      ...prev,
      declarations,
      updatedAt: new Date().toISOString(),
    }));
  };

  const runQualityGate = async (): Promise<QualityGateResult> => {
    const sides: PackageImage[] = currentInspection.images;
    let hasFailure = false;
    let failureReason: string | undefined;

    for (const img of sides) {
      const result = await AiOcrService.assessImageQuality(img);
      updateImageQuality(img.id, result.status, result.issue);
      if (result.status === 'Retake Required' && !hasFailure) {
        hasFailure = true;
        failureReason = result.issue || result.details;
      }
    }

    const gateResult: QualityGateResult = {
      status: hasFailure ? 'Retake Required' : 'Ready',
      issue: failureReason,
      checkedAt: new Date().toISOString(),
      evaluatedSides: sides.map(s => s.side)
    };

    setCurrentInspection((prev) => ({
      ...prev,
      qualityAssessment: gateResult,
      updatedAt: new Date().toISOString()
    }));

    return gateResult;
  };

  const runAiIdentification = async (): Promise<IdentifiedProduct> => {
    const primaryImg = currentInspection.images.find(img => img.side === 'front') || currentInspection.images[0];
    if (!primaryImg) {
      return {
        name: 'Not detected',
        brand: 'Not detected',
        category: 'Not detected',
        source: 'Package Inspection',
        status: 'Needs Confirmation',
        confidence: 0
      };
    }

    const result = await AiOcrService.identifyProductFromImage(primaryImg, currentInspection.images);
    setCurrentInspection((prev) => ({
      ...prev,
      identifiedProduct: result,
      productName: result.name !== 'Not detected' ? result.name : prev.productName,
      brand: result.brand !== 'Not detected' ? result.brand : prev.brand,
      category: result.category !== 'Not detected' ? result.category : prev.category,
      subCategory: result.subCategory || prev.subCategory,
      mrp: result.mrp || prev.mrp,
      netQuantity: result.packSize || prev.netQuantity,
      updatedAt: new Date().toISOString()
    }));

    return result;
  };

  const setConfirmedProduct = (product: IdentifiedProduct) => {
    const confirmed: IdentifiedProduct = {
      ...product,
      status: 'Confirmed'
    };

    setCurrentInspection((prev) => ({
      ...prev,
      identifiedProduct: confirmed,
      productName: confirmed.name,
      brand: confirmed.brand,
      category: confirmed.category,
      subCategory: confirmed.subCategory || prev.subCategory,
      mrp: confirmed.mrp || prev.mrp,
      netQuantity: confirmed.packSize || prev.netQuantity,
      manufacturerName: confirmed.manufacturer || prev.manufacturerName,
      updatedAt: new Date().toISOString()
    }));
  };

  const runOcrExtraction = async () => {
    const result = await AiOcrService.extractDeclarationsFromImages(
      currentInspection.images,
      currentInspection.identifiedProduct
    );

    const ruleEvaluation = RuleEngineService.evaluateCompliance(
      result.declarations,
      result.updatedImages,
      currentInspection.inspectionNumber,
      currentInspection.identifiedProduct?.packSize || currentInspection.netQuantity,
      224
    );

    setCurrentInspection((prev) => ({
      ...prev,
      images: result.updatedImages,
      declarations: result.declarations,
      complianceChecks: ruleEvaluation.checks,
      violations: ruleEvaluation.violations,
      evidenceList: ruleEvaluation.evidenceList,
      overallConfidence: result.overallConfidence,
      status: ruleEvaluation.overallStatus as ComplianceStatus,
      updatedAt: new Date().toISOString(),
    }));

    if (ruleEvaluation.evidenceList.length > 0) {
      setSelectedEvidence(ruleEvaluation.evidenceList[0]);
    }
  };

  const runComplianceValidation = async () => {
    setIsValidatingRules(true);
    setValidationError(null);
    try {
      // Simulate real verification pipeline processing
      await new Promise((resolve) => setTimeout(resolve, 500));
      const ruleEvaluation = await RuleEngineService.evaluateComplianceAsync(
        currentInspection.declarations,
        currentInspection.images,
        currentInspection.inspectionNumber,
        {
          productName: currentInspection.productName,
          category: currentInspection.category,
          netQuantity: currentInspection.netQuantity,
          mrp: currentInspection.mrp,
        }
      );

      setCurrentInspection((prev) => ({
        ...prev,
        complianceChecks: ruleEvaluation.checks,
        violations: ruleEvaluation.violations,
        evidenceList: ruleEvaluation.evidenceList,
        status: (ruleEvaluation.overallStatus === 'Potential Non-Compliance'
          ? 'Potential Non-Compliance'
          : ruleEvaluation.overallStatus === 'Requires Officer Review'
          ? 'Review Required'
          : 'Compliant') as ComplianceStatus,
        updatedAt: new Date().toISOString(),
      }));

      if (ruleEvaluation.evidenceList.length > 0) {
        setSelectedEvidence(ruleEvaluation.evidenceList[0]);
      }
    } catch {
      setValidationError("Unable to complete compliance validation. Please review manually.");
    } finally {
      setIsValidatingRules(false);
    }
  };

  const updateDeclaration = (
    id: string, 
    updatedValue: string, 
    status?: 'detected' | 'review' | 'not_detected',
    applicabilityStatus?: ApplicabilityStatus
  ) => {
    setCurrentInspection((prev) => {
      const updatedDeclarations = prev.declarations.map((decl) => {
        if (decl.id === id) {
          return {
            ...decl,
            detectedValue: updatedValue,
            officerVerifiedValue: updatedValue,
            extractedValue: decl.extractedValue || decl.detectedValue,
            status: status || decl.status,
            applicabilityStatus: applicabilityStatus || decl.applicabilityStatus || 'APPLICABLE',
            isEdited: true,
            originalValue: decl.originalValue || decl.detectedValue,
          };
        }
        return decl;
      });

      const ruleEvaluation = RuleEngineService.evaluateCompliance(
        updatedDeclarations,
        prev.images,
        prev.inspectionNumber,
        prev.netQuantity,
        224
      );

      return {
        ...prev,
        declarations: updatedDeclarations,
        complianceChecks: ruleEvaluation.checks,
        violations: ruleEvaluation.violations,
        evidenceList: ruleEvaluation.evidenceList,
        status: (ruleEvaluation.overallStatus === 'Potential Non-Compliance'
          ? 'Potential Non-Compliance'
          : ruleEvaluation.overallStatus === 'Requires Officer Review'
          ? 'Review Required'
          : 'Compliant') as ComplianceStatus,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateDeclarationApplicability = (id: string, applicabilityStatus: ApplicabilityStatus) => {
    setCurrentInspection((prev) => {
      const updatedDeclarations = prev.declarations.map((decl) => {
        if (decl.id === id) {
          return {
            ...decl,
            applicabilityStatus,
          };
        }
        return decl;
      });

      const ruleEvaluation = RuleEngineService.evaluateCompliance(
        updatedDeclarations,
        prev.images,
        prev.inspectionNumber,
        prev.netQuantity,
        224
      );

      return {
        ...prev,
        declarations: updatedDeclarations,
        complianceChecks: ruleEvaluation.checks,
        violations: ruleEvaluation.violations,
        evidenceList: ruleEvaluation.evidenceList,
        status: (ruleEvaluation.overallStatus === 'Potential Non-Compliance'
          ? 'Potential Non-Compliance'
          : ruleEvaluation.overallStatus === 'Requires Officer Review'
          ? 'Review Required'
          : 'Compliant') as ComplianceStatus,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const overrideComplianceCheck = (
    checkId: string, 
    result: ComplianceControlledStatus | 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE', 
    remarks: string
  ) => {
    setCurrentInspection((prev) => {
      const updatedChecks = prev.complianceChecks.map((c) => {
        if (c.checkId === checkId) {
          return {
            ...c,
            result,
            controlledStatus: result as any,
            officerStatus: 'Overridden' as const,
            officerRemarks: remarks,
          };
        }
        return c;
      });

      const hasViolations = updatedChecks.some((c) => c.result === 'POTENTIAL_NON_COMPLIANCE');
      const hasReviews = updatedChecks.some((c) => c.result === 'REQUIRES_OFFICER_REVIEW' || c.result === 'REVIEW_REQUIRED');
      const overallStatus: ComplianceStatus = hasViolations 
        ? 'Potential Non-Compliance' 
        : hasReviews 
        ? 'Review Required' 
        : 'Compliant';

      return {
        ...prev,
        complianceChecks: updatedChecks,
        status: overallStatus,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const selectEvidence = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
  };

  const updateEvidenceStatus = (
    evidenceId: string, 
    status: 'Accepted' | 'Rejected' | 'Needs Re-inspection', 
    comments?: string
  ) => {
    setCurrentInspection((prev) => ({
      ...prev,
      evidenceList: prev.evidenceList.map((e) =>
        e.evidenceId === evidenceId ? { ...e, status, officerComments: comments || e.officerComments } : e
      ),
      updatedAt: new Date().toISOString(),
    }));

    if (selectedEvidence?.evidenceId === evidenceId) {
      setSelectedEvidence((prev) => prev ? { ...prev, status, officerComments: comments || prev.officerComments } : null);
    }
  };

  const submitOfficerDecision = (decision: OfficerDecision) => {
    setCurrentInspection((prev) => {
      let finalStatus: ComplianceStatus = 'Compliant';
      if (
        decision.decision === 'Potential Non-Compliance' || 
        decision.decision === 'Non-Compliant' || 
        decision.decision === 'Compoundable Notice (Sec 48)' || 
        decision.decision === 'Regular Notice (Sec 36)'
      ) {
        finalStatus = 'Notice Issued';
      } else if (
        decision.decision === 'Requires Further Review' || 
        decision.decision === 'Needs Clarification'
      ) {
        finalStatus = 'Review Required';
      } else {
        finalStatus = 'Compliant';
      }

      const updated: Inspection = {
        ...prev,
        officerDecision: {
          ...decision,
          finalDecision: decision.decision,
          reviewedAt: decision.reviewedAt || new Date().toISOString(),
        },
        remarks: decision.remarks,
        status: finalStatus,
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveInspection(updated);
      return updated;
    });
  };

  const completeCurrentInspection = () => {
    StorageService.saveInspection(currentInspection);
    const refreshed = StorageService.getInspections();
    setInspections(refreshed);
    setFlowStep('completion');
  };

  const deleteEvidenceImage = (imageId: string) => {
    removeImage(imageId);
  };

  const updateEvidenceDescription = (imageId: string, description: string) => {
    setCurrentInspection((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId ? { ...img, description } : img
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const linkEvidenceToFinding = (imageId: string, findingId: string) => {
    setCurrentInspection((prev) => {
      const updatedImages = prev.images.map((img) => {
        if (img.id === imageId) {
          const existing = img.linkedFindingIds || [];
          const updated = existing.includes(findingId)
            ? existing.filter((id) => id !== findingId)
            : [...existing, findingId];
          return { ...img, linkedFindingIds: updated };
        }
        return img;
      });

      const updatedChecks = prev.complianceChecks.map((c) => {
        if (c.checkId === findingId) {
          const existing = c.evidenceIds || [];
          const updated = existing.includes(imageId)
            ? existing.filter((id) => id !== imageId)
            : [...existing, imageId];
          return { ...c, evidenceIds: updated };
        }
        return c;
      });

      return {
        ...prev,
        images: updatedImages,
        complianceChecks: updatedChecks,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const addAdditionalEvidenceImage = (image: PackageImage) => {
    setCurrentInspection((prev) => ({
      ...prev,
      images: [...prev.images, image],
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateOfficerRemarks = (remarks: string) => {
    setCurrentInspection((prev) => ({
      ...prev,
      officerRemarks: remarks,
      remarks,
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateReviewChecklist = (itemKey: string, checked: boolean) => {
    setCurrentInspection((prev) => ({
      ...prev,
      reviewChecklist: {
        ...(prev.reviewChecklist || {}),
        [itemKey]: checked,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const submitFinalDecision = (
    finalDecision: 'APPEARS_COMPLIANT' | 'REQUIRES_FURTHER_REVIEW' | 'POTENTIAL_NON_COMPLIANCE',
    remarks: string
  ) => {
    setCurrentInspection((prev) => {
      let finalStatus: ComplianceStatus = 'Compliant';
      if (finalDecision === 'POTENTIAL_NON_COMPLIANCE') {
        finalStatus = 'Notice Issued';
      } else if (finalDecision === 'REQUIRES_FURTHER_REVIEW') {
        finalStatus = 'Review Required';
      } else {
        finalStatus = 'Compliant';
      }

      // Compute rule engine advisory assessment summary
      const violationsCount = prev.complianceChecks.filter(
        (c) => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.controlledStatus === 'POTENTIAL_NON_COMPLIANCE'
      ).length;
      const reviewsCount = prev.complianceChecks.filter(
        (c) => c.result === 'REQUIRES_OFFICER_REVIEW' || c.result === 'REVIEW_REQUIRED'
      ).length;
      const sysAssessment = violationsCount > 0
        ? 'Potential Non-Compliance'
        : reviewsCount > 0
        ? 'Requires Officer Review'
        : 'Appears Compliant';

      const decisionRecord: OfficerDecision = {
        decision: finalDecision === 'APPEARS_COMPLIANT' 
          ? 'Appears Compliant'
          : finalDecision === 'REQUIRES_FURTHER_REVIEW'
          ? 'Requires Further Review'
          : 'Potential Non-Compliance',
        finalDecision: finalDecision === 'APPEARS_COMPLIANT'
          ? 'Appears Compliant'
          : finalDecision === 'REQUIRES_FURTHER_REVIEW'
          ? 'Requires Further Review'
          : 'Potential Non-Compliance',
        remarks: remarks.trim() || `Authoritative statutory determination: ${finalDecision}.`,
        officerName: currentUser.name,
        designation: currentUser.designation,
        officerId: currentUser.id,
        decisionTimestamp: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        digitalSignatureRef: `LM-DSC-${currentUser.id}-${Date.now().toString(36).toUpperCase()}`,
      };

      const updated: Inspection = {
        ...prev,
        officerDecision: decisionRecord,
        systemAssessment: sysAssessment,
        finalDecision: decisionRecord.decision,
        reviewedAt: new Date().toISOString(),
        officerRemarks: remarks.trim(),
        remarks: remarks.trim(),
        status: finalStatus,
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveInspection(updated);
      setInspections(StorageService.getInspections());
      return updated;
    });
  };

  const viewExistingInspection = (inspectionId: string, targetStep: InspectionFlowStep = 'report') => {
    const target = inspections.find((i) => i.id === inspectionId || i.inspectionNumber === inspectionId);
    if (target) {
      setCurrentInspection(target);
      setFlowStep(targetStep);
      setActiveTab('new_inspection');
    }
  };

  return (
    <InspectionContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isLoggedIn,
        currentUser,
        login,
        logout,
        inspections,
        products,
        currentInspection,
        flowStep,
        setFlowStep,
        startNewInspection,
        updateInspectionMetadata,
        runAiPipeline,
        updateLocationData,
        confirmLocation,
        updatePremises,
        addImage,
        updateImageQuality,
        removeImage,
        runQualityGate,
        runAiIdentification,
        setConfirmedProduct,
        runOcrExtraction,
        isValidatingRules,
        validationError,
        runComplianceValidation,
        updateDeclaration,
        updateDeclarationApplicability,
        overrideComplianceCheck,
        selectEvidence,
        selectedEvidence,
        selectedFinding,
        setSelectedFinding,
        updateEvidenceStatus,
        submitOfficerDecision,
        viewExistingInspection,
        updateProductDetails,
        updateRawOcrText,
        updateDeclarationsList,
        completeCurrentInspection,
        deleteEvidenceImage,
        updateEvidenceDescription,
        linkEvidenceToFinding,
        addAdditionalEvidenceImage,
        updateOfficerRemarks,
        updateReviewChecklist,
        submitFinalDecision,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  return context;
};
