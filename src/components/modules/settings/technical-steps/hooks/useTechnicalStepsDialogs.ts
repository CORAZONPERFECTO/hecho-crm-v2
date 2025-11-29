import { useState } from 'react';
import { TicketCategory } from '@/hooks/useTicketCategories';

export const useTechnicalStepsDialogs = () => {
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const [showCreateStepDialog, setShowCreateStepDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null);

  const openCreateCategoryDialog = () => setShowCreateCategoryDialog(true);
  const closeCreateCategoryDialog = () => setShowCreateCategoryDialog(false);

  const openEditCategoryDialog = (category: TicketCategory) => {
    setEditingCategory(category);
    setShowEditCategoryDialog(true);
  };
  
  const closeEditCategoryDialog = () => {
    setShowEditCategoryDialog(false);
    setEditingCategory(null);
  };

  const openCreateStepDialog = () => setShowCreateStepDialog(true);
  const closeCreateStepDialog = () => setShowCreateStepDialog(false);

  return {
    showCreateCategoryDialog,
    showEditCategoryDialog,
    showCreateStepDialog,
    editingCategory,
    openCreateCategoryDialog,
    closeCreateCategoryDialog,
    openEditCategoryDialog,
    closeEditCategoryDialog,
    openCreateStepDialog,
    closeCreateStepDialog
  };
};