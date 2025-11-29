import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Wrench, AlertTriangle, CheckCircle, Clock, History } from 'lucide-react';
import { useVillaMaintenances, VillaMaintenance } from '@/hooks/useVillaMaintenances';
import { useClientVillas } from '@/hooks/useClientVillas';

interface ClientMaintenanceSectionProps {
  clientId: string;
  clientName: string;
}

const ClientMaintenanceSection: React.FC<ClientMaintenanceSectionProps> = ({ clientId, clientName }) => {
  const { 
    maintenances, 
    history, 
    loading, 
    fetchMaintenances, 
    fetchHistory, 
    createMaintenance, 
    completeMaintenance,
    getOverdueMaintenances,
    getUpcomingMaintenances
  } = useVillaMaintenances();
  const { villas, fetchVillas } = useClientVillas();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [completingMaintenance, setCompletingMaintenance] = useState<VillaMaintenance | null>(null);
  const [formData, setFormData] = useState({
    villa_id: '',
    next_maintenance_date: '',
    service_type: '',
    observation: ''
  });
  const [completionData, setCompletionData] = useState({
    completed_by: '',
    observation: ''
  });

  useEffect(() => {
    fetchVillas(clientId);
    fetchMaintenances();
    fetchHistory();
  }, [clientId]);

  // Filter maintenances for client's villas
  const clientVillaIds = villas.map(v => v.id);
  const clientMaintenances = maintenances.filter(m => clientVillaIds.includes(m.villa_id));
  const clientHistory = history.filter(h => clientVillaIds.includes(h.villa_id));
  
  const overdueMaintenances = getOverdueMaintenances().filter(m => clientVillaIds.includes(m.villa_id));
  const upcomingMaintenances = getUpcomingMaintenances().filter(m => clientVillaIds.includes(m.villa_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMaintenance({
        ...formData,
        status: 'programado',
        created_by: 'Current User' // TODO: Get from auth context
      });
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating maintenance:', error);
    }
  };

  const handleCompleteMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMaintenance) return;

    try {
      await completeMaintenance(
        completingMaintenance.id,
        completionData.completed_by,
        completionData.observation
      );
      setCompletingMaintenance(null);
      setCompletionData({ completed_by: '', observation: '' });
    } catch (error) {
      console.error('Error completing maintenance:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      villa_id: '',
      next_maintenance_date: '',
      service_type: '',
      observation: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'programado':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programado</Badge>;
      case 'completado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>;
      case 'vencido':
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVillaName = (villaId: string) => {
    const villa = villas.find(v => v.id === villaId);
    return villa ? `${villa.villa_name} ${villa.villa_code ? `(${villa.villa_code})` : ''}` : 'Villa no encontrada';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando mantenimientos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mantenimientos Programados</p>
                <p className="text-2xl font-bold text-blue-600">{clientMaintenances.filter(m => m.status === 'programado').length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{overdueMaintenances.length}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos (30 días)</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingMaintenances.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="text-orange-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="programmed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programmed" className="flex items-center gap-2">
            <Wrench size={16} />
            Programados
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programmed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Mantenimientos Programados</CardTitle>
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2" disabled={villas.length === 0}>
                      <Plus size={16} />
                      Programar Mantenimiento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Programar Nuevo Mantenimiento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="villa_id">Villa *</Label>
                        <Select value={formData.villa_id} onValueChange={(value) => setFormData(prev => ({ ...prev, villa_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar villa" />
                          </SelectTrigger>
                          <SelectContent>
                            {villas.map((villa) => (
                              <SelectItem key={villa.id} value={villa.id}>
                                {villa.villa_name} {villa.villa_code && `(${villa.villa_code})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="next_maintenance_date">Fecha de Mantenimiento *</Label>
                        <Input
                          id="next_maintenance_date"
                          type="date"
                          value={formData.next_maintenance_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_maintenance_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="service_type">Tipo de Servicio *</Label>
                        <Select value={formData.service_type} onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
                            <SelectItem value="Limpieza de Filtros">Limpieza de Filtros</SelectItem>
                            <SelectItem value="Revisión General">Revisión General</SelectItem>
                            <SelectItem value="Cambio de Refrigerante">Cambio de Refrigerante</SelectItem>
                            <SelectItem value="Inspección Eléctrica">Inspección Eléctrica</SelectItem>
                            <SelectItem value="Otros">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="observation">Observaciones</Label>
                        <Textarea
                          id="observation"
                          value={formData.observation}
                          onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                          rows={3}
                          placeholder="Detalles específicos del mantenimiento..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Programar Mantenimiento
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {villas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Este cliente no tiene villas registradas. Agregue una villa primero para programar mantenimientos.
                </div>
              ) : clientMaintenances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay mantenimientos programados para este cliente
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {clientMaintenances.map((maintenance) => {
                      const isOverdue = maintenance.status === 'programado' && new Date(maintenance.next_maintenance_date) < new Date();
                      
                      return (
                        <Card key={maintenance.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{maintenance.service_type}</h3>
                                  {getStatusBadge(maintenance.status)}
                                  {isOverdue && (
                                    <Badge variant="destructive">
                                      Vencido
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                  Villa: {getVillaName(maintenance.villa_id)}
                                </p>
                                
                                {maintenance.observation && (
                                  <p className="text-sm text-gray-600 mb-2">{maintenance.observation}</p>
                                )}
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    Programado: {new Date(maintenance.next_maintenance_date).toLocaleDateString()}
                                  </div>
                                  {maintenance.completed_date && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle size={12} />
                                      Completado: {new Date(maintenance.completed_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {maintenance.status === 'programado' && (
                                <Button
                                  size="sm"
                                  onClick={() => setCompletingMaintenance(maintenance)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Completar
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {clientHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay historial de mantenimientos para este cliente
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {clientHistory.map((record) => (
                      <Card key={record.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <h3 className="font-semibold">{record.service_type}</h3>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                Villa: {getVillaName(record.villa_id)}
                              </p>
                              
                              {record.observation && (
                                <p className="text-sm text-gray-600 mb-2">{record.observation}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  Realizado: {new Date(record.maintenance_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wrench size={12} />
                                  Por: {record.performed_by}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Maintenance Dialog */}
      <Dialog open={!!completingMaintenance} onOpenChange={(open) => !open && setCompletingMaintenance(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Mantenimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompleteMaintenance} className="space-y-4">
            <div>
              <Label htmlFor="completed_by">Realizado por *</Label>
              <Input
                id="completed_by"
                value={completionData.completed_by}
                onChange={(e) => setCompletionData(prev => ({ ...prev, completed_by: e.target.value }))}
                required
                placeholder="Nombre del técnico"
              />
            </div>
            <div>
              <Label htmlFor="completion_observation">Observaciones del trabajo realizado</Label>
              <Textarea
                id="completion_observation"
                value={completionData.observation}
                onChange={(e) => setCompletionData(prev => ({ ...prev, observation: e.target.value }))}
                rows={3}
                placeholder="Detalles del trabajo realizado, piezas cambiadas, etc."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Marcar como Completado
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCompletingMaintenance(null);
                  setCompletionData({ completed_by: '', observation: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientMaintenanceSection;