
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const AutomationsSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatizaciones</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-gray-500 py-12">
        <Construction className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4">Funcionalidad en desarrollo...</p>
        <p className="text-sm">Aquí podrás configurar alertas y tareas automáticas.</p>
      </CardContent>
    </Card>
  );
};

export default AutomationsSettings;
