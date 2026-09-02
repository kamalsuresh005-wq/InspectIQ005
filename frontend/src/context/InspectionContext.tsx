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
  QualityGateResult 
} from '../types';
import { StorageService } from '../services/storageService';
import { AiOcrService } from '../services/aiOcrService';
import { RuleEngineService } from '../services/ruleEngineService';
import { PRODUCT_CATALOGUE, searchCatalogue } from '../data/productCatalogue';

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
  | 'settings';

export type InspectionFlowStep = 
  | 'new_inspection'
  | 'location'
  | 'capture'
  | 'quality_check'
  | 'ai_identification'
  | 'product_search'
  | 'product_confirmation'
  | 'ocr_extraction'
  | 'compliance_analysis'
  | 'finding_detail'
  | 'officer_verification'
  | 'completion'
  | 'report'
  // Legacy aliases for backward compatibility
  | 'create'
  | 'scan'
  | 'ecommerce_input'
  | 'analysis'
  | 'declarations'
  | 'compliance'
  | 'readability'
  | 'violations'
  | 'evidence'
  | 'verification';

interface InspectionContextType {
  // Navigation & Auth
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isLoggedIn: boolean;
  currentUser: Officer;
  login: (officerId: string, email: string) => void;
  logout: () => void;
  
  // Data Repositories
  inspections: Inspection[];
  products: ProductCatalogItem[];
  currentInspection: Inspection;
  flowStep: InspectionFlowStep;
  setFlowStep: (step: InspectionFlowStep) => void;
  
  // Workflow Actions
  startNewInspection: (type: 'physical' | 'ecommerce', presetId?: string) => void;
  updateInspectionMetadata: (fields: Partial<Inspection>) => void;
  runAiPipeline: () => Promise<void>;
  updateLocationData: (data: Partial<LocationData>) => void;
  updatePremises: (premisesName: string, address?: string, gstin?: string) => void;
  addImage: (image: PackageImage) => void;
  updateImageQuality: (imageId: string, status: 'Ready' | 'Retake Required', issue?: string) => void;
  removeImage: (imageId: string) => void;
  runQualityGate: () => Promise<QualityGateResult>;
  runAiIdentification: () => Promise<IdentifiedProduct>;
  setConfirmedProduct: (product: IdentifiedProduct) => void;
  runOcrExtraction: () => Promise<void>;
  updateDeclaration: (id: string, updatedValue: string, status?: 'detected' | 'review' | 'not_detected') => void;
  overrideComplianceCheck: (checkId: string, result: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE', remarks: string) => void;
  selectEvidence: (evidence: EvidenceItem) => void;
  selectedEvidence: EvidenceItem | null;
  selectedFinding: any | null;
  setSelectedFinding: (finding: any | null) => void;
  updateEvidenceStatus: (evidenceId: string, status: 'Accepted' | 'Rejected' | 'Needs Re-inspection', comments?: string) => void;
  submitOfficerDecision: (decision: OfficerDecision) => void;
  viewExistingInspection: (inspectionId: string, targetStep?: InspectionFlowStep) => void;
  completeCurrentInspection: () => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<Officer>(StorageService.getCurrentOfficer());
  const [inspections, setInspections] = useState<Inspection[]>(StorageService.getInspections());
  const [products, setProducts] = useState<ProductCatalogItem[]>(StorageService.getProducts());
  
  // Active Inspection flow
  const [currentInspection, setCurrentInspection] = useState<Inspection>(() => {
    const list = StorageService.getInspections();
    if (list.length > 0) return list[0];
    
    // Default initial inspection state
    return {
      id: 'insp-2026-0902-101',
      inspectionNumber: 'INSP-2026-0902-101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inspectionType: 'physical',
      locationData: { status: 'Awaiting Capture' },
      premisesName: '',
      premisesAddress: '',
      productName: 'Awaiting Capture',
      brand: 'Awaiting Capture',
      category: 'Packaged Commodity',
      subCategory: 'Retail SKU',
      mrp: 'Not captured',
      netQuantity: 'Not captured',
      manufacturerName: 'Awaiting OCR detection',
      retailerName: 'Not recorded',
      location: 'Not acquired',
      officerId: 'OFF-DEL-408',
      officerName: 'R. Sharma',
      officerDesignation: 'Legal Metrology Enforcement Officer',
      status: 'Under Review',
      overallConfidence: 0,
      images: [],
      declarations: [],
      complianceChecks: [],
      violations: [],
      evidenceList: []
    };
  });
  
  const [flowStep, setFlowStep] = useState<InspectionFlowStep>('new_inspection');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);

  // Sync with storage on mount
  useEffect(() => {
    const freshInspections = StorageService.getInspections();
    if (freshInspections.length > 0) {
      setInspections(freshInspections);
    }
    const freshProducts = StorageService.getProducts();
    if (freshProducts.length > 0) {
      setProducts(freshProducts);
    }
  }, []);

  const login = (officerId: string, email: string) => {
    const officer: Officer = {
      id: officerId || 'OFF-DEL-408',
      name: 'R. Sharma',
      designation: 'Legal Metrology Enforcement Officer',
      badgeNumber: 'LM-ENF-7821',
      zone: 'Central Enforcement Zone',
      state: 'Delhi (NCT)',
      email: email || 'r.sharma@inspectiq.legalmetrology.in',
      role: 'Enforcement Officer',
    };
    setCurrentUser(officer);
    StorageService.setCurrentOfficer(officer);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const startNewInspection = (type: 'physical' | 'ecommerce') => {
    const count = inspections.length + 1;
    const inspNum = `INSP-2026-0902-${100 + count}`;

    const newInsp: Inspection = {
      id: inspNum.toLowerCase(),
      inspectionNumber: inspNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inspectionType: type,
      locationData: {
        status: 'Awaiting Capture'
      },
      premisesName: '',
      premisesAddress: '',
      productName: 'Awaiting Capture',
      brand: 'Awaiting Capture',
      category: 'Packaged Commodity',
      subCategory: 'Retail SKU',
      mrp: 'Not captured',
      netQuantity: 'Not captured',
      manufacturerName: 'Awaiting OCR detection',
      retailerName: '',
      location: 'Location not acquired',
      officerId: currentUser.id,
      officerName: currentUser.name,
      officerDesignation: currentUser.designation,
      status: 'Under Review',
      overallConfidence: 0,
      images: [],
      declarations: [],
      complianceChecks: [],
      violations: [],
      evidenceList: []
    };

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

      return {
        ...prev,
        locationData: updatedLoc,
        location: data.resolvedAddress || (data.latitude ? `GPS: ${data.latitude.toFixed(5)}, ${data.longitude?.toFixed(5)} (±${data.accuracy?.toFixed(1)}m)` : prev.location),
        updatedAt: new Date().toISOString()
      };
    });
  };

  const updatePremises = (premisesName: string, address?: string, gstin?: string) => {
    setCurrentInspection((prev) => ({
      ...prev,
      premisesName,
      retailerName: premisesName,
      premisesAddress: address || prev.premisesAddress,
      retailerGstin: gstin || prev.retailerGstin,
      updatedAt: new Date().toISOString()
    }));
  };

  const addImage = (image: PackageImage) => {
    setCurrentInspection((prev) => {
      // Replace existing image for same side or append
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
        source: 'AI Identification',
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

    // Evaluate Legal Metrology Rule Engine
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

  const updateDeclaration = (id: string, updatedValue: string, status?: 'detected' | 'review' | 'not_detected') => {
    setCurrentInspection((prev) => {
      const updatedDeclarations = prev.declarations.map((decl) => {
        if (decl.id === id) {
          return {
            ...decl,
            detectedValue: updatedValue,
            status: status || decl.status,
            isEdited: true,
            originalValue: decl.originalValue || decl.detectedValue,
          };
        }
        return decl;
      });

      // Re-evaluate rules after manual officer edit
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
        status: ruleEvaluation.overallStatus as ComplianceStatus,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const overrideComplianceCheck = (
    checkId: string, 
    result: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE', 
    remarks: string
  ) => {
    setCurrentInspection((prev) => {
      const updatedChecks = prev.complianceChecks.map((c) => {
        if (c.checkId === checkId) {
          return {
            ...c,
            result,
            officerStatus: 'Overridden' as const,
            officerRemarks: remarks,
          };
        }
        return c;
      });

      const hasViolations = updatedChecks.some((c) => c.result === 'POTENTIAL_NON_COMPLIANCE');
      const hasReviews = updatedChecks.some((c) => c.result === 'REVIEW_REQUIRED');
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
      const updated: Inspection = {
        ...prev,
        officerDecision: decision,
        remarks: decision.remarks,
        status: decision.decision === 'Compliant' ? 'Compliant' : 'Notice Issued',
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
        updatePremises,
        addImage,
        updateImageQuality,
        removeImage,
        runQualityGate,
        runAiIdentification,
        setConfirmedProduct,
        runOcrExtraction,
        updateDeclaration,
        overrideComplianceCheck,
        selectEvidence,
        selectedEvidence,
        selectedFinding,
        setSelectedFinding,
        updateEvidenceStatus,
        submitOfficerDecision,
        viewExistingInspection,
        completeCurrentInspection,
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
