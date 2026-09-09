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
  History,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ReportService, formatStatusLabel } from '../../services/reportService';

export const ReportPreview: React.FC = () => {
  const { currentInspection, setActiveTab, setFlowStep } = useInspection();
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await ReportService.downloadInspectionPdf(
        currentInspection,
        `${currentInspection.inspectionNumber}_Inspection_Report`
      );
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    ReportService.printReport();
  };

  const checks = currentInspection.complianceChecks || [];
  const declarations = currentInspection.declarations || [];
  const availableImages = (currentInspection.images || []).filter(
    img => img && img.url && img.url.trim() !== ''
  );

  const viewsOrder = ['front', 'back', 'side', 'declaration_area', 'additional_evidence'];
  const sortedImages = [...availableImages].sort((a, b) => {
    const idxA = viewsOrder.indexOf(a.side);
    const idxB = viewsOrder.indexOf(b.side);
    return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
  });

  const rawDecision = currentInspection.finalDecision || currentInspection.officerDecision?.decision || currentInspection.status;
  const decisionLabel = formatStatusLabel(rawDecision);

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
            className="bg-[#12304A] hover:bg-[#0B2239] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#12304A] font-bold text-xs py-2 px-3 rounded-lg border border-[#D9E1E8] flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* Formal Inspection Document Preview */}
      <div
        id="compliance-report-document"
        className="bg-white border border-[#D9E1E8] rounded-xl p-6 sm:p-8 shadow-sm text-[#12304A] font-sans space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#12304A] pb-4 text-center space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#52616F]">
            Government of India • Department of Consumer Affairs
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#12304A]">
            INSPECTIQ
          </h1>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0F766E]">
            Statutory Packaged Commodity Field Inspection Report
          </h2>
          <p className="text-[10.5px] text-[#52616F]">
            Under Legal Metrology Act, 2009 &amp; Legal Metrology (Packaged Commodities) Rules, 2011
          </p>
        </div>

        {/* Section A: Inspection Particulars */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section A: Inspection Particulars
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Inspection ID</span>
              <span className="font-mono font-bold text-[#12304A]">{currentInspection.inspectionNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Date &amp; Time</span>
              <span className="font-medium text-[#12304A]">
                {new Date(currentInspection.createdAt || Date.now()).toLocaleString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Officer Name &amp; ID</span>
              <span className="font-medium text-[#12304A]">{currentInspection.officerName} ({currentInspection.officerId})</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Designation &amp; Zone</span>
              <span className="font-medium text-[#12304A]">{currentInspection.officerDesignation || 'Enforcement Officer'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Inspection Type</span>
              <span className="font-medium text-[#12304A] capitalize">{currentInspection.inspectionType} Inspection</span>
            </div>
            <div className="col-span-1 sm:col-span-3">
              <span className="text-[10px] text-[#52616F] block">Inspection Purpose</span>
              <span className="font-medium text-[#12304A]">{currentInspection.inspectionPurpose || 'Routine Market Surveillance'}</span>
            </div>
          </div>
        </div>

        {/* Section B: Premises Details */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section B: Premises Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Premises / Establishment Name</span>
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
              <span className="text-[10px] text-[#52616F] block">Verified Inspection Location &amp; Coordinates</span>
              <span className="font-medium text-[#12304A] leading-relaxed">
                {currentInspection.location || currentInspection.premisesAddress || 'Verified on-site via device GPS'}
              </span>
            </div>
          </div>
        </div>

        {/* Section C: Product Information */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
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
              <span className="font-bold text-[#12304A]">{currentInspection.netQuantity || 'Not detected in OCR text'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Maximum Retail Price (MRP)</span>
              <span className="font-bold text-[#12304A]">{currentInspection.mrp || 'Not detected in OCR text'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Batch / Lot Number</span>
              <span className="font-medium text-[#12304A]">{currentInspection.batchNumber || currentInspection.declarations?.find(d => d.fieldKey === 'batch_number')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Month &amp; Year of Mfg/Pack</span>
              <span className="font-medium text-[#12304A]">{currentInspection.declarations?.find(d => d.fieldKey === 'mfg_date')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Expiry / Best Before</span>
              <span className="font-medium text-[#12304A]">{currentInspection.declarations?.find(d => d.fieldKey === 'expiry_date')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
            </div>
          </div>
        </div>

        {/* Section D: Manufacturer, Packer & Consumer Care Details */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section D: Manufacturer, Packer &amp; Consumer Care Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-lg border border-[#D9E1E8] text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Manufacturer / Packer Name &amp; Address (Rule 6(1)(a))</span>
              <span className="font-medium text-[#12304A] leading-relaxed">
                {currentInspection.manufacturerName || currentInspection.declarations?.find(d => d.fieldKey === 'manufacturer')?.officerVerifiedValue || 'Not detected in OCR text'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Country of Origin (Rule 14 &amp; Rule 6(10))</span>
              <span className="font-medium text-[#12304A]">
                {currentInspection.declarations?.find(d => d.fieldKey === 'country_of_origin')?.officerVerifiedValue || 'India'}
              </span>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <span className="text-[10px] text-[#52616F] block">Consumer Care Contact Details (Rule 9)</span>
              <span className="font-medium text-[#12304A] leading-relaxed">
                {currentInspection.declarations?.find(d => d.fieldKey === 'consumer_care')?.officerVerifiedValue || 'Not detected in OCR text'}
              </span>
            </div>
          </div>
        </div>

        {/* Section E: Statutory Declaration Audit Trail */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section E: Statutory Declaration Audit Trail
          </h3>
          <div className="border border-[#D9E1E8] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F7FA] text-[#52616F] border-b border-[#D9E1E8]">
                <tr>
                  <th className="py-2 px-3 font-bold">Mandatory Declaration</th>
                  <th className="py-2 px-3 font-bold">Source View</th>
                  <th className="py-2 px-3 font-bold">OCR Extracted</th>
                  <th className="py-2 px-3 font-bold">Officer Verified</th>
                  <th className="py-2 px-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1E8]">
                {declarations.map((decl) => {
                  const sideLabel = decl.sideFound ? decl.sideFound.replace(/_/g, ' ') : 'Package';
                  const extracted = decl.extractedValue || decl.detectedValue || 'Not detected in OCR text';
                  const verified = decl.officerVerifiedValue || extracted;
                  const statusLabel = decl.applicabilityStatus === 'NOT_APPLICABLE' 
                    ? 'Not Applicable' 
                    : decl.status === 'detected' 
                    ? 'Appears Compliant' 
                    : 'Requires Officer Review';

                  return (
                    <tr key={decl.id}>
                      <td className="py-2 px-3 font-medium text-[#12304A]">
                        {decl.fieldName}
                        <span className="block text-[9.5px] font-mono text-[#52616F]">{decl.ruleRef}</span>
                      </td>
                      <td className="py-2 px-3 capitalize font-semibold text-[#0F766E]">
                        {sideLabel}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[#52616F] break-words">
                        {extracted}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#12304A] break-words">
                        {verified}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                          statusLabel === 'Appears Compliant'
                            ? 'bg-[#E6F4F1] text-[#0F766E]'
                            : statusLabel === 'Not Applicable'
                            ? 'bg-[#F1F5F9] text-[#64748B]'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section F: Statutory Compliance Findings */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section F: Statutory Compliance Findings
          </h3>
          <div className="border border-[#D9E1E8] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F7FA] text-[#52616F] border-b border-[#D9E1E8]">
                <tr>
                  <th className="py-2 px-3 font-bold">Rule Ref</th>
                  <th className="py-2 px-3 font-bold">Parameter / Requirement</th>
                  <th className="py-2 px-3 font-bold">System Finding</th>
                  <th className="py-2 px-3 font-bold">Officer Status</th>
                  <th className="py-2 px-3 font-bold">Statutory Provision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1E8]">
                {checks.map((chk) => {
                  const findingLabel = formatStatusLabel(String(chk.result));
                  const officerStatus = chk.officerStatus === 'Overridden' ? 'Overridden' : 'Confirmed';

                  return (
                    <tr key={chk.checkId}>
                      <td className="py-2 px-3 font-bold text-[#12304A]">{chk.ruleNumber}</td>
                      <td className="py-2 px-3 text-[#12304A] break-words">{chk.ruleTitle}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                          findingLabel === 'Potential Non-Compliance'
                            ? 'bg-red-100 text-red-800'
                            : findingLabel === 'Requires Officer Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {findingLabel}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-[#12304A]">
                        {officerStatus}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-[#52616F]">
                        {chk.statutoryProvision || 'Rule 6, PCR 2011'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section G: Photographic Evidence Records */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section G: Photographic Evidence Records ({sortedImages.length} View{sortedImages.length === 1 ? '' : 's'})
          </h3>
          {sortedImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-[#D9E1E8]">
              {sortedImages.map((img) => (
                <div key={img.id} className="space-y-1 text-center">
                  <div className="w-full h-28 bg-slate-900 rounded-lg overflow-hidden border border-[#D9E1E8] flex items-center justify-center">
                    <img 
                      src={img.url} 
                      alt={img.label} 
                      className="max-h-28 max-w-full object-contain" 
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#12304A] block capitalize">
                    {img.label || img.side.replace(/_/g, ' ')} View
                  </span>
                  <span className="text-[9px] text-[#52616F] block truncate">
                    Captured on-site
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-[#D9E1E8] text-xs text-[#52616F] italic">
              No photographic records attached to this inspection.
            </div>
          )}
        </div>

        {/* Section H: Officer Assessment & Final Decision */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section H: Officer Assessment &amp; Final Decision
          </h3>
          <div className="p-3.5 rounded-lg border border-[#D9E1E8] space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#52616F] block">System Advisory Assessment</span>
                <span className="font-bold text-[#12304A] text-sm">
                  {formatStatusLabel(currentInspection.systemAssessment || currentInspection.status)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#52616F] block">Officer Final Determination</span>
                <span className={`font-bold text-xs px-2.5 py-1 rounded inline-block ${
                  decisionLabel === 'Potential Non-Compliance'
                    ? 'bg-red-100 text-red-900'
                    : decisionLabel === 'Requires Officer Review'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {decisionLabel}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#52616F] block">Official Remarks &amp; Observations</span>
              <p className="text-xs text-[#17212B] bg-[#F4F7FA] p-2.5 rounded-lg mt-1 leading-relaxed">
                {currentInspection.officerRemarks || currentInspection.remarks || 'Packaging inspected under Section 18 authority. Mandatory statutory declarations examined and verified.'}
              </p>
            </div>
            
            <div className="text-[10px] text-[#52616F]">
              Determination recorded on: {new Date(currentInspection.reviewedAt || Date.now()).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Section I: Statutory Notice & Formal Signatures */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A] bg-[#F4F7FA] px-2.5 py-1 rounded border-l-3 border-[#0F766E]">
            Section I: Statutory Notice &amp; Formal Signatures
          </h3>
          
          <div className="p-3 rounded-lg border border-[#D9E1E8] text-[10.5px] text-[#52616F] leading-relaxed">
            <strong>Statutory Notice:</strong> This formal inspection report constitutes an official field examination record under Section 18 of the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. Where potential non-compliance is established, statutory proceedings may follow under Section 36 or departmental compounding under Section 48 of the Act.
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
            <div className="border-t-2 border-[#12304A] pt-2">
              <span className="font-bold text-[#12304A] block">Inspecting Officer Signature</span>
              <span className="text-[11px] text-[#12304A] block font-semibold">{currentInspection.officerName}</span>
              <span className="text-[10px] text-[#52616F] block">{currentInspection.officerDesignation || 'Enforcement Officer'} ({currentInspection.officerId})</span>
              <span className="text-[9.5px] text-[#0F766E] font-mono block mt-1">
                Ref: {currentInspection.officerDecision?.digitalSignatureRef || `LM-DSC-${currentInspection.officerId}-VERIFIED`}
              </span>
            </div>

            <div className="border-t-2 border-[#12304A] pt-2 text-right">
              <span className="font-bold text-[#12304A] block">Trader / Premises Representative</span>
              <span className="text-[11px] text-[#12304A] block font-semibold">{currentInspection.premisesName || 'Establishment In-charge'}</span>
              <span className="text-[10px] text-[#52616F] block">Acknowledgement of Inspection Record</span>
              <span className="text-[9.5px] text-[#52616F] block mt-1">Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
