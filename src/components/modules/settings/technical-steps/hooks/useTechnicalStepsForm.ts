import { useState } from 'react';
import { INITIAL_CATEGORY_FORM, INITIAL_STEP_FORM } from '../constants';

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface StepFormData {
  description: string;
  category_id: string;
}

export const useTechnicalStepsForm = () => {
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(INITIAL_CATEGORY_FORM);
  const [stepForm, setStepForm] = useState<StepFormData>(INITIAL_STEP_FORM);

  const resetCategoryForm = () => setCategoryForm(INITIAL_CATEGORY_FORM);
  const resetStepForm = () => setStepForm(INITIAL_STEP_FORM);

  const updateCategoryForm = (field: keyof CategoryFormData, value: string) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  };

  const updateStepForm = (field: keyof StepFormData, value: string) => {
    setStepForm(prev => ({ ...prev, [field]: value }));
  };

  const setCategoryFormData = (data: CategoryFormData) => {
    setCategoryForm(data);
  };

  return {
    categoryForm,
    stepForm,
    resetCategoryForm,
    resetStepForm,
    updateCategoryForm,
    updateStepForm,
    setCategoryFormData
  };
};