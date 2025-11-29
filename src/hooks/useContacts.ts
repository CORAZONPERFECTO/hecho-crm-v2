import { useState, useEffect } from 'react';
import { Contact } from '@/components/modules/contacts/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mock data inicial para migrar a la BD si no existe
const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'HECHO SRL',
    type: 'cliente',
    identificationType: 'rnc',
    identificationNumber: '131-56789-0',
    phone1: '809-555-0123',
    mobile: '829-555-0123',
    address: 'Av. Winston Churchill #1099',
    province: 'Distrito Nacional',
    municipality: 'Santo Domingo',
    country: 'República Dominicana',
    email: 'contacto@hechosrl.com',
    paymentTerms: '30 días',
    priceList: 'Estándar',
    assignedSalesperson: 'Ana García',
    creditLimit: 500000,
    accountsReceivable: 45000,
    accountsPayable: 0,
    internalNotes: 'Cliente preferencial',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
    status: 'activo'
  },
  {
    id: '2',
    name: 'Tech Solutions',
    type: 'cliente',
    identificationType: 'rnc',
    identificationNumber: '101-23456-7',
    phone1: '809-555-0124',
    mobile: '829-555-0124',
    address: 'C/ José Reyes #45',
    province: 'Santiago',
    municipality: 'Santiago',
    country: 'República Dominicana',
    email: 'info@techsolutions.com',
    paymentTerms: '15 días',
    priceList: 'Premium',
    assignedSalesperson: 'Juan Pérez',
    creditLimit: 300000,
    accountsReceivable: 28500,
    accountsPayable: 0,
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-06-10T16:45:00Z',
    status: 'activo'
  },
  {
    id: '3',
    name: 'Innovate Corp',
    type: 'cliente',
    identificationType: 'rnc',
    identificationNumber: '102-98765-4',
    phone1: '809-555-0125',
    mobile: '829-555-0125',
    address: 'Av. 27 de Febrero #789',
    province: 'Distrito Nacional',
    municipality: 'Santo Domingo',
    country: 'República Dominicana',
    email: 'ventas@innovatecorp.com',
    paymentTerms: '45 días',
    priceList: 'Estándar',
    assignedSalesperson: 'Ana García',
    creditLimit: 750000,
    accountsReceivable: 65000,
    accountsPayable: 0,
    createdAt: '2024-04-20T11:30:00Z',
    updatedAt: '2024-06-08T13:15:00Z',
    status: 'activo'
  }
];

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Cargar contactos desde Supabase con migración automática
  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      
      try {
        // Intentar cargar desde Supabase
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error loading contacts:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          // Si no hay datos en Supabase, migrar desde localStorage
          const savedContacts = localStorage.getItem('app_contacts');
          if (savedContacts) {
            const localContacts = JSON.parse(savedContacts);
            // Migrar a Supabase
            await migrateLocalContacts(localContacts);
            setContacts(localContacts);
          } else {
            // Migrar datos iniciales
            await migrateLocalContacts(initialContacts);
            setContacts(initialContacts);
          }
        } else {
          // Mapear datos de Supabase al formato del frontend
          const mappedContacts = data.map(contact => ({
            id: contact.id,
            name: contact.name,
            type: contact.type as 'cliente' | 'proveedor' | 'ambos',
            identificationType: contact.identification_type as 'rnc' | 'cedula' | 'pasaporte',
            identificationNumber: contact.identification_number,
            phone1: contact.phone1,
            phone2: contact.phone2,
            mobile: contact.mobile,
            fax: contact.fax,
            address: contact.address,
            province: contact.province,
            municipality: contact.municipality,
            country: contact.country,
            email: contact.email,
            paymentTerms: contact.payment_terms,
            priceList: contact.price_list,
            assignedSalesperson: contact.assigned_salesperson,
            creditLimit: Number(contact.credit_limit),
            accountsReceivable: Number(contact.accounts_receivable),
            accountsPayable: Number(contact.accounts_payable),
            internalNotes: contact.internal_notes,
            createdAt: contact.created_at,
            updatedAt: contact.updated_at,
            status: contact.status as 'activo' | 'inactivo'
          }));
          setContacts(mappedContacts);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los contactos.',
          variant: 'destructive'
        });
      }
      
      setLoading(false);
    };

    loadContacts();
  }, []);

  // Función para migrar contactos locales a Supabase
  const migrateLocalContacts = async (contactsToMigrate: Contact[]) => {
    try {
      const supabaseContacts = contactsToMigrate.map(contact => ({
        name: contact.name,
        type: contact.type,
        identification_type: contact.identificationType,
        identification_number: contact.identificationNumber,
        phone1: contact.phone1,
        phone2: contact.phone2,
        mobile: contact.mobile,
        fax: contact.fax,
        address: contact.address,
        province: contact.province,
        municipality: contact.municipality,
        country: contact.country,
        email: contact.email,
        payment_terms: contact.paymentTerms,
        price_list: contact.priceList,
        assigned_salesperson: contact.assignedSalesperson,
        credit_limit: contact.creditLimit,
        accounts_receivable: contact.accountsReceivable,
        accounts_payable: contact.accountsPayable,
        internal_notes: contact.internalNotes,
        status: contact.status
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(supabaseContacts);

      if (error) {
        console.error('Error migrating contacts:', error);
      } else {
        // Limpiar localStorage después de migrar exitosamente
        localStorage.removeItem('app_contacts');
      }
    } catch (error) {
      console.error('Error migrating contacts:', error);
    }
  };

  // Guardar cambios en Supabase (ya no en localStorage)
  const createContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabaseContact = {
        name: contactData.name,
        type: contactData.type,
        identification_type: contactData.identificationType,
        identification_number: contactData.identificationNumber,
        phone1: contactData.phone1,
        phone2: contactData.phone2,
        mobile: contactData.mobile,
        fax: contactData.fax,
        address: contactData.address,
        province: contactData.province,
        municipality: contactData.municipality,
        country: contactData.country,
        email: contactData.email,
        payment_terms: contactData.paymentTerms,
        price_list: contactData.priceList,
        assigned_salesperson: contactData.assignedSalesperson,
        credit_limit: contactData.creditLimit,
        accounts_receivable: contactData.accountsReceivable,
        accounts_payable: contactData.accountsPayable,
        internal_notes: contactData.internalNotes,
        status: contactData.status
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([supabaseContact])
        .select()
        .single();

      if (error) throw error;

      const newContact: Contact = {
        id: data.id,
        name: data.name,
        type: data.type as 'cliente' | 'proveedor' | 'ambos',
        identificationType: data.identification_type as 'rnc' | 'cedula' | 'pasaporte',
        identificationNumber: data.identification_number,
        phone1: data.phone1,
        phone2: data.phone2,
        mobile: data.mobile,
        fax: data.fax,
        address: data.address,
        province: data.province,
        municipality: data.municipality,
        country: data.country,
        email: data.email,
        paymentTerms: data.payment_terms,
        priceList: data.price_list,
        assignedSalesperson: data.assigned_salesperson,
        creditLimit: Number(data.credit_limit),
        accountsReceivable: Number(data.accounts_receivable),
        accountsPayable: Number(data.accounts_payable),
        internalNotes: data.internal_notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status as 'activo' | 'inactivo'
      };

      setContacts(prev => [newContact, ...prev]);
      
      toast({
        title: 'Cliente creado',
        description: `${newContact.name} ha sido creado exitosamente.`
      });

      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el cliente.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      const supabaseUpdate: any = {};
      
      if (contactData.name) supabaseUpdate.name = contactData.name;
      if (contactData.type) supabaseUpdate.type = contactData.type;
      if (contactData.identificationType) supabaseUpdate.identification_type = contactData.identificationType;
      if (contactData.identificationNumber) supabaseUpdate.identification_number = contactData.identificationNumber;
      if (contactData.phone1) supabaseUpdate.phone1 = contactData.phone1;
      if (contactData.phone2) supabaseUpdate.phone2 = contactData.phone2;
      if (contactData.mobile) supabaseUpdate.mobile = contactData.mobile;
      if (contactData.fax) supabaseUpdate.fax = contactData.fax;
      if (contactData.address) supabaseUpdate.address = contactData.address;
      if (contactData.province) supabaseUpdate.province = contactData.province;
      if (contactData.municipality) supabaseUpdate.municipality = contactData.municipality;
      if (contactData.country) supabaseUpdate.country = contactData.country;
      if (contactData.email) supabaseUpdate.email = contactData.email;
      if (contactData.paymentTerms) supabaseUpdate.payment_terms = contactData.paymentTerms;
      if (contactData.priceList) supabaseUpdate.price_list = contactData.priceList;
      if (contactData.assignedSalesperson !== undefined) supabaseUpdate.assigned_salesperson = contactData.assignedSalesperson;
      if (contactData.creditLimit !== undefined) supabaseUpdate.credit_limit = contactData.creditLimit;
      if (contactData.accountsReceivable !== undefined) supabaseUpdate.accounts_receivable = contactData.accountsReceivable;
      if (contactData.accountsPayable !== undefined) supabaseUpdate.accounts_payable = contactData.accountsPayable;
      if (contactData.internalNotes !== undefined) supabaseUpdate.internal_notes = contactData.internalNotes;
      if (contactData.status) supabaseUpdate.status = contactData.status;

      const { error } = await supabase
        .from('contacts')
        .update(supabaseUpdate)
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === id 
          ? { ...contact, ...contactData, updatedAt: new Date().toISOString() }
          : contact
      ));

      toast({
        title: 'Cliente actualizado',
        description: 'Los datos del cliente han sido actualizados.'
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el cliente.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado exitosamente.'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Filtrar contactos basado en el término de búsqueda
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.identificationNumber.includes(searchTerm)
  );

  // Obtener solo clientes (excluir proveedores)
  const customers = contacts.filter(contact => 
    contact.type === 'cliente' || contact.type === 'ambos'
  );

  // Estadísticas
  const stats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'activo').length,
    clients: contacts.filter(c => c.type === 'cliente' || c.type === 'ambos').length,
    suppliers: contacts.filter(c => c.type === 'proveedor' || c.type === 'ambos').length
  };

  return {
    contacts: filteredContacts,
    customers,
    loading,
    searchTerm,
    setSearchTerm,
    createContact,
    updateContact,
    deleteContact,
    stats
  };
};