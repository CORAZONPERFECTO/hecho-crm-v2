
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import UsersModule from '@/components/modules/UsersModule';
import CompanySettings from './settings/CompanySettings';
import FinancialSettings from './settings/FinancialSettings';
import CustomLists from './settings/CustomLists';
import AutomationsSettings from './settings/AutomationsSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import IntegrationsSettings from './settings/IntegrationsSettings';
import RolesSettings from './settings/RolesSettings';
import DocumentSettings from './settings/DocumentSettings';
import TechniciansSettings from './settings/TechniciansSettings';
import TechnicalResourcesSettings from './settings/TechnicalResourcesSettings';
import TechnicalStepsSettings from './settings/TechnicalStepsSettings';
import { 
  Users, 
  HardHat, 
  Shield, 
  Building, 
  FileText, 
  DollarSign, 
  List, 
  Zap, 
  Palette, 
  Link,
  Database,
  Workflow
} from 'lucide-react';

const SettingsModule: React.FC = () => {
  const isMobile = useIsMobile();

  const settingsTabs = [
    { value: "users", label: "Usuarios", icon: Users },
    { value: "technicians", label: "Técnicos", icon: HardHat },
    { value: "roles", label: "Roles", icon: Shield },
    { value: "company", label: "Empresa", icon: Building },
    { value: "documents", label: "Documentos", icon: FileText },
    { value: "financial", label: "Financiero", icon: DollarSign },
    { value: "lists", label: "Listas", icon: List },
    { value: "technical", label: "Base de Datos Técnica", icon: Database },
    { value: "steps", label: "Categorías y Pasos", icon: Workflow },
    { value: "automations", label: "Automatización", icon: Zap },
    { value: "appearance", label: "Apariencia", icon: Palette },
    { value: "integrations", label: "Integraciones", icon: Link }
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gestiona los parámetros fundamentales del sistema.
          </p>
        </div>
        
        <Tabs defaultValue="users" className="w-full" orientation={isMobile ? "vertical" : "horizontal"}>
          {isMobile ? (
            <div className="flex flex-col space-y-4">
              <ScrollArea className="w-full">
                <TabsList className="flex flex-col h-auto w-full space-y-2 bg-white p-2 rounded-lg shadow-sm">
                  {settingsTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="w-full justify-start gap-3 px-4 py-3 text-left data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
                      >
                        <IconComponent size={18} />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </ScrollArea>
              
              <div className="flex-1">
                {settingsTabs.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="mt-0">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      {tab.value === "users" && <UsersModule />}
                      {tab.value === "technicians" && <TechniciansSettings />}
                      {tab.value === "roles" && <RolesSettings />}
                      {tab.value === "company" && <CompanySettings />}
                      {tab.value === "documents" && <DocumentSettings />}
                      {tab.value === "financial" && <FinancialSettings />}
                      {tab.value === "lists" && <CustomLists />}
                      {tab.value === "technical" && <TechnicalResourcesSettings />}
                      {tab.value === "steps" && <TechnicalStepsSettings />}
                      {tab.value === "automations" && <AutomationsSettings />}
                      {tab.value === "appearance" && <AppearanceSettings />}
                      {tab.value === "integrations" && <IntegrationsSettings />}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12 mb-4 bg-white shadow-sm">
                  {settingsTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                      >
                        <IconComponent size={16} className="hidden sm:block" />
                        <span className="truncate">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </ScrollArea>
              
              {settingsTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                  {tab.value === "users" && <UsersModule />}
                  {tab.value === "technicians" && <TechniciansSettings />}
                  {tab.value === "roles" && <RolesSettings />}
                  {tab.value === "company" && <CompanySettings />}
                  {tab.value === "documents" && <DocumentSettings />}
                  {tab.value === "financial" && <FinancialSettings />}
                  {tab.value === "lists" && <CustomLists />}
                  {tab.value === "technical" && <TechnicalResourcesSettings />}
                  {tab.value === "steps" && <TechnicalStepsSettings />}
                  {tab.value === "automations" && <AutomationsSettings />}
                  {tab.value === "appearance" && <AppearanceSettings />}
                  {tab.value === "integrations" && <IntegrationsSettings />}
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsModule;
