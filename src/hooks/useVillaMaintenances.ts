import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VillaMaintenance {
  id: string;
  villa_id: string;
  next_maintenance_date: string;
  service_type: string;
  observation?: string;
  status: 'programado' | 'completado' | 'vencido';
  completed_date?: string;
  completed_by?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface MaintenanceHistory {
  id: string;
  villa_id: string;
  maintenance_date: string;
  service_type: string;
  performed_by: string;
  observation?: string;
  ticket_id?: string;
  created_at: string;
}

export const useVillaMaintenances = () => {
  const [maintenances, setMaintenances] = useState<VillaMaintenance[]>([]);
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMaintenances = async (villaId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('villa_maintenances')
        .select('*')
        .order('next_maintenance_date', { ascending: true });

      if (villaId) {
        query = query.eq('villa_id', villaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMaintenances((data || []) as VillaMaintenance[]);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mantenimientos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (villaId?: string) => {
    try {
      let query = supabase
        .from('villa_maintenance_history')
        .select('*')
        .order('maintenance_date', { ascending: false });

      if (villaId) {
        query = query.eq('villa_id', villaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de mantenimientos",
        variant: "destructive"
      });
    }
  };

  const createMaintenance = async (maintenanceData: Omit<VillaMaintenance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('villa_maintenances')
        .insert([maintenanceData])
        .select()
        .single();

      if (error) throw error;

      setMaintenances(prev => [data as VillaMaintenance, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Mantenimiento programado correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error creating maintenance:', error);
      toast({
        title: "Error",
        description: "No se pudo programar el mantenimiento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const completeMaintenance = async (maintenanceId: string, completedBy: string, observation?: string) => {
    try {
      const maintenance = maintenances.find(m => m.id === maintenanceId);
      if (!maintenance) throw new Error('Mantenimiento no encontrado');

      // Actualizar el mantenimiento como completado
      const { data: updatedMaintenance, error: updateError } = await supabase
        .from('villa_maintenances')
        .update({
          status: 'completado',
          completed_date: new Date().toISOString().split('T')[0],
          completed_by: completedBy,
          observation: observation || maintenance.observation
        })
        .eq('id', maintenanceId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Agregar al historial
      const { error: historyError } = await supabase
        .from('villa_maintenance_history')
        .insert([{
          villa_id: maintenance.villa_id,
          maintenance_date: new Date().toISOString().split('T')[0],
          service_type: maintenance.service_type,
          performed_by: completedBy,
          observation: observation || maintenance.observation
        }]);

      if (historyError) throw historyError;

      setMaintenances(prev => prev.map(m => 
        m.id === maintenanceId ? (updatedMaintenance as VillaMaintenance) : m
      ));

      toast({
        title: "Éxito",
        description: "Mantenimiento completado y registrado en el historial"
      });

      return updatedMaintenance;
    } catch (error) {
      console.error('Error completing maintenance:', error);
      toast({
        title: "Error",
        description: "No se pudo completar el mantenimiento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getOverdueMaintenances = (villaId?: string) => {
    const filtered = villaId ? maintenances.filter(m => m.villa_id === villaId) : maintenances;
    return filtered.filter(maintenance => 
      maintenance.status === 'programado' &&
      new Date(maintenance.next_maintenance_date) < new Date()
    );
  };

  const getUpcomingMaintenances = (villaId?: string, days: number = 30) => {
    const filtered = villaId ? maintenances.filter(m => m.villa_id === villaId) : maintenances;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return filtered.filter(maintenance => 
      maintenance.status === 'programado' &&
      new Date(maintenance.next_maintenance_date) <= futureDate &&
      new Date(maintenance.next_maintenance_date) >= new Date()
    );
  };

  return {
    maintenances,
    history,
    loading,
    fetchMaintenances,
    fetchHistory,
    createMaintenance,
    completeMaintenance,
    getOverdueMaintenances,
    getUpcomingMaintenances
  };
};