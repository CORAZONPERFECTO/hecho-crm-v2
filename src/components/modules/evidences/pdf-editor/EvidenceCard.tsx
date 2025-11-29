import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  GripVertical, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Evidence } from '@/utils/evidence/pdfGenerator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EvidenceCardProps {
  evidence: Evidence;
  index: number;
  isSelected: boolean;
  onSelect: (evidence: Evidence) => void;
  onUpdate: (id: string, updates: Partial<Evidence>) => void;
  onDelete: (id: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(evidence.description || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleSaveEdit = () => {
    onUpdate(evidence.id, { description: editedDescription });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription(evidence.description || '');
    setIsEditing(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`p-3 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
        } ${isDragging ? 'cursor-grabbing' : ''}`}
        onClick={() => !isEditing && onSelect(evidence)}
      >
        <div className="flex gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-start pt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
            {evidence.file_type.startsWith('image/') ? (
              <img
                src={evidence.file_url}
                alt={evidence.file_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              #{index + 1}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-xs font-medium truncate">
              {evidence.file_name}
            </p>

            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Descripción..."
                  className="min-h-[60px] text-xs resize-none"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs"
                    onClick={handleSaveEdit}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {evidence.description || 'Sin descripción'}
              </p>
            )}
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evidencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La evidencia será removida del reporte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(evidence.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
