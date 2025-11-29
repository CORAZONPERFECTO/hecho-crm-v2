
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const AppearanceSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia y Personalización</CardTitle>
        <CardDescription>Gestiona el aspecto visual del sistema y las plantillas de documentos.</CardDescription>
      </CardHeader>
      <CardContent className="text-center text-gray-500 py-12">
        <Construction className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4">La personalización de la apariencia está en desarrollo.</p>
        <p className="text-sm">Las plantillas de documentos ahora se configuran en la pestaña 'Documentos'.</p>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
