
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload } from 'lucide-react';

interface ContactsHeaderProps {
  canEdit: boolean;
  onCreateContact: () => void;
  onImportContacts: () => void;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  canEdit,
  onCreateContact,
  onImportContacts
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes y Proveedores</h1>
        <p className="text-gray-600">Administra clientes, proveedores y sus relaciones comerciales</p>
      </div>
      
      {canEdit && (
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => {
              console.log('Import contacts button clicked');
              onImportContacts();
            }}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Upload size={16} className="mr-2" />
            Importar Contactos
          </Button>
          
          <Button 
            onClick={() => {
              console.log('Nuevo Cliente button clicked - opening create form');
              onCreateContact();
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <UserPlus size={16} className="mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContactsHeader;
