
import { Contact, ContactFilters } from './types';

export const getContactTypeColor = (type: string) => {
  switch (type) {
    case 'cliente': return 'bg-blue-100 text-blue-800';
    case 'proveedor': return 'bg-green-100 text-green-800';
    case 'ambos': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'activo': return 'bg-green-100 text-green-800';
    case 'inactivo': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const filterContacts = (contacts: Contact[], filters: ContactFilters): Contact[] => {
  return contacts.filter(contact => {
    if (filters.type && contact.type !== filters.type) return false;
    if (filters.province && contact.province !== filters.province) return false;
    if (filters.salesperson && contact.assignedSalesperson !== filters.salesperson) return false;
    if (filters.status && contact.status !== filters.status) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.identificationNumber.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });
};

export const validateContactData = (contact: Partial<Contact>): string[] => {
  const errors: string[] = [];
  
  if (!contact.name?.trim()) errors.push('Nombre es requerido');
  if (!contact.type) errors.push('Tipo de contacto es requerido');
  if (!contact.identificationType) errors.push('Tipo de identificación es requerido');
  if (!contact.identificationNumber?.trim()) errors.push('Número de identificación es requerido');
  if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) errors.push('Email inválido');
  
  return errors;
};

export const checkCreditLimit = (contact: Contact): boolean => {
  return contact.accountsReceivable > contact.creditLimit;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

export const exportToCSV = (contacts: Contact[]): string => {
  const headers = [
    'Nombre', 'Tipo', 'Identificación', 'Número ID', 'Teléfono', 'Email',
    'Dirección', 'Provincia', 'Municipio', 'País', 'Vendedor', 'Límite Crédito',
    'Por Cobrar', 'Por Pagar', 'Estado'
  ];
  
  const rows = contacts.map(contact => [
    contact.name,
    contact.type,
    contact.identificationType,
    contact.identificationNumber,
    contact.phone1 || '',
    contact.email,
    contact.address,
    contact.province,
    contact.municipality,
    contact.country,
    contact.assignedSalesperson || '',
    contact.creditLimit,
    contact.accountsReceivable,
    contact.accountsPayable,
    contact.status
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};
