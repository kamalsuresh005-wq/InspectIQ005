import React from 'react';
import { Home, ClipboardList, FileText, BookOpen } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useInspection();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 shadow-md py-1.5 px-4 safe-bottom"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Home */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Inspections */}
        <button
          type="button"
          onClick={() => setActiveTab('inspections')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'inspections' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Inspections</span>
        </button>

        {/* Reports */}
        <button
          type="button"
          onClick={() => setActiveTab('inspections')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'reports' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Reports</span>
        </button>

        {/* Rules Codex */}
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'rules' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">PCR Rules</span>
        </button>

      </div>
    </nav>
  );
};
