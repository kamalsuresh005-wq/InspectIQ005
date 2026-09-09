import React from 'react';
import { Home, ClipboardList, BookOpen, Settings } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useInspection();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 bg-white border-t border-[#D9E1E8] z-50 shadow-card py-1.5 px-4 safe-bottom"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Home */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-[#12304A] font-bold' : 'text-[#52616F] hover:text-[#17212B]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Inspections */}
        <button
          type="button"
          onClick={() => setActiveTab('inspections')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'inspections' ? 'text-[#12304A] font-bold' : 'text-[#52616F] hover:text-[#17212B]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Inspections</span>
        </button>

        {/* Rules Codex */}
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'rules' ? 'text-[#12304A] font-bold' : 'text-[#52616F] hover:text-[#17212B]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Rules</span>
        </button>

        {/* Settings / Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'text-[#12304A] font-bold' : 'text-[#52616F] hover:text-[#17212B]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>

      </div>
    </nav>
  );
};
