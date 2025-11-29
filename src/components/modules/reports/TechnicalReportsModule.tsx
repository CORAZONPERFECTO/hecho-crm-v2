import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit3, Trash2, Eye, Calendar } from 'lucide-react';
import { useTechnicalReports } from '@/hooks/useTechnicalReports';
import { CreateReportDialog } from './CreateReportDialog';
import { EditReportDialog } from './EditReportDialog';
import { ViewReportDialog } from './ViewReportDialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const TechnicalReportsModule: React.FC = () => {
  const { reports, loading, deleteReport } = useTechnicalReports();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrador': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'borrador': return 'Borrador';
      case 'finalizado': return 'Finalizado';
      case 'enviado': return 'Enviado';
      default: return status;
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      await deleteReport(reportId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reportes Técnicos</h2>
          <p className="text-muted-foreground">
            Gestiona todos tus reportes técnicos de manera centralizada
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Reportes</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Borradores</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'borrador').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Finalizados</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'finalizado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Este Mes</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => {
                    const reportDate = new Date(r.created_at);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && 
                           reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {report.report_number}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {getStatusText(report.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {report.general_description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {report.general_description}
                </p>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(report.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {Array.isArray(report.evidences) ? report.evidences.length : 0} evidencias
                </span>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingReport(report.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingReport(report.id)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay reportes</h3>
            <p className="text-muted-foreground mb-6">
              Comienza creando tu primer reporte técnico
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Reporte
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateReportDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      {editingReport && (
        <EditReportDialog 
          reportId={editingReport}
          open={!!editingReport} 
          onOpenChange={() => setEditingReport(null)} 
        />
      )}
      
      {viewingReport && (
        <ViewReportDialog 
          reportId={viewingReport}
          open={!!viewingReport} 
          onOpenChange={() => setViewingReport(null)} 
        />
      )}
    </div>
  );
};

export default TechnicalReportsModule;