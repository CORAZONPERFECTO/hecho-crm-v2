import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, AlertTriangle, Edit2, Trash2, Mail } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import { useClientVillas } from '@/hooks/useClientVillas';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  userRole: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onClose,
  onUpdate,
  onComplete,
  onDelete,
  userRole,
  currentUser
}) => {
  const { villas, fetchVillas } = useClientVillas();
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    execution_datetime: task.execution_datetime || '',
    warning_datetime: task.warning_datetime || '',
    assigned_to: task.assigned_to || '',
    associated_type: task.associated_type,
    associated_id: task.associated_id || ''
  });

  useEffect(() => {
    fetchUsers();
    fetchVillas(task.client_id);
    fetchNotifications();
  }, [task.id]);

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

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('task_notifications')
        .select('*')
        .eq('task_id', task.id)
        .order('sent_at', { ascending: false });
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSave = () => {
    onUpdate(task.id, formData);
    setIsEditing(false);
  };

  const handleComplete = () => {
    onComplete(task.id);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return 'No especificada';
    return new Date(dateTime).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      case 'en_proceso':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Proceso</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pendiente</Badge>;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'execution':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = userRole === 'admin' || userRole === 'manager' || 
    (userRole === 'technician' && task.assigned_to === currentUser);

  const canDelete = userRole === 'admin' || userRole === 'manager';

  const isOverdue = task.is_overdue;
  const isCritical = task.is_critical;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {getStatusBadge(task.status)}
              {isOverdue && (
                <Badge variant="destructive">
                  <AlertTriangle size={12} className="mr-1" />
                  Vencida
                </Badge>
              )}
              {isCritical && !isOverdue && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  <AlertTriangle size={12} className="mr-1" />
                  Crítica
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.status !== 'completada' && canEdit && (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle size={16} className="mr-2" />
              Marcar Completada
            </Button>
          )}
          
          {canEdit && (
            <Button 
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={16} className="mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          )}
          
          {canDelete && (
            <Button 
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="timing">Programación</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones ({notifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                      <Label htmlFor="status">Estado</Label>
                      <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="assigned_to">Asignado a</Label>
                    <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.email} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      Guardar Cambios
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                    <p className="text-gray-900">{task.description || 'Sin descripción'}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Cliente</Label>
                    <p className="text-gray-900">{task.client_id}</p>
                  </div>

                  {task.assigned_to && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Asignado a</Label>
                      <p className="text-gray-900">{task.assigned_to}</p>
                    </div>
                  )}

                  {task.associated_type && task.associated_id && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Relacionado con</Label>
                      <p className="text-gray-900 capitalize">{task.associated_type}: {task.associated_id}</p>
                    </div>
                  )}

                  {task.completed_at && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Completada</Label>
                      <p className="text-gray-900">
                        {formatDateTime(task.completed_at)}
                        {task.completed_by && ` por ${task.completed_by}`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programación y Tiempos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="execution_datetime" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Fecha y Hora de Ejecución
                    </Label>
                    <Input
                      id="execution_datetime"
                      type="datetime-local"
                      value={formData.execution_datetime}
                      onChange={(e) => setFormData(prev => ({ ...prev, execution_datetime: e.target.value }))}
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
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock size={16} />
                      Fecha de Preaviso
                    </Label>
                    <p className="text-gray-900">{formatDateTime(task.warning_datetime)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar size={16} />
                      Fecha de Ejecución
                    </Label>
                    <p className="text-gray-900">{formatDateTime(task.execution_datetime)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Creada</Label>
                    <p className="text-gray-900">{formatDateTime(task.created_at)} por {task.created_by}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Última Actualización</Label>
                    <p className="text-gray-900">{formatDateTime(task.updated_at)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                Historial de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No se han enviado notificaciones para esta tarea
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getNotificationTypeColor(notification.notification_type)}>
                            {notification.notification_type}
                          </Badge>
                          <span className="font-medium">{notification.recipient_email}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Enviado: {formatDateTime(notification.sent_at)}
                        </p>
                        {notification.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {notification.error_message}
                          </p>
                        )}
                      </div>
                      <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                        {notification.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskDetail;