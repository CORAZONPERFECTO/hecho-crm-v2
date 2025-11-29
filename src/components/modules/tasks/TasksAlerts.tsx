import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Eye } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TasksAlertsProps {
  overdueTasks: Task[];
  criticalTasks: Task[];
  onViewTask: (task: Task) => void;
}

const TasksAlerts: React.FC<TasksAlertsProps> = ({
  overdueTasks,
  criticalTasks,
  onViewTask
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

  return (
    <div className="space-y-4">
      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle size={20} />
              Tareas Vencidas ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-red-900">{task.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-red-700">
                      <span>Cliente: {task.client_id}</span>
                      {task.assigned_to && <span className="ml-4">Asignado a: {task.assigned_to}</span>}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Debía ejecutarse: {formatDateTime(task.execution_datetime)}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewTask(task)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Button>
                </div>
              ))}
              {overdueTasks.length > 5 && (
                <p className="text-sm text-red-600 text-center">
                  Y {overdueTasks.length - 5} tareas vencidas más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Tasks Alert */}
      {criticalTasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock size={20} />
              Tareas Críticas - Próximas a Vencer ({criticalTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-orange-900">{task.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-orange-700">
                      <span>Cliente: {task.client_id}</span>
                      {task.assigned_to && <span className="ml-4">Asignado a: {task.assigned_to}</span>}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Debe ejecutarse: {formatDateTime(task.execution_datetime)}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewTask(task)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Button>
                </div>
              ))}
              {criticalTasks.length > 5 && (
                <p className="text-sm text-orange-600 text-center">
                  Y {criticalTasks.length - 5} tareas críticas más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksAlerts;