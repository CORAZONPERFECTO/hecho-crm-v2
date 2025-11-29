
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NCFSettings from './NCFSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const FinancialSettings: React.FC = () => {
  return (
    <Tabs defaultValue="ncf" className="space-y-6">
      <TabsList>
        <TabsTrigger value="ncf">NCF</TabsTrigger>
        <TabsTrigger value="taxes">Impuestos</TabsTrigger>
        <TabsTrigger value="currency">Moneda</TabsTrigger>
        <TabsTrigger value="payment-terms">Condiciones de Pago</TabsTrigger>
      </TabsList>

      <TabsContent value="ncf">
        <NCFSettings />
      </TabsContent>

      <TabsContent value="taxes">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Impuestos</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-500 py-12">
            <Construction className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Funcionalidad en desarrollo...</p>
            <p className="text-sm">Aquí podrás configurar ITBIS, ISR y otros impuestos.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="currency">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Moneda</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-500 py-12">
            <Construction className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Funcionalidad en desarrollo...</p>
            <p className="text-sm">Aquí podrás configurar moneda base, tasas de cambio, etc.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment-terms">
        <Card>
          <CardHeader>
            <CardTitle>Condiciones de Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-500 py-12">
            <Construction className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Funcionalidad en desarrollo...</p>
            <p className="text-sm">Aquí podrás configurar plazos de pago, descuentos, recargos, etc.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FinancialSettings;
