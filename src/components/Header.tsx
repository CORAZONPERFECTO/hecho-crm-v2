
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, Bell, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { profile, signOut } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-cyan-100 text-cyan-800';
      case 'contador': return 'bg-yellow-100 text-yellow-800';
      case 'asistente': return 'bg-purple-100 text-purple-800';
      case 'technician': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={12} />;
      case 'manager': return <Shield size={12} />;
      default: return <User size={12} />;
    }
  };

  return (
    <Card className="border-0 shadow-sm sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden p-2"
          >
            <Menu size={20} />
          </Button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-fluid-lg font-bold text-foreground">Sistema de Gestión</h1>
              <p className="text-fluid-xs text-muted-foreground">Panel de Administración</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notificaciones */}
          <Button variant="ghost" size="sm" className="relative hover-scale">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground animate-pulse">
              3
            </span>
          </Button>

          {/* Información del usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted/50 transition-all">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User size={16} className="text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-fluid-sm font-medium text-foreground">{profile?.name || 'Usuario'}</p>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(profile?.role || '')}
                    <Badge className={`text-xs ${getRoleColor(profile?.role || '')}`}>
                      {profile?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 animate-slide-up" align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium text-foreground">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-2 hover:bg-muted/50">
                <User size={14} />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-2 hover:bg-muted/50">
                <Settings size={14} />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center space-x-2 text-destructive focus:text-destructive hover:bg-destructive/10"
                onClick={signOut}
              >
                <LogOut size={14} />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
