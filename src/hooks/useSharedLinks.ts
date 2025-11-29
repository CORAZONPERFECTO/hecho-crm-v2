
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedLink {
  id: string;
  ticket_id: string;
  token: string;
  created_by: string;
  expires_at?: string;
  is_active: boolean;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
}

export const useSharedLinks = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async (ticketId: string, createdBy: string, expiresInHours?: number) => {
    setLoading(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString() : null;

      const { data, error } = await supabase
        .from('ticket_shared_links')
        .insert([{
          ticket_id: ticketId,
          token,
          created_by: createdBy,
          expires_at: expiresAt,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared-ticket/${token}`;
      
      toast({
        title: "Éxito",
        description: "Link compartible generado"
      });

      return { ...data, share_url: shareUrl };
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el link compartible",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSharedTicket = async (token: string) => {
    try {
      console.log('🔍 Intentando obtener ticket compartido con token:', token);
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌐 URL actual:', window.location.href);
      
      // Verificar si el link existe y está activo
      const { data: linkData, error: linkError } = await supabase
        .from('ticket_shared_links')
        .select('*, tickets(*)')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      console.log('📊 Resultado de búsqueda:', { linkData, linkError });

      if (linkError) {
        console.error('❌ Error en consulta de link:', linkError);
        throw new Error(`Error de base de datos: ${linkError.message}`);
      }

      if (!linkData) {
        console.error('❌ No se encontró el link compartido');
        throw new Error('Link compartido no encontrado o inactivo');
      }

      // Verificar si no ha expirado
      const expirationDate = new Date(linkData.expires_at);
      const currentDate = new Date();
      
      console.log('⏰ Verificando expiración:');
      console.log('⏰ Expira:', expirationDate.toISOString(), 'Local:', expirationDate.toLocaleString());
      console.log('⏰ Actual:', currentDate.toISOString(), 'Local:', currentDate.toLocaleString());
      console.log('⏰ Diferencia (hrs):', (currentDate.getTime() - expirationDate.getTime()) / (1000 * 60 * 60));
      
      if (linkData.expires_at && expirationDate < currentDate) {
        console.error('⏰ Link expirado');
        throw new Error(`El link ha expirado el ${expirationDate.toLocaleString()}`);
      }

      console.log('✅ Link válido, actualizando contador de accesos');

      // Actualizar contador de accesos
      const { error: updateError } = await supabase
        .from('ticket_shared_links')
        .update({ 
          access_count: linkData.access_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', linkData.id);

      if (updateError) {
        console.warn('⚠️ Error actualizando contador de accesos:', updateError);
        // No lanzar error aquí, solo log
      }

      console.log('✅ Ticket compartido obtenido exitosamente');
      return linkData;
    } catch (error) {
      console.error('💥 Error accessing shared ticket:', error);
      
      // Agregar información de contexto para debugging
      const errorInfo = {
        token,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      
      console.error('🐛 Información de debugging:', errorInfo);
      
      throw error;
    }
  };

  const deactivateLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_shared_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Link desactivado"
      });
    } catch (error) {
      console.error('Error deactivating link:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el link",
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    generateShareLink,
    getSharedTicket,
    deactivateLink
  };
};
