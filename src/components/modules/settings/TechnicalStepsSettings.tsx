import React from 'react';
import { useTicketCategories } from '@/hooks/useTicketCategories';
import { useToast } from '@/hooks/use-toast';
import { useTechnicalStepsForm, CategoryFormData, StepFormData } from './technical-steps/hooks/useTechnicalStepsForm';
import { useTechnicalStepsDialogs } from './technical-steps/hooks/useTechnicalStepsDialogs';
import { useInlineEdit } from './technical-steps/hooks/useInlineEdit';
import { useCategoryExpansion } from './technical-steps/hooks/useCategoryExpansion';
import { MESSAGES } from './technical-steps/constants';
import CategoryCard from './technical-steps/CategoryCard';
import CreateCategoryDialog from './technical-steps/dialogs/CreateCategoryDialog';
import EditCategoryDialog from './technical-steps/dialogs/EditCategoryDialog';
import CreateStepDialog from './technical-steps/dialogs/CreateStepDialog';
import EmptyState from './technical-steps/components/EmptyState';
import HeaderActions from './technical-steps/components/HeaderActions';

const TechnicalStepsSettings: React.FC = () => {
  const {
    categories,
    steps,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    createStep,
    updateStep,
    deleteStep,
    getStepsByCategory,
    reorderSteps
  } = useTicketCategories();

  const { toast } = useToast();
  
  const {
    categoryForm,
    stepForm,
    resetCategoryForm,
    resetStepForm,
    updateCategoryForm,
    updateStepForm,
    setCategoryFormData
  } = useTechnicalStepsForm();
  
  const {
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
  } = useTechnicalStepsDialogs();
  
  const {
    editingStepId,
    editValue,
    startEdit,
    cancelEdit,
    setEditValue
  } = useInlineEdit();
  
  const {
    isExpanded,
    toggleExpansion
  } = useCategoryExpansion();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: MESSAGES.CATEGORY_NAME_REQUIRED,
        variant: "destructive"
      });
      return;
    }

    try {
      await createCategory(categoryForm);
      closeCreateCategoryDialog();
      resetCategoryForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditCategory = (category: any) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || ''
    });
    openEditCategoryDialog(category);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryForm.name.trim()) return;

    try {
      await updateCategory(editingCategory.id, categoryForm);
      closeEditCategoryDialog();
      resetCategoryForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(MESSAGES.CONFIRM_DELETE_CATEGORY(name))) {
      await deleteCategory(id);
    }
  };

  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepForm.description.trim() || !stepForm.category_id) {
      toast({
        title: "Error",
        description: MESSAGES.STEP_FIELDS_REQUIRED,
        variant: "destructive"
      });
      return;
    }

    try {
      const categorySteps = getStepsByCategory(stepForm.category_id);
      const newOrder = categorySteps.length + 1;

      await createStep({
        ...stepForm,
        step_order: newOrder
      });
      closeCreateStepDialog();
      resetStepForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteStep = async (id: string) => {
    if (window.confirm(MESSAGES.CONFIRM_DELETE_STEP)) {
      await deleteStep(id);
    }
  };

  const saveInlineEdit = async (stepId: string) => {
    if (!editValue.trim()) return;

    try {
      await updateStep(stepId, { description: editValue.trim() });
      cancelEdit();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleReorderSteps = async (reorderedSteps: any[]) => {
    if (reorderedSteps.length === 0) return;
    
    const categoryId = reorderedSteps[0].category_id;
    await reorderSteps(categoryId, reorderedSteps);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorías y Pasos Técnicos</h2>
          <p className="text-muted-foreground">
            Gestiona las categorías de tickets y sus pasos técnicos asociados
          </p>
        </div>
        <HeaderActions
          onCreateStep={openCreateStepDialog}
          onCreateCategory={openCreateCategoryDialog}
          hasCategories={categories.length > 0}
        />
      </div>

      <div className="grid gap-6">
        {categories.map((category) => {
          const categorySteps = getStepsByCategory(category.id);
          const categoryExpanded = isExpanded(category.id);

          return (
            <CategoryCard
              key={category.id}
              category={category}
              categorySteps={categorySteps}
              isExpanded={categoryExpanded}
              editingStepId={editingStepId}
              editValue={editValue}
              onToggleExpanded={toggleExpansion}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onReorderSteps={handleReorderSteps}
              onStartEdit={startEdit}
              onSaveEdit={saveInlineEdit}
              onCancelEdit={cancelEdit}
              onEditValueChange={setEditValue}
              onDeleteStep={handleDeleteStep}
            />
          );
        })}

        {categories.length === 0 && (
          <EmptyState onCreateCategory={openCreateCategoryDialog} />
        )}
      </div>

      <CreateCategoryDialog
        open={showCreateCategoryDialog}
        onOpenChange={closeCreateCategoryDialog}
        formData={categoryForm}
        onFieldChange={updateCategoryForm}
        onSubmit={handleCreateCategory}
        loading={loading}
      />

      <EditCategoryDialog
        open={showEditCategoryDialog}
        onOpenChange={closeEditCategoryDialog}
        formData={categoryForm}
        onFieldChange={updateCategoryForm}
        onSubmit={handleUpdateCategory}
        loading={loading}
      />

      <CreateStepDialog
        open={showCreateStepDialog}
        onOpenChange={closeCreateStepDialog}
        formData={stepForm}
        onFieldChange={updateStepForm}
        onSubmit={handleCreateStep}
        categories={categories}
        loading={loading}
      />
    </div>
  );
};

export default TechnicalStepsSettings;