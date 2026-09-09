import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileCheck2,
  MapPin,
  ExternalLink,
  History
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ReportService } from '../../services/reportService';

export const ReportPreview: React.FC = () => {
  const { currentInspection, setActiveTab, setFlowStep } = useInspection();
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await ReportService.downloadPdfFromElement(
        'compliance-report-document',
        `${currentInspection.inspectionNumber}_Inspection_Report`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    ReportService.printReport();
  };

  const checks = currentInspection.complianceChecks || [];
  const declarations = currentInspection.declarations || [];
  const images = currentInspection.images || [];

  const decisionLabel = currentInspection.finalDecision || currentInspection.officerDecision?.decision || currentInspection.status;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12 p-3 sm:p-4">
      
      {/* Top Action Bar */}
      <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setFlowStep('final_decision')}
          className="flex items-center gap-1 text-xs font-semibold text-[#52616F] hover:text-[#12304A] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-[#12304A] hover:bg-[#0B2239] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Generate PDF Report'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#12304A] font-bold text-xs py-2 px-3 rounded-lg border border-[#D9E1E8] flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Complete & View History</span>
          </button>
        </div>
      </div>

      {/* Formal Inspection Document */}
      <div
        id="compliance-report-document"
        className="bg-white border border-[#D9E1E8] rounded-xl p-6 sm:p-8 shadow-sm text-[#12304A] font-sans space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header (Neutral InspectIQ Branding) */}
        <div className="border-b-2 border-[#12304A] pb-4 text-center space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight text-[#12304A]">
            INSPECTIQ
          </h1>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0F766E]">
            PACKAGED COMMODITY INSPECTION REPORT
          </h2>
          <p className="text-[10.5px] text-[#52616F]">
            Under Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
          </p>
        </div>

        {/* Section A: Inspection Particulars */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section A: Inspection Particulars
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Inspection ID</span>
              <span className="font-mono font-bold text-[#12304A]">{currentInspection.inspectionNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Date & Time</span>
              <span className="font-medium text-[#12304A]">{new Date(currentInspection.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Officer Name & ID</span>
              <span className="font-medium text-[#12304A]">{currentInspection.officerName} ({currentInspection.officerId})</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Designation & Zone</span>
              <span className="font-medium text-[#12304A]">{currentInspection.officerDesignation || 'Enforcement Officer'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Inspection Type</span>
              <span className="font-medium text-[#12304A] capitalize">{currentInspection.inspectionType} Inspection</span>
            </div>
            <div className="col-span-3">
              <span className="text-[10px] text-[#52616F] block">Surveillance Purpose</span>
              <span className="font-medium text-[#12304A]">{currentInspection.inspectionPurpose || 'Routine Market Surveillance'}</span>
            </div>
          </div>
        </div>

        {/* Section B: Premises Details */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section B: Premises Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Premises / Store Name</span>
              <span className="font-bold text-[#12304A]">{currentInspection.premisesName || currentInspection.retailerName || 'Retail Facility'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Premises Type</span>
              <span className="font-medium text-[#12304A]">{currentInspection.premisesType || 'Retail Store'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">GSTIN / Identification</span>
              <span className="font-medium font-mono text-[#12304A]">{currentInspection.retailerGstin || 'Not Recorded'}</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-[10px] text-[#52616F] block">Address & Coordinates</span>
              <span className="font-medium text-[#12304A]">{currentInspection.location || currentInspection.premisesAddress || 'Verified during on-site inspection'}</span>
            </div>
          </div>
        </div>

        {/* Section C: Product Information */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section C: Product Information
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Product Name</span>
              <span className="font-bold text-[#12304A]">{currentInspection.productName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Brand</span>
              <span className="font-medium text-[#12304A]">{currentInspection.brand}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Category</span>
              <span className="font-medium text-[#12304A]">{currentInspection.category}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Declared Net Quantity</span>
              <span className="font-medium text-[#12304A]">{currentInspection.netQuantity || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Maximum Retail Price (MRP)</span>
              <span className="font-bold text-[#12304A]">{currentInspection.mrp || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Batch / Lot Number</span>
              <span className="font-medium text-[#12304A]">{currentInspection.batchNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Month & Year of Mfg/Pack</span>
              <span className="font-medium text-[#12304A]">{currentInspection.declarations?.find(d => d.fieldName.toLowerCase().includes('date'))?.detectedValue || 'Recorded on pack'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Expiry / Best Before</span>
              <span className="font-medium text-[#12304A]">{currentInspection.declarations?.find(d => d.fieldName.toLowerCase().includes('expiry') || d.fieldName.toLowerCase().includes('before'))?.detectedValue || 'Recorded on pack'}</span>
            </div>
          </div>
        </div>

        {/* Section D: Manufacturer & Packer Details */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section D: Manufacturer, Packer & Consumer Care Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Manufacturer / Packer Name & Address</span>
              <span className="font-medium text-[#12304A]">{currentInspection.manufacturerName || currentInspection.declarations?.find(d => d.fieldName.toLowerCase().includes('manufacturer'))?.detectedValue || 'Recorded on package'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Country of Origin</span>
              <span className="font-medium text-[#12304A]">{currentInspection.declarations?.find(d => d.fieldName.toLowerCase().includes('origin'))?.detectedValue || 'India'}</span>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <span className="text-[10px] text-[#52616F] block">Consumer Care Contact Details (Rule 6(1)(da))</span>
              <span className="font-medium text-[#12304A]">{currentInspection.declarations?.find(d => d.fieldName.toLowerCase().includes('consumer') || d.fieldName.toLowerCase().includes('care'))?.detectedValue || 'Name, phone, email, and address declared'}</span>
            </div>
          </div>
        </div>

        {/* Section E: Declaration Audit Trail */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section E: Statutory Declaration Audit Trail
          </h3>
          <div className="border border-[#D9E1E8] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FA] text-[#52616F] border-b border-[#D9E1E8]">
                <tr>
                  <th className="py-2 px-3 font-bold">Mandatory Declaration</th>
                  <th className="py-2 px-3 font-bold">OCR Extracted</th>
                  <th className="py-2 px-3 font-bold">Officer Verified</th>
                  <th className="py-2 px-3 font-bold">Status</th>
                  <th className="py-2 px-3 font-bold">Applicability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1E8]">
                {declarations.map((decl) => (
                  <tr key={decl.id}>
                    <td className="py-2 px-3 font-medium text-[#12304A]">{decl.fieldName}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#52616F]">{decl.extractedValue || decl.originalValue || decl.detectedValue || '—'}</td>
                    <td className="py-2 px-3 font-medium text-[#12304A]">{decl.officerVerifiedValue || decl.detectedValue || '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        decl.status === 'detected' ? 'bg-[#E6F4F1] text-[#0F766E]' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {decl.status === 'detected' ? 'Verified' : 'Review'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-[#52616F]">
                      {decl.applicabilityStatus || 'APPLICABLE'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section F: Statutory Compliance Findings */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section F: Statutory Compliance Findings
          </h3>
          <div className="border border-[#D9E1E8] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FA] text-[#52616F] border-b border-[#D9E1E8]">
                <tr>
                  <th className="py-2 px-3 font-bold">Rule Ref</th>
                  <th className="py-2 px-3 font-bold">Parameter</th>
                  <th className="py-2 px-3 font-bold">System Finding</th>
                  <th className="py-2 px-3 font-bold">Officer Status</th>
                  <th className="py-2 px-3 font-bold">Statutory Provision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1E8]">
                {checks.map((chk) => (
                  <tr key={chk.checkId}>
                    <td className="py-2 px-3 font-bold text-[#12304A]">{chk.ruleNumber}</td>
                    <td className="py-2 px-3 text-[#12304A]">{chk.ruleTitle}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        chk.result === 'POTENTIAL_NON_COMPLIANCE'
                          ? 'bg-red-100 text-red-800'
                          : chk.result === 'REQUIRES_OFFICER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {chk.result}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-[#12304A]">
                      {chk.officerStatus === 'Overridden' ? `${chk.controlledStatus} (Overridden)` : 'Confirmed'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-[#52616F]">{chk.statutoryProvision || 'Rule 6, PCR 2011'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section G: Photographic Evidence */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section G: Photographic Evidence Records ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-[#D9E1E8]">
            {images.map((img, idx) => (
              <div key={img.id} className="space-y-1 text-center">
                <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden border border-[#D9E1E8]">
                  <img src={img.url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-[#12304A] block capitalize">{img.side.replace(/_/g, ' ')}</span>
                <span className="text-[9px] text-[#52616F] block truncate">{img.description || 'Packaging capture'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section H: Officer Assessment & Final Decision */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section H: Officer Assessment & Final Decision
          </h3>
          <div className="p-3.5 rounded-lg border border-[#D9E1E8] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#52616F] block">System Advisory Assessment</span>
                <span className="font-bold text-[#12304A]">{currentInspection.systemAssessment || 'Evaluated'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#52616F] block">Officer Final Determination</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  decisionLabel === 'Potential Non-Compliance' || decisionLabel === 'POTENTIAL_NON_COMPLIANCE'
                    ? 'bg-red-100 text-red-900'
                    : decisionLabel === 'Requires Further Review' || decisionLabel === 'REQUIRES_FURTHER_REVIEW'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {decisionLabel}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#52616F] block">Official Remarks & Observations</span>
              <p className="text-xs text-[#17212B] bg-[#F4F7FA] p-2.5 rounded-lg mt-0.5">
                {currentInspection.officerRemarks || currentInspection.remarks || 'Inspection completed and findings recorded.'}
              </p>
            </div>
            
            <div className="text-[10px] text-[#52616F]">
              Determination recorded at: {currentInspection.reviewedAt ? new Date(currentInspection.reviewedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Section I: Statutory Notice & Signatures */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded">
            Section I: Statutory Notice & Formal Signatures
          </h3>
          
          <div className="p-3 rounded-lg border border-[#D9E1E8] text-[10.5px] text-[#52616F] leading-relaxed">
            <b>Statutory Notice:</b> This formal inspection report constitutes an official field examination record under the provisions of the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. Where potential non-compliance is recorded, further statutory proceedings may follow in accordance with Section 36 and Section 48 of the Act.
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 text-xs">
            <div className="border-t border-[#12304A] pt-2">
              <span className="font-bold text-[#12304A] block">Inspecting Officer Signature</span>
              <span className="text-[11px] text-[#12304A] block">{currentInspection.officerName}</span>
              <span className="text-[10px] text-[#52616F] block">{currentInspection.officerDesignation} ({currentInspection.officerId})</span>
              <span className="text-[9.5px] text-[#0F766E] font-mono block mt-1">
                Ref: {currentInspection.officerDecision?.digitalSignatureRef || `LM-DSC-${currentInspection.officerId}-VERIFIED`}
              </span>
            </div>

            <div className="border-t border-[#12304A] pt-2 text-right">
              <span className="font-bold text-[#12304A] block">Trader / Premises Representative</span>
              <span className="text-[11px] text-[#12304A] block">{currentInspection.premisesName || 'Facility In-charge'}</span>
              <span className="text-[10px] text-[#52616F] block">Acknowledgement of Inspection Record</span>
              <span className="text-[9.5px] text-[#52616F] block mt-1">Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
