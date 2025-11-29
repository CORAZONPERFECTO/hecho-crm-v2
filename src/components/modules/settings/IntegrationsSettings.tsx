
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const IntegrationsSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integraciones Externas</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-gray-500 py-12">
        <Construction className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4">Funcionalidad en desarrollo...</p>
        <p className="text-sm">Aquí podrás conectar con WhatsApp, Google Calendar y otras APIs.</p>
      </CardContent>
    </Card>
  );
};

export default IntegrationsSettings;
