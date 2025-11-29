
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';
import { Contact } from './types';
import { useToast } from '@/hooks/use-toast';
import { validateContactForm } from './form-validation/contactFormValidation';
import BasicInfoSection from './form-sections/BasicInfoSection';
import IdentificationSection from './form-sections/IdentificationSection';
import ContactInfoSection from './form-sections/ContactInfoSection';
import CommercialInfoSection from './form-sections/CommercialInfoSection';
import FinancialInfoSection from './form-sections/FinancialInfoSection';
import NotesStatusSection from './form-sections/NotesStatusSection';

interface CreateContactFormProps {
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingContact?: Contact;
}

const CreateContactForm: React.FC<CreateContactFormProps> = ({
  onClose,
  onSave,
  editingContact
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: editingContact?.name || '',
    type: editingContact?.type || 'cliente' as const,
    identificationType: editingContact?.identificationType || 'rnc' as const,
    identificationNumber: editingContact?.identificationNumber || '',
    phone1: editingContact?.phone1 || '',
    phone2: editingContact?.phone2 || '',
    mobile: editingContact?.mobile || '',
    fax: editingContact?.fax || '',
    address: editingContact?.address || '',
    province: editingContact?.province || '',
    municipality: editingContact?.municipality || '',
    country: editingContact?.country || 'República Dominicana',
    email: editingContact?.email || '',
    paymentTerms: editingContact?.paymentTerms || '30 días',
    priceList: editingContact?.priceList || 'Estándar',
    assignedSalesperson: editingContact?.assignedSalesperson || '',
    creditLimit: editingContact?.creditLimit || 0,
    accountsReceivable: editingContact?.accountsReceivable || 0,
    accountsPayable: editingContact?.accountsPayable || 0,
    internalNotes: editingContact?.internalNotes || '',
    status: editingContact?.status || 'activo' as const
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    const validationErrors = validateContactForm(formData);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      toast({
        title: "Errores de validación",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const contactToSave = {
        name: formData.name.trim(),
        type: formData.type,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber.trim(),
        phone1: formData.phone1.trim(),
        phone2: formData.phone2.trim(),
        mobile: formData.mobile.trim(),
        fax: formData.fax.trim(),
        address: formData.address.trim(),
        province: formData.province.trim(),
        municipality: formData.municipality.trim(),
        country: formData.country.trim(),
        email: formData.email.trim(),
        paymentTerms: formData.paymentTerms,
        priceList: formData.priceList,
        assignedSalesperson: formData.assignedSalesperson.trim(),
        creditLimit: Number(formData.creditLimit) || 0,
        accountsReceivable: Number(formData.accountsReceivable) || 0,
        accountsPayable: Number(formData.accountsPayable) || 0,
        internalNotes: formData.internalNotes.trim(),
        status: formData.status
      };

      console.log('Calling onSave with:', contactToSave);
      onSave(contactToSave);
      
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Error al guardar el cliente. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {editingContact ? 'Editar Cliente' : 'Nuevo Cliente'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <IdentificationSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <ContactInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <CommercialInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <FinancialInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <NotesStatusSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Guardando...' : editingContact ? 'Actualizar' : 'Guardar'} Cliente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateContactForm;
