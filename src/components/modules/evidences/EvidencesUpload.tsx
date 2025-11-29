
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, FileImage, X, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { correctImageOrientation } from '@/utils/evidence/imageOrientation';
import GoogleDriveImport from './GoogleDriveImport';

interface EvidencesUploadProps {
  onUploadComplete: () => void;
  userRole: 'admin' | 'technician' | 'manager';
}

const EvidencesUpload: React.FC<EvidencesUploadProps> = ({ 
  onUploadComplete, 
  userRole 
}) => {
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const uploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona archivos para subir",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        let file = selectedFiles[i];
        
        // Correct image orientation if it's an image
        if (file.type.startsWith('image/')) {
          try {
            file = await correctImageOrientation(file);
          } catch (error) {
            console.log('Could not correct image orientation, using original:', error);
          }
        }
        
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `evidences/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ticket-evidences')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ticket-evidences')
          .getPublicUrl(filePath);

        // Create evidence record
        const { error: insertError } = await supabase
          .from('ticket_evidences')
          .insert({
            ticket_id: '00000000-0000-0000-0000-000000000000', // Placeholder - will need proper ticket selection
            file_url: publicUrl,
            file_name: file.name,
            file_type: file.type,
            description: description || null,
            uploaded_by: 'Usuario Actual', // Should get from auth context
            sync_status: 'synced'
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Éxito",
        description: `${selectedFiles.length} archivo(s) subido(s) correctamente`
      });

      // Reset form
      setSelectedFiles(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Error al subir los archivos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleDriveImport = async (files: File[], description?: string) => {
    setSelectedFiles(null);
    if (description) {
      setDescription(description);
    }
    
    // Correct orientation for images from Google Drive
    const correctedFiles: File[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const correctedFile = await correctImageOrientation(file);
          correctedFiles.push(correctedFile);
        } catch (error) {
          console.log('Could not correct image orientation, using original:', error);
          correctedFiles.push(file);
        }
      } else {
        correctedFiles.push(file);
      }
    }
    
    // Convert File[] to FileList
    const dt = new DataTransfer();
    correctedFiles.forEach(file => dt.items.add(file));
    const fileList = dt.files;
    
    setSelectedFiles(fileList);
    await uploadFiles();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Subir Evidencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Options */}
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
                  <FileImage size={16} className="mr-2" />
                  Seleccionar Múltiples Archivos
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Mantén presionado Ctrl (PC) o Cmd (Mac) para seleccionar múltiples archivos
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
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
                  onChange={(e) => handleFileSelect(e.target.files)}
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

          {/* Selected Files */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div>
              <Label>Archivos Seleccionados</Label>
              <div className="mt-2 space-y-2">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const dt = new DataTransfer();
                        Array.from(selectedFiles).forEach((f, i) => {
                          if (i !== index) dt.items.add(f);
                        });
                        setSelectedFiles(dt.files.length > 0 ? dt.files : null);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agregar descripción de las evidencias..."
              rows={3}
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={uploadFiles}
            disabled={uploading || !selectedFiles}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {uploading ? 'Subiendo...' : 'Subir Evidencias'}
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">Información importante:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Se aceptan imágenes (JPG, PNG, GIF) y videos (MP4, MOV, AVI)</li>
              <li>Tamaño máximo por archivo: 500MB</li>
              <li>Puedes subir múltiples archivos a la vez (mantén Ctrl/Cmd para seleccionar varios)</li>
              <li>Las evidencias se sincronizarán automáticamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidencesUpload;
