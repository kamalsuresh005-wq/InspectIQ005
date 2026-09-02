import React, { useState } from 'react';
import { Download, Printer, FileText, ArrowLeft, QrCode, ShieldCheck, CheckCircle2, Home } from 'lucide-react';
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

  const handleExportDocx = () => {
    ReportService.exportToDocx(currentInspection);
  };

  const handlePrint = () => {
    ReportService.printReport();
  };

  const primaryImage = currentInspection.images.find(img => img.side === 'front') || currentInspection.images[0];
  const backImage = currentInspection.images.find(img => img.side === 'back') || currentInspection.images[1];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8 p-3 sm:p-4">
      
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Professional Inspection Document */}
      <div
        id="compliance-report-document"
        className="bg-white border border-slate-300 rounded-xl p-5 sm:p-8 shadow-sm text-slate-900 font-sans space-y-5 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header (Neutral InspectIQ Branding) */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
              IQ
            </div>
            <span className="text-sm font-extrabold tracking-tight text-blue-950">
              InspectIQ
            </span>
          </div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-600">
            LEGAL METROLOGY FIELD INSPECTION REPORT
          </h1>
          <p className="text-[10.5px] text-slate-500">
            Compliance Verification under Legal Metrology (Packaged Commodities) Rules, 2011
          </p>
        </div>

        {/* Particulars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">Inspection ID</span>
            <span className="font-mono font-bold text-slate-900 text-xs">{currentInspection.inspectionNumber}</span>
          </div>
          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">Date / Time</span>
            <span className="font-semibold text-slate-800 text-[11px]">
              {new Date(currentInspection.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>
          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">Officer</span>
            <span className="font-semibold text-slate-900 text-[11px] block truncate">{currentInspection.officerName}</span>
            <span className="text-[9.5px] text-slate-500 block truncate">{currentInspection.officerDesignation}</span>
          </div>
          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">Premises</span>
            <span className="font-semibold text-slate-900 text-[11px] block truncate">
              {currentInspection.premisesName || currentInspection.retailerName || 'Retail Premises'}
            </span>
          </div>
        </div>

        {/* Location & GPS */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">GPS Coordinates</span>
            <span className="font-mono text-slate-800 text-[11px]">
              {currentInspection.locationData?.latitude 
                ? `${currentInspection.locationData.latitude.toFixed(5)}° N, ${currentInspection.locationData.longitude?.toFixed(5)}° E (±${currentInspection.locationData.accuracy?.toFixed(0)}m)`
                : currentInspection.location || 'Manual Entry'}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Field Inspection
          </span>
        </div>

        {/* Product Details */}
        <div className="space-y-1.5 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            1. Inspected Commodity Details
          </h3>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <span className="text-slate-500">Commodity Name:</span>{' '}
              <strong className="text-slate-900">{currentInspection.productName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Brand:</span>{' '}
              <strong className="text-slate-900">{currentInspection.brand}</strong>
            </div>
            <div>
              <span className="text-slate-500">Declared Net Qty:</span>{' '}
              <strong className="text-slate-900 font-mono">{currentInspection.netQuantity}</strong>
            </div>
            <div>
              <span className="text-slate-500">Declared MRP:</span>{' '}
              <strong className="text-slate-900 font-mono">{currentInspection.mrp}</strong>
            </div>
          </div>
        </div>

        {/* Actual Captured Packaging Evidence Photos */}
        {currentInspection.images.length > 0 && (
          <div className="space-y-1.5 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
              2. Packaging Evidence Photos ({currentInspection.images.length} Attached)
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {primaryImage && (
                <div className="border border-slate-200 rounded p-1.5 text-center space-y-1">
                  <img
                    src={primaryImage.url}
                    alt="Front Packaging Evidence"
                    className="max-h-36 mx-auto object-contain rounded"
                  />
                  <span className="text-[9.5px] font-mono text-slate-600 block">
                    {primaryImage.label || 'Front (PDP)'}
                  </span>
                </div>
              )}
              {backImage && (
                <div className="border border-slate-200 rounded p-1.5 text-center space-y-1">
                  <img
                    src={backImage.url}
                    alt="Back Packaging Evidence"
                    className="max-h-36 mx-auto object-contain rounded"
                  />
                  <span className="text-[9.5px] font-mono text-slate-600 block">
                    {backImage.label || 'Back (Statutory Box)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Declarations Table */}
        <div className="space-y-1.5 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            3. Statutory Declarations Audit (Rule 6)
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-bold text-slate-700">
                <th className="p-1.5">Declaration Field</th>
                <th className="p-1.5">Detected Value</th>
                <th className="p-1.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentInspection.declarations.slice(0, 6).map((decl) => (
                <tr key={decl.id}>
                  <td className="p-1.5 font-semibold text-slate-800">{decl.fieldName}</td>
                  <td className="p-1.5 font-mono text-[11px] text-slate-900">{decl.detectedValue}</td>
                  <td className="p-1.5 text-right font-bold text-[10px]">
                    <span className={
                      decl.status === 'detected' ? 'text-emerald-700' : decl.status === 'review' ? 'text-amber-800' : 'text-red-700'
                    }>
                      {decl.status === 'detected' ? '✓ Detected' : decl.status === 'review' ? '⚠ Review' : '— Not Detected'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance Findings */}
        <div className="space-y-1.5 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            4. Legal Metrology Compliance Findings
          </h3>
          <div className="space-y-1.5 pt-0.5">
            {currentInspection.complianceChecks.filter(c => c.result !== 'COMPLIANT').map((chk) => (
              <div key={chk.checkId} className="p-2 bg-amber-50/70 border border-amber-200 rounded text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{chk.ruleTitle} ({chk.ruleNumber})</span>
                  <span className="text-amber-800 uppercase text-[10px]">{chk.result.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-slate-700 mt-0.5">{chk.explanation}</p>
              </div>
            ))}
            {currentInspection.complianceChecks.filter(c => c.result !== 'COMPLIANT').length === 0 && (
              <p className="p-2 bg-emerald-50 text-emerald-800 rounded font-medium">
                ✓ All inspected declarations conform to Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
            )}
          </div>
        </div>

        {/* Officer Final Decision & Signature */}
        <div className="border-t-2 border-slate-900 pt-3 space-y-3 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Final Officer Order</span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">
                {currentInspection.officerDecision?.decision || currentInspection.status}
              </p>
              {currentInspection.remarks && (
                <p className="text-slate-700 mt-1 italic">
                  &ldquo;{currentInspection.remarks}&rdquo;
                </p>
              )}
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[9px] font-bold text-blue-900 uppercase block">Certified Digitally</span>
              <p className="font-bold text-slate-900">{currentInspection.officerName}</p>
              <p className="text-[10px] text-slate-500">{currentInspection.officerDesignation}</p>
              <span className="text-[9px] font-mono text-slate-400 block">
                REF: {currentInspection.officerDecision?.digitalSignatureRef || 'DSC-VERIFIED'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Return Home Button */}
      <div className="pt-2 text-center print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to InspectIQ Home</span>
        </button>
      </div>

    </div>
  );
};
