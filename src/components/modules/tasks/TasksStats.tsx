import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TasksStatsProps {
  tasks: Task[];
  userRole: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}

const TasksStats: React.FC<TasksStatsProps> = ({ tasks, userRole, currentUser }) => {
  const userTasks = userRole === 'technician' && currentUser 
    ? tasks.filter(task => task.assigned_to === currentUser)
    : tasks;

  const pendingTasks = userTasks.filter(task => task.status === 'pendiente');
  const inProgressTasks = userTasks.filter(task => task.status === 'en_proceso');
  const completedTasks = userTasks.filter(task => task.status === 'completada');
  const overdueTasks = userTasks.filter(task => task.is_overdue && task.status !== 'completada');
  const criticalTasks = userTasks.filter(task => task.is_critical && task.status !== 'completada');
  const highPriorityTasks = userTasks.filter(task => task.priority === 'alta' && task.status !== 'completada');

  const stats = [
    {
      title: 'Total Tareas',
      value: userTasks.length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pendientes',
      value: pendingTasks.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'En Proceso',
      value: inProgressTasks.length,
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completadas',
      value: completedTasks.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Vencidas',
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Críticas',
      value: criticalTasks.length,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2 ${stat.bgColor} rounded-full`}>
                  <IconComponent className={stat.color} size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TasksStats;