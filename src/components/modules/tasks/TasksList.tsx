import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Edit2, Trash2, Clock, Calendar, User, AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
  onViewTask: (task: Task) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  userRole: 'admin' | 'technician' | 'manager';
  currentUser?: string;
  canEdit: boolean;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  loading,
  onViewTask,
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
  userRole,
  currentUser,
  canEdit
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completada':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'en_proceso':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
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

  const canUserEdit = (task: Task) => {
    if (canEdit) return true;
    if (userRole === 'technician' && task.assigned_to === currentUser) {
      // Check if task is within 2 hours of execution
      if (task.execution_datetime) {
        const executionTime = new Date(task.execution_datetime);
        const now = new Date();
        const hoursUntilExecution = (executionTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilExecution > 2;
      }
      return true;
    }
    return false;
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (newStatus === 'completada') {
      onCompleteTask(taskId);
    } else {
      onUpdateTask(taskId, { status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando tareas...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
        <p className="text-gray-600">No se encontraron tareas con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {tasks.map((task) => {
          const isOverdue = task.is_overdue;
          const isCritical = task.is_critical;
          const canEditTask = canUserEdit(task);
          
          return (
            <Card key={task.id} className={`
              ${isOverdue ? 'border-red-200 bg-red-50' : ''}
              ${isCritical && !isOverdue ? 'border-orange-200 bg-orange-50' : ''}
            `}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-semibold text-lg">{task.title}</h3>
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

                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-gray-600">Cliente: {task.client_id}</span>
                      </div>
                      
                      {task.assigned_to && (
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-gray-600">Asignado: {task.assigned_to}</span>
                        </div>
                      )}

                      {task.execution_datetime && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600">Ejecución: {formatDateTime(task.execution_datetime)}</span>
                        </div>
                      )}

                      {task.warning_datetime && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-gray-600">Preaviso: {formatDateTime(task.warning_datetime)}</span>
                        </div>
                      )}
                    </div>

                    {task.associated_type && task.associated_id && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Relacionado con {task.associated_type}: {task.associated_id}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Status selector for editable tasks */}
                    {canEditTask && task.status !== 'completada' && (
                      <Select 
                        value={task.status} 
                        onValueChange={(value: Task['status']) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="completada">Completar</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {/* Action buttons */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewTask(task)}
                    >
                      <Eye size={14} className="mr-1" />
                      Ver
                    </Button>

                    {canEditTask && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewTask(task)} // Will open detail view for editing
                        >
                          <Edit2 size={14} />
                        </Button>
                        
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default TasksList;