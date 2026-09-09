import React from 'react';
import { useInspection } from './context/InspectionContext';
import { MainHeader } from './components/common/MainHeader';
import { MobileNavBar } from './components/common/MobileNavBar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewInspection } from './pages/NewInspection';
import { InspectionHistory } from './pages/InspectionHistory';
import { RulesRepository } from './pages/RulesRepository';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const { isLoggedIn, activeTab } = useInspection();

  if (!isLoggedIn) {
    return <Login />;
  }

  const isWorkflowActive = activeTab === 'new_inspection';

  return (
    <div className="min-h-[100dvh] bg-[#F4F7FA] flex justify-center text-[#17212B] font-sans antialiased">
      {/* Mobile-First Container (Full width on mobile, sleek phone frame on desktop) */}
      <div className="w-full max-w-md bg-white min-h-[100dvh] flex flex-col shadow-card relative border-x border-[#D9E1E8]">
        
        {/* Mobile Header with Neutral InspectIQ Branding */}
        <MainHeader />

        {/* Dynamic Screen View */}
        <main className={`flex-1 overflow-y-auto ${isWorkflowActive ? 'pb-4' : 'pb-18'}`}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'new_inspection' && <NewInspection />}
          {activeTab === 'inspections' && <InspectionHistory />}
          {activeTab === 'reports' && <InspectionHistory />}
          {activeTab === 'rules' && <RulesRepository />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* Mobile Bottom Navigation (Visible on main tabs, hidden during active inspection to focus officer) */}
        {!isWorkflowActive && <MobileNavBar />}

      </div>
    </div>
  );
};
