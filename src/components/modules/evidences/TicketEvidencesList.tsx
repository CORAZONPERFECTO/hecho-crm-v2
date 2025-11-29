import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  FileImage, 
  Video, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  X,
  Eye,
  Share,
  RefreshCw,
  Check,
  List,
  Type,
  Palette,
  Settings
} from 'lucide-react';
import { useTicketEvidences } from '@/hooks/useTicketEvidences';
import { useEvidenceActions } from '@/hooks/useEvidenceActions';
import { useToast } from '@/hooks/use-toast';
import EvidenceActionsWithSave from './EvidenceActionsWithSave';
import EvidencesGallery from './EvidencesGallery';
import TicketExportedReports from '../tickets/TicketExportedReports';

interface TicketEvidencesListProps {
  ticketId: string;
  ticketNumber: string;
  ticketTitle?: string;
  clientName?: string;
  currentUser: string;
  userRole: 'admin' | 'technician' | 'manager';
}

const TicketEvidencesList: React.FC<TicketEvidencesListProps> = ({
  ticketId,
  ticketNumber,
  ticketTitle,
  clientName,
  currentUser,
  userRole
}) => {
  const { evidences, loading, uploading, uploadEvidence, updateDescription, updateFileName, deleteEvidence, refetch } = useTicketEvidences(ticketId);
  const { downloadSingleEvidence, shareEvidence } = useEvidenceActions();
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [reportDescription, setReportDescription] = useState('');
  const [reportDescriptionSaved, setReportDescriptionSaved] = useState(false);
  const [useBullets, setUseBullets] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [bulletStyle, setBulletStyle] = useState('•');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona archivos para subir",
        variant: "destructive"
      });
      return;
    }

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        await uploadEvidence(uploadFiles[i], uploadDescription, currentUser);
      }
      
      setShowUploadDialog(false);
      setUploadFiles(null);
      setUploadDescription('');
      
      toast({
        title: "Éxito",
        description: `${uploadFiles.length} evidencia(s) subida(s) correctamente`
      });
    } catch (error) {
      console.error('Error uploading evidences:', error);
    }
  };

  const handleSaveDescription = async (evidenceId: string) => {
    try {
      await updateDescription(evidenceId, newDescription);
      setEditingDescription(null);
      setNewDescription('');
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string, fileName: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia?')) return;
    
    try {
      await deleteEvidence(evidenceId, fileName);
      setSelectedEvidences(prev => prev.filter(id => id !== evidenceId));
    } catch (error) {
      console.error('Error deleting evidence:', error);
    }
  };

  const handleSelectEvidence = (evidenceId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvidences(prev => [...prev, evidenceId]);
    } else {
      setSelectedEvidences(prev => prev.filter(id => id !== evidenceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvidences(evidences.map(e => e.id));
    } else {
      setSelectedEvidences([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedEvidences([]);
  };

  const handleSaveReportDescription = async () => {
    try {
      setReportDescriptionSaved(true);
      toast({
        title: "Descripción guardada",
        description: "Descripción general guardada y reporte actualizado correctamente.",
        variant: "default"
      });
      
      // Auto hide the confirmation after 3 seconds
      setTimeout(() => {
        setReportDescriptionSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving report description:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la descripción del reporte",
        variant: "destructive"
      });
    }
  };

  const handleRefreshReport = async () => {
    try {
      await refetch();
      toast({
        title: "Reporte actualizado",
        description: "La vista previa del reporte se ha actualizado con los últimos cambios",
        variant: "default"
      });
    } catch (error) {
      console.error('Error refreshing report:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la vista previa del reporte",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Evidence Actions */}
      <EvidenceActionsWithSave
        evidences={evidences}
        selectedEvidences={evidences.filter(e => selectedEvidences.includes(e.id))}
        ticketNumber={ticketNumber}
        ticketId={ticketId}
        ticketTitle={ticketTitle}
        clientName={clientName}
        reportDescription={reportDescription}
        useBullets={useBullets}
        bulletStyle={bulletStyle}
        textColor={textColor}
      />

      {/* Report Description with Formatting Options */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <FileImage size={20} />
            Configuración del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content" className="flex items-center gap-1">
                <Type size={14} />
                Contenido
              </TabsTrigger>
              <TabsTrigger value="format" className="flex items-center gap-1">
                <Settings size={14} />
                Formato
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-3 mt-4">
              <Textarea
                value={reportDescription}
                onChange={(e) => {
                  setReportDescription(e.target.value);
                  setReportDescriptionSaved(false);
                }}
                placeholder="Escribe una descripción general que aparecerá en el reporte PDF y Word (opcional)..."
                rows={4}
                className="bg-white border-amber-200 focus:border-amber-400"
                style={{ color: textColor }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-amber-700">
                  Esta descripción aparecerá en la parte superior del reporte junto con el logo de la empresa.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefreshReport}
                    className="h-8 text-xs"
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Actualizar reporte
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveReportDescription}
                    className={`h-8 text-xs ${reportDescriptionSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {reportDescriptionSaved ? (
                      <>
                        <Check size={12} className="mr-1" />
                        Guardado
                      </>
                    ) : (
                      <>
                        <Save size={12} className="mr-1" />
                        Guardar descripción
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="format" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bullets Toggle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <List size={14} />
                    Viñetas
                  </label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useBullets"
                      checked={useBullets}
                      onCheckedChange={(checked) => setUseBullets(checked === true)}
                    />
                    <label htmlFor="useBullets" className="text-xs text-amber-700">
                      Usar viñetas en la descripción
                    </label>
                  </div>
                  {useBullets && (
                    <Select value={bulletStyle} onValueChange={setBulletStyle}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="•">• Punto</SelectItem>
                        <SelectItem value="◦">◦ Círculo</SelectItem>
                        <SelectItem value="▪">▪ Cuadrado</SelectItem>
                        <SelectItem value="→">→ Flecha</SelectItem>
                        <SelectItem value="1.">1. Numérico</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <Palette size={14} />
                    Color del texto
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-8 p-1 border rounded bg-white"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTextColor('#000000')}
                      className="h-8 text-xs"
                    >
                      Por defecto
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800">
                    Vista previa
                  </label>
                  <div className="bg-white p-2 border rounded text-xs min-h-[60px]">
                    {reportDescription ? (
                      <div style={{ color: textColor }}>
                        {useBullets ? (
                          reportDescription.split('\n').map((line, i) => (
                            line.trim() && (
                              <div key={i} className="flex items-start gap-1">
                                <span>{bulletStyle === '1.' ? `${i + 1}.` : bulletStyle}</span>
                                <span>{line.trim()}</span>
                              </div>
                            )
                          ))
                        ) : (
                          reportDescription
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        Escribe algo en el contenido para ver la vista previa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} />
              Evidencias del Ticket #{ticketNumber} ({evidences.length})
            </CardTitle>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus size={16} className="mr-2" />
                  Subir Evidencias
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Subir Nuevas Evidencias</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seleccionar Archivos
                    </label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descripción (opcional)
                    </label>
                    <Textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Agregar descripción de las evidencias..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpload} 
                      disabled={uploading || !uploadFiles}
                      className="flex-1"
                    >
                      {uploading ? 'Subiendo...' : 'Subir'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploadDialog(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {evidences.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay evidencias
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza subiendo fotos o videos de este ticket
              </p>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus size={16} className="mr-2" />
                Subir Primera Evidencia
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={selectedEvidences.length === evidences.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Seleccionar todo ({evidences.length} evidencias)
                </span>
                {selectedEvidences.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedEvidences.length} seleccionadas
                  </Badge>
                )}
              </div>

              {/* Evidence Gallery with Reordering and Editing */}
              <EvidencesGallery
                searchTerm=""
                filterType="all"
                filterTicket={ticketId}
                selectedEvidences={selectedEvidences}
                onSelectionChange={setSelectedEvidences}
                userRole={userRole}
                ticketId={ticketId}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exported Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Reportes Exportados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TicketExportedReports ticketId={ticketId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketEvidencesList;