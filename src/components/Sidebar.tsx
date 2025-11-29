import React, { useState } from 'react';
import { Home, Users, ShoppingCart, Package, FileText, Calendar, BarChart3, Settings, Ticket, UserCog, Shield, ChevronLeft, ChevronRight, Building2, Camera, Clock, TrendingUp, Edit3, ChevronUp, ChevronDown, Pin, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModuleOrder } from '@/hooks/useModuleOrder';
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeModule: string;
  onModuleSelect: (module: string) => void;
  userRole?: 'admin' | 'technician' | 'manager';
}
const menuItems = [{
  id: 'dashboard',
  title: 'Dashboard',
  description: 'Panel principal',
  icon: <Home size={16} />,
  gradient: 'from-blue-500 to-purple-600',
  allowedRoles: ['admin', 'manager', 'technician']
}, {
  id: 'crm',
  title: 'CRM',
  description: 'Gestión de relaciones',
  icon: <Users size={16} />,
  gradient: 'from-green-500 to-blue-600',
  allowedRoles: ['admin', 'manager']
}, {
  id: 'sales',
  title: 'Ventas',
  description: 'Gestión de ventas',
  icon: <ShoppingCart size={16} />,
  gradient: 'from-orange-500 to-red-600',
  allowedRoles: ['admin', 'manager']
}, {
  id: 'customers',
  title: 'Clientes',
  description: 'Base de clientes',
  icon: <Users size={16} />,
  gradient: 'from-purple-500 to-pink-600',
  allowedRoles: ['admin', 'manager']
}, {
  id: 'tasks',
  title: 'Tareas',
  description: 'Gestión de tareas',
  icon: <Clock size={16} />,
  gradient: 'from-yellow-500 to-orange-600',
  allowedRoles: ['admin', 'manager', 'technician']
}, {
  id: 'finances',
  title: 'Finanzas Generales',
  description: 'Control financiero',
  icon: <TrendingUp size={16} />,
  gradient: 'from-emerald-500 to-green-600',
  allowedRoles: ['admin']
}, {
  id: 'inventory',
  title: 'Inventario',
  description: 'Control de stock',
  icon: <Package size={16} />,
  gradient: 'from-indigo-500 to-purple-600',
  allowedRoles: ['admin', 'manager']
}, {
  id: 'tickets',
  title: 'Tickets',
  description: 'Tickets de servicio',
  icon: <Ticket size={16} />,
  gradient: 'from-red-500 to-pink-600',
  allowedRoles: ['admin', 'manager', 'technician']
}, {
  id: 'evidences',
  title: 'Evidencias',
  description: 'Gestión de evidencias',
  icon: <Camera size={16} />,
  gradient: 'from-cyan-500 to-blue-600',
  allowedRoles: ['admin', 'manager', 'technician']
}, {
  id: 'projects',
  title: 'Proyectos',
  description: 'Gestión de proyectos',
  icon: <Calendar size={16} />,
  gradient: 'from-violet-500 to-purple-600',
  allowedRoles: ['admin', 'manager']
}, {
  id: 'accounting',
  title: 'Contabilidad',
  description: 'Sistema contable',
  icon: <FileText size={16} />,
  gradient: 'from-slate-500 to-gray-600',
  allowedRoles: ['admin']
}, {
  id: 'reports',
  title: 'Reportes',
  description: 'Análisis y reportes',
  icon: <BarChart3 size={16} />,
  gradient: 'from-blue-500 to-indigo-600',
  allowedRoles: ['admin', 'manager']
}, {
  id: 'users',
  title: 'Usuarios',
  description: 'Gestión de usuarios',
  icon: <UserCog size={16} />,
  gradient: 'from-gray-500 to-slate-600',
  allowedRoles: ['admin']
}, {
  id: 'settings',
  title: 'Configuración',
  description: 'Configuración del sistema',
  icon: <Settings size={16} />,
  gradient: 'from-stone-500 to-gray-600',
  allowedRoles: ['admin']
}];
const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  activeModule,
  onModuleSelect,
  userRole = 'admin'
}) => {
  const [isReorderMode, setIsReorderMode] = useState(false);
  const {
    orderedModules,
    moveModuleUp,
    moveModuleDown,
    togglePin,
    toggleInProgress
  } = useModuleOrder(menuItems, userRole);
  return <div className={cn(
    "bg-sidebar shadow-xl border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col relative h-screen",
    isCollapsed ? "w-16" : "w-72"
  )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && <div className="flex items-center space-x-3 animate-slide-in-left">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-fluid-lg">HECHO CRM</h1>
              <p className="text-fluid-xs text-sidebar-foreground/70">Sistema Integrado</p>
            </div>
          </div>}
        <div className="flex items-center gap-2">
          {!isCollapsed && <button 
            onClick={() => setIsReorderMode(!isReorderMode)} 
            className={cn(
              "p-2 rounded-xl transition-all duration-200 group hover-scale",
              isReorderMode 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
            )} 
            title="Reordenar módulos"
          >
              <Edit3 size={16} />
            </button>}
          <button 
            onClick={onToggle} 
            className="p-2 hover:bg-sidebar-accent rounded-xl transition-all duration-200 group hover-scale"
          >
            {isCollapsed ? 
              <ChevronRight size={18} className="text-sidebar-foreground group-hover:text-sidebar-accent-foreground" /> : 
              <ChevronLeft size={18} className="text-sidebar-foreground group-hover:text-sidebar-accent-foreground" />
            }
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {orderedModules.map((item, index) => {
        const isActive = activeModule === item.id;
        return <div key={item.id} className="relative group">
              <button 
                onClick={() => !isReorderMode && onModuleSelect(item.id)} 
                className={cn(
                  "w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 relative hover-scale",
                  isActive 
                    ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-primary/20" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  isReorderMode && "cursor-default"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-200 relative",
                  isActive 
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md" 
                    : "bg-sidebar-accent group-hover:bg-sidebar-primary group-hover:text-sidebar-primary-foreground"
                )}>
                  {item.icon}
                  {item.isPinned && <Pin size={8} className="absolute -top-1 -right-1 text-blue-600 fill-blue-600" />}
                  {item.isInProgress && <Clock3 size={8} className="absolute -bottom-1 -right-1 text-orange-600 fill-orange-600" />}
                </div>
                {!isCollapsed && <span className="font-medium text-fluid-sm flex-1 text-left">{item.title}</span>}
                {isActive && !isReorderMode && <div className="absolute right-2 w-2 h-2 bg-sidebar-primary rounded-full animate-pulse" />}
              </button>
              
              {/* Controles de reordenamiento */}
              {isReorderMode && !isCollapsed && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 bg-sidebar rounded-lg shadow-lg border border-sidebar-border p-1 animate-scale-in">
                  <button 
                    onClick={() => moveModuleUp(item.id)} 
                    className="p-1 hover:bg-sidebar-accent rounded text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors" 
                    title="Mover arriba"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button 
                    onClick={() => moveModuleDown(item.id)} 
                    className="p-1 hover:bg-sidebar-accent rounded text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors" 
                    title="Mover abajo"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button 
                    onClick={() => togglePin(item.id)} 
                    className={cn(
                      "p-1 rounded transition-colors", 
                      item.isPinned 
                        ? "bg-blue-100 text-blue-600" 
                        : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    )} 
                    title={item.isPinned ? "Desfijar" : "Fijar"}
                  >
                    <Pin size={12} />
                  </button>
                  <button 
                    onClick={() => toggleInProgress(item.id)} 
                    className={cn(
                      "p-1 rounded transition-colors", 
                      item.isInProgress 
                        ? "bg-orange-100 text-orange-600" 
                        : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    )} 
                    title={item.isInProgress ? "Quitar de progreso" : "Marcar en progreso"}
                  >
                    <Clock3 size={12} />
                  </button>
                </div>}
            </div>;
      })}
      </nav>

      {/* User Role Badge */}
      {!isCollapsed && <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center space-x-2 animate-slide-in-right">
            <Shield size={16} className="text-sidebar-foreground/60" />
            <span className="text-fluid-xs text-sidebar-foreground/70 capitalize font-medium">{userRole}</span>
          </div>
        </div>}
    </div>;
};
export default Sidebar;