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
import { Plus, Calendar, AlertTriangle, User, Edit2, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';
import { useClientTasks, ClientTask } from '@/hooks/useClientTasks';
import { useClientVillas } from '@/hooks/useClientVillas';

interface ClientTasksSectionProps {
  clientId: string;
  clientName: string;
}

const ClientTasksSection: React.FC<ClientTasksSectionProps> = ({ clientId, clientName }) => {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, getOverdueTasks, getUrgentTasks } = useClientTasks();
  const { villas, fetchVillas } = useClientVillas();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ClientTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'media' as ClientTask['priority'],
    assigned_to: '',
    associated_type: undefined as ClientTask['associated_type'],
    associated_id: ''
  });

  useEffect(() => {
    fetchTasks(clientId);
    fetchVillas(clientId);
  }, [clientId]);

  const clientTasks = tasks.filter(task => task.client_id === clientId);
  const overdueTasks = getOverdueTasks(clientId);
  const urgentTasks = getUrgentTasks(clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        setEditingTask(null);
      } else {
        await createTask({
          ...formData,
          client_id: clientId,
          status: 'pendiente',
          created_by: 'Current User' // TODO: Get from auth context
        });
        setShowCreateForm(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'media',
      assigned_to: '',
      associated_type: undefined,
      associated_id: ''
    });
  };

  const handleEdit = (task: ClientTask) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      associated_type: task.associated_type || undefined,
      associated_id: task.associated_id || ''
    });
    setEditingTask(task);
  };

  const handleStatusChange = async (taskId: string, newStatus: ClientTask['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'en_proceso':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando tareas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-blue-600">{clientTasks.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Circle className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Tareas Urgentes</p>
                <p className="text-2xl font-bold text-orange-600">{urgentTasks.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="text-orange-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tareas de {clientName}</CardTitle>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Tarea</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select value={formData.priority} onValueChange={(value: ClientTask['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
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
                  </div>
                  <div>
                    <Label htmlFor="assigned_to">Asignado a</Label>
                    <Input
                      id="assigned_to"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="associated_type">Asociar con</Label>
                      <Select value={formData.associated_type || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, associated_type: value as ClientTask['associated_type'] || undefined, associated_id: '' }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Ninguno</SelectItem>
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
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Crear Tarea
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
          {clientTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay tareas registradas para este cliente
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {clientTasks.map((task) => {
                  const isOverdue = task.due_date && task.status !== 'completado' && new Date(task.due_date) < new Date();
                  
                  return (
                    <Card key={task.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <h3 className="font-semibold">{task.title}</h3>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive">
                                  Vencida
                                </Badge>
                              )}
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {task.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  Vence: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                              {task.assigned_to && (
                                <div className="flex items-center gap-1">
                                  <User size={12} />
                                  {task.assigned_to}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Select value={task.status} onValueChange={(value: ClientTask['status']) => handleStatusChange(task.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="en_proceso">En Proceso</SelectItem>
                                <SelectItem value="completado">Completado</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(task)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
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

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_title">Título *</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_description">Descripción</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_due_date">Fecha de Vencimiento</Label>
                <Input
                  id="edit_due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(value: ClientTask['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
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
            </div>
            <div>
              <Label htmlFor="edit_assigned_to">Asignado a</Label>
              <Input
                id="edit_assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                placeholder="Nombre del responsable"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Actualizar Tarea
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
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

export default ClientTasksSection;