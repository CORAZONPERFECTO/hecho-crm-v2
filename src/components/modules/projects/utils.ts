
import { Project } from './types';

export const generateProjectCode = (prefix: string = 'PROJ') => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
};

export const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: Project['status']) => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'paused':
      return 'Pausado';
    case 'completed':
      return 'Finalizado';
    default:
      return 'Sin estado';
  }
};

export const calculateProjectHealth = (project: Project) => {
  const now = new Date();
  const endDate = new Date(project.estimatedEndDate);
  const startDate = new Date(project.startDate);
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const timeProgress = Math.min(100, (elapsed / totalDuration) * 100);
  
  const budgetUsage = (project.executedAmount / project.assignedBudget) * 100;
  
  if (project.progress < timeProgress - 20 || budgetUsage > 90) {
    return 'critical';
  } else if (project.progress < timeProgress - 10 || budgetUsage > 75) {
    return 'warning';
  } else {
    return 'good';
  }
};

export const getFilteredProjects = (
  projects: Project[],
  filters: {
    status?: string;
    technician?: string;
    client?: string;
    dateRange?: { start: string; end: string };
  },
  searchTerm: string
) => {
  return projects.filter(project => {
    // Search filter
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectCode.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || filters.status === 'all' || project.status === filters.status;

    // Technician filter
    const matchesTechnician = !filters.technician || filters.technician === 'all' || 
      project.assignedTechnicians.includes(filters.technician) || project.manager === filters.technician;

    // Client filter
    const matchesClient = !filters.client || filters.client === 'all' || project.client === filters.client;

    // Date range filter
    const matchesDateRange = !filters.dateRange || (
      new Date(project.startDate) >= new Date(filters.dateRange.start) &&
      new Date(project.startDate) <= new Date(filters.dateRange.end)
    );

    return matchesSearch && matchesStatus && matchesTechnician && matchesClient && matchesDateRange;
  });
};
