import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Eye, 
  ArrowRight, 
  ShieldAlert, 
  Scale, 
  FileText, 
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { Violation } from '../../types';

export const ViolationDetails: React.FC = () => {
  const { currentInspection, selectEvidence, setFlowStep } = useInspection();

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    currentInspection.violations[0] || null
  );

  const handleInspectEvidence = (v: Violation) => {
    const evidenceItem = currentInspection.evidenceList.find((e) => e.violationId === v.violationId) || currentInspection.evidenceList[0];
    if (evidenceItem) {
      selectEvidence(evidenceItem);
    }
    setFlowStep('evidence');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gov-cardborder shadow-gov flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gov-700 uppercase tracking-wider">Step 7 of 10</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Statutory Violations Triage</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">Potential Non-Compliance & Violations</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Review identified statutory contraventions under Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011.
          </p>
        </div>

        <button
          onClick={() => setFlowStep('evidence')}
          className="bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <span>Open Evidence Viewer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Violations List */}
      {currentInspection.violations.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gov-cardborder shadow-gov text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Statutory Violations Detected</h3>
          <p className="text-xs text-slate-500">
            This commodity satisfies all mandatory declarations under Legal Metrology Rules, 2011.
          </p>
          <button
            onClick={() => setFlowStep('verification')}
            className="mt-2 bg-gov-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm"
          >
            Proceed to Officer Verification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentInspection.violations.map((v) => {
            const isHigh = v.severity === 'High';
            const isMed = v.severity === 'Medium';

            return (
              <div 
                key={v.violationId}
                className="bg-white rounded-xl border border-gov-cardborder shadow-gov overflow-hidden"
              >
                {/* Card Top Banner */}
                <div className={`p-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                  isHigh ? 'bg-red-50/70 border-red-200' : 'bg-amber-50/70 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <AlertOctagon className={`w-5 h-5 ${isHigh ? 'text-red-600' : 'text-amber-600'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{v.violationId}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-xs text-slate-800">{v.ruleTitle}</span>
                      </div>
                      <span className="text-[11px] text-slate-600">{v.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isHigh ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {v.severity} Severity
                    </span>
                    <span className="text-[11px] font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded border border-slate-300">
                      Confidence: {v.confidence}%
                    </span>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-5 space-y-4 text-xs">
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Statutory Finding Description
                    </span>
                    <p className="text-slate-800 font-semibold text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {v.finding}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-200">
                      <span className="text-[10px] uppercase font-bold text-red-800 block">Observed Value</span>
                      <p className="font-mono font-bold text-red-700 text-sm mt-0.5">{v.observedValue}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Mandatory Standard Required</span>
                      <p className="font-mono font-bold text-emerald-800 text-xs mt-0.5">{v.requiredStandard}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gov-50 rounded-lg border border-gov-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gov-800 block">
                        Statutory Reference & Penalty Provision
                      </span>
                      <p className="font-semibold text-gov-950 text-[11px] mt-0.5">
                        {v.sectionReference} • Subject to compounding under Section 48 or notice under Section 36.
                      </p>
                    </div>
                    <span className="text-[10.5px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded border border-amber-300 shrink-0">
                      Status: {v.status}
                    </span>
                  </div>

                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Evidence photographed & indexed for statutory case file.
                  </span>

                  <button
                    onClick={() => handleInspectEvidence(v)}
                    className="bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-2 px-5 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Optical Evidence</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="bg-white p-4 rounded-xl border border-gov-cardborder shadow-gov flex items-center justify-between">
        <button
          onClick={() => setFlowStep('compliance')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Back to Compliance Matrix
        </button>

        <button
          onClick={() => setFlowStep('evidence')}
          className="bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <span>Open Evidence Viewer Canvas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
