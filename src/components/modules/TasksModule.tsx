import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, Clock, AlertTriangle, CheckCircle, User, Calendar, Eye, Circle } from 'lucide-react';
import { useTasks, Task, TaskFilters } from '@/hooks/useTasks';
import TasksHeader from './tasks/TasksHeader';
import TasksFilters from './tasks/TasksFilters';
import TasksList from './tasks/TasksList';
import CreateTaskForm from './tasks/CreateTaskForm';
import TaskDetail from './tasks/TaskDetail';
import TasksStats from './tasks/TasksStats';
import TasksAlerts from './tasks/TasksAlerts';

interface TasksModuleProps {
  userRole: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}

const TasksModule: React.FC<TasksModuleProps> = ({ userRole, currentUser }) => {
  const {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    markTaskCompleted,
    deleteTask,
    getOverdueTasks,
    getCriticalTasks,
    getPendingTasks,
    getInProgressTasks,
    getCompletedTasks
  } = useTasks();

  const [activeView, setActiveView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Apply user role filters automatically
    const roleFilters: TaskFilters = {};
    
    if (userRole === 'technician' && currentUser) {
      roleFilters.assigned_to = currentUser;
    }
    
    setFilters(roleFilters);
    fetchTasks(roleFilters);
  }, [userRole, currentUser]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask({
        ...taskData,
        created_by: currentUser || 'Sistema'
      });
      setActiveView('list');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await markTaskCompleted(taskId, currentUser || 'Sistema');
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setActiveView('detail');
  };

  const handleApplyFilters = (newFilters: TaskFilters) => {
    const combinedFilters = { ...filters, ...newFilters };
    setFilters(combinedFilters);
    fetchTasks(combinedFilters);
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'pending':
        return getPendingTasks();
      case 'in_progress':
        return getInProgressTasks();
      case 'completed':
        return getCompletedTasks();
      case 'overdue':
        return getOverdueTasks();
      case 'critical':
        return getCriticalTasks();
      default:
        return tasks;
    }
  };

  const canCreateTasks = userRole === 'admin' || userRole === 'manager';
  const canEditAllTasks = userRole === 'admin' || userRole === 'manager';
  
  const overdueTasks = getOverdueTasks();
  const criticalTasks = getCriticalTasks();
  const hasAlerts = overdueTasks.length > 0 || criticalTasks.length > 0;

  if (activeView === 'create') {
    return (
      <CreateTaskForm
        onClose={() => setActiveView('list')}
        onSave={handleCreateTask}
        userRole={userRole}
      />
    );
  }

  if (activeView === 'detail' && selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        onClose={() => {
          setActiveView('list');
          setSelectedTask(null);
        }}
        onUpdate={handleUpdateTask}
        onComplete={handleCompleteTask}
        onDelete={deleteTask}
        userRole={userRole}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <TasksHeader
        canCreate={canCreateTasks}
        onCreateTask={() => setActiveView('create')}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Alerts */}
      {hasAlerts && (
        <TasksAlerts
          overdueTasks={overdueTasks}
          criticalTasks={criticalTasks}
          onViewTask={handleViewTask}
        />
      )}

      {/* Stats */}
      <TasksStats
        tasks={tasks}
        userRole={userRole}
        currentUser={currentUser}
      />

      {/* Filters */}
      {showFilters && (
        <TasksFilters
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
          userRole={userRole}
        />
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Lista de Tareas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                Todas ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Circle size={14} />
                Pendientes ({getPendingTasks().length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <Clock size={14} />
                En Proceso ({getInProgressTasks().length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle size={14} />
                Completadas ({getCompletedTasks().length})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex items-center gap-2">
                <AlertTriangle size={14} />
                Vencidas ({overdueTasks.length})
              </TabsTrigger>
              <TabsTrigger value="critical" className="flex items-center gap-2">
                <AlertTriangle size={14} />
                Críticas ({criticalTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <TasksList
                tasks={getFilteredTasks()}
                loading={loading}
                onViewTask={handleViewTask}
                onUpdateTask={handleUpdateTask}
                onCompleteTask={handleCompleteTask}
                onDeleteTask={deleteTask}
                userRole={userRole}
                currentUser={currentUser}
                canEdit={canEditAllTasks}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksModule;