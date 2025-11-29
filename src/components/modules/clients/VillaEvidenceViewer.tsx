import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Calendar, User, FileText, Edit, Save, X, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TicketEvidence } from '@/hooks/useTicketEvidences';
import { ClientVilla } from '@/hooks/useClientVillas';
import { useToast } from '@/hooks/use-toast';

interface VillaEvidenceViewerProps {
  villa: ClientVilla;
  userRole?: 'admin' | 'technician' | 'manager';
}

interface EvidenceWithTicket extends TicketEvidence {
  tickets?: {
    id: string;
    ticket_number: string;
    title: string;
    status: string;
    created_at: string;
  };
}

const VillaEvidenceViewer: React.FC<VillaEvidenceViewerProps> = ({ villa, userRole = 'admin' }) => {
  const [evidencesByTicket, setEvidencesByTicket] = useState<Record<string, EvidenceWithTicket[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceWithTicket | null>(null);
  const [editForm, setEditForm] = useState({ file_name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    const fetchVillaEvidences = async () => {
      try {
        const { data, error } = await supabase
          .from('ticket_evidences')
          .select(`
            *,
            tickets!inner(
              id,
              ticket_number,
              title,
              status,
              created_at
            )
          `)
          .eq('villa_id', villa.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Agrupar evidencias por ticket
        const grouped = (data || []).reduce((acc, evidence) => {
          const ticketId = evidence.ticket_id;
          if (!acc[ticketId]) {
            acc[ticketId] = [];
          }
          acc[ticketId].push(evidence as EvidenceWithTicket);
          return acc;
        }, {} as Record<string, EvidenceWithTicket[]>);

        setEvidencesByTicket(grouped);
      } catch (error) {
        console.error('Error fetching villa evidences:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las evidencias",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVillaEvidences();
  }, [villa.id, toast]);

  const handleEditEvidence = (evidence: EvidenceWithTicket) => {
    setEditingEvidence(evidence);
    setEditForm({
      file_name: evidence.file_name,
      description: evidence.description || ''
    });
  };

  const handleUpdateEvidence = async () => {
    if (!editingEvidence) return;

    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .update({
          file_name: editForm.file_name,
          description: editForm.description
        })
        .eq('id', editingEvidence.id);

      if (error) throw error;

      // Actualizar el estado local
      setEvidencesByTicket(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(ticketId => {
          updated[ticketId] = updated[ticketId].map(evidence =>
            evidence.id === editingEvidence.id
              ? { ...evidence, file_name: editForm.file_name, description: editForm.description }
              : evidence
          );
        });
        return updated;
      });

      setEditingEvidence(null);
      toast({
        title: "Éxito",
        description: "Evidencia actualizada correctamente"
      });
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la evidencia",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvidence = async (evidence: EvidenceWithTicket) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia?')) return;

    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .delete()
        .eq('id', evidence.id);

      if (error) throw error;

      // Actualizar el estado local
      setEvidencesByTicket(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(ticketId => {
          updated[ticketId] = updated[ticketId].filter(e => e.id !== evidence.id);
          if (updated[ticketId].length === 0) {
            delete updated[ticketId];
          }
        });
        return updated;
      });

      toast({
        title: "Éxito",
        description: "Evidencia eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evidencia",
        variant: "destructive"
      });
    }
  };

  const downloadAllEvidences = async () => {
    try {
      const allEvidences = Object.values(evidencesByTicket).flat();
      
      // Crear un ZIP con todas las evidencias
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      for (const evidence of allEvidences) {
        try {
          const response = await fetch(evidence.file_url);
          const blob = await response.blob();
          const fileName = `${evidence.tickets?.ticket_number || 'ticket'}_${evidence.file_name}`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Error downloading ${evidence.file_name}:`, error);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evidencias_${villa.villa_name}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Éxito",
        description: "Descarga iniciada"
      });
    } catch (error) {
      console.error('Error downloading evidences:', error);
      toast({
        title: "Error",
        description: "No se pudieron descargar las evidencias",
        variant: "destructive"
      });
    }
  };

  const generateEvidenceReport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Título del reporte
      doc.setFontSize(20);
      doc.text(`Reporte de Evidencias - ${villa.villa_name}`, 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Dirección: ${villa.address}`, 20, 45);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 55);
      
      let yPosition = 75;
      const allEvidences = Object.values(evidencesByTicket).flat();
      
      doc.text(`Total de evidencias: ${allEvidences.length}`, 20, yPosition);
      yPosition += 20;
      
      // Agrupar por ticket y agregar imágenes
      for (const [ticketId, evidences] of Object.entries(evidencesByTicket)) {
        const ticket = evidences[0]?.tickets;
        if (!ticket) continue;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(14);
        doc.text(`Ticket #${ticket.ticket_number} - ${ticket.title}`, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.text(`Estado: ${ticket.status}`, 20, yPosition);
        doc.text(`Fecha: ${new Date(ticket.created_at).toLocaleDateString()}`, 120, yPosition);
        yPosition += 15;
        
        // Filtrar solo imágenes para incluir en el PDF
        const imageEvidences = evidences.filter(evidence => evidence.file_type.startsWith('image/'));
        
        if (imageEvidences.length > 0) {
          doc.text(`Evidencias con imágenes (${imageEvidences.length}):`, 20, yPosition);
          yPosition += 10;
          
          for (let i = 0; i < imageEvidences.length; i++) {
            const evidence = imageEvidences[i];
            
            // Verificar si necesitamos una nueva página
            if (yPosition > 120) {
              doc.addPage();
              yPosition = 30;
            }
            
            try {
              // Cargar la imagen
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = evidence.file_url;
              });
              
              // Crear canvas para redimensionar la imagen con máxima calidad
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calcular dimensiones aún más grandes (25% más que la versión anterior)
              const maxWidth = 109.375; // era 87.5, ahora 25% más grande
              const maxHeight = 78.125; // era 62.5, ahora 25% más grande
              let { width, height } = img;
              
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
              
              // Usar resolución máxima para la mejor calidad posible
              const scale = 4; // Aumentado de 3 a 4 para máxima calidad
              canvas.width = width * scale;
              canvas.height = height * scale;
              ctx?.scale(scale, scale);
              
              // Configurar para la máxima calidad de imagen
              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
              }
              
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Usar máxima calidad de compresión
              const imgData = canvas.toDataURL('image/jpeg', 1.0); // Máxima calidad sin compresión
              
              // Agregar la imagen al PDF (lado izquierdo)
              doc.addImage(imgData, 'JPEG', 20, yPosition, width, height);
              
              // Información de la evidencia a la derecha de la imagen
              doc.setFontSize(10);
              const textStartX = 140; // Ajustado para la imagen más grande
              let textY = yPosition + 5;
              
              doc.setFontSize(12);
              doc.text(`Evidencia ${i + 1}:`, textStartX, textY);
              textY += 8;
              
              doc.setFontSize(10);
              doc.text(`Archivo: ${evidence.file_name}`, textStartX, textY);
              textY += 6;
              
              doc.text(`Fecha: ${new Date(evidence.created_at).toLocaleDateString()}`, textStartX, textY);
              textY += 6;
              
              doc.text(`Subido por: ${evidence.uploaded_by}`, textStartX, textY);
              textY += 6;
              
              if (evidence.description) {
                doc.text('Descripción:', textStartX, textY);
                textY += 5;
                
                const descLines = doc.splitTextToSize(evidence.description, 60); // Ajustado para el nuevo ancho
                doc.text(descLines, textStartX, textY);
                textY += descLines.length * 5;
              }
              
              // Actualizar yPosition para la siguiente imagen
              yPosition += Math.max(height + 20, textY - yPosition + 15);
              
            } catch (error) {
              console.error(`Error loading image ${evidence.file_name}:`, error);
              // Si hay error cargando la imagen, agregar solo el texto
              doc.setFontSize(12);
              doc.text(`Evidencia ${i + 1} - Error cargando imagen`, 20, yPosition);
              yPosition += 8;
              
              doc.setFontSize(10);
              doc.text(`Archivo: ${evidence.file_name}`, 20, yPosition);
              yPosition += 6;
              doc.text(`Fecha: ${new Date(evidence.created_at).toLocaleDateString()}`, 20, yPosition);
              yPosition += 6;
              doc.text(`Subido por: ${evidence.uploaded_by}`, 20, yPosition);
              yPosition += 15;
            }
          }
        }
        
        // Agregar información de videos (solo texto)
        const videoEvidences = evidences.filter(evidence => evidence.file_type.startsWith('video/'));
        if (videoEvidences.length > 0) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
          }
          
          doc.setFontSize(12);
          doc.text(`Videos (${videoEvidences.length}):`, 20, yPosition);
          yPosition += 10;
          
          videoEvidences.forEach((evidence, index) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 30;
            }
            
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${evidence.file_name}`, 25, yPosition);
            yPosition += 7;
            
            if (evidence.description) {
              const descLines = doc.splitTextToSize(`Descripción: ${evidence.description}`, 170);
              doc.text(descLines, 25, yPosition);
              yPosition += descLines.length * 5;
            }
            
            doc.text(`Subido por: ${evidence.uploaded_by}`, 25, yPosition);
            doc.text(`Fecha: ${new Date(evidence.created_at).toLocaleDateString()}`, 120, yPosition);
            yPosition += 10;
          });
        }
        
        yPosition += 10;
      }
      
      doc.save(`reporte_evidencias_${villa.villa_name}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Éxito",
        description: "Reporte PDF generado y descargado correctamente"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte PDF",
        variant: "destructive"
      });
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

  const totalEvidences = Object.values(evidencesByTicket).flat().length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera size={20} />
            <CardTitle>Historial de Evidencias - {villa.villa_name}</CardTitle>
            <Badge variant="outline">{totalEvidences} evidencias</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={downloadAllEvidences}>
              <Download size={16} className="mr-2" />
              Descargar ZIP
            </Button>
            <Button size="sm" variant="outline" onClick={generateEvidenceReport}>
              <FileText size={16} className="mr-2" />
              Reporte PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalEvidences === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay evidencias registradas para esta villa
          </div>
        ) : (
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">Galería</TabsTrigger>
              <TabsTrigger value="by-ticket">Por Ticket</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.values(evidencesByTicket).flat().map((evidence) => (
                    <Card key={evidence.id} className="overflow-hidden">
                      <div className="aspect-square relative">
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
                        {userRole === 'admin' && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditEvidence(evidence)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteEvidence(evidence)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2">
                        <div className="text-xs space-y-1">
                          <p className="font-medium truncate">{evidence.file_name}</p>
                          <p className="text-gray-500">
                            {new Date(evidence.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-blue-600">
                            Ticket #{evidence.tickets?.ticket_number}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="by-ticket" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {Object.entries(evidencesByTicket).map(([ticketId, evidences]) => {
                    const ticket = evidences[0]?.tickets;
                    return (
                      <Card key={ticketId}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                Ticket #{ticket?.ticket_number} - {ticket?.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {ticket?.created_at && new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                                <Badge variant={ticket?.status === 'abierto' ? 'destructive' : 'default'}>
                                  {ticket?.status}
                                </Badge>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {evidences.length} evidencia(s)
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {evidences.map((evidence) => (
                              <div key={evidence.id} className="aspect-square relative">
                                {evidence.file_type.startsWith('image/') ? (
                                  <img
                                    src={evidence.file_url}
                                    alt={evidence.file_name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <video
                                    src={evidence.file_url}
                                    className="w-full h-full object-cover rounded"
                                    controls
                                  />
                                )}
                                {userRole === 'admin' && (
                                  <div className="absolute top-1 right-1 flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditEvidence(evidence)}
                                    >
                                      <Edit size={10} />
                                    </Button>
                                  </div>
                                )}
                                {evidence.description && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                                    <FileText size={10} className="inline mr-1" />
                                    {evidence.description.substring(0, 20)}...
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {/* Dialog para editar evidencia */}
        <Dialog open={!!editingEvidence} onOpenChange={() => setEditingEvidence(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Evidencia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del archivo</label>
                <Input
                  value={editForm.file_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, file_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingEvidence(null)}>
                  <X size={16} className="mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleUpdateEvidence}>
                  <Save size={16} className="mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VillaEvidenceViewer;
