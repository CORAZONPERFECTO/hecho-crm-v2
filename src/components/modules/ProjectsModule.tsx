import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  Grid3X3,
  List
} from 'lucide-react';
import { Project, ProjectsModuleProps } from './projects/types';
import { getFilteredProjects, generateProjectCode } from './projects/utils';
import { useSupabaseTechnicians } from '@/hooks/useSupabaseTechnicians';
import CreateProjectForm from './projects/CreateProjectForm';
import ProjectDetail from './projects/ProjectDetail';
import ProjectsList from './projects/ProjectsList';

const ProjectsModule: React.FC<ProjectsModuleProps> = ({ 
  userRole = 'admin',
  currentUser = 'Juan Pérez'
}) => {
  const { getActiveTechnicians, getActiveManagers, loading: techniciansLoading } = useSupabaseTechnicians();
  const activeTechnicians = getActiveTechnicians();
  const activeManagers = getActiveManagers();

  // Usar técnicos y gerentes reales de la configuración para los proyectos de ejemplo
  const getAssignedTechnicians = () => {
    const technicianNames = activeTechnicians.map(t => t.name);
    return technicianNames.length >= 3 ? technicianNames.slice(0, 3) : technicianNames;
  };

  const getProjectManager = () => {
    const managers = activeManagers;
    return managers.length > 0 ? managers[0].name : 'Sin gerente asignado';
  };

  const getAssignedTechniciansForProject2 = () => {
    const technicianNames = activeTechnicians.map(t => t.name);
    return technicianNames.length >= 2 ? technicianNames.slice(-2) : technicianNames;
  };

  const getProjectManager2 = () => {
    const managers = activeManagers;
    return managers.length > 1 ? managers[1].name : managers.length > 0 ? managers[0].name : 'Sin gerente asignado';
  };

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      projectCode: 'PROJ-202506-A001',
      name: 'Implementación Sistema ERP - Empresa ABC',
      description: 'Instalación y configuración completa del sistema ERP para gestión empresarial',
      client: 'Empresa ABC S.A.',
      location: 'Av. Principal 123, Santo Domingo',
      status: 'active',
      startDate: '2025-06-01',
      estimatedEndDate: '2025-09-15',
      assignedBudget: 150000,
      executedAmount: 85000,
      assignedTechnicians: getAssignedTechnicians(),
      manager: getProjectManager(),
      progress: 65,
      createdAt: '2025-06-01T10:00:00',
      updatedAt: '2025-06-15T14:30:00',
      documents: [
        {
          id: 'd1',
          name: 'Planos Técnicos',
          type: 'technical',
          fileName: 'planos_tecnicos.pdf',
          uploadedAt: '2025-06-02T09:00:00',
          uploadedBy: getProjectManager()
        }
      ],
      comments: [
        {
          id: 'c1',
          content: 'Fase de instalación completada exitosamente',
          author: getAssignedTechnicians()[0] || 'Técnico',
          createdAt: '2025-06-10T16:00:00',
          phase: 'Instalación'
        }
      ],
      milestones: [
        {
          id: 'm1',
          title: 'Análisis de Requerimientos',
          description: 'Completar análisis de todos los requerimientos del cliente',
          dueDate: '2025-06-15',
          completed: true,
          completedAt: '2025-06-14T10:00:00'
        },
        {
          id: 'm2',
          title: 'Instalación del Sistema',
          description: 'Instalar y configurar el sistema base',
          dueDate: '2025-07-15',
          completed: false
        }
      ]
    },
    {
      id: '2',
      projectCode: 'PROJ-202506-B002',
      name: 'Modernización Red Corporativa TechCorp',
      description: 'Actualización completa de la infraestructura de red de la empresa',
      client: 'TechCorp Solutions',
      location: 'Torre Empresarial, Piso 15, Santiago',
      status: 'paused',
      startDate: '2025-05-15',
      estimatedEndDate: '2025-08-30',
      assignedBudget: 200000,
      executedAmount: 45000,
      assignedTechnicians: getAssignedTechniciansForProject2(),
      manager: getProjectManager2(),
      progress: 25,
      createdAt: '2025-05-15T08:00:00',
      updatedAt: '2025-06-10T11:20:00',
      documents: [],
      comments: [
        {
          id: 'c2',
          content: 'Proyecto pausado temporalmente por solicitud del cliente',
          author: getProjectManager2(),
          createdAt: '2025-06-10T11:20:00',
          phase: 'Pausa'
        }
      ],
      milestones: []
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    technician: 'all',
    client: 'all'
  });

  const filteredProjects = getFilteredProjects(projects, filters, searchTerm);

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'documents' | 'comments' | 'milestones'>) => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      comments: [],
      milestones: []
    };

    setProjects(prev => [newProject, ...prev]);
    console.log('Nuevo proyecto creado:', newProject);
  };

  const getProjectStats = () => {
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const paused = projects.filter(p => p.status === 'paused').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.assignedBudget, 0);
    const totalExecuted = projects.reduce((sum, p) => sum + p.executedAmount, 0);
    
    return { active, completed, paused, totalBudget, totalExecuted };
  };

  const stats = getProjectStats();

  if (techniciansLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <ProjectDetail 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onShowEditForm={() => setShowEditForm(true)}
          onShowDocumentUpload={() => setShowDocumentUpload(true)}
        />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <CreateProjectForm 
          onClose={() => setShowCreateForm(false)}
          onCreateProject={handleCreateProject}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
          <p className="text-gray-600">
            Administra proyectos, seguimiento y recursos asignados
            {userRole === 'technician' && ' (Vista de Técnico)'}
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'manager') && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Proyectos Activos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Target size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completados</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <Calendar size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pausados</p>
                <p className="text-2xl font-bold">{stats.paused}</p>
              </div>
              <AlertTriangle size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Presupuesto Total</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-DO', {
                    style: 'currency',
                    currency: 'DOP',
                    maximumFractionDigits: 0
                  }).format(stats.totalBudget)}
                </p>
              </div>
              <DollarSign size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar proyectos por nombre, código o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-300"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Finalizado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.technician} onValueChange={(value) => setFilters(prev => ({ ...prev, technician: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {activeTechnicians.map(technician => (
                    <SelectItem key={technician.id} value={technician.name}>{technician.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Target size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron proyectos</h3>
            <p className="text-gray-500">
              {searchTerm || filters.status !== 'all' || filters.technician !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer proyecto'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProjectsList 
          projects={filteredProjects}
          onSelectProject={setSelectedProject}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

export default ProjectsModule;
