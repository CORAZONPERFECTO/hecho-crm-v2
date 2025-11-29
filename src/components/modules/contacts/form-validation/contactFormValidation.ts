
interface ContactFormData {
  name: string;
  identificationNumber: string;
  email: string;
  creditLimit: number;
}

export const validateContactForm = (formData: ContactFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name?.trim()) {
    errors.push('El nombre/razón social es requerido');
  }
  
  if (!formData.identificationNumber?.trim()) {
    errors.push('El RNC/Cédula es requerido');
  }
  
  if (formData.email && !formData.email.includes('@')) {
    errors.push('El correo electrónico no es válido');
  }
  
  if (formData.creditLimit && formData.creditLimit < 0) {
    errors.push('El límite de crédito no puede ser negativo');
  }
  
  return errors;
};
