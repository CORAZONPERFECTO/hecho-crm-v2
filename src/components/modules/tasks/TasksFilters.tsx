import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { TaskFilters } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';

interface TasksFiltersProps {
  onApplyFilters: (filters: TaskFilters) => void;
  currentFilters: TaskFilters;
  userRole: 'admin' | 'technician' | 'manager';
}

const TasksFilters: React.FC<TasksFiltersProps> = ({
  onApplyFilters,
  currentFilters,
  userRole
}) => {
  const [filters, setFilters] = useState<TaskFilters>(currentFilters);
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

  const fetchClients = async () => {
    // For now, using a mock list since we don't have a clients table structure defined
    // In a real implementation, this would fetch from the clients/contacts table
    setClients([
      { id: '1', name: 'Cliente A' },
      { id: '2', name: 'Cliente B' },
      { id: '3', name: 'Cliente C' }
    ]);
  };

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

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: TaskFilters = {};
    if (userRole === 'technician') {
      clearedFilters.assigned_to = currentFilters.assigned_to;
    }
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search size={18} />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Client Filter */}
          <div>
            <Label htmlFor="client_filter">Cliente</Label>
            <Select value={filters.client_id || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, client_id: value || undefined }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los clientes</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status_filter">Estado</Label>
            <Select value={filters.status || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any || undefined }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <Label htmlFor="priority_filter">Prioridad</Label>
            <Select value={filters.priority || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as any || undefined }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter (only for admins and managers) */}
          {(userRole === 'admin' || userRole === 'manager') && (
            <div>
              <Label htmlFor="assigned_filter">Asignado a</Label>
              <Select value={filters.assigned_to || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, assigned_to: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los usuarios</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.email} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range Filters */}
          <div>
            <Label htmlFor="start_date">Fecha de Inicio</Label>
            <Input
              id="start_date"
              type="datetime-local"
              value={filters.start_date || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value || undefined }))}
            />
          </div>

          <div>
            <Label htmlFor="end_date">Fecha de Fin</Label>
            <Input
              id="end_date"
              type="datetime-local"
              value={filters.end_date || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value || undefined }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleApplyFilters} className="flex-1">
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            <X size={16} className="mr-2" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksFilters;