import React, { useState } from 'react';
import { Search, ChevronRight, FileText, Download, Plus, ArrowLeft } from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const InspectionHistory: React.FC = () => {
  const { inspections, viewExistingInspection, startNewInspection, setActiveTab } = useInspection();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = inspections.filter((insp) => {
    const matchesSearch = 
      insp.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || insp.status.toLowerCase().replace(/\s+/g, '_') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inspections</h1>
            <p className="text-xs text-slate-500 mt-0.5">Records archive ({filtered.length} items)</p>
          </div>

          <button
            type="button"
            onClick={() => startNewInspection('physical')}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Compact Search & Filter */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, product, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900 shadow-2xs font-medium"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'compliant', 'potential_non-compliance', 'under_review'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap capitalize border ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Cards List */}
        <div className="space-y-2 max-h-[calc(100dvh-280px)] overflow-y-auto pr-0.5">
          {filtered.length > 0 ? (
            filtered.map((insp) => (
              <div
                key={insp.id}
                onClick={() => viewExistingInspection(insp.id, 'report')}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 hover:border-blue-800 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {insp.inspectionNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {insp.productName}
                  </h3>

                  <p className="text-[11px] text-slate-500 truncate">
                    {insp.brand} · {insp.netQuantity}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    insp.status === 'Compliant'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-amber-50 text-amber-900'
                  }`}>
                    {insp.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
              No inspections match your search.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
