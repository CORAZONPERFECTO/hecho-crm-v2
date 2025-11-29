
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Project } from './types';
import { getStatusColor, getStatusText, calculateProjectHealth } from './utils';

interface ProjectsListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  viewMode: 'grid' | 'list';
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, onSelectProject, viewMode }) => {
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'critical':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  if (viewMode === 'list') {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Proyecto</th>
                  <th className="text-left p-4 font-medium text-gray-700">Cliente</th>
                  <th className="text-left p-4 font-medium text-gray-700">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-700">Progreso</th>
                  <th className="text-left p-4 font-medium text-gray-700">Presupuesto</th>
                  <th className="text-left p-4 font-medium text-gray-700">Fecha Fin</th>
                  <th className="text-left p-4 font-medium text-gray-700">Salud</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const health = calculateProjectHealth(project);
                  return (
                    <tr 
                      key={project.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSelectProject(project)}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.projectCode}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{project.client}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Progress value={project.progress} className="w-20" />
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{formatCurrency(project.executedAmount)}</div>
                          <div className="text-gray-500">de {formatCurrency(project.assignedBudget)}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(project.estimatedEndDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {getHealthIcon(health)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => {
        const health = calculateProjectHealth(project);
        const budgetUsage = (project.executedAmount / project.assignedBudget) * 100;
        
        return (
          <Card 
            key={project.id} 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            onClick={() => onSelectProject(project)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.projectCode}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(health)}
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                </div>

                {/* Client and Location */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users size={14} />
                    <span>{project.client}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso</span>
                    <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Budget */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Presupuesto</span>
                    <span className="text-sm font-medium text-gray-900">{budgetUsage.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      {formatCurrency(project.executedAmount)} / {formatCurrency(project.assignedBudget)}
                    </span>
                  </div>
                </div>

                {/* End Date */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>Fin: {new Date(project.estimatedEndDate).toLocaleDateString()}</span>
                </div>

                {/* Team */}
                <div className="flex items-center space-x-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {project.assignedTechnicians.length} técnico(s)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProjectsList;
