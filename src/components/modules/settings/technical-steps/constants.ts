export const INITIAL_CATEGORY_FORM: { name: string; description: string } = {
  name: '',
  description: ''
};

export const INITIAL_STEP_FORM: { description: string; category_id: string } = {
  description: '',
  category_id: ''
};

export const MESSAGES = {
  CATEGORY_NAME_REQUIRED: 'El nombre de la categoría es obligatorio',
  STEP_FIELDS_REQUIRED: 'Todos los campos son obligatorios',
  CONFIRM_DELETE_CATEGORY: (name: string) => `¿Está seguro de eliminar la categoría "${name}"?`,
  CONFIRM_DELETE_STEP: '¿Está seguro de eliminar este paso técnico?',
  PRIORITY_INFO: 'Arrastra los pasos para establecer su orden de ejecución. Este orden se reflejará automáticamente en todos los tickets de esta categoría.'
} as const;

export const ANIMATIONS = {
  DRAG_THRESHOLD: 8,
  TRANSITION_DURATION: 300
} as const;