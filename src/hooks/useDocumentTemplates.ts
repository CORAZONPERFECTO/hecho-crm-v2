import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  document_type: 'invoice' | 'quotation' | 'delivery_note' | 'purchase_order';
  template_id: string;
  is_default: boolean;
  is_active: boolean;
  styles: any;
  created_at: string;
  updated_at: string;
}

export interface CompanyDocumentSettings {
  id: string;
  document_type: 'invoice' | 'quotation' | 'delivery_note' | 'purchase_order';
  default_template_id: string;
  auto_numbering: boolean;
  number_format: string;
  created_at: string;
  updated_at: string;
}

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [settings, setSettings] = useState<CompanyDocumentSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('document_type', { ascending: true })
        .order('is_default', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as DocumentTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las plantillas de documentos.',
        variant: 'destructive',
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_document_settings')
        .select('*')
        .order('document_type', { ascending: true });

      if (error) throw error;
      setSettings((data || []) as CompanyDocumentSettings[]);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones de documentos.',
        variant: 'destructive',
      });
    }
  };

  const updateDefaultTemplate = async (documentType: string, templateId: string) => {
    try {
      // Actualizar configuración de la empresa
      const { error: settingsError } = await supabase
        .from('company_document_settings')
        .upsert({
          document_type: documentType,
          default_template_id: templateId,
        })
        .eq('document_type', documentType);

      if (settingsError) throw settingsError;

      // Actualizar estado local
      setSettings(prev => 
        prev.map(setting => 
          setting.document_type === documentType 
            ? { ...setting, default_template_id: templateId }
            : setting
        )
      );

      toast({
        title: 'Configuración guardada',
        description: `La plantilla por defecto para ${getDocumentTypeName(documentType)} ha sido actualizada.`,
      });

      return true;
    } catch (error) {
      console.error('Error updating default template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTemplatesByType = (documentType: string): DocumentTemplate[] => {
    return templates.filter(template => template.document_type === documentType);
  };

  const getDefaultTemplateId = (documentType: string): string => {
    const setting = settings.find(s => s.document_type === documentType);
    return setting?.default_template_id || '';
  };

  const getDocumentTypeName = (type: string): string => {
    switch (type) {
      case 'invoice': return 'Facturas';
      case 'quotation': return 'Cotizaciones';
      case 'delivery_note': return 'Conduces';
      case 'purchase_order': return 'Órdenes de Compra';
      default: return 'Documentos';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchSettings()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    templates,
    settings,
    loading,
    getTemplatesByType,
    getDefaultTemplateId,
    updateDefaultTemplate,
    getDocumentTypeName,
    fetchTemplates,
    fetchSettings,
  };
};