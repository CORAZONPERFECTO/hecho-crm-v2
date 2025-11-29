
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySettings {
  id?: string;
  companyName: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  ticketPrefix?: string;
  quotePrefix?: string;
  invoicePrefix?: string;
  proformaPrefix?: string;
  deliveryNotePrefix?: string;
  logoUrl?: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company settings:', error);
        toast({
          title: "Error al cargar configuración",
          description: "No se pudo cargar la configuración de la empresa.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const mappedData: CompanySettings = {
          id: data.id,
          companyName: data.company_name,
          taxId: data.tax_id,
          address: data.address,
          email: data.email,
          phone: data.phone,
          website: data.website,
          ticketPrefix: data.ticket_prefix,
          quotePrefix: data.quote_prefix,
          invoicePrefix: data.invoice_prefix,
          proformaPrefix: data.proforma_prefix,
          deliveryNotePrefix: data.delivery_note_prefix,
          logoUrl: data.logo_url,
        };
        setSettings(mappedData);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: CompanySettings) => {
    try {
      const settingsData = {
        company_name: newSettings.companyName,
        tax_id: newSettings.taxId,
        address: newSettings.address,
        email: newSettings.email,
        phone: newSettings.phone,
        website: newSettings.website,
        ticket_prefix: newSettings.ticketPrefix,
        quote_prefix: newSettings.quotePrefix,
        invoice_prefix: newSettings.invoicePrefix,
        proforma_prefix: newSettings.proformaPrefix,
        delivery_note_prefix: newSettings.deliveryNotePrefix,
        logo_url: newSettings.logoUrl,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (settings?.id) {
        // Update existing settings
        result = await supabase
          .from('company_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await supabase
          .from('company_settings')
          .insert([settingsData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving company settings:', result.error);
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar la configuración de la empresa.",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      const updatedSettings: CompanySettings = {
        id: result.data.id,
        companyName: result.data.company_name,
        taxId: result.data.tax_id,
        address: result.data.address,
        email: result.data.email,
        phone: result.data.phone,
        website: result.data.website,
        ticketPrefix: result.data.ticket_prefix,
        quotePrefix: result.data.quote_prefix,
        invoicePrefix: result.data.invoice_prefix,
        proformaPrefix: result.data.proforma_prefix,
        deliveryNotePrefix: result.data.delivery_note_prefix,
        logoUrl: result.data.logo_url,
      };
      setSettings(updatedSettings);

      toast({
        title: "Configuración guardada",
        description: "Los datos de la empresa han sido actualizados correctamente.",
      });
      return true;
    } catch (error) {
      console.error('Error saving company settings:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar la configuración.",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        toast({
          title: "Error al subir logo",
          description: "No se pudo subir el logo. Inténtalo de nuevo.",
          variant: "destructive",
        });
        return null;
      }

      const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saveSettings,
    uploadLogo,
    refreshSettings: fetchSettings,
  };
};
