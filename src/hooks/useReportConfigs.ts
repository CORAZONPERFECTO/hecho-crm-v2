import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  id: string;
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReportConfigData {
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
}

export const useReportConfigs = () => {
  const [configs, setConfigs] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState<ReportConfig | null>(null);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('evidence_report_configs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedConfigs = data.map(config => ({
        id: config.id,
        ticketNumber: config.ticket_number,
        ticketTitle: config.ticket_title,
        clientName: config.client_name,
        description: config.description,
        isDefault: config.is_default,
        createdAt: config.created_at,
        updatedAt: config.updated_at
      }));

      setConfigs(mappedConfigs);
      
      // Encontrar configuración por defecto
      const defaultConf = mappedConfigs.find(config => config.isDefault);
      setDefaultConfig(defaultConf || null);

    } catch (error) {
      console.error('Error fetching report configs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: ReportConfigData, setAsDefault = false) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      // Si se marca como defecto, desmarcar la anterior
      if (setAsDefault) {
        await supabase
          .from('evidence_report_configs')
          .update({ is_default: false })
          .eq('user_id', user.user.id);
      }

      const { data, error } = await supabase
        .from('evidence_report_configs')
        .insert({
          user_id: user.user.id,
          ticket_number: configData.ticketNumber,
          ticket_title: configData.ticketTitle,
          client_name: configData.clientName,
          description: configData.description,
          is_default: setAsDefault
        })
        .select()
        .single();

      if (error) throw error;

      const newConfig: ReportConfig = {
        id: data.id,
        ticketNumber: data.ticket_number,
        ticketTitle: data.ticket_title,
        clientName: data.client_name,
        description: data.description,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setConfigs(prev => [newConfig, ...prev]);
      
      if (setAsDefault) {
        setDefaultConfig(newConfig);
        // Actualizar otras configuraciones para que no sean por defecto
        setConfigs(prev => prev.map(config => 
          config.id === newConfig.id ? config : { ...config, isDefault: false }
        ));
      }

      return newConfig;

    } catch (error) {
      console.error('Error saving report config:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConfig = async (configId: string, configData: ReportConfigData, setAsDefault = false) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      // Si se marca como defecto, desmarcar la anterior
      if (setAsDefault) {
        await supabase
          .from('evidence_report_configs')
          .update({ is_default: false })
          .eq('user_id', user.user.id)
          .neq('id', configId);
      }

      const { data, error } = await supabase
        .from('evidence_report_configs')
        .update({
          ticket_number: configData.ticketNumber,
          ticket_title: configData.ticketTitle,
          client_name: configData.clientName,
          description: configData.description,
          is_default: setAsDefault
        })
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;

      const updatedConfig: ReportConfig = {
        id: data.id,
        ticketNumber: data.ticket_number,
        ticketTitle: data.ticket_title,
        clientName: data.client_name,
        description: data.description,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setConfigs(prev => prev.map(config => 
        config.id === configId ? updatedConfig : config
      ));

      if (setAsDefault) {
        setDefaultConfig(updatedConfig);
        // Actualizar otras configuraciones para que no sean por defecto
        setConfigs(prev => prev.map(config => 
          config.id === configId ? config : { ...config, isDefault: false }
        ));
      }

      return updatedConfig;

    } catch (error) {
      console.error('Error updating report config:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConfig = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('evidence_report_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      setConfigs(prev => prev.filter(config => config.id !== configId));
      
      if (defaultConfig?.id === configId) {
        setDefaultConfig(null);
      }

      toast({
        title: "Configuración eliminada",
        description: "La configuración de reporte ha sido eliminada"
      });

    } catch (error) {
      console.error('Error deleting report config:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración",
        variant: "destructive"
      });
    }
  };

  const getLastUsedConfig = (): ReportConfig | null => {
    if (defaultConfig) return defaultConfig;
    return configs.length > 0 ? configs[0] : null;
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return {
    configs,
    loading,
    defaultConfig,
    fetchConfigs,
    saveConfig,
    updateConfig,
    deleteConfig,
    getLastUsedConfig
  };
};