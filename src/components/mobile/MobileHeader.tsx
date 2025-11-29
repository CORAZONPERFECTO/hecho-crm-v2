import React from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileHeaderProps {
  activeModule: string;
  userRole?: 'admin' | 'technician' | 'manager';
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ activeModule, userRole }) => {
  const { profile, signOut } = useAuth();

  const getModuleTitle = (module: string) => {
    const modules: Record<string, string> = {
      dashboard: 'Dashboard',
      crm: 'CRM',
      sales: 'Ventas',
      tasks: 'Tareas',
      finances: 'Finanzas',
      tickets: 'Tickets',
      evidences: 'Evidencias',
      inventory: 'Inventario',
      projects: 'Proyectos',
      accounting: 'Contabilidad',
      reports: 'Reportes',
      users: 'Usuarios',
      contacts: 'Contactos',
      settings: 'Configuración'
    };
    return modules[module] || 'Dashboard';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'manager': return 'bg-blue-500';
      case 'technician': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-foreground rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">
              {getModuleTitle(activeModule)}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className={`text-white ${getRoleColor(userRole || 'admin')}`}>
                  {userRole}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;