
export interface Contact {
  id: string;
  name: string;
  type: 'cliente' | 'proveedor' | 'ambos';
  identificationType: 'rnc' | 'cedula' | 'pasaporte';
  identificationNumber: string;
  phone1?: string;
  phone2?: string;
  mobile?: string;
  fax?: string;
  address: string;
  province: string;
  municipality: string;
  country: string;
  email: string;
  paymentTerms: string;
  priceList: string;
  assignedSalesperson?: string;
  creditLimit: number;
  accountsReceivable: number;
  accountsPayable: number;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  status: 'activo' | 'inactivo';
}

export interface ContactFilters {
  type?: 'cliente' | 'proveedor' | 'ambos';
  province?: string;
  salesperson?: string;
  status?: 'activo' | 'inactivo';
  search?: string;
}

export interface ImportPreview {
  data: Partial<Contact>[];
  errors: string[];
  duplicates: string[];
}

export interface ContactAlert {
  id: string;
  contactId: string;
  type: 'credit_limit' | 'overdue_payment' | 'payment_due';
  message: string;
  severity: 'high' | 'medium' | 'low';
  createdAt: string;
}
