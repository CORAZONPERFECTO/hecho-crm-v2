import React from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  Calendar, 
  BarChart3,
  Ticket,
  UserCog,
  Headphones,
  TrendingUp,
  Camera,
  Clock,
  DollarSign,
  Receipt,
  FolderKanban,
  Settings,
  Phone
} from 'lucide-react';

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  stats?: string;
  allowedRoles: string[];
  isPinned?: boolean;
  isInProgress?: boolean;
  badge?: string | null;
}

export const ALL_MODULES: Module[] = [
  {
    id: 'crm',
    title: 'CRM',
    description: 'Gestión integral de relaciones con clientes y leads',
    icon: <Users className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    stats: '1,234',
    badge: '12',
    allowedRoles: ['admin', 'manager']
  },
  {
    id: 'sales',
    title: 'Ventas',
    description: 'Control de ventas, cotizaciones y facturación',
    icon: <ShoppingCart className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    stats: '₡2.5M',
    allowedRoles: ['admin', 'manager']
  },
  {
    id: 'tasks',
    title: 'Lista de Tareas',
    description: 'Gestión de tareas con recordatorios automáticos',
    icon: <Clock className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    stats: '23 pendientes',
    badge: '3',
    allowedRoles: ['admin', 'manager', 'technician']
  },
  {
    id: 'finances',
    title: 'Finanzas Generales',
    description: 'Panel de control financiero administrativo',
    icon: <TrendingUp className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    stats: '$2.1M ganancia',
    allowedRoles: ['admin']
  },
  {
    id: 'tickets',
    title: 'Sistema de Tickets',
    description: 'Gestión de incidencias y soporte técnico',
    icon: <Ticket className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    stats: '47 abiertos',
    badge: '5',
    allowedRoles: ['admin', 'manager', 'technician']
  },
  {
    id: 'evidences',
    title: 'Evidencias',
    description: 'Gestión y almacenamiento de evidencias fotográficas',
    icon: <Camera className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    stats: '324 archivos',
    allowedRoles: ['admin', 'manager', 'technician']
  },
  {
    id: 'inventory',
    title: 'Inventario',
    description: 'Control de stock, productos y almacenes',
    icon: <Package className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
    stats: '2,156',
    allowedRoles: ['admin', 'manager']
  },
  {
    id: 'projects',
    title: 'Proyectos',
    description: 'Planificación y seguimiento de proyectos',
    icon: <FolderKanban className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    stats: '12 activos',
    allowedRoles: ['admin', 'manager']
  },
  {
    id: 'accounting',
    title: 'Contabilidad',
    description: 'Gestión financiera y contable completa',
    icon: <Receipt className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    stats: '₡15.2M',
    allowedRoles: ['admin']
  },
  {
    id: 'reports',
    title: 'Reportes y KPIs',
    description: 'Análisis de datos y métricas de negocio',
    icon: <BarChart3 className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    stats: '24 reportes',
    allowedRoles: ['admin', 'manager']
  },
  {
    id: 'contacts',
    title: 'Contactos',
    description: 'Gestión de contactos y agenda',
    icon: <Phone className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-teal-500 to-green-600',
    allowedRoles: ['admin', 'manager']
  },
  {
    id: 'users',
    title: 'Gestión de Usuarios',
    description: 'Administración de usuarios y permisos',
    icon: <UserCog className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-gray-600 to-gray-800',
    stats: '89 usuarios',
    allowedRoles: ['admin']
  },
  {
    id: 'settings',
    title: 'Configuración',
    description: 'Ajustes del sistema',
    icon: <Settings className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-gray-500 to-slate-600',
    allowedRoles: ['admin', 'manager', 'technician']
  },
  {
    id: 'support',
    title: 'Soporte',
    description: 'Centro de ayuda y documentación',
    icon: <Headphones className="text-white" size={24} />,
    gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    allowedRoles: ['admin', 'manager', 'technician']
  }
];
