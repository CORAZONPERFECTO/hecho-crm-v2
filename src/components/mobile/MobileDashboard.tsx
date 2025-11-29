import React from 'react';
import {
  TrendingUp,
  Users,
  Ticket,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ALL_MODULES } from '@/constants/modules';
import { useModuleOrder } from '@/hooks/useModuleOrder';

interface MobileDashboardProps {
  onModuleSelect: (module: string) => void;
  userRole?: 'admin' | 'technician' | 'manager';
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  onModuleSelect,
  userRole = 'admin'
}) => {
  const { orderedModules } = useModuleOrder(ALL_MODULES, userRole);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Buenos días';
    if (hour >= 12 && hour < 18) greeting = 'Buenas tardes';
    if (hour >= 18) greeting = 'Buenas noches';

    return `${greeting}!`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getWelcomeMessage()}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'technician'
              ? 'Gestiona tus asignaciones técnicas'
              : 'Administra tu negocio desde aquí'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ventas Hoy</p>
                  <p className="font-bold text-lg text-foreground">₡125K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clientes</p>
                  <p className="font-bold text-lg text-foreground">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Módulos</h2>
          <Badge variant="secondary" className="text-xs">
            {orderedModules.length} disponibles
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {orderedModules.map((module) => {
            // Ensure icon is a valid React element
            const iconElement = React.isValidElement(module.icon) ? module.icon : null;

            return (
              <Card
                key={module.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 active:scale-98 overflow-hidden"
                onClick={() => onModuleSelect(module.id)}
              >
                <CardContent className="p-0">
                  <div className="p-4 space-y-3">
                    <div className={`w-12 h-12 ${module.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      {iconElement}
                    </div>
                    {module.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{module.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{module.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Resumen de Hoy</h2>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Ticket className="text-white" size={16} />
                </div>
                <p className="text-2xl font-bold text-foreground">47</p>
                <p className="text-xs text-muted-foreground">Tickets</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="text-white" size={16} />
                </div>
                <p className="text-2xl font-bold text-foreground">94%</p>
                <p className="text-xs text-muted-foreground">Eficiencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileDashboard;