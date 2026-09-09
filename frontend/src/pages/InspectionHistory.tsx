import React, { useState } from 'react';
import { Search, ChevronRight, FileText, Plus, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const InspectionHistory: React.FC = () => {
  const { inspections, viewExistingInspection, startNewInspection, setActiveTab } = useInspection();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filtered = inspections.filter((insp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      insp.inspectionNumber.toLowerCase().includes(term) ||
      (insp.productName && insp.productName.toLowerCase().includes(term)) ||
      (insp.brand && insp.brand.toLowerCase().includes(term)) ||
      (insp.premisesName && insp.premisesName.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' || 
      (insp.status && insp.status.toLowerCase().replace(/\s+/g, '_') === statusFilter) ||
      (insp.finalDecision && insp.finalDecision.toLowerCase().replace(/\s+/g, '_') === statusFilter);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#12304A]">Inspection History</h1>
            <p className="text-xs text-[#52616F] mt-0.5">Official Records Archive ({filtered.length})</p>
          </div>

          <button
            type="button"
            onClick={() => startNewInspection('physical')}
            className="bg-[#12304A] hover:bg-[#0B2239] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#52616F] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, product, brand, premises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#D9E1E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-[#12304A] font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
              className="px-2.5 py-2 bg-white border border-[#D9E1E8] rounded-lg text-xs font-semibold text-[#52616F] flex items-center gap-1 cursor-pointer"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="text-[10px]">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'compliant', label: 'Compliant' },
              { id: 'potential_non-compliance', label: 'Non-Compliance' },
              { id: 'requires_further_review', label: 'Review Required' }
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border cursor-pointer ${
                  statusFilter === chip.id
                    ? 'bg-[#12304A] text-white border-[#12304A]'
                    : 'bg-white text-[#52616F] border-[#D9E1E8] hover:bg-[#F4F7FA]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inspections Archive List */}
        <div className="space-y-2 max-h-[calc(100dvh-280px)] overflow-y-auto pr-0.5">
          {filtered.length > 0 ? (
            filtered.map((insp) => {
              const findingsCount = insp.complianceChecks?.length || 0;
              const photosCount = insp.images?.length || 0;
              const decisionLabel = insp.finalDecision || insp.status;

              return (
                <div
                  key={insp.id}
                  onClick={() => viewExistingInspection(insp.id, 'inspection_details')}
                  className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 hover:border-[#0F766E] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[#0F766E] font-bold">
                        {insp.inspectionNumber}
                      </span>
                      <span className="text-[10px] text-[#52616F]">·</span>
                      <span className="text-[10px] text-[#52616F]">
                        {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#12304A] truncate">
                      {insp.productName || 'Unidentified Commodity'}
                    </h3>

                    <p className="text-[11px] text-[#52616F] truncate">
                      {insp.brand ? `${insp.brand} · ` : ''}{insp.premisesName || 'Retail store'}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5 text-[10px] text-[#52616F]">
                      <span>{findingsCount} finding(s)</span>
                      <span>•</span>
                      <span>{photosCount} photo(s)</span>
                      <span>•</span>
                      <span>Officer: {insp.officerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      decisionLabel === 'Appears Compliant' || decisionLabel === 'Compliant'
                        ? 'bg-emerald-50 text-emerald-800'
                        : decisionLabel === 'Potential Non-Compliance'
                        ? 'bg-red-50 text-red-900'
                        : 'bg-amber-50 text-amber-900'
                    }`}>
                      {decisionLabel}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#52616F]" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-dashed border-[#D9E1E8] rounded-xl p-8 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#52616F] mx-auto opacity-40" />
              <p className="text-xs font-bold text-[#12304A]">No inspections recorded yet.</p>
              <p className="text-[11px] text-[#52616F]">
                Start a new inspection to begin recording statutory packaged commodity evaluations.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
