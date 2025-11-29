import { useState } from 'react';
import { TechnicalStep } from '@/hooks/useTicketCategories';

export const useInlineEdit = () => {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (step: TechnicalStep) => {
    setEditingStepId(step.id);
    setEditValue(step.description);
  };

  const cancelEdit = () => {
    setEditingStepId(null);
    setEditValue('');
  };

  const isEditing = (stepId: string) => editingStepId === stepId;

  return {
    editingStepId,
    editValue,
    startEdit,
    cancelEdit,
    setEditValue,
    isEditing
  };
};