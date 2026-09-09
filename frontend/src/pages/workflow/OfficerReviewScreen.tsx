import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Building, 
  Package, 
  MapPin, 
  UserCheck, 
  Image as ImageIcon
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const OfficerReviewScreen: React.FC = () => {
  const { 
    currentInspection, 
    setFlowStep, 
    updateOfficerRemarks, 
    updateReviewChecklist 
  } = useInspection();

  const checks = currentInspection.complianceChecks || [];
  const declarations = currentInspection.declarations || [];
  const images = currentInspection.images || [];

  const nonComplianceCount = checks.filter(
    (c) => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.controlledStatus === 'POTENTIAL_NON_COMPLIANCE'
  ).length;

  const reviewCount = checks.filter(
    (c) => c.result === 'REQUIRES_OFFICER_REVIEW' || c.result === 'REVIEW_REQUIRED' || c.controlledStatus === 'REQUIRES_OFFICER_REVIEW'
  ).length;

  // Initialize remarks if empty
  const defaultSummary = nonComplianceCount > 0
    ? `During statutory market surveillance of "${currentInspection.productName}", ${nonComplianceCount} potential declaration non-compliance(s) were identified under the Legal Metrology (Packaged Commodities) Rules, 2011. Photographic evidence and declaration panels have been examined.`
    : reviewCount > 0
    ? `Inspection of "${currentInspection.productName}" completed. ${reviewCount} declaration parameter(s) require further verification or clarification. Photographic evidence on record.`
    : `Inspection of "${currentInspection.productName}" completed. All verified declarations appear compliant with statutory requirements under Legal Metrology Act, 2009 & PCR 2011.`;

  const [remarks, setRemarks] = useState<string>(currentInspection.officerRemarks || defaultSummary);

  useEffect(() => {
    if (!currentInspection.officerRemarks) {
      updateOfficerRemarks(defaultSummary);
    }
  }, []);

  const checklist = currentInspection.reviewChecklist || {
    locationVerified: false,
    productConfirmed: false,
    photosReviewed: false,
    ocrVerified: false,
    declarationsReviewed: false,
    findingsReviewed: false,
    evidenceExamined: false,
  };

  const toggleChecklist = (key: string) => {
    const newVal = !checklist[key];
    updateReviewChecklist(key, newVal);
  };

  const checklistItems: { key: string; label: string }[] = [
    { key: 'locationVerified', label: 'Location and premises verified' },
    { key: 'productConfirmed', label: 'Product details confirmed' },
    { key: 'photosReviewed', label: 'Package photographs reviewed' },
    { key: 'ocrVerified', label: 'OCR text extraction verified' },
    { key: 'declarationsReviewed', label: 'Mandatory declarations reviewed' },
    { key: 'findingsReviewed', label: 'Compliance findings reviewed' },
    { key: 'evidenceExamined', label: 'Evidence photos examined' },
  ];

  const allChecklistAcknowledged = checklistItems.every((item) => checklist[item.key]);

  const handleRemarksChange = (val: string) => {
    setRemarks(val);
    updateOfficerRemarks(val);
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      <div className="space-y-4">
        
        {/* Step Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Step 8 of 10 · Officer Review
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Officer Review</h1>
            <p className="text-xs text-[#52616F] mt-0.5">
              Comprehensive audit review prior to recording final legal decision.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('evidence')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Evidence</span>
          </button>
        </div>

        {/* Section A: Inspection Details */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-[#D9E1E8] pb-1.5">
            <Building className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">A. Inspection & Premises</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Inspection ID</span>
              <span className="font-mono font-bold text-[#12304A]">{currentInspection.inspectionNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Date & Time</span>
              <span className="font-medium text-[#12304A]">{new Date(currentInspection.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Enforcement Officer</span>
              <span className="font-medium text-[#12304A]">{currentInspection.officerName} ({currentInspection.officerId})</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Premises Name & Type</span>
              <span className="font-medium text-[#12304A] truncate block">{currentInspection.premisesName || 'Retail Store'} ({currentInspection.premisesType})</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-[#52616F] block">Address & Coordinates</span>
              <span className="text-[11px] text-[#12304A] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0F766E] shrink-0" />
                {currentInspection.location || currentInspection.premisesAddress || 'Location captured'}
              </span>
            </div>
          </div>
        </div>

        {/* Section B: Product Details */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-[#D9E1E8] pb-1.5">
            <Package className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">B. Product Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Product Name</span>
              <span className="font-bold text-[#12304A] truncate block">{currentInspection.productName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Brand</span>
              <span className="font-medium text-[#12304A] truncate block">{currentInspection.brand}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Declared Net Quantity</span>
              <span className="font-medium text-[#12304A]">{currentInspection.netQuantity || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Declared MRP</span>
              <span className="font-medium text-[#12304A]">{currentInspection.mrp || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Category</span>
              <span className="font-medium text-[#12304A]">{currentInspection.category}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Batch Number</span>
              <span className="font-medium text-[#12304A]">{currentInspection.batchNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Section C: Declaration Verification Results (Audit Table) */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-1.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F766E]" />
              <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">C. Declaration Audit Trail</h2>
            </div>
            <span className="text-[10.5px] font-semibold text-[#52616F]">{declarations.length} checked</span>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#D9E1E8] text-[#52616F]">
                  <th className="py-1 px-1.5 font-semibold">Declaration</th>
                  <th className="py-1 px-1.5 font-semibold">OCR Extracted</th>
                  <th className="py-1 px-1.5 font-semibold">Verified</th>
                  <th className="py-1 px-1.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1E8]">
                {declarations.map((decl) => {
                  const extracted = decl.extractedValue || decl.originalValue || decl.detectedValue || '—';
                  const verified = decl.officerVerifiedValue || decl.detectedValue || '—';
                  const isModified = decl.isEdited || (extracted !== verified && extracted !== '—');

                  return (
                    <tr key={decl.id} className={isModified ? 'bg-amber-50/60' : ''}>
                      <td className="py-1.5 px-1.5 font-medium text-[#12304A]">{decl.fieldName}</td>
                      <td className="py-1.5 px-1.5 font-mono text-[10px] text-[#52616F] max-w-[90px] truncate" title={extracted}>
                        {extracted}
                      </td>
                      <td className="py-1.5 px-1.5 font-medium text-[#12304A] max-w-[90px] truncate" title={verified}>
                        {verified}
                        {isModified && (
                          <span className="ml-1 text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">edited</span>
                        )}
                      </td>
                      <td className="py-1.5 px-1.5">
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          decl.applicabilityStatus === 'NOT_APPLICABLE'
                            ? 'bg-slate-100 text-slate-700'
                            : decl.status === 'detected'
                            ? 'bg-[#E6F4F1] text-[#0F766E]'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {decl.applicabilityStatus === 'NOT_APPLICABLE' ? 'Not Applicable' : decl.status === 'detected' ? 'Verified' : 'Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section D: Compliance Findings */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">D. Compliance Findings</h2>
            </div>
            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
              nonComplianceCount > 0
                ? 'bg-red-50 text-[#B91C1C]'
                : reviewCount > 0
                ? 'bg-amber-50 text-[#B45309]'
                : 'bg-emerald-50 text-[#15803D]'
            }`}>
              {nonComplianceCount > 0 ? `${nonComplianceCount} Flagged` : `${checks.length} Evaluated`}
            </span>
          </div>

          <div className="space-y-2">
            {checks.map((chk) => (
              <div
                key={chk.checkId}
                className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  chk.result === 'POTENTIAL_NON_COMPLIANCE' || chk.controlledStatus === 'POTENTIAL_NON_COMPLIANCE'
                    ? 'bg-red-50/50 border-red-200'
                    : chk.result === 'REQUIRES_OFFICER_REVIEW' || chk.result === 'REVIEW_REQUIRED'
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-[#F4F7FA] border-[#D9E1E8]'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className="font-bold text-[#12304A] block">{chk.ruleNumber}: {chk.ruleTitle}</span>
                    <span className="text-[10px] text-[#52616F]">{chk.statutoryProvision || 'PCR 2011'}</span>
                  </div>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    chk.result === 'POTENTIAL_NON_COMPLIANCE'
                      ? 'bg-red-100 text-red-800'
                      : chk.result === 'REQUIRES_OFFICER_REVIEW'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {chk.result === 'POTENTIAL_NON_COMPLIANCE' ? 'Non-Compliant' : chk.result === 'REQUIRES_OFFICER_REVIEW' ? 'Review Required' : 'Compliant'}
                  </span>
                </div>

                <p className="text-[11px] text-[#17212B]">
                  Observed: <span className="font-medium">{chk.detectedValue || 'Not provided'}</span>
                </p>

                {chk.officerStatus === 'Overridden' && (
                  <p className="text-[10.5px] text-[#0F766E] font-medium pt-0.5">
                    Officer Override: {chk.controlledStatus} ({chk.officerRemarks})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section E: Officer Review Checklist */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-1.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0F766E]" />
              <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">E. Officer Review Checklist</h2>
            </div>
            <span className="text-[10.5px] font-semibold text-[#52616F]">
              {checklistItems.filter(i => checklist[i.key]).length}/{checklistItems.length} Confirmed
            </span>
          </div>

          <div className="space-y-1.5">
            {checklistItems.map((item) => {
              const isChecked = !!checklist[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleChecklist(item.key)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F4F7FA] transition-colors cursor-pointer border border-transparent hover:border-[#D9E1E8]"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#0F766E] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#52616F] shrink-0" />
                  )}
                  <span className={`text-xs ${isChecked ? 'font-semibold text-[#12304A]' : 'text-[#52616F]'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section F: Officer Remarks */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <label className="text-xs font-bold text-[#12304A] uppercase tracking-wider block">
            F. Official Observations & Remarks
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => handleRemarksChange(e.target.value)}
            placeholder="Record official statutory observations, premises remarks, or testing directives..."
            className="w-full bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg p-2.5 text-xs text-[#12304A] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFlowStep('evidence')}
          className="w-1/3 bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#17212B] font-semibold text-xs py-3 px-2 rounded-xl border border-[#D9E1E8] transition-colors cursor-pointer text-center"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => setFlowStep('final_decision')}
          className="w-2/3 bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Final Decision</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
