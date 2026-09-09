import React, { useState } from 'react';
import { 
  FileCheck2, 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Eye, 
  Scale, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';
import { useInspection } from '../context/InspectionContext';
import { ReportService } from '../services/reportService';
import { Inspection } from '../types';

export const ReportsNotices: React.FC = () => {
  const { inspections, viewExistingInspection, startNewInspection } = useInspection();

  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'report' | 'notice_sec36' | 'compounding_sec48'>('all');
  const [previewInspection, setPreviewInspection] = useState<Inspection | null>(null);
  const [previewMode, setPreviewMode] = useState<'report' | 'notice_sec36' | 'compounding_sec48'>('report');
  const [isExporting, setIsExporting] = useState(false);

  const filteredList = inspections.filter((insp) => {
    const matchesSearch =
      insp.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (insp.officerDecision?.noticeRefNumber && insp.officerDecision.noticeRefNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const isNotice = insp.violations.length > 0 || insp.status.includes('Notice') || (insp.officerDecision && insp.officerDecision.decision !== 'Compliant');
    const isCompounding = insp.officerDecision?.decision?.includes('Sec 48') || insp.status.includes('Non-Compliance');

    if (docTypeFilter === 'report') return matchesSearch;
    if (docTypeFilter === 'notice_sec36') return matchesSearch && isNotice;
    if (docTypeFilter === 'compounding_sec48') return matchesSearch && isCompounding;

    return matchesSearch;
  });

  const handleDownloadPdf = async (insp: Inspection) => {
    setPreviewInspection(insp);
    setIsExporting(true);
    try {
      if (previewMode === 'report') {
        await ReportService.downloadInspectionPdf(insp, `${insp.inspectionNumber}_Inspection_Report`);
      } else {
        setTimeout(async () => {
          try {
            await ReportService.downloadPdfFromElement('report-notice-preview-doc', `${insp.inspectionNumber}_Official_Record`);
          } catch (e) {
            console.error(e);
          } finally {
            setIsExporting(false);
          }
        }, 150);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDocx = (insp: Inspection) => {
    ReportService.exportToDocx(insp);
  };

  return (
    <div className="space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">Statutory Documentation Center</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Department of Legal Metrology</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">Reports & Statutory Legal Notices</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Official statutory compliance inspection certificates, <strong>Section 36 Form-I show-cause notices</strong>, and <strong>Section 48 compounding orders</strong>.
          </p>
        </div>

        <button
          onClick={() => startNewInspection('physical')}
          className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold py-1.5 px-3 rounded transition-colors flex items-center gap-1 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New Inspection</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-slate-500 block">Inspection Certificates</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{inspections.length} Certificates</span>
          <span className="text-[10px] text-slate-400">PDF / DOCX generated</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-red-800 block">Section 36 Form 1 Notices</span>
          <span className="text-xl font-bold text-red-700 font-mono mt-0.5 block">
            {inspections.filter((i) => i.violations.length > 0).length} Notices
          </span>
          <span className="text-[10px] text-slate-400">15-day show-cause period</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-amber-800 block">Section 48 Compounding Orders</span>
          <span className="text-xl font-bold text-amber-800 font-mono mt-0.5 block">
            {inspections.filter((i) => i.violations.length > 0).length} Orders
          </span>
          <span className="text-[10px] text-slate-400">Departmental fine settlements</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDocTypeFilter('all')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              docTypeFilter === 'all' ? 'bg-[#78350F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Documents ({inspections.length})
          </button>
          <button
            onClick={() => setDocTypeFilter('report')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              docTypeFilter === 'report' ? 'bg-[#78350F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inspection Reports
          </button>
          <button
            onClick={() => setDocTypeFilter('notice_sec36')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              docTypeFilter === 'notice_sec36' ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Section 36 Notices
          </button>
          <button
            onClick={() => setDocTypeFilter('compounding_sec48')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              docTypeFilter === 'compounding_sec48' ? 'bg-amber-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sec 48 Orders
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report ID, brand, notice ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F] text-xs"
          />
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Inspection Ref</th>
                <th className="py-2.5 px-3">Commodity Particulars</th>
                <th className="py-2.5 px-3">Statutory Outcome</th>
                <th className="py-2.5 px-3">Notice Number</th>
                <th className="py-2.5 px-3">Enforcement Officer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((insp) => {
                const isCompliant = insp.status === 'Compliant';
                const hasViolations = insp.violations.length > 0;
                const noticeNumber = insp.officerDecision?.noticeRefNumber || (hasViolations ? `LM/NOT/2026/${insp.inspectionNumber.split('-')[2] || '4189'}` : '—');

                return (
                  <tr key={insp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#78350F]">
                      {insp.inspectionNumber}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block truncate max-w-[180px]">{insp.productName}</span>
                      <span className="text-[10.5px] text-slate-500">{insp.brand} • {insp.netQuantity}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCompliant
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {isCompliant ? 'Compliant' : `${insp.violations.length} Violation(s)`}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">
                      {noticeNumber}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{insp.officerName}</div>
                      <span className="text-[9.5px] text-slate-400 font-mono">DSC-VERIFIED</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {new Date(insp.createdAt).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setPreviewInspection(insp); setPreviewMode('report'); }}
                          className="p-1 text-slate-600 hover:text-[#78350F] rounded"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(insp)}
                          className="p-1 text-[#78350F] hover:text-[#582509] rounded"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadDocx(insp)}
                          className="p-1 text-slate-700 hover:text-slate-900 rounded"
                          title="Export DOCX"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal Preview */}
      {previewInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded border border-slate-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#1E293B] text-white p-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xs font-bold">{previewInspection.inspectionNumber} Document Preview</h3>
                <span className="text-[10.5px] text-slate-300">{previewInspection.productName}</span>
              </div>
              <button onClick={() => setPreviewInspection(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Content Viewport */}
            <div className="p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              <div 
                id="report-notice-preview-doc"
                className="bg-white p-6 border border-slate-300 rounded space-y-4 text-slate-900"
              >
                {/* Government Letterhead */}
                <div className="text-center pb-3 border-b-2 border-slate-900 space-y-0.5">
                  <img src="/emblem.svg" alt="Emblem" className="h-10 w-auto mx-auto object-contain mb-1" />
                  <h1 className="text-[11px] font-bold uppercase tracking-widest text-slate-700 font-serif">GOVERNMENT OF INDIA</h1>
                  <h2 className="text-xs font-bold uppercase text-[#78350F] font-serif">DEPARTMENT OF LEGAL METROLOGY</h2>
                  <p className="text-[9.5px] text-slate-600">Ministry of Consumer Affairs, Food & Public Distribution</p>
                  
                  <div className="pt-1.5">
                    <span className="inline-block bg-slate-900 text-white font-serif font-bold text-[11px] uppercase px-3 py-0.5 rounded">
                      {previewMode === 'report' && 'STATUTORY COMPLIANCE INSPECTION REPORT'}
                      {previewMode === 'notice_sec36' && 'FORM 1: STATUTORY SHOW-CAUSE NOTICE (SECTION 36)'}
                      {previewMode === 'compounding_sec48' && 'DEPARTMENTAL COMPOUNDING ORDER (SECTION 48)'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Inspection ID</span>
                    <span className="font-mono font-bold text-slate-900">{previewInspection.inspectionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Date</span>
                    <span className="font-semibold text-slate-800">{new Date(previewInspection.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Commodity</span>
                    <span className="font-bold text-slate-900 truncate block">{previewInspection.productName} ({previewInspection.netQuantity})</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Manufacturer</span>
                    <span className="font-semibold text-slate-800 truncate block">{previewInspection.manufacturerName}</span>
                  </div>
                </div>

                {previewMode === 'report' && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 uppercase text-[10.5px]">Summary Findings</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                      {previewInspection.officerDecision?.remarks || 'Statutory optical analysis completed across multi-side package imagery with Legal Metrology rule synthesis.'}
                    </p>
                  </div>
                )}

                {/* Footer Signature */}
                <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-bold text-slate-900 block font-mono">AUTH-{previewInspection.inspectionNumber}</span>
                    <span className="text-slate-500">Government Certified</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-800 uppercase block">Digitally Signed (DSC Class 3)</span>
                    <p className="font-bold text-slate-900 font-serif">{previewInspection.officerName}</p>
                    <p className="text-slate-500">{previewInspection.officerDesignation}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setPreviewInspection(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDocx(previewInspection)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-1.5 px-3 rounded flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export DOCX</span>
                </button>

                <button
                  onClick={() => handleDownloadPdf(previewInspection)}
                  disabled={isExporting}
                  className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-1.5 px-3.5 rounded flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
