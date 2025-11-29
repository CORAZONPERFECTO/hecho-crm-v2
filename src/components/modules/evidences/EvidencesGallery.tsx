import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  FileText,
  ExternalLink,
  Camera,
  RotateCw,
  RotateCcw,
  Flag,
  GripVertical,
  Save,
  X,
  Palette
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getImageOrientationFromUrl, getTransformFromOrientation } from '@/utils/evidence/imageOrientation';
import OrientationCorrectImage from './OrientationCorrectImage';
import { EditEvidenceDialog } from './EditEvidenceDialog';
import ImageEditor from './ImageEditor';

// Importaciones para Drag & Drop
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Evidence {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
  villa_id?: string;
  display_order: number;
  manual_rotation?: number;
  tickets?: {
    id: string;
    ticket_number: string;
    title: string;
    status: string;
  };
}

interface EvidencesGalleryProps {
  searchTerm: string;
  filterType: string;
  filterTicket: string;
  selectedEvidences: string[];
  onSelectionChange: (selected: string[]) => void;
  userRole: 'admin' | 'technician' | 'manager';
  ticketId?: string; // ID específico del ticket para filtrar evidencias
}

interface SortableEvidenceCardProps {
  evidence: Evidence;
  index: number;
  isSelected: boolean;
  userRole: string;
  rotation: number;
  isFlagged: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRotate: (direction: 'left' | 'right') => void;
  onToggleFlag: () => void;
  onEditImage: () => void;
  onRename: () => void;
}

// Componente de tarjeta sorteable
const SortableEvidenceCard: React.FC<SortableEvidenceCardProps> = ({
  evidence,
  index,
  isSelected,
  userRole,
  rotation,
  isFlagged,
  onSelect,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onRotate,
  onToggleFlag,
  onEditImage,
  onRename
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: evidence.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayName = `Foto ${index + 1}`;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
        {/* Drag Handle */}
        <div 
          className="absolute top-2 left-8 z-20 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <div className="bg-white/95 rounded p-1 shadow-sm border border-gray-200">
            <GripVertical size={14} className="text-gray-600" />
          </div>
        </div>

        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Media Preview */}
        <div className="aspect-square relative cursor-zoom-in" onClick={onView} role="button" aria-label={`Ver ${displayName}`}>
          {evidence.file_type.startsWith('image/') ? (
            <OrientationCorrectImage
              src={evidence.file_url}
              alt={displayName}
              className="w-full h-full object-cover"
              manualRotation={rotation}
            />
          ) : (
            <video
              src={evidence.file_url}
              className="w-full h-full object-cover"
              muted
            />
          )}
          
          {/* Sync Status */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant={evidence.sync_status === 'synced' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {evidence.sync_status === 'synced' ? 'Sincronizado' : 
               evidence.sync_status === 'pending' ? 'Pendiente' : 'Error'}
            </Badge>
          </div>

          {/* Flag Button */}
          <div className="absolute top-2 right-12 z-20">
            <Button
              size="sm"
              variant={isFlagged ? "default" : "ghost"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFlag();
              }}
              className="h-8 w-8 p-0 bg-white/95 hover:bg-white shadow-sm border border-gray-200"
            >
              <Flag size={14} className={isFlagged ? "text-red-500 fill-red-500" : "text-gray-600"} />
            </Button>
          </div>

          {/* Rotation Controls for Images */}
          {evidence.file_type.startsWith('image/') && (
            <div className="absolute bottom-2 left-2 z-20 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRotate('left');
                }}
                className="h-8 w-8 p-0 bg-white/95 hover:bg-white shadow-sm border border-gray-200"
              >
                <RotateCcw size={14} className="text-gray-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRotate('right');
                }}
                className="h-8 w-8 p-0 bg-white/95 hover:bg-white shadow-sm border border-gray-200"
              >
                <RotateCw size={14} className="text-gray-600" />
              </Button>
            </div>
          )}

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onView}
            >
              <Eye size={14} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onDownload}
            >
              <Download size={14} />
            </Button>
            {evidence.file_type.startsWith('image/') && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onEditImage}
                title="Editar imagen"
              >
                <Palette size={14} />
              </Button>
            )}
            {userRole === 'admin' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onEdit}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                >
                  <Trash2 size={14} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Evidence Info */}
        <CardContent className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate" title={displayName}>
                {displayName}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRename}
                className="h-6 w-6 p-0"
                title="Renombrar"
              >
                <Edit size={12} />
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              {evidence.description ? (
                <p className="text-xs text-gray-600 truncate flex-1" title={evidence.description}>
                  {evidence.description}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic flex-1">Sin descripción</p>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-5 w-5 p-0 flex-shrink-0"
                title="Editar descripción"
              >
                <FileText size={10} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(evidence.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <User size={12} />
              {evidence.uploaded_by}
            </div>
          </div>

          {evidence.tickets && (
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                #{evidence.tickets.ticket_number}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                title="Ver ticket"
              >
                <ExternalLink size={12} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EvidencesGallery: React.FC<EvidencesGalleryProps> = ({
  searchTerm,
  filterType,
  filterTicket,
  selectedEvidences,
  onSelectionChange,
  userRole,
  ticketId
}) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingEvidence, setViewingEvidence] = useState<Evidence | null>(null);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [flaggedEvidences, setFlaggedEvidences] = useState<string[]>([]);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [editingImageEvidence, setEditingImageEvidence] = useState<Evidence | null>(null);
  const [renamingEvidence, setRenamingEvidence] = useState<Evidence | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchEvidences();
  }, [searchTerm, filterType, filterTicket]);

  useEffect(() => {
    // Cargar rotaciones guardadas cuando se cargan las evidencias
    if (evidences.length > 0) {
      console.log('🔍 Loading saved rotations for evidences:', evidences.length);
      const savedRotations: Record<string, number> = {};
      evidences.forEach(evidence => {
        if (evidence.manual_rotation && evidence.manual_rotation !== 0) {
          savedRotations[evidence.id] = evidence.manual_rotation;
          console.log(`📸 Evidence ${evidence.id} has saved rotation: ${evidence.manual_rotation}`);
        }
      });
      console.log('🔄 Setting rotations:', savedRotations);
      setRotations(savedRotations);
    }
  }, [evidences]);

  const fetchEvidences = async () => {
    try {
      let query = supabase
        .from('ticket_evidences')
        .select(`
          *,
          tickets!inner(
            id,
            ticket_number,
            title,
            status
          )
        `)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`file_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        if (filterType === 'image') {
          query = query.like('file_type', 'image%');
        } else if (filterType === 'video') {
          query = query.like('file_type', 'video%');
        }
      }

      if (filterTicket && filterTicket !== 'all') {
        if (filterTicket === 'recent') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('created_at', weekAgo.toISOString());
        } else {
          // Filter by specific ticket ID
          query = query.eq('ticket_id', filterTicket);
        }
      }

      // Si ticketId está especificado, filtrar solo por ese ticket
      if (ticketId) {
        query = query.eq('ticket_id', ticketId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match our Evidence interface
      const transformedData: Evidence[] = (data || []).map(item => ({
        ...item,
        sync_status: (item.sync_status as 'pending' | 'synced' | 'failed') || 'synced',
        display_order: item.display_order || 1,
        manual_rotation: item.manual_rotation || 0
      }));
      
      setEvidences(transformedData);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evidencias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = evidences.findIndex(evidence => evidence.id === active.id);
    const newIndex = evidences.findIndex(evidence => evidence.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newEvidences = arrayMove(evidences, oldIndex, newIndex);
    setEvidences(newEvidences);

    // Actualizar orden en la base de datos
    try {
      const updates = newEvidences.map((evidence, index) => ({
        id: evidence.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('ticket_evidences')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Éxito",
        description: "Orden de evidencias actualizado correctamente"
      });
    } catch (error) {
      console.error('Error updating evidence order:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden",
        variant: "destructive"
      });
      // Revertir cambios locales
      fetchEvidences();
    }
  };

  const handleSelectEvidence = (evidenceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEvidences, evidenceId]);
    } else {
      onSelectionChange(selectedEvidences.filter(id => id !== evidenceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(evidences.map(e => e.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleDeleteEvidence = async (evidence: Evidence) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia?')) return;

    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .delete()
        .eq('id', evidence.id);

      if (error) throw error;

      setEvidences(prev => prev.filter(e => e.id !== evidence.id));
      onSelectionChange(selectedEvidences.filter(id => id !== evidence.id));
      
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

  const downloadEvidence = (evidence: Evidence) => {
    const link = document.createElement('a');
    link.href = evidence.file_url;
    link.download = `Foto ${evidences.findIndex(e => e.id === evidence.id) + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewEvidence = (evidence: Evidence) => {
    setViewingEvidence(evidence);
  };
  const handleEditEvidence = (evidence: Evidence) => {
    setEditingEvidence(evidence);
    setEditDialogOpen(true);
  };

  const handleSaveEvidence = (updatedEvidence: Evidence) => {
    setEvidences(prev => 
      prev.map(e => e.id === updatedEvidence.id ? updatedEvidence : e)
    );
    setEditingEvidence(null);

    // Refrescar evidencias para asegurar sincronización
    setTimeout(() => {
      fetchEvidences();
    }, 100);
  };

  const handleRotateImage = async (evidenceId: string, direction: 'left' | 'right') => {
    console.log('🔄 Rotating image:', evidenceId, direction);
    
    setRotations(prev => {
      const currentRotation = prev[evidenceId] || 0;
      const newRotation = direction === 'right' 
        ? (currentRotation + 90) % 360 
        : (currentRotation - 90 + 360) % 360;
      
      console.log('🔄 New rotation:', newRotation);
      
      // Guardar la rotación en la base de datos
      updateEvidenceRotation(evidenceId, newRotation);
      
      return { ...prev, [evidenceId]: newRotation };
    });
  };

  const updateEvidenceRotation = async (evidenceId: string, rotation: number) => {
    try {
      console.log('💾 Saving rotation to DB:', evidenceId, rotation);
      const { error } = await supabase
        .from('ticket_evidences')
        .update({ manual_rotation: rotation })
        .eq('id', evidenceId);

      if (error) {
        console.error('❌ Error updating rotation:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la rotación de la imagen",
          variant: "destructive"
        });
      } else {
        console.log('✅ Rotation saved successfully');
      }
    } catch (error) {
      console.error('❌ Error updating rotation:', error);
      toast({
        title: "Error", 
        description: "No se pudo guardar la rotación de la imagen",
        variant: "destructive"
      });
    }
  };

  const handleToggleFlag = (evidenceId: string) => {
    setFlaggedEvidences(prev => {
      const isFlagged = prev.includes(evidenceId);
      return isFlagged 
        ? prev.filter(id => id !== evidenceId)
        : [...prev, evidenceId];
    });
  };

  const handleEditImage = (evidence: Evidence) => {
    console.log('🔧 EvidencesGallery: Abriendo editor de imagen para evidencia:', {
      evidenceId: evidence.id,
      fileName: evidence.file_name,
      fileUrl: evidence.file_url,
      fileType: evidence.file_type,
      urlExists: !!evidence.file_url,
      urlLength: evidence.file_url?.length
    });
    
    setEditingImageEvidence(evidence);
    setImageEditorOpen(true);
  };

  const handleSaveEditedImage = async (editedImageBlob: Blob, fileName: string) => {
    if (!editingImageEvidence) return;

    try {
      // Subir la imagen editada a Supabase Storage
      const fileExt = fileName.split('.').pop();
      const filePath = `${editingImageEvidence.ticket_id}/${Date.now()}_${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-evidences')
        .upload(filePath, editedImageBlob);

      if (uploadError) throw uploadError;

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('ticket-evidences')
        .getPublicUrl(filePath);

      // Actualizar la evidencia en la base de datos
      const { error: updateError } = await supabase
        .from('ticket_evidences')
        .update({
          file_url: publicUrl,
          file_name: fileName
        })
        .eq('id', editingImageEvidence.id);

      if (updateError) throw updateError;

      // Actualizar estado local
      setEvidences(prev =>
        prev.map(e =>
          e.id === editingImageEvidence.id
            ? { ...e, file_url: publicUrl, file_name: fileName }
            : e
        )
      );

      setEditingImageEvidence(null);
    } catch (error) {
      console.error('Error saving edited image:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la imagen editada",
        variant: "destructive"
      });
    }
  };

  const handleRenameEvidence = (evidence: Evidence) => {
    setRenamingEvidence(evidence);
    setNewFileName(`Foto ${evidences.findIndex(e => e.id === evidence.id) + 1}`);
    setRenameDialogOpen(true);
  };

  const handleSaveRename = async () => {
    if (!renamingEvidence || !newFileName.trim()) return;

    try {
      const { error } = await supabase
        .from('ticket_evidences')
        .update({ file_name: newFileName.trim() })
        .eq('id', renamingEvidence.id);

      if (error) throw error;

      // Actualizar evidencias localmente
      setEvidences(prev =>
        prev.map(e =>
          e.id === renamingEvidence.id
            ? { ...e, file_name: newFileName.trim() }
            : e
        )
      );

      setRenameDialogOpen(false);
      setRenamingEvidence(null);
      setNewFileName('');

      toast({
        title: "Éxito",
        description: "Nombre actualizado correctamente"
      });

      // Refrescar evidencias para asegurar sincronización
      setTimeout(() => {
        fetchEvidences();
      }, 100);
    } catch (error) {
      console.error('Error renaming evidence:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse"></div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All */}
      {evidences.length > 0 && (
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
      )}

      {/* Evidence Grid */}
      {evidences.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron evidencias
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros o subir nuevas evidencias
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={evidences.map(e => e.id)}
              strategy={undefined}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {evidences.map((evidence, index) => (
                  <SortableEvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    index={index}
                    isSelected={selectedEvidences.includes(evidence.id)}
                    userRole={userRole}
                    rotation={rotations[evidence.id] || evidence.manual_rotation || 0}
                    isFlagged={flaggedEvidences.includes(evidence.id)}
                    onSelect={(checked) => handleSelectEvidence(evidence.id, checked)}
                    onView={() => handleViewEvidence(evidence)}
                    onDownload={() => downloadEvidence(evidence)}
                    onEdit={() => handleEditEvidence(evidence)}
                    onDelete={() => handleDeleteEvidence(evidence)}
                    onRotate={(direction) => handleRotateImage(evidence.id, direction)}
                    onToggleFlag={() => handleToggleFlag(evidence.id)}
                    onEditImage={() => handleEditImage(evidence)}
                    onRename={() => handleRenameEvidence(evidence)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      )}

      {/* Edit Evidence Dialog */}
      <EditEvidenceDialog
        evidence={editingEvidence}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingEvidence(null);
        }}
        onSave={handleSaveEvidence}
      />

      {/* View Evidence Dialog */}
      <Dialog open={!!viewingEvidence} onOpenChange={(open) => { if (!open) setViewingEvidence(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          {viewingEvidence && (
            <div className="space-y-3">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {viewingEvidence.file_type.startsWith('image/') ? (
                  <OrientationCorrectImage
                    src={viewingEvidence.file_url}
                    alt={viewingEvidence.file_name}
                    className="w-full h-full object-contain"
                    manualRotation={rotations[viewingEvidence.id] || viewingEvidence.manual_rotation || 0}
                  />
                ) : (
                  <video src={viewingEvidence.file_url} className="w-full h-full" controls />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{viewingEvidence.file_name}</div>
                  {viewingEvidence.description && (
                    <div className="text-gray-600">{viewingEvidence.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = viewingEvidence.file_url;
                      a.target = '_blank';
                      a.rel = 'noopener';
                      a.click();
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> Abrir original
                  </Button>
                  <Button onClick={() => downloadEvidence(viewingEvidence)}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Editor */}
      {editingImageEvidence && (
        <ImageEditor
          isOpen={imageEditorOpen}
          onClose={() => {
            setImageEditorOpen(false);
            setEditingImageEvidence(null);
          }}
          imageUrl={editingImageEvidence.file_url}
          imageName={editingImageEvidence.file_name}
          onSave={handleSaveEditedImage}
        />
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar Evidencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nuevo nombre:</label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Ingrese el nuevo nombre"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveRename}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvidencesGallery;