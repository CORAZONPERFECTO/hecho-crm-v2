import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketTechnician {
  id: string;
  name: string;
  role: 'technician' | 'manager' | 'supervisor';
  status: 'active' | 'inactive';
  email?: string;
  phone?: string;
}

export const useTicketTechnicians = () => {
  const [technicians, setTechnicians] = useState<TicketTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, status, email, phone')
        .in('role', ['technician', 'manager', 'supervisor'])
        .order('name');

      if (error) throw error;
      
      const formattedTechnicians = (data || []).map(user => ({
        id: user.id,
        name: user.name,
        role: user.role as 'technician' | 'manager' | 'supervisor',
        status: user.status as 'active' | 'inactive',
        email: user.email,
        phone: user.phone
      }));

      setTechnicians(formattedTechnicians);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los técnicos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveTechnicians = () => {
    return technicians.filter(tech => tech.status === 'active');
  };

  const getActiveManagers = () => {
    return technicians.filter(tech => 
      tech.status === 'active' && (tech.role === 'manager' || tech.role === 'supervisor')
    );
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  return {
    technicians,
    loading,
    getActiveTechnicians,
    getActiveManagers,
    refetch: fetchTechnicians
  };
};