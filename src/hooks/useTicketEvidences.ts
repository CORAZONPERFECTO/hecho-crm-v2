
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketEvidence {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

export const useTicketEvidences = (ticketId: string) => {
  const [evidences, setEvidences] = useState<TicketEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchEvidences = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_evidences')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe conversion of Supabase data
      const typedEvidences: TicketEvidence[] = (data || []).map(evidence => ({
        ...evidence,
        sync_status: (evidence.sync_status as 'pending' | 'synced' | 'failed') || 'synced'
      }));
      
      setEvidences(typedEvidences);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evidencias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadEvidence = async (file: File, description: string, uploadedBy: string, villaId?: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ticket-evidences')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ticket-evidences')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('ticket_evidences')
        .insert([{
          ticket_id: ticketId,
          villa_id: villaId || null,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type,
          description,
          uploaded_by: uploadedBy,
          sync_status: 'synced'
        }])
        .select()
        .single();

      if (error) throw error;

      // Type-safe conversion
      const typedEvidence: TicketEvidence = {
        ...data,
        sync_status: (data.sync_status as 'pending' | 'synced' | 'failed') || 'synced'
      };

      setEvidences(prev => [typedEvidence, ...prev]);
      
      toast({
        title: "Éxito",
        description: "Evidencia subida correctamente"
      });

      return typedEvidence;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la evidencia",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const updateDescription = async (evidenceId: string, description: string) => {
    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .update({ description })
        .eq('id', evidenceId);

      if (error) throw error;

      setEvidences(prev => prev.map(evidence => 
        evidence.id === evidenceId ? { ...evidence, description } : evidence
      ));

      toast({
        title: "Éxito",
        description: "Descripción actualizada"
      });
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la descripción",
        variant: "destructive"
      });
    }
  };

  const updateFileName = async (evidenceId: string, fileName: string) => {
    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .update({ file_name: fileName })
        .eq('id', evidenceId);

      if (error) throw error;

      setEvidences(prev => prev.map(evidence => 
        evidence.id === evidenceId ? { ...evidence, file_name: fileName } : evidence
      ));

      toast({
        title: "Éxito",
        description: "Nombre actualizado"
      });
    } catch (error) {
      console.error('Error updating file name:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre",
        variant: "destructive"
      });
    }
  };

  const deleteEvidence = async (evidenceId: string, fileName: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('ticket_evidences')
        .delete()
        .eq('id', evidenceId);

      if (deleteError) throw deleteError;

      // Extraer el path del archivo de la URL
      const filePath = fileName.split('/').slice(-2).join('/');
      await supabase.storage
        .from('ticket-evidences')
        .remove([filePath]);

      setEvidences(prev => prev.filter(evidence => evidence.id !== evidenceId));
      
      toast({
        title: "Éxito",
        description: "Evidencia eliminada"
      });
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evidencia",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchEvidences();
    }
  }, [ticketId]);

  return {
    evidences,
    loading,
    uploading,
    uploadEvidence,
    updateDescription,
    updateFileName,
    deleteEvidence,
    refetch: fetchEvidences
  };
};
