import React, { useState } from 'react';
import { ShieldCheck, User, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

interface MainHeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = () => {
  const { currentUser, logout, setActiveTab } = useInspection();
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        
        {/* Brand */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
            IQ
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-blue-950 block leading-none">
              InspectIQ
            </span>
            <span className="text-[9px] text-slate-500 font-medium leading-none">
              Legal Metrology Field Tool
            </span>
          </div>
        </button>

        {/* Right Officer Pill & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-200 text-blue-900 font-bold text-[10px] flex items-center justify-center">
              RS
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">{currentUser.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 block">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500">{currentUser.designation}</span>
                <span className="text-[10px] text-blue-900 font-mono block mt-0.5">{currentUser.badgeNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left p-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg mt-1 flex items-center gap-1.5"
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
