
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CompanySettingsFormValues } from '../schemas/companySettingsSchema';

interface CompanyInfoSectionProps {
  control: Control<CompanySettingsFormValues>;
}

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({ control }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la Empresa</CardTitle>
        <CardDescription>Información general y de contacto de tu empresa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Mi Empresa S.R.L." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RNC / ID Fiscal</FormLabel>
                <FormControl>
                  <Input placeholder="1-31-12345-6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (809) 555-0123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección Fiscal</FormLabel>
              <FormControl>
                <Input placeholder="Av. Principal #123, Ciudad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico Oficial</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ventas@tuempresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio Web</FormLabel>
                <FormControl>
                  <Input placeholder="www.tuempresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoSection;
