
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Trash2, Download, Edit2, Save, X, Cloud } from 'lucide-react';
import { useTicketEvidences, TicketEvidence } from '@/hooks/useTicketEvidences';
import { supabase } from '@/integrations/supabase/client';
import GoogleDriveImport from '../evidences/GoogleDriveImport';

interface EvidenceUploadProps {
  ticketId: string;
  currentUser: string;
  onClose?: () => void;
}

const EvidenceUpload: React.FC<EvidenceUploadProps> = ({ 
  ticketId, 
  currentUser,
  onClose 
}) => {
  const { evidences, loading, uploading, uploadEvidence, updateDescription, deleteEvidence } = useTicketEvidences(ticketId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [ticketVilla, setTicketVilla] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch ticket villa information
  useEffect(() => {
    const fetchTicketInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('villa_id')
          .eq('id', ticketId)
          .single();

        if (error) throw error;
        setTicketVilla(data.villa_id);
      } catch (error) {
        console.error('Error fetching ticket info:', error);
      }
    };

    fetchTicketInfo();
  }, [ticketId]);

  const handleFileUpload = async (files: FileList | null, description: string = '') => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        try {
          await uploadEvidence(file, description, currentUser, ticketVilla);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    }
  };

  const handleGoogleDriveImport = async (files: File[], description?: string) => {
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        try {
          await uploadEvidence(file, description || '', currentUser, ticketVilla);
        } catch (error) {
          console.error('Error importing file from Google Drive:', error);
        }
      }
    }
  };

  const handleEditDescription = (evidence: TicketEvidence) => {
    setEditingId(evidence.id);
    setEditDescription(evidence.description || '');
  };

  const handleSaveDescription = async () => {
    if (editingId) {
      await updateDescription(editingId, editDescription);
      setEditingId(null);
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  const downloadEvidence = (evidence: TicketEvidence) => {
    const link = document.createElement('a');
    link.href = evidence.file_url;
    link.download = evidence.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSyncStatusBadge = (status: TicketEvidence['sync_status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-green-600">Sincronizado</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando evidencias...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Camera size={20} />
            Evidencias del Ticket
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">Dispositivo</TabsTrigger>
            <TabsTrigger value="camera">Cámara</TabsTrigger>
            <TabsTrigger value="drive">Google Drive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-4">
            <div>
              <Label>Subir desde Galería</Label>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full mt-2"
                variant="outline"
              >
                <Upload size={16} className="mr-2" />
                {uploading ? 'Subiendo...' : 'Seleccionar Archivos'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="camera" className="space-y-4">
            <div>
              <Label>Tomar Foto</Label>
              <Button
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="w-full mt-2"
                variant="outline"
              >
                <Camera size={16} className="mr-2" />
                Abrir Cámara
              </Button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="drive" className="space-y-4">
            <GoogleDriveImport 
              onFilesImported={handleGoogleDriveImport}
              disabled={uploading}
            />
          </TabsContent>
        </Tabs>

        {/* Evidences List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Evidencias Subidas ({evidences.length})
            </h3>
          </div>
          
          {evidences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay evidencias subidas aún
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidences.map((evidence) => (
                  <Card key={evidence.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      {evidence.file_type.startsWith('image/') ? (
                        <img
                          src={evidence.file_url}
                          alt={evidence.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={evidence.file_url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        {getSyncStatusBadge(evidence.sync_status)}
                      </div>
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Archivo</Label>
                        <p className="text-sm font-medium truncate">{evidence.file_name}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Descripción</Label>
                        {editingId === evidence.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Agregar descripción..."
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveDescription}>
                                <Save size={14} className="mr-1" />
                                Guardar
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X size={14} className="mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-700 flex-1">
                              {evidence.description || 'Sin descripción'}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditDescription(evidence)}
                            >
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>Subido por: {evidence.uploaded_by}</p>
                        <p>{new Date(evidence.created_at).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadEvidence(evidence)}
                        >
                          <Download size={14} className="mr-1" />
                          Descargar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteEvidence(evidence.id, evidence.file_url)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {evidences.length > 0 && (
          <div className="flex justify-center">
            <Button className="bg-green-600 hover:bg-green-700">
              Finalizar y Enviar Evidencias
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvidenceUpload;
