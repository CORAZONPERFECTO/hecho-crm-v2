export interface ServiceRecord {
  id: string;
  type: 'instalacion' | 'reparacion' | 'mantenimiento' | 'verificacion' | 'levantamiento' | 'rastreo_fuga' | 'otros';
  quantity: number;
  description?: string;
  date: string;
  technician: string;
  photos: ServicePhoto[];
}

export interface ServicePhoto {
  id: string;
  url: string;
  description: string;
  type: 'antes' | 'despues' | 'proceso';
}

export interface TicketVisit {
  id: string;
  date: string;
  technician: string;
  observation: string;
  resolved: boolean;
  photos: string[];
  services: ServiceRecord[];
}

export interface QuotationItem {
  id: string;
  serviceType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  ticketId: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  validUntil: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  ticketId: string;
  clientName: string;
  createdAt: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'generada' | 'enviada' | 'pagada';
  dueDate: string;
  notes?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  area: string;
  basePrice?: number;
  unit: string;
  description?: string;
  isActive: boolean;
}

export interface CategoryService {
  id: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  description?: string;
  area: string;
  totalPrice?: number;
  date: string;
  technician: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'abierto' | 'en-progreso' | 'cerrado-pendiente-cotizar' | 'aprobado-factura' | 'facturado-finalizado' | 'finalizado-por-tecnico';
  assignedTo: string;
  client: string;
  project?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  attachments: string[];
  internalNotes: string;
  visits: TicketVisit[];
  categoryServices: CategoryService[];
  quotation?: Quotation;
  invoice?: Invoice;
  closedAt?: string;
  closedBy?: string;
}

export interface TicketsModuleProps {
  userRole?: 'admin' | 'technician' | 'manager';
  currentUser?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
}
