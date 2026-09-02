import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Package, 
  AlertOctagon, 
  FileCheck2, 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings,
  Scale,
  X
} from 'lucide-react';
import { useInspection, NavigationTab } from '../../context/InspectionContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { activeTab, setActiveTab, inspections } = useInspection();

  const violationsCount = inspections.reduce((acc, curr) => acc + curr.violations.length, 0);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_inspection', label: 'New Inspection', icon: PlusCircle },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList, badge: inspections.length },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'violations', label: 'Violations', icon: AlertOctagon, badge: violationsCount, badgeColor: 'bg-red-600 text-white' },
    { id: 'reports', label: 'Reports', icon: FileCheck2 },
    { id: 'rules', label: 'Rules & Amendments', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:sticky top-0 md:top-[61px] bottom-0 left-0 z-50 md:z-30
          w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0
          transition-transform duration-200 ease-in-out h-full md:h-[calc(100vh-61px)] overflow-y-auto
          ${isMobileOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Header */}
        <div className="md:hidden p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <img src="/emblem.svg" alt="Emblem" className="h-6 w-auto" />
            <span className="text-xs font-bold text-slate-800">Legal Metrology Portal</span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-2.5 px-2.5 space-y-0.5">
          <div className="px-2.5 py-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Departmental Navigation
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-[#78350F] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#78350F]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                      item.badgeColor ||
                      (isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Statutory Reference Footer */}
        <div className="p-3 m-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <Scale className="w-3.5 h-3.5 text-[#78350F]" />
            <span className="text-[11px]">Legal Metrology Act, 2009</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Section 18 & PCR 2011 Enforcement Inspection Portal.
          </p>
        </div>
      </aside>
    </>
  );
};
