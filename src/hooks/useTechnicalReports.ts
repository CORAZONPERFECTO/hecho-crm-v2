import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbTechnicalReport = Database['public']['Tables']['technical_reports']['Row'];

export interface TechnicalReport {
  id: string;
  ticket_id?: string | null;
  report_number: string;
  title: string;
  general_description?: string | null;
  technical_description?: string | null;
  observations?: string | null;
  evidences: any[];
  status: 'borrador' | 'finalizado' | 'enviado';
  created_at: string;
  updated_at: string;
  created_by: string;
  auto_saved_data?: any;
}

export interface ReportFormData {
  title: string;
  general_description: string;
  technical_description: string;
  observations: string;
  evidences: any[];
}

export const useTechnicalReports = () => {
  const [reports, setReports] = useState<TechnicalReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('technical_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedReports = (data || []).map(item => ({
        ...item,
        evidences: Array.isArray(item.evidences) ? item.evidences : []
      })) as TechnicalReport[];
      
      setReports(mappedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: Partial<TechnicalReport>) => {
    try {
      const reportNumber = `REP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
      
      const insertData = {
        ticket_id: reportData.ticket_id || null,
        report_number: reportNumber,
        title: reportData.title || 'Nuevo Reporte',
        general_description: reportData.general_description || null,
        technical_description: reportData.technical_description || null,
        observations: reportData.observations || null,
        evidences: reportData.evidences || [],
        status: reportData.status || 'borrador',
        created_by: 'current_user',
        auto_saved_data: reportData.auto_saved_data || {}
      };

      const { data, error } = await supabase
        .from('technical_reports')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        ...data,
        evidences: Array.isArray(data.evidences) ? data.evidences : []
      } as TechnicalReport;

      setReports(prev => [mappedData, ...prev]);
      toast({
        title: "Éxito",
        description: "Reporte creado correctamente",
      });
      
      return mappedData;
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el reporte",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const updateReport = useCallback(async (id: string, updates: Partial<TechnicalReport>) => {
    try {
      const updateData = {
        title: updates.title,
        general_description: updates.general_description,
        technical_description: updates.technical_description,
        observations: updates.observations,
        evidences: updates.evidences,
        status: updates.status,
        auto_saved_data: updates.auto_saved_data
      };

      const { data, error } = await supabase
        .from('technical_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        ...data,
        evidences: Array.isArray(data.evidences) ? data.evidences : []
      } as TechnicalReport;

      setReports(prev => prev.map(report => 
        report.id === id ? mappedData : report
      ));

      return mappedData;
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el reporte",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const autoSaveReport = useCallback(async (id: string, formData: ReportFormData) => {
    try {
      const updateData = {
        title: formData.title,
        general_description: formData.general_description,
        technical_description: formData.technical_description,
        observations: formData.observations,
        evidences: formData.evidences,
        status: 'borrador' as const,
        auto_saved_data: formData as any
      };

      await supabase
        .from('technical_reports')
        .update(updateData)
        .eq('id', id);
    } catch (error) {
      console.error('Error auto-saving report:', error);
    }
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('technical_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReports(prev => prev.filter(report => report.id !== id));
      toast({
        title: "Éxito",
        description: "Reporte eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    createReport,
    updateReport,
    autoSaveReport,
    deleteReport,
    refetch: fetchReports
  };
};