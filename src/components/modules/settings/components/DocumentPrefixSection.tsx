
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { CompanySettingsFormValues } from '../schemas/companySettingsSchema';

interface DocumentPrefixSectionProps {
  control: Control<CompanySettingsFormValues>;
}

const DocumentPrefixSection: React.FC<DocumentPrefixSectionProps> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formato de Numeración</CardTitle>
        <CardDescription>Define los prefijos para los números de documentos.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <FormField
          control={control}
          name="ticketPrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tickets</FormLabel>
              <FormControl>
                <Input placeholder="TKT-" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="quotePrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cotizaciones</FormLabel>
              <FormControl>
                <Input placeholder="COT-" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="invoicePrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facturas</FormLabel>
              <FormControl>
                <Input placeholder="FAC-" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="proformaPrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facturas Proforma</FormLabel>
              <FormControl>
                <Input placeholder="FACPR-" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="deliveryNotePrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conduces</FormLabel>
              <FormControl>
                <Input placeholder="CON-" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default DocumentPrefixSection;
