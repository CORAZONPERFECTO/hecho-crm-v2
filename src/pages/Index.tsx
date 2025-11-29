import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardGrid from '@/components/DashboardGrid';
import MobileLayout from '@/components/mobile/MobileLayout';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import SalesModule from '@/components/modules/SalesModule';
import IncomeModule from '@/components/modules/IncomeModule';
import CustomersModule from '@/components/modules/CustomersModule';
import InventoryModule from '@/components/modules/InventoryModule';
import TicketsModule from '@/components/modules/TicketsModule';
import UsersModule from '@/components/modules/UsersModule';
import CRMModule from '@/components/modules/CRMModule';
import AccountingModule from '@/components/modules/AccountingModule';
import ProjectsModule from '@/components/modules/ProjectsModule';
import ContactsModule from '@/components/modules/ContactsModule';
import SettingsModule from '@/components/modules/SettingsModule';
import ReportsModule from '@/components/modules/ReportsModule';
import EvidencesModule from '@/components/modules/EvidencesModule';
import TasksModule from '@/components/modules/TasksModule';
import FinancesModule from '@/components/modules/FinancesModule';
import { AIAssistantChat } from '@/components/AIAssistantChat';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobile);
  // Usamos una nueva key 'activeModule_v2' para forzar el reset al dashboard y evitar crashes por módulos antiguos
  const [activeModule, setActiveModule] = useLocalStorage('activeModule_v2', 'dashboard');
  const [userRole] = useLocalStorage<'admin' | 'technician' | 'manager'>('userRole', 'admin');
  const [currentUser] = useState('Juan Pérez');
  const [showAIChat, setShowAIChat] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleModuleSelect = (module: string) => {
    setActiveModule(module);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'crm':
        return <CRMModule />;
      case 'sales':
        return <IncomeModule />;
      case 'income':
        return <IncomeModule />;
      case 'customers':
        return <CustomersModule />;
      case 'contacts':
        return <ContactsModule userRole={userRole} />;
      case 'tasks':
        return <TasksModule userRole={userRole} currentUser={currentUser} />;
      case 'finances':
        return <FinancesModule userRole={userRole} />;
      case 'inventory':
        return <InventoryModule />;
      case 'tickets':
        return <TicketsModule userRole={userRole} currentUser={currentUser} />;
      case 'evidences':
        return <EvidencesModule userRole={userRole} />;
      case 'users':
        return <UsersModule />;
      case 'accounting':
        return <AccountingModule />;
      case 'projects':
        return <ProjectsModule userRole={userRole} currentUser={currentUser} />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return isMobile ?
          <MobileDashboard onModuleSelect={handleModuleSelect} userRole={userRole} /> :
          <DashboardGrid onModuleSelect={handleModuleSelect} userRole={userRole} />;
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <MobileLayout
        activeModule={activeModule}
        onModuleSelect={handleModuleSelect}
        userRole={userRole}
      >
        {renderActiveModule()}
      </MobileLayout>
    );
  }

  // Desktop layout
  return (
    <>
      <div className="min-h-screen bg-background flex w-full">
        {/* Mobile Sidebar Overlay */}
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isSidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            activeModule={activeModule}
            onModuleSelect={handleModuleSelect}
            userRole={userRole}
          />
        </div>

        {/* Main Content */}
        <div className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ease-in-out
          ${!isSidebarCollapsed ? 'lg:ml-0' : ''}
        `}>
          <Header isSidebarOpen={!isSidebarCollapsed} toggleSidebar={toggleSidebar} />

          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto h-full">
              {renderActiveModule()}
            </div>
          </main>
        </div>
      </div>

      {/* AI Assistant Button */}
      {!showAIChat && (
        <Button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-40"
          size="icon"
        >
          <Bot className="w-6 h-6" />
        </Button>
      )}

      {/* AI Assistant Chat */}
      {showAIChat && <AIAssistantChat onClose={() => setShowAIChat(false)} />}
    </>
  );
};

export default Index;
