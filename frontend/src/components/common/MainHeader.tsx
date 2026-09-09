import React, { useState } from 'react';
import { LogOut, ChevronDown, Shield } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

interface MainHeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = () => {
  const { currentUser, logout, setActiveTab } = useInspection();
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-[#D9E1E8] sticky top-0 z-40 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#12304A] text-white font-black text-xs flex items-center justify-center shadow-xs">
            IQ
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-[#12304A] block leading-none">
              Inspect<span className="text-[#0F766E]">IQ</span>
            </span>
            <span className="text-[9.5px] text-[#52616F] font-medium leading-none block mt-0.5">
              Packaged Commodity Inspection
            </span>
          </div>
        </button>

        {/* Officer Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#F4F7FA] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-[#12304A] text-white font-bold text-[10px] flex items-center justify-center">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LM'}
            </div>
            <span className="text-xs font-semibold text-[#17212B] hidden sm:inline">{currentUser.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#52616F]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-card-md border border-[#D9E1E8] p-2 z-50 text-xs">
              <div className="p-2 border-b border-[#D9E1E8]">
                <span className="font-bold text-[#17212B] block">{currentUser.name}</span>
                <span className="text-[10px] text-[#52616F] block">{currentUser.designation}</span>
                <span className="text-[10px] text-[#0F766E] font-mono block mt-0.5">{currentUser.id}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left p-2 text-[#B91C1C] font-semibold hover:bg-red-50 rounded-lg mt-1 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
