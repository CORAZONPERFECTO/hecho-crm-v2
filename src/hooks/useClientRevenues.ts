import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientRevenue {
  id: string;
  client_name: string;
  client_id?: string;
  revenue_date: string;
  invoiced_amount: number;
  associated_service?: string;
  payment_method: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  observations?: string;
  ticket_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ClientRevenueFilters {
  client_name?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
}

export const useClientRevenues = () => {
  const [revenues, setRevenues] = useState<ClientRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRevenues = async (filters?: ClientRevenueFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('client_revenues')
        .select('*')
        .order('revenue_date', { ascending: false });

      // Aplicar filtros
      if (filters?.client_name) {
        query = query.ilike('client_name', `%${filters.client_name}%`);
      }
      if (filters?.date_from) {
        query = query.gte('revenue_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('revenue_date', filters.date_to);
      }
      if (filters?.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRevenues((data || []) as ClientRevenue[]);
    } catch (error) {
      console.error('Error fetching client revenues:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los ingresos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRevenue = async (revenueData: Omit<ClientRevenue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('client_revenues')
        .insert([revenueData])
        .select()
        .single();

      if (error) throw error;

      setRevenues(prev => [data as ClientRevenue, ...prev]);
      toast({
        title: "Éxito",
        description: "Ingreso agregado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error creating revenue:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el ingreso",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateRevenue = async (id: string, updates: Partial<ClientRevenue>) => {
    try {
      const { data, error } = await supabase
        .from('client_revenues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRevenues(prev => prev.map(revenue => 
        revenue.id === id ? { ...revenue, ...data as ClientRevenue } : revenue
      ));
      toast({
        title: "Éxito",
        description: "Ingreso actualizado correctamente"
      });
      return data;
    } catch (error) {
      console.error('Error updating revenue:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el ingreso",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRevenue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRevenues(prev => prev.filter(revenue => revenue.id !== id));
      toast({
        title: "Éxito",
        description: "Ingreso eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting revenue:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Obtener lista de clientes únicos
  const getUniqueClients = () => {
    const clients = revenues.map(revenue => revenue.client_name);
    return [...new Set(clients)].sort();
  };

  // Calcular total por período
  const getTotalRevenue = (filters?: ClientRevenueFilters) => {
    let filteredRevenues = revenues;

    if (filters?.client_name) {
      filteredRevenues = filteredRevenues.filter(revenue => 
        revenue.client_name.toLowerCase().includes(filters.client_name!.toLowerCase())
      );
    }
    if (filters?.date_from) {
      filteredRevenues = filteredRevenues.filter(revenue => 
        revenue.revenue_date >= filters.date_from!
      );
    }
    if (filters?.date_to) {
      filteredRevenues = filteredRevenues.filter(revenue => 
        revenue.revenue_date <= filters.date_to!
      );
    }
    if (filters?.payment_method) {
      filteredRevenues = filteredRevenues.filter(revenue => 
        revenue.payment_method === filters.payment_method
      );
    }

    return filteredRevenues.reduce((total, revenue) => total + Number(revenue.invoiced_amount), 0);
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  return {
    revenues,
    loading,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    fetchRevenues,
    getUniqueClients,
    getTotalRevenue
  };
};