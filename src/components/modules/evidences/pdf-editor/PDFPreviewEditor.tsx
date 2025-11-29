import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PDFPreviewCanvas } from './PDFPreviewCanvas';
import { PDFEditToolbar } from './PDFEditToolbar';
import { EvidenceCard } from './EvidenceCard';
import { useOrientation } from '@/hooks/useOrientation';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  FileText, 
  Download, 
  X, 
  Eye, 
  Edit3,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Evidence } from '@/utils/evidence/pdfGenerator';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface PDFPreviewEditorProps {
  open: boolean;
  onClose: () => void;
  evidences: Evidence[];
  metadata: {
    ticketNumber?: string;
    ticketTitle?: string;
    clientName?: string;
    description?: string;
  };
  onExport: (editedEvidences: Evidence[], editedMetadata: any, annotations: any[]) => Promise<{ blob?: Blob; fileName?: string } | void>;
  exportedPDF?: { blob: Blob; fileName: string } | null;
  onDownloadPDF?: (blob?: Blob, fileName?: string) => void;
}

export const PDFPreviewEditor: React.FC<PDFPreviewEditorProps> = ({
  open,
  onClose,
  evidences: initialEvidences,
  metadata: initialMetadata,
  onExport,
  exportedPDF,
  onDownloadPDF
}) => {
  const [evidences, setEvidences] = useState(initialEvidences);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const orientation = useOrientation();
  const isMobile = useIsMobile();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setEvidences(initialEvidences);
    setMetadata(initialMetadata);
    if (!selectedEvidence && initialEvidences && initialEvidences.length > 0) {
      setSelectedEvidence(initialEvidences[0]);
    }
  }, [initialEvidences, initialMetadata, selectedEvidence]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEvidences((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      toast.success('Orden actualizado');
    }
  };

  const handleUpdateEvidence = (id: string, updates: Partial<Evidence>) => {
    setEvidences(prev => 
      prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev)
    );
    toast.success('Evidencia actualizada');
  };

  const handleDeleteEvidence = (id: string) => {
    setEvidences(prev => prev.filter(ev => ev.id !== id));
    if (selectedEvidence?.id === id) {
      setSelectedEvidence(null);
    }
    toast.success('Evidencia eliminada');
  };

  const handleAddAnnotation = (evidenceId: string, annotation: any) => {
    setAnnotations(prev => [...prev, { evidenceId, ...annotation }]);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await Promise.resolve(onExport(evidences, metadata, annotations));
      
      if (result && typeof result === 'object' && 'blob' in result && 'fileName' in result) {
        setCanDownload(true);
        toast.success('PDF exportado correctamente');
        return result;
      }
      
      return undefined;
    } catch (error) {
      console.error('❌ Error en handleExport:', error);
      toast.error('No se pudo exportar el PDF');
      return undefined;
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadClick = async () => {
    console.log('🔥 PDFPreviewEditor: Iniciando descarga desde editor');
    
    if (isExporting) {
      toast.info('Espera a que termine la exportación actual');
      return;
    }

    try {
      let blob: Blob | undefined;
      let fileName: string | undefined;

      console.log('📁 Estado actual:', { 
        hasExportedPDF: !!exportedPDF,
        exportedPDFSize: exportedPDF?.blob?.size,
        exportedFileName: exportedPDF?.fileName
      });

      // Si ya existe un PDF exportado, úsalo
      if (exportedPDF?.blob && exportedPDF?.fileName) {
        console.log('✅ Usando PDF ya exportado');
        blob = exportedPDF.blob;
        fileName = exportedPDF.fileName;
      } else {
        console.log('🔄 Generando nuevo PDF...');
        // Si no, genera uno nuevo
        const result = await handleExport();
        if (result && typeof result === 'object' && 'blob' in result && 'fileName' in result) {
          blob = result.blob;
          fileName = result.fileName;
          console.log('✅ PDF generado:', { size: blob?.size, fileName });
        } else {
          console.error('❌ handleExport no devolvió resultado válido:', result);
        }
      }

      // Descargar
      if (blob && fileName) {
        console.log('⬇️ Llamando onDownloadPDF con:', { size: blob.size, fileName });
        if (onDownloadPDF) {
          onDownloadPDF(blob, fileName);
        } else {
          console.error('❌ onDownloadPDF no está definido');
          toast.error('Error: función de descarga no disponible');
        }
      } else {
        console.error('❌ Datos incompletos para descarga:', { blob: !!blob, fileName });
        toast.error('No se pudo obtener el PDF para descargar');
      }
    } catch (error) {
      console.error('❌ Error en handleDownloadClick:', error);
      toast.error('No se pudo descargar el PDF');
    }
  };

  const isLandscape = isMobile && orientation === 'landscape';
  const contentHeight = isLandscape ? 'calc(100vh - 60px)' : 'calc(95vh - 60px)';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="pdf-editor-desc" className={`p-0 gap-0 ${isLandscape ? 'max-w-[100vw] max-h-[100vh] w-screen h-screen' : 'max-w-[95vw] max-h-[95vh]'}`}>
        <DialogHeader className={`px-3 py-2 border-b ${isLandscape ? 'py-1.5' : 'py-3'}`}>
          <div className="flex items-center justify-between">
            <DialogTitle className={`flex items-center gap-2 ${isLandscape ? 'text-sm' : ''}`}>
              <Sparkles className={`text-primary ${isLandscape ? 'w-4 h-4' : 'w-5 h-5'}`} />
              {!isLandscape && 'Editor Visual de PDF'}
            </DialogTitle>
            <div className="flex items-center gap-1.5">
              {!isLandscape && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                >
                  {viewMode === 'edit' ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleDownloadClick}
                disabled={evidences.length === 0 || isExporting}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Download className={`${isLandscape ? 'w-3.5 h-3.5 mr-1' : 'w-4 h-4 mr-2'}`} />
                {!isLandscape && (isExporting ? 'Exportando…' : 'Exportar y Descargar')}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className={isLandscape ? 'h-7 w-7' : ''}>
                <X className={isLandscape ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <p id="pdf-editor-desc" className="sr-only">Editor visual de PDF con vista previa y anotaciones</p>
 
        <div className={`flex ${isLandscape ? 'flex-row' : 'flex-col lg:flex-row'}`} style={{ height: contentHeight }}>
          {/* Panel de Edición - Izquierda/Superior */}
          <div className={`border-r bg-muted/30 ${
            isLandscape 
              ? 'w-64 overflow-y-auto' 
              : 'w-full lg:w-96'
          }`}>
            <div className={isLandscape ? 'p-2' : ''}>
              <PDFEditToolbar
                metadata={metadata}
                onMetadataChange={setMetadata}
                totalEvidences={evidences.length}
              />
            </div>
            
            <ScrollArea className={isLandscape ? 'h-[calc(100%-100px)]' : 'h-[calc(100%-140px)]'}>
              <div className={`space-y-3 ${isLandscape ? 'p-2' : 'p-4'}`}>
                <h3 className={`font-semibold mb-2 ${isLandscape ? 'text-xs' : 'text-sm'}`}>
                  Evidencias ({evidences.length})
                </h3>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={evidences.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {evidences.map((evidence, index) => (
                      <EvidenceCard
                        key={evidence.id}
                        evidence={evidence}
                        index={index}
                        isSelected={selectedEvidence?.id === evidence.id}
                        onSelect={setSelectedEvidence}
                        onUpdate={handleUpdateEvidence}
                        onDelete={handleDeleteEvidence}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </ScrollArea>
          </div>

          {/* Vista Previa/Canvas - Derecha/Inferior */}
          <div className="flex-1 bg-background overflow-hidden">
            {viewMode === 'preview' ? (
              evidences.length > 0 ? (
                <ScrollArea className="h-full w-full">
                  <div className="p-4 space-y-6">
                    {evidences.map((ev, idx) => (
                      <div key={ev.id} className="border rounded-md overflow-hidden">
                        <div className="p-3 flex items-center justify-between bg-muted/30">
                          <div className="text-sm font-medium">Página {idx + 1}: {ev.file_name}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedEvidence(ev); setViewMode('edit'); }}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar esta
                          </Button>
                        </div>
                        <div className="p-3 flex items-center justify-center bg-card">
                          {ev.file_type?.startsWith('image/') ? (
                            <img
                              src={ev.file_url}
                              alt={`Vista previa ${ev.file_name}`}
                              className="max-h-[60vh] w-auto object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground py-10">
                              Vista previa no disponible para este tipo de archivo
                            </div>
                          )}
                        </div>
                        {ev.description && (
                          <div className="px-3 pb-3 text-sm text-muted-foreground">{ev.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 p-8">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Vista Previa del PDF</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        ⚠️ No hay evidencias seleccionadas
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : selectedEvidence ? (
              <PDFPreviewCanvas
                evidence={selectedEvidence}
                onAddAnnotation={(annotation) =>
                  handleAddAnnotation(selectedEvidence.id, annotation)
                }
                annotations={annotations.filter(a => a.evidenceId === selectedEvidence.id)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 p-8">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Selecciona una evidencia</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Haz clic en una evidencia para editarla, agregar anotaciones o ajustar su contenido
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
