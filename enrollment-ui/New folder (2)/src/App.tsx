import React, { useState } from 'react';
import { WebSocketProvider } from './context/WebSocketContext';
import { RoleProvider } from './context/RoleContext';
import { Header } from './components/common/Header';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { InwardManagementView } from './components/inward/InwardManagementView';
import { PolicyProcessorView } from './components/processor/PolicyProcessorView';
import { QCApprovalView } from './components/qc/QCApprovalView';
import { MemberProcessingHub } from './components/member/MemberProcessingHub';
import { ReconciliationView } from './components/reconciliation/ReconciliationView';
import { ECardCenterView } from './components/ecard/ECardCenterView';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Brand & Role Header */}
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-12">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'inward' && <InwardManagementView onNavigate={setActiveTab} />}
          {activeTab === 'processor' && <PolicyProcessorView onNavigate={setActiveTab} />}
          {activeTab === 'qc' && <QCApprovalView onNavigate={setActiveTab} />}
          {activeTab === 'member' && <MemberProcessingHub />}
          {activeTab === 'reconciliation' && <ReconciliationView />}
          {activeTab === 'ecard' && <ECardCenterView />}
        </main>
      </div>

      {/* Real-time WebSocket Toasts */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RoleProvider>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </RoleProvider>
  );
};

export default App;
