
import { Ticket, ServiceType, Quotation, Invoice } from './types';

export const generateTicketNumber = (existingTickets: Ticket[]): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const currentPrefix = `TK-${year}-${month}-`;
  const existingNumbers = existingTickets
    .filter(t => t.ticketNumber.startsWith(currentPrefix))
    .map(t => parseInt(t.ticketNumber.split('-')[3]))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${currentPrefix}${String(nextNumber).padStart(4, '0')}`;
};

export const generateQuotationNumber = (existingQuotations: Quotation[]): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const currentPrefix = `COT-${year}-${month}-`;
  const existingNumbers = existingQuotations
    .filter(q => q.quotationNumber.startsWith(currentPrefix))
    .map(q => parseInt(q.quotationNumber.split('-')[3]))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${currentPrefix}${String(nextNumber).padStart(4, '0')}`;
};

export const generateInvoiceNumber = (existingInvoices: Invoice[]): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const currentPrefix = `FAC-${year}-${month}-`;
  const existingNumbers = existingInvoices
    .filter(i => i.invoiceNumber.startsWith(currentPrefix))
    .map(i => parseInt(i.invoiceNumber.split('-')[3]))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${currentPrefix}${String(nextNumber).padStart(4, '0')}`;
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta': return 'bg-red-100 text-red-800 border-red-200';
    case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'baja': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'abierto': return 'bg-red-50 text-red-700 border-red-200';
    case 'en-progreso': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'cerrado-pendiente-cotizar': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'aprobado-factura': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'facturado-finalizado': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const getFilteredTickets = (
  tickets: Ticket[],
  userRole: string,
  currentUser: string,
  filter: string,
  searchTerm: string
) => {
  let filtered = tickets;
  
  if (userRole === 'technician') {
    filtered = filtered.filter(ticket => ticket.assignedTo === currentUser);
  }
  
  if (filter !== 'all') {
    filtered = filtered.filter(ticket => ticket.status === filter);
  }
  
  if (searchTerm) {
    filtered = filtered.filter(ticket => 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filtered;
};

export const serviceTypes: ServiceType[] = [
  { id: 'instalacion', name: 'Instalación', basePrice: 150, unit: 'unidad' },
  { id: 'reparacion', name: 'Reparación', basePrice: 120, unit: 'unidad' },
  { id: 'mantenimiento', name: 'Mantenimiento', basePrice: 80, unit: 'unidad' },
  { id: 'verificacion', name: 'Verificación', basePrice: 60, unit: 'unidad' },
  { id: 'levantamiento', name: 'Levantamiento', basePrice: 100, unit: 'unidad' },
  { id: 'rastreo_fuga', name: 'Servicio de Rastreo de Fuga', basePrice: 200, unit: 'unidad' },
  { id: 'otros', name: 'Otros', basePrice: 50, unit: 'unidad' }
];

export const getServiceTypeName = (typeId: string): string => {
  const serviceType = serviceTypes.find(type => type.id === typeId);
  return serviceType ? serviceType.name : typeId;
};

export const getServiceTypePrice = (typeId: string): number => {
  const serviceType = serviceTypes.find(type => type.id === typeId);
  return serviceType ? serviceType.basePrice : 0;
};
