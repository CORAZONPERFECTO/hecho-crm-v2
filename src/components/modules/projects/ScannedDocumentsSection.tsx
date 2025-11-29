
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Star,
  FileText,
  File,
  Download
} from 'lucide-react';
import { useProjectDocuments, ProjectDocument } from '@/hooks/useProjectDocuments';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentViewer from './DocumentViewer';

interface ScannedDocumentsSectionProps {
  projectId: string;
  userRole: 'admin' | 'technician' | 'manager';
}

const ScannedDocumentsSection: React.FC<ScannedDocumentsSectionProps> = ({
  projectId,
  userRole
}) => {
  const { documents, documentTypes, loading, deleteDocument } = useProjectDocuments(projectId);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const canManage = userRole === 'admin';

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.document_type_id === selectedType;
    return matchesSearch && matchesType;
  });

  const handleViewDocument = (document: ProjectDocument) => {
    setSelectedDocument(document);
  };

  const handleDownloadDocument = (document: ProjectDocument) => {
    // Crear enlace de descarga
    const link = window.document.createElement('a');
    link.href = `https://vwyquuwxhwgvzageqkww.supabase.co/storage/v1/object/public/project-scanned-documents/${document.file_path}`;
    link.download = document.name;
    link.click();
  };

  const handleDeleteDocument = async (document: ProjectDocument) => {
    if (!canManage) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el documento "${document.name}"?`
    );
    
    if (confirmed) {
      try {
        await deleteDocument(document.id, document.file_path);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (fileType.includes('image')) return <File className="h-4 w-4 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <File className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Escaneados
              <Badge variant="secondary">{documents.length}</Badge>
            </CardTitle>
            {canManage && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar documentos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {documentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de documentos */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay documentos escaneados</p>
              <p className="text-sm">
                {canManage 
                  ? 'Usa el botón "Subir Documento" para agregar archivos'
                  : 'Los administradores pueden subir documentos al proyecto'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.file_type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{document.name}</h4>
                        {document.is_key_document && (
                          <Star className="h-3 w-3 text-yellow-500 inline" />
                        )}
                      </div>
                    </div>
                  </div>

                  {document.document_type && (
                    <Badge 
                      variant="outline" 
                      className="text-xs mb-2"
                      style={{ borderColor: document.document_type.color }}
                    >
                      {document.document_type.name}
                    </Badge>
                  )}

                  {document.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    <div>Tamaño: {formatFileSize(document.file_size)}</div>
                    <div>Subido: {new Date(document.created_at).toLocaleDateString('es-DO')}</div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(document)}
                      className="flex-1 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(document)}
                      className="flex-1 text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Bajar
                    </Button>
                    {canManage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(document)}
                        className="text-red-600 hover:text-red-700 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      {showUploadDialog && (
        <DocumentUploadDialog
          projectId={projectId}
          documentTypes={documentTypes}
          onClose={() => setShowUploadDialog(false)}
        />
      )}

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
};

export default ScannedDocumentsSection;
