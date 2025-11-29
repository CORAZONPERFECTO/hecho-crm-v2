
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CRMDashboard from './crm/CRMDashboard';
import OpportunitiesKanban from './crm/OpportunitiesKanban';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CreateOpportunityForm from './crm/CreateOpportunityForm';
import { Opportunity } from './crm/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContacts } from '@/hooks/useContacts';

const CRMModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const { customers } = useContacts();
  
  // Generar oportunidades basadas en los clientes reales
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const clientNames = customers.length > 0 ? customers.map(c => c.name) : ['HECHO SRL', 'Tech Solutions', 'Innovate Corp'];
    return [
      { id: 'opp-1', name: 'Nuevo Sitio Web Corporativo', clientName: clientNames[0] || 'HECHO SRL', stage: 'En negociación', value: 500000, closeDate: '2025-07-30', owner: 'Ana G.' },
      { id: 'opp-2', name: 'Campaña de Marketing Digital Q3', clientName: clientNames[1] || 'Tech Solutions', stage: 'Prospecto', value: 750000, closeDate: '2025-08-15', owner: 'Juan P.' },
      { id: 'opp-3', name: 'Actualización de Servidores', clientName: clientNames[2] || 'Innovate Corp', stage: 'Prospecto', value: 300000, closeDate: '2025-07-25', owner: 'Ana G.' },
      { id: 'opp-4', name: 'Contrato de Soporte Anual', clientName: clientNames[0] || 'HECHO SRL', stage: 'Cerrada ganada', value: 1200000, closeDate: '2025-06-10', owner: 'Luis M.' },
      { id: 'opp-5', name: 'Desarrollo App Móvil', clientName: clientNames[1] || 'Tech Solutions', stage: 'Cerrada perdida', value: 900000, closeDate: '2025-05-20', owner: 'Juan P.' },
    ];
  });

  const handleCreateOpportunity = (newOpportunityData: Omit<Opportunity, 'id'>) => {
    const newOpportunity: Opportunity = {
      ...newOpportunityData,
      id: `opp-${Date.now()}`,
    };
    setOpportunities(prev => [...prev, newOpportunity]);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM - Gestión de Clientes</h1>
          <p className="text-gray-600">Administra leads, oportunidades y relaciones con clientes.</p>
        </div>
        <Button onClick={() => setCreateFormOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shrink-0">
          <PlusCircle size={20} className="mr-2" />
          Nueva Oportunidad
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="dashboard">Panel Principal</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <CRMDashboard opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="opportunities" className="mt-6">
          <OpportunitiesKanban opportunities={opportunities} setOpportunities={setOpportunities} />
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Tareas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">La funcionalidad para crear y gestionar tareas (llamadas, reuniones, etc.) vinculadas a oportunidades y clientes estará disponible próximamente.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reportes del CRM</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Los reportes avanzados, como el embudo de conversión y análisis por responsable, estarán disponibles en una futura actualización.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <CreateOpportunityForm 
        isOpen={isCreateFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onCreate={handleCreateOpportunity}
        customers={customers}
      />
    </div>
  );
};

export default CRMModule;
