
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { companySettingsSchema, CompanySettingsFormValues } from './schemas/companySettingsSchema';
import CompanyInfoSection from './components/CompanyInfoSection';
import LogoSection from './components/LogoSection';
import DocumentPrefixSection from './components/DocumentPrefixSection';
import LoadingSpinner from './components/LoadingSpinner';

const CompanySettings: React.FC = () => {
  const { settings, loading, saveSettings, uploadLogo } = useCompanySettings();
  const [companyLogo, setCompanyLogo] = useState<string>('');

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: '',
      taxId: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      ticketPrefix: "TKT-",
      quotePrefix: "COT-",
      invoicePrefix: "FAC-",
      proformaPrefix: "FACPR-",
      deliveryNotePrefix: "CON-"
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName || '',
        taxId: settings.taxId || '',
        address: settings.address || '',
        email: settings.email || '',
        phone: settings.phone || '',
        website: settings.website || '',
        ticketPrefix: settings.ticketPrefix || "TKT-",
        quotePrefix: settings.quotePrefix || "COT-",
        invoicePrefix: settings.invoicePrefix || "FAC-",
        proformaPrefix: settings.proformaPrefix || "FACPR-",
        deliveryNotePrefix: settings.deliveryNotePrefix || "CON-"
      });
      setCompanyLogo(settings.logoUrl || '');
    }
  }, [settings, form]);

  async function onSubmit(data: CompanySettingsFormValues) {
    const settingsToSave = {
      companyName: data.companyName,
      taxId: data.taxId,
      address: data.address,
      email: data.email,
      phone: data.phone,
      website: data.website || '',
      ticketPrefix: data.ticketPrefix || "TKT-",
      quotePrefix: data.quotePrefix || "COT-",
      invoicePrefix: data.invoicePrefix || "FAC-",
      proformaPrefix: data.proformaPrefix || "FACPR-",
      deliveryNotePrefix: data.deliveryNotePrefix || "CON-",
      logoUrl: companyLogo,
    };
    
    const success = await saveSettings(settingsToSave);
    
    if (success) {
      console.log('Company settings saved successfully');
    }
  }

  const handleLogoChange = (logoUrl: string) => {
    setCompanyLogo(logoUrl);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CompanyInfoSection control={form.control} />
        <LogoSection 
          companyLogo={companyLogo}
          onLogoChange={handleLogoChange}
          uploadFunction={uploadLogo}
        />
        <DocumentPrefixSection control={form.control} />
        <div className="flex justify-end">
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanySettings;
