import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Building2, ListTodo, Wrench, AlertTriangle } from 'lucide-react';
import { Contact } from '../contacts/types';
import VillasSection from './VillasSection';
import ClientTasksSection from './ClientTasksSection';
import ClientMaintenanceSection from './ClientMaintenanceSection';
import { useClientTasks } from '@/hooks/useClientTasks';
import { useVillaMaintenances } from '@/hooks/useVillaMaintenances';

interface ClientDetailProps {
  client: Contact;
  onClose: () => void;
  userRole: 'admin' | 'technician' | 'manager';
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onClose, userRole }) => {
  const [activeTab, setActiveTab] = useState('info');
  const { tasks, fetchTasks, getOverdueTasks, getUrgentTasks } = useClientTasks();
  const { maintenances, fetchMaintenances, getOverdueMaintenances, getUpcomingMaintenances } = useVillaMaintenances();

  useEffect(() => {
    fetchTasks(client.id);
    fetchMaintenances();
  }, [client.id]);

  const overdueTasks = getOverdueTasks(client.id);
  const urgentTasks = getUrgentTasks(client.id);
  const overdueMaintenances = getOverdueMaintenances();
  const upcomingMaintenances = getUpcomingMaintenances();

  const hasAlerts = overdueTasks.length > 0 || urgentTasks.length > 0 || overdueMaintenances.length > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activo</Badge>;
      case 'inactivo':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'cliente':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Cliente</Badge>;
      case 'proveedor':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Proveedor</Badge>;
      case 'ambos':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Cliente/Proveedor</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getTypeBadge(client.type)}
              {getStatusBadge(client.status)}
              {hasAlerts && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Alertas
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {hasAlerts && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle size={20} />
              Alertas y Recordatorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.map(task => (
                <div key={task.id} className="text-sm text-red-700">
                  • Tarea vencida: {task.title} (vencía el {new Date(task.due_date!).toLocaleDateString()})
                </div>
              ))}
              {urgentTasks.map(task => (
                <div key={task.id} className="text-sm text-orange-700">
                  • Tarea urgente: {task.title}
                </div>
              ))}
              {overdueMaintenances.map(maintenance => (
                <div key={maintenance.id} className="text-sm text-red-700">
                  • Mantenimiento vencido: {maintenance.service_type} (programado para {new Date(maintenance.next_maintenance_date).toLocaleDateString()})
                </div>
              ))}
              {upcomingMaintenances.map(maintenance => (
                <div key={maintenance.id} className="text-sm text-yellow-700">
                  • Mantenimiento próximo: {maintenance.service_type} (programado para {new Date(maintenance.next_maintenance_date).toLocaleDateString()})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User size={16} />
            Información
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo size={16} />
            Tareas ({tasks.filter(t => t.client_id === client.id).length})
          </TabsTrigger>
          <TabsTrigger value="villas" className="flex items-center gap-2">
            <Building2 size={16} />
            Villas y Equipos
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench size={16} />
            Mantenimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{client.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono Principal</label>
                  <p className="text-gray-900">{client.phone1}</p>
                </div>
                {client.phone2 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono Secundario</label>
                    <p className="text-gray-900">{client.phone2}</p>
                  </div>
                )}
                {client.mobile && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Móvil</label>
                    <p className="text-gray-900">{client.mobile}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de Identificación */}
            <Card>
              <CardHeader>
                <CardTitle>Identificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Identificación</label>
                  <p className="text-gray-900 capitalize">{client.identificationType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Identificación</label>
                  <p className="text-gray-900">{client.identificationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-gray-900">{client.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ubicación</label>
                  <p className="text-gray-900">{client.municipality}, {client.province}, {client.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Información Comercial */}
            <Card>
              <CardHeader>
                <CardTitle>Información Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lista de Precios</label>
                  <p className="text-gray-900">{client.priceList}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Términos de Pago</label>
                  <p className="text-gray-900">{client.paymentTerms}</p>
                </div>
                {client.assignedSalesperson && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendedor Asignado</label>
                    <p className="text-gray-900">{client.assignedSalesperson}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle>Información Financiera</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Límite de Crédito</label>
                  <p className="text-gray-900">${client.creditLimit.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cuentas por Cobrar</label>
                  <p className="text-gray-900">${client.accountsReceivable.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cuentas por Pagar</label>
                  <p className="text-gray-900">${client.accountsPayable.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas Internas */}
          {client.internalNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas Internas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{client.internalNotes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <ClientTasksSection clientId={client.id} clientName={client.name} />
        </TabsContent>

        <TabsContent value="villas">
          <VillasSection clientId={client.id} clientName={client.name} />
        </TabsContent>

        <TabsContent value="maintenance">
          <ClientMaintenanceSection clientId={client.id} clientName={client.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;