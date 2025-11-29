import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketExportedReport {
  id: string;
  ticket_id: string;
  report_type: 'pdf' | 'word' | 'zip';
  file_name: string;
  file_url: string;
  file_size?: number | null;
  generated_by: string;
  description?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useTicketExportedReports = (ticketId: string) => {
  const [reports, setReports] = useState<TicketExportedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReports = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_exported_reports')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as TicketExportedReport[]);
    } catch (error) {
      console.error('Error fetching exported reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes exportados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async (
    reportType: 'pdf' | 'word' | 'zip',
    fileName: string,
    fileBlob: Blob,
    generatedBy: string,
    description?: string,
    metadata?: any
  ): Promise<TicketExportedReport | null> => {
    try {
      // Subir archivo a storage
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-exported-reports')
        .upload(uniqueFileName, fileBlob, {
          contentType: fileBlob.type,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('ticket-exported-reports')
        .getPublicUrl(uniqueFileName);

      // Guardar registro en base de datos
      const { data, error } = await supabase
        .from('ticket_exported_reports')
        .insert({
          ticket_id: ticketId,
          report_type: reportType,
          file_name: fileName,
          file_url: publicUrl,
          file_size: fileBlob.size,
          generated_by: generatedBy,
          description,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista local
      setReports(prev => [data as TicketExportedReport, ...prev]);
      
      toast({
        title: "Reporte guardado",
        description: `El reporte ${fileName} se guardó correctamente`
      });

      return data as TicketExportedReport;
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el reporte",
        variant: "destructive"
      });
      return null;
    }
  };

  const downloadReport = async (report: TicketExportedReport) => {
    try {
      const response = await fetch(report.file_url);
      if (!response.ok) throw new Error('Error downloading file');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = report.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${report.file_name}`
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte",
        variant: "destructive"
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Eliminar archivo de storage
      const fileName = report.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('ticket-exported-reports')
          .remove([fileName]);
      }

      // Eliminar registro de base de datos
      const { error } = await supabase
        .from('ticket_exported_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      // Actualizar lista local
      setReports(prev => prev.filter(r => r.id !== reportId));

      toast({
        title: "Reporte eliminado",
        description: "El reporte se eliminó correctamente"
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, [ticketId]);

  return {
    reports,
    loading,
    saveReport,
    downloadReport,
    deleteReport,
    refetch: fetchReports
  };
};