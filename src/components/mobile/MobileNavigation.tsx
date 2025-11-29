import React, { useRef, useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Ticket, 
  Camera, 
  Clock,
  Settings,
  BarChart3,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileNavigationProps {
  activeModule: string;
  onModuleSelect: (module: string) => void;
  userRole?: 'admin' | 'technician' | 'manager';
  isLandscape?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeModule,
  onModuleSelect,
  userRole = 'admin',
  isLandscape = false
}) => {
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        icon: Home,
        label: 'Inicio',
        badge: null,
        allowedRoles: ['admin', 'manager', 'technician']
      }
    ];

    if (userRole === 'technician') {
      return [
        ...baseItems,
        {
          id: 'tickets',
          icon: Ticket,
          label: 'Tickets',
          badge: '5',
          allowedRoles: ['admin', 'manager', 'technician']
        },
        {
          id: 'tasks',
          icon: Clock,
          label: 'Tareas',
          badge: '3',
          allowedRoles: ['admin', 'manager', 'technician']
        },
        {
          id: 'evidences',
          icon: Camera,
          label: 'Fotos',
          badge: null,
          allowedRoles: ['admin', 'manager', 'technician']
        },
        {
          id: 'settings',
          icon: Settings,
          label: 'Config',
          badge: null,
          allowedRoles: ['admin', 'manager', 'technician']
        }
      ];
    }

    return [
      ...baseItems,
      {
        id: 'crm',
        icon: Users,
        label: 'CRM',
        badge: '12',
        allowedRoles: ['admin', 'manager']
      },
      {
        id: 'tickets',
        icon: Ticket,
        label: 'Tickets',
        badge: '47',
        allowedRoles: ['admin', 'manager', 'technician']
      },
      {
        id: 'reports',
        icon: BarChart3,
        label: 'Reportes',
        badge: null,
        allowedRoles: ['admin', 'manager']
      },
      {
        id: 'contacts',
        icon: Users,
        label: 'Contactos',
        badge: null,
        allowedRoles: ['admin', 'manager']
      },
      {
        id: 'tasks',
        icon: Clock,
        label: 'Tareas',
        badge: '8',
        allowedRoles: ['admin', 'manager']
      },
      {
        id: 'inventory',
        icon: Package,
        label: 'Inventario',
        badge: null,
        allowedRoles: ['admin', 'manager']
      },
      {
        id: 'evidences',
        icon: Camera,
        label: 'Evidencias',
        badge: null,
        allowedRoles: ['admin', 'manager', 'technician']
      },
      {
        id: 'projects',
        icon: Calendar,
        label: 'Proyectos',
        badge: null,
        allowedRoles: ['admin', 'manager']
      },
      {
        id: 'settings',
        icon: Settings,
        label: 'Config',
        badge: null,
        allowedRoles: ['admin', 'manager', 'technician']
      }
    ];
  };

  const navigationItems = getNavigationItems().filter(item => 
    item.allowedRoles.includes(userRole)
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  const checkScrollIndicators = () => {
    const container = scrollContainerRef.current;
    if (!container || isLandscape) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftIndicator(scrollLeft > 10);
    setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollIndicators();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollIndicators);
      window.addEventListener('resize', checkScrollIndicators);
      return () => {
        container.removeEventListener('scroll', checkScrollIndicators);
        window.removeEventListener('resize', checkScrollIndicators);
      };
    }
  }, [isLandscape, navigationItems]);

  if (isLandscape) {
    return (
      <nav className="fixed left-0 top-0 bottom-0 w-16 border-r bg-background z-50 flex flex-col">
        <div className="flex flex-col items-center justify-start py-4 space-y-2 h-full overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center p-2 h-auto relative w-14 min-h-14 mb-1 ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onModuleSelect(item.id)}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center text-xs p-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium mt-1 leading-none text-[9px]">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-8 bg-primary rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="relative">
        {/* Left fade indicator */}
        {showLeftIndicator && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none flex items-center">
            <ChevronLeft className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        )}

        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-1 px-2 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center p-2 h-auto relative min-w-[90px] min-h-[60px] snap-center flex-shrink-0 ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onModuleSelect(item.id)}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center text-xs p-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium mt-1 leading-none text-xs">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Right fade indicator */}
        {showRightIndicator && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none flex items-center justify-end">
            <ChevronRight className="h-4 w-4 text-muted-foreground mr-1" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default MobileNavigation;