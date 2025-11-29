
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Image, X, Download } from 'lucide-react';
import { ProjectStepEvidence } from '@/hooks/useProjectTechnicalProcesses';
import { useIsMobile } from '@/hooks/use-mobile';

interface StepEvidenceDialogProps {
  stepProgressId: string;
  evidences: ProjectStepEvidence[];
  onClose: () => void;
  onUploadEvidence: (file: File, description?: string) => Promise<any>;
  canUpload: boolean;
}

const StepEvidenceDialog: React.FC<StepEvidenceDialogProps> = ({
  stepProgressId,
  evidences,
  onClose,
  onUploadEvidence,
  canUpload
}) => {
  const isMobile = useIsMobile();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await onUploadEvidence(selectedFile, description);
      setSelectedFile(null);
      setDescription('');
    } catch (error) {
      console.error('Error uploading evidence:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-16px)] max-w-none h-[calc(100vh-32px)] max-h-none m-2 overflow-hidden flex flex-col sm:w-[calc(100vw-32px)] sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:m-4">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-sm font-medium sm:text-base">Evidencias del Paso</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {/* Upload Section */}
          {canUpload && (
            <Card className="w-full">
              <CardContent className="p-3">
                <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                  Subir Nueva Evidencia
                </h4>
                
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="file" className="text-xs">Archivo</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>

                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                      {getFileIcon(selectedFile.type)}
                      <span className="flex-1 truncate min-w-0">{selectedFile.name}</span>
                      <span className="text-muted-foreground text-xs flex-shrink-0">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="h-5 w-5 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description" className="text-xs">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe brevemente la evidencia..."
                      className="mt-1 min-h-[50px] text-xs resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full gap-2 h-8 text-xs"
                    size="sm"
                  >
                    <Upload className="h-3 w-3" />
                    {uploading ? 'Subiendo...' : 'Subir Evidencia'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidences List */}
          <div className="w-full">
            <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">
              Evidencias Existentes ({evidences.length})
            </h4>
            
            {evidences.length === 0 ? (
              <Card className="w-full">
                <CardContent className="p-4 text-center text-muted-foreground">
                  <FileText className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No hay evidencias para este paso</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 w-full">
                {evidences.map((evidence) => (
                  <Card key={evidence.id} className="w-full">
                    <CardContent className="p-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getFileIcon(evidence.file_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-medium text-xs truncate">{evidence.file_name}</h5>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {evidence.file_size && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatFileSize(evidence.file_size)}
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0"
                                  onClick={() => {
                                    // En una implementación real, descargar el archivo
                                    console.log('Downloading:', evidence.file_path);
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {evidence.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{evidence.description}</p>
                            )}
                            
                            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                              <span>Por: {evidence.uploaded_by}</span>
                              <span>{new Date(evidence.created_at).toLocaleDateString('es-DO')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 pt-2 border-t">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full h-8 text-xs"
            size="sm"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepEvidenceDialog;
