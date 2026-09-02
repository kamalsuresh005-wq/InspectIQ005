import React from 'react';
import { useInspection } from './context/InspectionContext';
import { MainHeader } from './components/common/MainHeader';
import { MobileNavBar } from './components/common/MobileNavBar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewInspection } from './pages/NewInspection';
import { InspectionHistory } from './pages/InspectionHistory';
import { RulesRepository } from './pages/RulesRepository';

export const App: React.FC = () => {
  const { isLoggedIn, activeTab } = useInspection();

  if (!isLoggedIn) {
    return <Login />;
  }

  const isWorkflowActive = activeTab === 'new_inspection';

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex justify-center text-slate-900 font-sans antialiased">
      {/* Mobile-First Container (Full width on mobile, sleek phone frame on desktop) */}
      <div className="w-full max-w-md bg-[#F8FAFC] min-h-[100dvh] flex flex-col shadow-lg relative border-x border-slate-200">
        
        {/* Mobile Header with Neutral InspectIQ Branding */}
        <MainHeader />

        {/* Dynamic Screen View */}
        <main className={`flex-1 overflow-y-auto ${isWorkflowActive ? 'pb-4' : 'pb-18'}`}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'new_inspection' && <NewInspection />}
          {activeTab === 'inspections' && <InspectionHistory />}
          {activeTab === 'reports' && <InspectionHistory />}
          {activeTab === 'rules' && <RulesRepository />}
        </main>

        {/* Mobile Bottom Navigation (Visible on main tabs, hidden during active inspection to focus officer) */}
        {!isWorkflowActive && <MobileNavBar />}

      </div>
    </div>
  );
};
