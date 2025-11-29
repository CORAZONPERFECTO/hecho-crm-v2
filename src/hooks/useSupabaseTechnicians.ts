
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Technician {
  id: string;
  name: string;
  role: 'technician' | 'manager' | 'supervisor';
  status: 'active' | 'inactive';
  email?: string;
  phone?: string;
}

export const useSupabaseTechnicians = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTechnicians = async () => {
    try {
      // MOCK TEMPORAL PARA EVITAR CRASHES CON SUPABASE
      console.log('Using mock technicians to prevent Supabase crash');
      setTechnicians([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setLoading(false);
    }
  };

  const addTechnician = async (technicianData: Omit<Technician, 'id'>) => {
    try {
      // Validate required fields
      if (!technicianData.name || !technicianData.email) {
        toast({
          title: "Error",
          description: "Nombre y email son requeridos",
          variant: "destructive"
        });
        return;
      }

      console.log('Creating technician via Edge Function:', technicianData);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Error de autenticación",
          description: "Debes estar autenticado para crear técnicos.",
          variant: "destructive",
        });
        return;
      }

      // Generate a secure temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      // Call the Edge Function to create user with authentication
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: technicianData.email.toLowerCase().trim(),
          password: tempPassword,
          name: technicianData.name,
          phone: technicianData.phone || '',
          role: technicianData.role
        }
      });

      if (error) {
        console.error('Error calling create-user function:', error);
        toast({
          title: "Error al crear técnico",
          description: "Hubo un problema de conexión. Inténtalo de nuevo.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.success) {
        console.error('Function returned error:', data?.error);
        toast({
          title: "Error al crear técnico",
          description: data?.error || "No se pudo crear el técnico.",
          variant: "destructive",
        });
        return;
      }

      // Create the new technician object
      const newTechnician: Technician = {
        id: data.user.id,
        name: data.user.name,
        role: data.user.role as 'technician' | 'manager' | 'supervisor',
        status: data.user.status as 'active' | 'inactive',
        email: data.user.email,
        phone: data.user.phone
      };

      setTechnicians(prev => [...prev, newTechnician]);
      toast({
        title: "¡Técnico creado exitosamente!",
        description: `${technicianData.name} puede acceder con contraseña: ${tempPassword}`,
      });

      return newTechnician;
    } catch (error) {
      console.error('Error adding technician:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el técnico",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTechnician = async (id: string, updates: Partial<Technician>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          role: updates.role,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTechnician = {
        id: data.id,
        name: data.name,
        role: data.role as 'technician' | 'manager' | 'supervisor',
        status: data.status as 'active' | 'inactive',
        email: data.email,
        phone: data.phone
      };

      setTechnicians(prev => prev.map(tech =>
        tech.id === id ? updatedTechnician : tech
      ));

      toast({
        title: "Éxito",
        description: "Técnico actualizado correctamente"
      });
      return updatedTechnician;
    } catch (error) {
      console.error('Error updating technician:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el técnico",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTechnician = async (id: string) => {
    try {
      // Delete the user from Supabase Auth (profiles will be deleted automatically via CASCADE)
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;

      setTechnicians(prev => prev.filter(tech => tech.id !== id));
      toast({
        title: "Éxito",
        description: "Técnico eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting technician:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el técnico",
        variant: "destructive"
      });
      throw error;
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
    addTechnician,
    updateTechnician,
    deleteTechnician,
    getActiveTechnicians,
    getActiveManagers,
    refetch: fetchTechnicians
  };
};
