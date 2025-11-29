
import React, { useState } from 'react';
import CreateContactForm from './contacts/CreateContactForm';
import ContactsList from './contacts/ContactsList';
import ContactDetail from './contacts/ContactDetail';
import ClientDetail from './clients/ClientDetail';
import ImportContacts from './contacts/ImportContacts';
import ContactsHeader from './contacts/ContactsHeader';
import ContactsAlerts from './contacts/ContactsAlerts';
import ContactsStats from './contacts/ContactsStats';
import { Contact, ContactAlert } from './contacts/types';
import { useToast } from '@/hooks/use-toast';

interface ContactsModuleProps {
  userRole: 'admin' | 'technician' | 'manager';
}

const ContactsModule: React.FC<ContactsModuleProps> = ({ userRole }) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'detail' | 'import'>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  // Sample alerts data
  const [alerts] = useState<ContactAlert[]>([
    {
      id: '1',
      contactId: '1',
      type: 'credit_limit',
      message: 'Tech Solutions S.R.L. ha superado su límite de crédito',
      severity: 'high',
      createdAt: '2024-06-15'
    },
    {
      id: '2',
      contactId: '2',
      type: 'payment_due',
      message: 'Factura FAC-2024-002 vence en 3 días',
      severity: 'medium',
      createdAt: '2024-06-14'
    }
  ]);

  const handleCreateContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating new client contact:', contactData);
    
    // Generate new contact with ID and timestamps
    const newContact: Contact = {
      ...contactData,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    console.log('New contact created:', newContact);
    
    toast({
      title: "Cliente creado exitosamente",
      description: `${contactData.name} ha sido agregado como nuevo cliente.`,
    });
    setActiveView('list');
  };

  const handleEditContact = (contact: Contact) => {
    console.log('Editing contact:', contact);
    setSelectedContact(contact);
    setActiveView('edit');
  };

  const handleUpdateContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Updating contact:', contactData);
    toast({
      title: "Cliente actualizado",
      description: `${contactData.name} ha sido actualizado exitosamente.`,
    });
    setActiveView('list');
    setSelectedContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    console.log('Deleting contact:', contactId);
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado exitosamente.",
      variant: "destructive"
    });
  };

  const handleViewDetails = (contact: Contact) => {
    console.log('Viewing contact details:', contact);
    setSelectedContact(contact);
    setActiveView('detail');
  };

  const handleImportContacts = (contacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    console.log('Importing contacts:', contacts);
    toast({
      title: "Clientes importados",
      description: `${contacts.length} clientes han sido importados exitosamente.`,
    });
    setActiveView('list');
  };

  const canEdit = userRole === 'admin' || userRole === 'manager';

  if (activeView === 'create') {
    return (
      <CreateContactForm
        onClose={() => {
          console.log('Closing create form, returning to list');
          setActiveView('list');
        }}
        onSave={handleCreateContact}
      />
    );
  }

  if (activeView === 'edit' && selectedContact) {
    return (
      <CreateContactForm
        onClose={() => {
          console.log('Closing edit form, returning to list');
          setActiveView('list');
          setSelectedContact(null);
        }}
        onSave={handleUpdateContact}
        editingContact={selectedContact}
      />
    );
  }

  if (activeView === 'detail' && selectedContact) {
    return (
      <ClientDetail
        client={selectedContact}
        onClose={() => {
          console.log('Closing detail view, returning to list');
          setActiveView('list');
          setSelectedContact(null);
        }}
        userRole={userRole}
      />
    );
  }

  if (activeView === 'import') {
    return (
      <ImportContacts
        onClose={() => {
          console.log('Closing import view, returning to list');
          setActiveView('list');
        }}
        onImport={handleImportContacts}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ContactsHeader
        canEdit={canEdit}
        onCreateContact={() => setActiveView('create')}
        onImportContacts={() => setActiveView('import')}
      />

      <ContactsAlerts alerts={alerts} />

      <ContactsStats alerts={alerts} />

      <ContactsList
        userRole={userRole}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default ContactsModule;
