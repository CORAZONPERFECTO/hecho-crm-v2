import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'pendiente' | 'en_proceso' | 'completada';
  execution_datetime?: string;
  warning_datetime?: string;
  assigned_to?: string;
  associated_type?: 'villa' | 'quotation' | 'equipment';
  associated_id?: string;
  completed_at?: string;
  completed_by?: string;
  is_overdue: boolean;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TaskFilters {
  client_id?: string;
  status?: 'pendiente' | 'en_proceso' | 'completada';
  priority?: 'baja' | 'media' | 'alta';
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
  is_overdue?: boolean;
  is_critical?: boolean;
}

export interface TaskNotification {
  id: string;
  task_id: string;
  notification_type: 'warning' | 'execution' | 'overdue';
  sent_at: string;
  recipient_email: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async (filters?: TaskFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.is_overdue) {
        query = query.eq('is_overdue', filters.is_overdue);
      }
      if (filters?.is_critical) {
        query = query.eq('is_critical', filters.is_critical);
      }
      if (filters?.start_date && filters?.end_date) {
        query = query.gte('execution_datetime', filters.start_date)
                  .lte('execution_datetime', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'is_overdue' | 'is_critical'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data as Task, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Tarea creada correctamente"
      });

      // Schedule notifications if warning_datetime is set
      if (data.warning_datetime && data.assigned_to) {
        await scheduleTaskNotification(data.id, 'warning', data);
      }

      // Schedule execution notification if execution_datetime is set
      if (data.execution_datetime && data.assigned_to) {
        await scheduleTaskNotification(data.id, 'execution', data);
      }

      return data as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? (data as Task) : task
      ));

      toast({
        title: "Éxito",
        description: "Tarea actualizada correctamente"
      });

      return data as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive"
      });
      throw error;
    }
  };

  const markTaskCompleted = async (taskId: string, completedBy: string) => {
    try {
      await updateTask(taskId, {
        status: 'completada',
        completed_at: new Date().toISOString(),
        completed_by: completedBy,
        is_overdue: false,
        is_critical: false
      });
    } catch (error) {
      console.error('Error marking task as completed:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast({
        title: "Éxito",
        description: "Tarea eliminada"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  };

  const scheduleTaskNotification = async (taskId: string, type: 'warning' | 'execution' | 'overdue', taskData: any) => {
    try {
      // Get user email for the assigned person
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('name', taskData.assigned_to)
        .single();

      if (!profileData?.email) {
        console.warn('No email found for assigned user:', taskData.assigned_to);
        return;
      }

      // Call the edge function to send notification
      const { error } = await supabase.functions.invoke('send-task-notifications', {
        body: {
          taskId,
          notificationType: type,
          recipientEmail: profileData.email,
          taskData: {
            title: taskData.title,
            description: taskData.description,
            clientId: taskData.client_id,
            executionDateTime: taskData.execution_datetime,
            warningDateTime: taskData.warning_datetime,
            priority: taskData.priority
          }
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const fetchNotifications = async (taskId?: string) => {
    try {
      let query = supabase
        .from('task_notifications')
        .select('*')
        .order('sent_at', { ascending: false });

      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications((data || []) as TaskNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => task.is_overdue && task.status !== 'completada');
  };

  const getCriticalTasks = () => {
    return tasks.filter(task => task.is_critical && task.status !== 'completada');
  };

  const getPendingTasks = () => {
    return tasks.filter(task => task.status === 'pendiente');
  };

  const getInProgressTasks = () => {
    return tasks.filter(task => task.status === 'en_proceso');
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.status === 'completada');
  };

  const getTasksByPriority = (priority: 'baja' | 'media' | 'alta') => {
    return tasks.filter(task => task.priority === priority);
  };

  const getTasksForUser = (userName: string) => {
    return tasks.filter(task => task.assigned_to === userName);
  };

  return {
    tasks,
    notifications,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    markTaskCompleted,
    deleteTask,
    scheduleTaskNotification,
    fetchNotifications,
    getOverdueTasks,
    getCriticalTasks,
    getPendingTasks,
    getInProgressTasks,
    getCompletedTasks,
    getTasksByPriority,
    getTasksForUser
  };
};