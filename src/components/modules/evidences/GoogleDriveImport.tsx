import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Cloud, FileImage, FileVideo, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  size?: string;
}

interface GoogleDriveImportProps {
  onFilesImported: (files: File[], description?: string) => Promise<void>;
  disabled?: boolean;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const GoogleDriveImport: React.FC<GoogleDriveImportProps> = ({ 
  onFilesImported, 
  disabled = false 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([]);
  const [description, setDescription] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Google Drive API configuration
  const [apiConfig, setApiConfig] = useState<{
    apiKey: string;
    clientId: string;
    discoveryDoc: string;
    scopes: string;
  } | null>(null);

  useEffect(() => {
    loadApiConfig();
  }, []);

  const loadApiConfig = async () => {
    try {
      const response = await fetch('https://vwyquuwxhwgvzageqkww.supabase.co/functions/v1/google-drive-config', {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eXF1dXd4aHdndnphZ2Vxa3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjM2NjIsImV4cCI6MjA2NTUzOTY2Mn0.6w0tmrBHepALflRV0635D-CgLWtF5eikHfvAY275zVI`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load Google Drive configuration');
      }

      const config = await response.json();
      setApiConfig(config);
      loadGoogleAPI(config);
    } catch (error) {
      console.error('Error loading API config:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de Google Drive",
        variant: "destructive"
      });
    }
  };

  const loadGoogleAPI = async (config: any) => {
    if (!config) return;
    
    // Load Google API
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => initializeGapi(config);
      document.body.appendChild(script);
    } else {
      initializeGapi(config);
    }
  };

  const initializeGapi = async (config: any) => {
    try {
      await window.gapi.load('client:auth2', async () => {
        await window.gapi.client.init({
          apiKey: config.apiKey,
          clientId: config.clientId,
          discoveryDocs: [config.discoveryDoc],
          scope: config.scopes
        });

        const authInstance = window.gapi.auth2.getAuthInstance();
        setIsAuthenticated(authInstance.isSignedIn.get());
      });
    } catch (error) {
      console.error('Error initializing Google API:', error);
      toast({
        title: "Error",
        description: "No se pudo inicializar la API de Google Drive",
        variant: "destructive"
      });
    }
  };

  const signIn = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsAuthenticated(true);
      loadDriveFiles();
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión en Google Drive",
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsAuthenticated(false);
      setDriveFiles([]);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const loadDriveFiles = async () => {
    setIsLoading(true);
    try {
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType contains 'image/' or mimeType contains 'video/'",
        fields: 'files(id,name,mimeType,thumbnailLink,webContentLink,size)',
        pageSize: 50
      });

      setDriveFiles(response.result.files || []);
    } catch (error) {
      console.error('Error loading Drive files:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos de Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileSelection = (file: GoogleDriveFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const downloadFileFromDrive = async (file: GoogleDriveFile): Promise<File> => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${file.name}`);
    }

    const blob = await response.blob();
    return new File([blob], file.name, { type: file.mimeType });
  };

  const importSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona al menos un archivo",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const downloadedFiles: File[] = [];
      
      for (const driveFile of selectedFiles) {
        const file = await downloadFileFromDrive(driveFile);
        downloadedFiles.push(file);
      }

      await onFilesImported(downloadedFiles, description);
      
      toast({
        title: "Éxito",
        description: `${downloadedFiles.length} archivo(s) importado(s) desde Google Drive`
      });

      // Reset selection
      setSelectedFiles([]);
      setDescription('');
    } catch (error) {
      console.error('Error importing files:', error);
      toast({
        title: "Error",
        description: "Error al importar archivos desde Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-4 h-4" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="w-4 h-4" />;
    }
    return <FileImage className="w-4 h-4" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Cloud className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Importar desde Google Drive</h3>
          <p className="text-gray-600 mb-4">
            Conecta tu cuenta de Google Drive para importar imágenes y videos
          </p>
          <Button onClick={signIn} disabled={disabled} className="bg-blue-600 hover:bg-blue-700">
            <Cloud className="w-4 h-4 mr-2" />
            Conectar Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Google Drive
          </h3>
          <Button variant="outline" size="sm" onClick={signOut}>
            Desconectar
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando archivos...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Label>Archivos en Google Drive</Label>
              <ScrollArea className="h-64 mt-2 border rounded">
                <div className="p-2 space-y-2">
                  {driveFiles.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No se encontraron imágenes o videos
                    </p>
                  ) : (
                    driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                          selectedFiles.some(f => f.id === file.id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleFileSelection(file)}
                      >
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            {getFileIcon(file.mimeType)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        {selectedFiles.some(f => f.id === file.id) && (
                          <Badge variant="default" className="bg-blue-500">
                            Seleccionado
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Archivos seleccionados ({selectedFiles.length})</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedFiles.map((file) => (
                      <Badge key={file.id} variant="outline" className="flex items-center gap-1">
                        {file.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => toggleFileSelection(file)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="drive-description">Descripción (opcional)</Label>
                  <Textarea
                    id="drive-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Agregar descripción para los archivos importados..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={importSelectedFiles}
                  disabled={isImporting || disabled}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isImporting ? (
                    <>
                      <Download className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Importar {selectedFiles.length} archivo(s)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleDriveImport;