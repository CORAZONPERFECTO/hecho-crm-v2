
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Edit } from 'lucide-react';

const roles = [
  { name: 'Administrador', description: 'Acceso total y configuración del sistema.' },
  { name: 'Gerente', description: 'Supervisa proyectos y equipos. Acceso a reportes.' },
  { name: 'Supervisor', description: 'Supervisa operaciones y personal técnico.' },
  { name: 'Técnico', description: 'Gestiona tickets y tareas de servicio.' },
  { name: 'Contador', description: 'Gestiona facturación, pagos y finanzas.' },
  { name: 'Asistente', description: 'Apoya en tareas administrativas y de soporte.' },
];

const RolesSettings: React.FC = () => {
  return (
    <div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Roles y Permisos</CardTitle>
        <CardDescription>Define qué pueden ver y hacer los usuarios según su rol.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        {roles.map(role => (
          <Card key={role.name}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Gestionar Permisos
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6 bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle>Próximamente: Gestión de Permisos</CardTitle>
          <CardDescription>
            La gestión detallada de permisos por módulo (ver, crear, editar, eliminar) estará disponible en una futura actualización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Actualmente los permisos son fijos para cada rol predefinido.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesSettings;
