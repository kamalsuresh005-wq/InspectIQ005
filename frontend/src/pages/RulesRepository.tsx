import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight, X, Scale } from 'lucide-react';
import { LEGAL_RULES_DATABASE, SCHEDULE_TABLE_FONT_SIZES } from '../data/legalRules';
import { LegalRule } from '../types';

export const RulesRepository: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingRule, setViewingRule] = useState<LegalRule | null>(null);

  const filteredRules = LEGAL_RULES_DATABASE.filter((r) => {
    return (
      r.ruleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requirement.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">PCR 2011 Rules</h1>
            <p className="text-xs text-slate-500 mt-0.5">Statutory legal codex for packaged commodities</p>
          </div>
          <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            2026 Edition
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search rule number, keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900 shadow-2xs font-medium"
          />
        </div>

        {/* Compact Rules List */}
        <div className="space-y-2 max-h-[calc(100dvh-250px)] overflow-y-auto pr-0.5">
          {filteredRules.map((rule) => (
            <div
              key={rule.ruleId}
              onClick={() => setViewingRule(rule)}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 hover:border-blue-800 transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-blue-900 block">
                  {rule.ruleNumber}
                </span>
                <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {rule.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {rule.requirement}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Rule Detail Bottom Sheet */}
      {viewingRule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 block">{viewingRule.ruleNumber}</span>
                <h3 className="text-sm font-bold text-slate-900">{viewingRule.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRule(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Requirement:</span>
                <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">{viewingRule.requirement}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Applies When:</span>
                <p className="text-slate-700 mt-0.5">{viewingRule.appliesWhen}</p>
              </div>

              {viewingRule.penaltyText && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-[10px] font-bold text-red-800 uppercase block">Statutory Penalty:</span>
                  <p className="text-red-900 mt-0.5 text-[11px] font-medium">{viewingRule.penaltyText}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setViewingRule(null)}
              className="w-full bg-blue-900 text-white font-bold text-xs py-2.5 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
