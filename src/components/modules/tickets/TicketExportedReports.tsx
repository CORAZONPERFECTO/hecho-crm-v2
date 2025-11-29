import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Calendar,
  User,
  Trash2,
  File,
  Archive
} from 'lucide-react';
import { useTicketExportedReports } from '@/hooks/useTicketExportedReports';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketExportedReportsProps {
  ticketId: string;
}

const TicketExportedReports: React.FC<TicketExportedReportsProps> = ({ ticketId }) => {
  const { reports, loading, downloadReport, deleteReport, refetch } = useTicketExportedReports(ticketId);

  useEffect(() => {
    const listener = (e: Event) => {
      const ev = e as CustomEvent<{ ticketId: string }>;
      if (ev.detail?.ticketId === ticketId) {
        refetch();
      }
    };
    window.addEventListener('ticket-exported-reports:updated', listener);
    return () => window.removeEventListener('ticket-exported-reports:updated', listener);
  }, [ticketId, refetch]);

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'word':
        return <File size={16} className="text-blue-500" />;
      case 'zip':
        return <Archive size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'word':
        return 'Word';
      case 'zip':
        return 'ZIP';
      default:
        return type.toUpperCase();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Reportes Exportados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Reportes Exportados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay reportes exportados para este ticket</p>
            <p className="text-gray-400 text-sm">Los reportes aparecerán aquí cuando exportes evidencias</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          Reportes Exportados ({reports.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getReportIcon(report.report_type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {report.file_name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {getReportTypeLabel(report.report_type)}
                    </Badge>
                  </div>
                  
                  {report.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {report.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{report.generated_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        {formatDistance(new Date(report.created_at), new Date(), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                    {report.file_size && (
                      <span>{formatFileSize(report.file_size)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(report)}
                  className="h-8 px-3"
                >
                  <Download size={14} className="mr-1" />
                  Descargar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteReport(report.id)}
                  className="h-8 px-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketExportedReports;