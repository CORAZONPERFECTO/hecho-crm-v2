
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  FileUp, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  MapPin,
  User,
  FileText,
  MessageSquare,
  CheckCircle2,
  Circle,
  Settings
} from 'lucide-react';
import { Project } from './types';
import ScannedDocumentsSection from './ScannedDocumentsSection';
import TechnicalProcessLine from './TechnicalProcessLine';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onShowEditForm: () => void;
  onShowDocumentUpload: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
  onShowEditForm,
  onShowDocumentUpload
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.projectCode}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onShowEditForm}>
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={onShowDocumentUpload}>
            <FileUp size={16} className="mr-2" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Status and Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold">{getStatusText(project.status)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Progreso</p>
              <div className="flex items-center space-x-2">
                <Progress value={project.progress} className="flex-1" />
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Presupuesto</p>
              <p className="font-semibold text-green-600">{formatCurrency(project.assignedBudget)}</p>
              <p className="text-xs text-gray-500">
                Ejecutado: {formatCurrency(project.executedAmount)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Vencimiento</p>
              <p className="font-semibold">{new Date(project.estimatedEndDate).toLocaleDateString('es-DO')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="technical-process">
            <Settings className="h-4 w-4 mr-1" />
            Procesos Técnicos
          </TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="milestones">Hitos</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Project Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Información del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descripción</p>
                  <p className="text-sm">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente</p>
                    <p className="text-sm">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gerente</p>
                    <p className="text-sm">{project.manager}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación
                  </p>
                  <p className="text-sm">{project.location}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fecha de Inicio</p>
                    <p className="text-sm">{new Date(project.startDate).toLocaleDateString('es-DO')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fecha Estimada</p>
                    <p className="text-sm">{new Date(project.estimatedEndDate).toLocaleDateString('es-DO')}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Progreso General</p>
                  <Progress value={project.progress} className="mb-1" />
                  <p className="text-xs text-gray-500">{project.progress}% completado</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen Financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(project.assignedBudget)}</p>
                  <p className="text-sm text-gray-600">Presupuesto Asignado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(project.executedAmount)}</p>
                  <p className="text-sm text-gray-600">Monto Ejecutado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(project.assignedBudget - project.executedAmount)}
                  </p>
                  <p className="text-sm text-gray-600">Saldo Disponible</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Ejecución Presupuestaria</span>
                  <span>{Math.round((project.executedAmount / project.assignedBudget) * 100)}%</span>
                </div>
                <Progress 
                  value={(project.executedAmount / project.assignedBudget) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical-process">
          <TechnicalProcessLine 
            projectId={project.id}
            userRole="admin" // En una implementación real, esto vendría del contexto de usuario
            currentUser="Juan Pérez" // En una implementación real, esto vendría del contexto de usuario
          />
        </TabsContent>

        <TabsContent value="documents">
          <ScannedDocumentsSection 
            projectId={project.id}
            userRole="admin" // En una implementación real, esto vendría del contexto de usuario
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipo del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <User className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{project.manager}</p>
                    <p className="text-sm text-gray-600">Gerente del Proyecto</p>
                  </div>
                  <Badge variant="secondary">Gerente</Badge>
                </div>
                
                {project.assignedTechnicians.map((technician, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <User className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{technician}</p>
                      <p className="text-sm text-gray-600">Técnico Asignado</p>
                    </div>
                    <Badge variant="outline">Técnico</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hitos del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.milestones.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay hitos definidos para este proyecto</p>
              ) : (
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      {milestone.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-medium ${milestone.completed ? 'text-green-700' : 'text-gray-900'}`}>
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Fecha límite: {new Date(milestone.dueDate).toLocaleDateString('es-DO')}</span>
                          {milestone.completed && milestone.completedAt && (
                            <span>Completado: {new Date(milestone.completedAt).toLocaleDateString('es-DO')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentarios del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay comentarios en este proyecto</p>
              ) : (
                <div className="space-y-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <div className="flex items-center space-x-2">
                          {comment.phase && (
                            <Badge variant="outline" className="text-xs">{comment.phase}</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('es-DO')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
