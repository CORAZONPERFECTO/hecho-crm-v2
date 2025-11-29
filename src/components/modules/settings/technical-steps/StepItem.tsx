import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { TechnicalStep } from '@/hooks/useTicketCategories';
import { cn } from '@/lib/utils';

interface StepItemProps {
  step: TechnicalStep;
  index: number;
  isEditing: boolean;
  editValue: string;
  onStartEdit: (step: TechnicalStep) => void;
  onSaveEdit: (stepId: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onDelete: (stepId: string) => void;
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  isEditing,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg bg-background transition-all duration-200",
        isDragging && "shadow-lg border-primary/30 bg-primary/5"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="min-w-[70px] text-center bg-primary/10 text-primary border-primary/20">
          <span className="font-semibold">Paso {index + 1}</span>
        </Badge>
        {index === 0 && (
          <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Alta Prioridad
          </Badge>
        )}
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSaveEdit(step.id);
                } else if (e.key === 'Escape') {
                  onCancelEdit();
                }
              }}
            />
            <Button size="sm" onClick={() => onSaveEdit(step.id)}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <p 
            className="text-sm cursor-pointer hover:bg-muted/50 p-2 rounded"
            onClick={() => onStartEdit(step)}
          >
            {step.description}
          </p>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => onStartEdit(step)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(step.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StepItem;