import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Clock, User, Building2 } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import { useClientVillas } from '@/hooks/useClientVillas';

interface CreateTaskFormProps {
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'is_overdue' | 'is_critical'>) => void;
  userRole: 'admin' | 'technician' | 'manager';
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onClose,
  onSave,
  userRole
}) => {
  const { villas, fetchVillas } = useClientVillas();
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    priority: 'media' as Task['priority'],
    status: 'pendiente' as Task['status'],
    execution_datetime: '',
    warning_datetime: '',
    assigned_to: '',
    associated_type: undefined as Task['associated_type'],
    associated_id: '',
    completed_at: undefined,
    completed_by: undefined,
    created_by: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      fetchVillas(formData.client_id);
    }
  }, [formData.client_id]);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('status', 'active');
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchClients = async () => {
    // Mock clients data - in real implementation, fetch from contacts/clients table
    setClients([
      { id: '1', name: 'Cliente A' },
      { id: '2', name: 'Cliente B' },
      { id: '3', name: 'Cliente C' }
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.client_id || !formData.title) {
      alert('Por favor complete los campos obligatorios: Cliente y Título');
      return;
    }

    // Validate warning time is before execution time
    if (formData.warning_datetime && formData.execution_datetime) {
      const warningTime = new Date(formData.warning_datetime);
      const executionTime = new Date(formData.execution_datetime);
      
      if (warningTime >= executionTime) {
        alert('La fecha de preaviso debe ser anterior a la fecha de ejecución');
        return;
      }
    }

    onSave(formData);
  };

  const calculateWarningTime = (executionDateTime: string, hoursBefore: number = 24) => {
    if (!executionDateTime) return '';
    
    const executionTime = new Date(executionDateTime);
    const warningTime = new Date(executionTime.getTime() - (hoursBefore * 60 * 60 * 1000));
    
    return warningTime.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const handleExecutionDateTimeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      execution_datetime: value,
      warning_datetime: value ? calculateWarningTime(value) : ''
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Nueva Tarea</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Tarea</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div>
              <Label htmlFor="client_id">Cliente *</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value, associated_id: '', associated_type: undefined }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title and Description */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la tarea"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Descripción detallada de la tarea"
                />
              </div>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_to">Asignado a</Label>
                <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value === 'unassigned' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.email} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Execution and Warning DateTime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="execution_datetime" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Fecha y Hora de Ejecución
                </Label>
                <Input
                  id="execution_datetime"
                  type="datetime-local"
                  value={formData.execution_datetime}
                  onChange={(e) => handleExecutionDateTimeChange(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="warning_datetime" className="flex items-center gap-2">
                  <Clock size={16} />
                  Fecha y Hora de Preaviso
                </Label>
                <Input
                  id="warning_datetime"
                  type="datetime-local"
                  value={formData.warning_datetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, warning_datetime: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se calcula automáticamente 24h antes de la ejecución, pero puedes modificarla
                </p>
              </div>
            </div>

            {/* Association with Villa/Quotation/Equipment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="associated_type">Relacionar con</Label>
                <Select 
                  value={formData.associated_type || 'none'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    associated_type: value === 'none' ? undefined : value as Task['associated_type'], 
                    associated_id: '' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="quotation">Cotización</SelectItem>
                    <SelectItem value="equipment">Equipo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.associated_type === 'villa' && (
                <div>
                  <Label htmlFor="associated_id">Villa</Label>
                  <Select value={formData.associated_id} onValueChange={(value) => setFormData(prev => ({ ...prev, associated_id: value }))}>
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
              )}

              {formData.associated_type === 'quotation' && (
                <div>
                  <Label htmlFor="associated_id">ID de Cotización</Label>
                  <Input
                    id="associated_id"
                    value={formData.associated_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, associated_id: e.target.value }))}
                    placeholder="Número de cotización"
                  />
                </div>
              )}

              {formData.associated_type === 'equipment' && (
                <div>
                  <Label htmlFor="associated_id">ID de Equipo</Label>
                  <Input
                    id="associated_id"
                    value={formData.associated_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, associated_id: e.target.value }))}
                    placeholder="ID del equipo"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Crear Tarea
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTaskForm;