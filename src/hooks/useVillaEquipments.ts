import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VillaEquipment {
  id: string;
  villa_id: string;
  equipment_name: string;
  brand?: string;
  model?: string;
  capacity?: string;
  status: 'activo' | 'inactivo' | 'en_mantenimiento' | 'dañado';
  photo_url?: string;
  observations?: string;
  installation_date?: string;
  warranty_expiry?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface EquipmentTicket {
  id: string;
  equipment_id: string;
  ticket_id: string;
  relationship_type: 'instalacion' | 'reparacion' | 'mantenimiento' | 'verificacion';
  created_at: string;
}

export const useVillaEquipments = () => {
  const [equipments, setEquipments] = useState<VillaEquipment[]>([]);
  const [equipmentTickets, setEquipmentTickets] = useState<EquipmentTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchEquipments = async (villaId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('villa_equipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (villaId) {
        query = query.eq('villa_id', villaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEquipments((data || []) as VillaEquipment[]);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEquipment = async (equipmentData: Omit<VillaEquipment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('villa_equipments')
        .insert([equipmentData])
        .select()
        .single();

      if (error) throw error;

      setEquipments(prev => [data as VillaEquipment, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Equipo registrado correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el equipo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEquipment = async (equipmentId: string, updates: Partial<VillaEquipment>) => {
    try {
      const { data, error } = await supabase
        .from('villa_equipments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId)
        .select()
        .single();

      if (error) throw error;

      setEquipments(prev => prev.map(equipment => 
        equipment.id === equipmentId ? (data as VillaEquipment) : equipment
      ));

      toast({
        title: "Éxito",
        description: "Equipo actualizado correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el equipo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadEquipmentPhoto = async (equipmentId: string, file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/photo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('villa-photos')
        .upload(`equipments/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('villa-photos')
        .getPublicUrl(`equipments/${fileName}`);

      await updateEquipment(equipmentId, { photo_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading equipment photo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto del equipo",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const linkEquipmentToTicket = async (equipmentId: string, ticketId: string, relationshipType: EquipmentTicket['relationship_type']) => {
    try {
      const { data, error } = await supabase
        .from('equipment_tickets')
        .insert([{
          equipment_id: equipmentId,
          ticket_id: ticketId,
          relationship_type: relationshipType
        }])
        .select()
        .single();

      if (error) throw error;

      setEquipmentTickets(prev => [data as EquipmentTicket, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Equipo vinculado al ticket correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error linking equipment to ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo vincular el equipo al ticket",
        variant: "destructive"
      });
      throw error;
    }
  };

  const fetchEquipmentTickets = async (equipmentId?: string) => {
    try {
      let query = supabase
        .from('equipment_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEquipmentTickets((data || []) as EquipmentTicket[]);
    } catch (error) {
      console.error('Error fetching equipment tickets:', error);
    }
  };

  const deleteEquipment = async (equipmentId: string) => {
    try {
      const { error } = await supabase
        .from('villa_equipments')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;

      setEquipments(prev => prev.filter(equipment => equipment.id !== equipmentId));
      
      toast({
        title: "Éxito",
        description: "Equipo eliminado"
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo",
        variant: "destructive"
      });
    }
  };

  return {
    equipments,
    equipmentTickets,
    loading,
    uploading,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    uploadEquipmentPhoto,
    linkEquipmentToTicket,
    fetchEquipmentTickets,
    deleteEquipment
  };
};