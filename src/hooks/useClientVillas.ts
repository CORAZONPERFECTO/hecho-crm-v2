
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientVilla {
  id: string;
  client_id: string;
  villa_name: string;
  villa_code?: string;
  address: string;
  gps_location?: string;
  contact_person?: string;
  contact_phone?: string;
  exterior_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useClientVillas = () => {
  const [villas, setVillas] = useState<ClientVilla[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchVillas = async (clientId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('client_villas')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVillas(data || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las villas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createVilla = async (villaData: Omit<ClientVilla, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('client_villas')
        .insert([villaData])
        .select()
        .single();

      if (error) throw error;

      setVillas(prev => [data, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Villa creada correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error creating villa:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la villa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateVilla = async (villaId: string, updates: Partial<ClientVilla>) => {
    try {
      const { data, error } = await supabase
        .from('client_villas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', villaId)
        .select()
        .single();

      if (error) throw error;

      setVillas(prev => prev.map(villa => 
        villa.id === villaId ? data : villa
      ));

      toast({
        title: "Éxito",
        description: "Villa actualizada correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error updating villa:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la villa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadExteriorPhoto = async (villaId: string, file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${villaId}/exterior.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('villa-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('villa-photos')
        .getPublicUrl(fileName);

      await updateVilla(villaId, { exterior_photo_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteVilla = async (villaId: string) => {
    try {
      const { error } = await supabase
        .from('client_villas')
        .delete()
        .eq('id', villaId);

      if (error) throw error;

      setVillas(prev => prev.filter(villa => villa.id !== villaId));
      
      toast({
        title: "Éxito",
        description: "Villa eliminada"
      });
    } catch (error) {
      console.error('Error deleting villa:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la villa",
        variant: "destructive"
      });
    }
  };

  return {
    villas,
    loading,
    uploading,
    fetchVillas,
    createVilla,
    updateVilla,
    uploadExteriorPhoto,
    deleteVilla
  };
};
