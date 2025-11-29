import React from 'react';
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
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { TechnicalStep } from '@/hooks/useTicketCategories';
import { ANIMATIONS } from './constants';
import StepItem from './StepItem';

interface DraggableStepsListProps {
  steps: TechnicalStep[];
  onReorder: (steps: TechnicalStep[]) => void;
  editingStepId: string | null;
  editValue: string;
  onStartEdit: (step: TechnicalStep) => void;
  onSaveEdit: (stepId: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onDeleteStep: (stepId: string) => void;
}

const DraggableStepsList: React.FC<DraggableStepsListProps> = ({
  steps,
  onReorder,
  editingStepId,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onDeleteStep
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: ANIMATIONS.DRAG_THRESHOLD,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);

      const reorderedSteps = arrayMove(steps, oldIndex, newIndex);
      onReorder(reorderedSteps);
    }
  };

  if (steps.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No hay pasos técnicos para esta categoría
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext 
        items={steps.map(step => step.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              isEditing={editingStepId === step.id}
              editValue={editValue}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditValueChange={onEditValueChange}
              onDelete={onDeleteStep}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableStepsList;