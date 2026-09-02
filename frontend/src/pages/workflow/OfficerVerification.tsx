import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck2, 
  ArrowRight, 
  PenTool, 
  Scale, 
  KeyRound,
  FileText
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { OfficerDecision } from '../../types';

export const OfficerVerification: React.FC = () => {
  const { currentInspection, currentUser, submitOfficerDecision, setFlowStep } = useInspection();

  const [decision, setDecision] = useState<OfficerDecision['decision']>(
    currentInspection.violations.length > 0 ? 'Compoundable Notice (Sec 48)' : 'Compliant'
  );
  
  const [remarks, setRemarks] = useState<string>(
    currentInspection.violations.length > 0
      ? `Inspection establishes non-compliance with Legal Metrology (Packaged Commodities) Rules, 2011 for commodity ${currentInspection.productName}. Recommended for Section 36(1) statutory notice / Section 48 compounding.`
      : `All mandatory statutory declarations under Rule 6(1) and Schedule II verified and found fully compliant with Legal Metrology (Packaged Commodities) Rules, 2011 for ${currentInspection.productName}.`
  );

  const [compoundingFee, setCompoundingFee] = useState<string>('₹ 25,000.00');
  const [signed, setSigned] = useState<boolean>(true);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const noticeNum = decision !== 'Compliant' ? `LM/DL/2026/NOT-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const officerDecision: OfficerDecision = {
      decision,
      remarks,
      officerName: currentUser.name,
      designation: currentUser.designation,
      officerId: currentUser.id,
      decisionTimestamp: new Date().toISOString(),
      digitalSignatureRef: `DSC-${currentUser.badgeNumber}-${Date.now().toString(36).toUpperCase()}`,
      compoundableFeeEstimate: decision === 'Compoundable Notice (Sec 48)' ? compoundingFee : undefined,
      noticeRefNumber: noticeNum,
    };

    submitOfficerDecision(officerDecision);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">
            Step 6 of 7
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-500 font-medium">Authoritative Enforcement Determination</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-serif">
          Enforcement Officer Determination & DSC Authentication
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          As the designated Legal Metrology Officer under Section 18, verify findings and record your formal statutory order.
        </p>
      </div>

      <form onSubmit={handleConfirm} className="space-y-4">
        
        {/* Case Summary Panel */}
        <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
              Case Particulars: {currentInspection.inspectionNumber}
            </span>
            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
              currentInspection.status === 'Compliant'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              AI Recommendation: {currentInspection.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Commodity</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block">{currentInspection.productName}</span>
              <span className="text-[10.5px] text-slate-500">{currentInspection.brand} • {currentInspection.netQuantity}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Manufacturer / Packer</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{currentInspection.manufacturerName}</span>
              <span className="text-[10.5px] text-slate-500">{currentInspection.retailerName}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Statutory Non-Compliances</span>
              <span className="font-bold text-red-800 text-xs mt-0.5 block">
                {currentInspection.violations.length} Flagged Infraction(s)
              </span>
              <span className="text-[10.5px] text-slate-500">{currentInspection.complianceChecks.length} rules evaluated</span>
            </div>
          </div>
        </div>

        {/* Officer Decision Radio Selector */}
        <div className="bg-white p-5 border border-slate-200 rounded space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Select Authoritative Statutory Determination:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className={`p-3 rounded border-2 cursor-pointer transition-colors flex items-start gap-2.5 ${
              decision === 'Compliant'
                ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="Compliant"
                checked={decision === 'Compliant'}
                onChange={() => setDecision('Compliant')}
                className="mt-0.5"
              />
              <div>
                <div className="font-bold text-slate-900">Compliant (Clearance Granted)</div>
                <p className="text-[11px] text-slate-600 mt-0.5">Package conforms to all mandatory statutory rules and font standards.</p>
              </div>
            </label>

            <label className={`p-3 rounded border-2 cursor-pointer transition-colors flex items-start gap-2.5 ${
              decision === 'Compoundable Notice (Sec 48)'
                ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="Compoundable Notice (Sec 48)"
                checked={decision === 'Compoundable Notice (Sec 48)'}
                onChange={() => setDecision('Compoundable Notice (Sec 48)')}
                className="mt-0.5"
              />
              <div>
                <div className="font-bold text-slate-900">Compoundable Notice (Section 48)</div>
                <p className="text-[11px] text-slate-600 mt-0.5">First offence eligible for departmental compounding fee (₹25,000 standard).</p>
              </div>
            </label>

            <label className={`p-3 rounded border-2 cursor-pointer transition-colors flex items-start gap-2.5 ${
              decision === 'Regular Notice (Sec 36)' || decision === 'Non-Compliant'
                ? 'border-red-700 bg-red-50/50 ring-1 ring-red-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="Regular Notice (Sec 36)"
                checked={decision === 'Regular Notice (Sec 36)' || decision === 'Non-Compliant'}
                onChange={() => setDecision('Regular Notice (Sec 36)')}
                className="mt-0.5"
              />
              <div>
                <div className="font-bold text-slate-900">Form 1 Show-Cause Notice (Section 36)</div>
                <p className="text-[11px] text-slate-600 mt-0.5">Formal notice requiring manufacturer/retailer response within 15 days.</p>
              </div>
            </label>

            <label className={`p-3 rounded border-2 cursor-pointer transition-colors flex items-start gap-2.5 ${
              decision === 'Needs Clarification'
                ? 'border-blue-700 bg-blue-50/50 ring-1 ring-blue-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="decision"
                value="Needs Clarification"
                checked={decision === 'Needs Clarification'}
                onChange={() => setDecision('Needs Clarification')}
                className="mt-0.5"
              />
              <div>
                <div className="font-bold text-slate-900">Needs Secondary Metrological Testing</div>
                <p className="text-[11px] text-slate-600 mt-0.5">Sample seized for laboratory testing or zonal legal review.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Officer Remarks & Signature Card */}
        <div className="bg-white p-5 border border-slate-200 rounded space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Authoritative Officer Remarks & Directions
            </label>
            <textarea
              rows={3}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F] leading-relaxed"
            />
          </div>

          {/* Digital Signature Badge */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#78350F] text-white flex items-center justify-center font-bold">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">{currentUser.name} ({currentUser.designation})</span>
                <span className="text-[10px] text-slate-500 font-mono">DSC Key: DSC-DEL-7821-GOV-2026 • Class 3 Validated</span>
              </div>
            </div>

            <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              DSC Verified
            </span>
          </div>

          <label className="flex items-start gap-2 pt-1 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={signed}
              onChange={(e) => setSigned(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-[11px] leading-tight">
              I certify that I have verified the optical evidence and declarations under statutory authority conferred by Section 18 of the Legal Metrology Act, 2009.
            </span>
          </label>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFlowStep('compliance')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Compliance Matrix
            </button>

            <button
              type="submit"
              className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2.5 px-6 rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Confirm & Generate Official Statutory Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
