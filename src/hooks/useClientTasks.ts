import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientTask {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'pendiente' | 'en_proceso' | 'completado';
  assigned_to?: string;
  associated_type?: 'quotation' | 'villa' | 'equipment';
  associated_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useClientTasks = () => {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async (clientId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('client_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks((data || []) as ClientTask[]);
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

  const createTask = async (taskData: Omit<ClientTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('client_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data as ClientTask, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Tarea creada correctamente"
      });

      return data;
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

  const updateTask = async (taskId: string, updates: Partial<ClientTask>) => {
    try {
      const { data, error } = await supabase
        .from('client_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? (data as ClientTask) : task
      ));

      toast({
        title: "Éxito",
        description: "Tarea actualizada correctamente"
      });

      return data;
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

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('client_tasks')
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

  const getOverdueTasks = (clientId?: string) => {
    const filtered = clientId ? tasks.filter(t => t.client_id === clientId) : tasks;
    return filtered.filter(task => 
      task.due_date && 
      task.status !== 'completado' &&
      new Date(task.due_date) < new Date()
    );
  };

  const getUrgentTasks = (clientId?: string) => {
    const filtered = clientId ? tasks.filter(t => t.client_id === clientId) : tasks;
    return filtered.filter(task => 
      task.priority === 'alta' && 
      task.status !== 'completado'
    );
  };

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getOverdueTasks,
    getUrgentTasks
  };
};