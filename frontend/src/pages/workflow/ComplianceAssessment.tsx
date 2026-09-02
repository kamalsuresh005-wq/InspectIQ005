import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  ArrowRight, 
  Scale, 
  FileText, 
  Sliders, 
  HelpCircle,
  X,
  Ruler
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ComplianceCheck } from '../../types';

export const ComplianceAssessment: React.FC = () => {
  const { 
    currentInspection, 
    overrideComplianceCheck, 
    setFlowStep, 
    selectEvidence 
  } = useInspection();

  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [filterResult, setFilterResult] = useState<string>('all');
  const [evidenceModalCheck, setEvidenceModalCheck] = useState<ComplianceCheck | null>(null);

  const checks = currentInspection.complianceChecks;

  const filteredChecks = checks.filter((c) => {
    if (filterResult === 'all') return true;
    return c.result === filterResult;
  });

  const compliantCount = checks.filter((c) => c.result === 'COMPLIANT').length;
  const reviewCount = checks.filter((c) => c.result === 'REVIEW_REQUIRED').length;
  const violationCount = checks.filter((c) => c.result === 'POTENTIAL_NON_COMPLIANCE').length;

  const handleOpenEvidence = (check: ComplianceCheck) => {
    setEvidenceModalCheck(check);
  };

  const handleOverride = (checkId: string, newResult: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'POTENTIAL_NON_COMPLIANCE', remarks: string) => {
    overrideComplianceCheck(checkId, newResult, remarks);
    setSelectedCheck(null);
  };

  const activeImage = currentInspection.images[0];

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">
              Step 5 of 7
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Statutory Compliance Matrix</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Compliance Assessment & Rule Evaluation Matrix
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Cross-examination of <strong>{currentInspection.productName}</strong> against the Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <button
          onClick={() => setFlowStep('verification')}
          className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <span>Proceed to Step 6 (Officer Verification)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Scorecard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-slate-500 block">Total Rules Assessed</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{checks.length} Checks</span>
          <span className="text-[10px] text-slate-400">Under PCR 2011</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-emerald-800 block">Compliant Standards</span>
          <span className="text-xl font-bold text-emerald-800 font-mono mt-0.5 block">{compliantCount} Passed</span>
          <span className="text-[10px] text-slate-400">Statutory Provisions Met</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-red-800 block">Potential Non-Compliances</span>
          <span className="text-xl font-bold text-red-700 font-mono mt-0.5 block">{violationCount} Infractions</span>
          <span className="text-[10px] text-slate-400">Section 36 Notice Grounds</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-amber-800 block">Officer Review Required</span>
          <span className="text-xl font-bold text-amber-800 font-mono mt-0.5 block">{reviewCount} Items</span>
          <span className="text-[10px] text-slate-400">Discretionary Review</span>
        </div>
      </div>

      {/* Formal Government-Style Compliance Table Panel */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        
        {/* Table Filter Toolbar */}
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-700 mr-2">Filter Results:</span>
            <button
              onClick={() => setFilterResult('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterResult === 'all' ? 'bg-[#78350F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({checks.length})
            </button>
            <button
              onClick={() => setFilterResult('COMPLIANT')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterResult === 'COMPLIANT' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Compliant ({compliantCount})
            </button>
            <button
              onClick={() => setFilterResult('POTENTIAL_NON_COMPLIANCE')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterResult === 'POTENTIAL_NON_COMPLIANCE' ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Non-Compliance ({violationCount})
            </button>
            <button
              onClick={() => setFilterResult('REVIEW_REQUIRED')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterResult === 'REVIEW_REQUIRED' ? 'bg-amber-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Review ({reviewCount})
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Commodity: {currentInspection.productName}
          </span>
        </div>

        {/* The Formal Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 border-b border-slate-200 uppercase">
                <th className="py-2.5 px-3 w-12 text-center">S.No.</th>
                <th className="py-2.5 px-3">Declaration / Statutory Requirement</th>
                <th className="py-2.5 px-3">Detected Information</th>
                <th className="py-2.5 px-3">Rule Reference</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Evidence</th>
                <th className="py-2.5 px-3 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.map((chk, idx) => {
                const isCompliant = chk.result === 'COMPLIANT';
                const isViolation = chk.result === 'POTENTIAL_NON_COMPLIANCE';
                const isReview = chk.result === 'REVIEW_REQUIRED';

                return (
                  <tr key={chk.checkId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{chk.ruleTitle}</span>
                      <span className="text-[10.5px] text-slate-500">{chk.fieldChecked}</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800">
                      {chk.detectedValue}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-semibold text-[#78350F] text-[10.5px]">
                      {chk.ruleNumber}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCompliant
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isViolation
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isCompliant ? 'COMPLIANT' : isViolation ? 'POTENTIAL NON-COMPLIANCE' : 'REVIEW REQUIRED'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleOpenEvidence(chk)}
                        className="text-xs font-semibold text-[#78350F] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Image</span>
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedCheck(chk)}
                        className="text-[11px] text-slate-600 hover:text-slate-900 font-medium underline"
                      >
                        {chk.officerStatus === 'Overridden' ? 'Overridden' : 'Details'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-600">
            Compliance results cross-referenced against official Legal Metrology Schedule standards.
          </span>

          <button
            onClick={() => setFlowStep('verification')}
            className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Proceed to Step 6 (Officer Determination)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Evidence & Finding Optical Inspection Modal */}
      {evidenceModalCheck && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded border border-slate-300 shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#1E293B] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs">
                  Optical Evidence: {evidenceModalCheck.ruleTitle} ({evidenceModalCheck.ruleNumber})
                </h3>
              </div>
              <button onClick={() => setEvidenceModalCheck(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative bg-slate-900 rounded p-2 flex items-center justify-center max-h-[300px] overflow-hidden">
                {activeImage && (
                  <img 
                    src={activeImage.url} 
                    alt="Evidence Finding" 
                    className="max-h-[280px] max-w-full object-contain rounded"
                  />
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Observed Value:</span>
                  <span className="font-mono font-bold text-slate-900">{evidenceModalCheck.detectedValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Expected Legal Standard:</span>
                  <span className="font-mono text-slate-800">{evidenceModalCheck.expectedCondition}</span>
                </div>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10.5px] font-bold text-slate-600 block">Statutory Ground:</span>
                  <p className="text-[11px] text-slate-700 leading-tight">{evidenceModalCheck.legalGround}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setEvidenceModalCheck(null)}
                className="bg-[#78350F] text-white font-semibold px-4 py-1.5 rounded hover:bg-[#582509]"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Officer Override Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded border border-slate-300 shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#1E293B] text-white p-3.5 flex items-center justify-between">
              <h3 className="font-bold text-xs">{selectedCheck.ruleNumber}: {selectedCheck.ruleTitle}</h3>
              <button onClick={() => setSelectedCheck(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Explanation</span>
                <p className="text-slate-800 leading-relaxed font-medium">{selectedCheck.explanation}</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Statutory Ground</span>
                <p className="text-slate-700 font-mono text-[11px]">{selectedCheck.legalGround}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block">Officer Override Option:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOverride(selectedCheck.checkId, 'COMPLIANT', 'Officer verified exemption under Rule 26')}
                    className="flex-1 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold hover:bg-emerald-100 text-center"
                  >
                    Mark Compliant
                  </button>
                  <button
                    onClick={() => handleOverride(selectedCheck.checkId, 'POTENTIAL_NON_COMPLIANCE', 'Confirmed non-compliance upon physical verification')}
                    className="flex-1 py-1.5 bg-red-50 text-red-800 border border-red-300 rounded font-semibold hover:bg-red-100 text-center"
                  >
                    Mark Non-Compliance
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedCheck(null)}
                className="text-slate-600 hover:text-slate-900 font-semibold px-3 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
