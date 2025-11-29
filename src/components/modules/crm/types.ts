
export interface Opportunity {
  id: string;
  name: string;
  clientName: string;
  stage: 'Prospecto' | 'En negociación' | 'Cerrada ganada' | 'Cerrada perdida';
  value: number;
  closeDate: string;
  owner: string;
  lastContact?: string;
}

export interface CrmTask {
  id: string;
  title: string;
  dueDate: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  type: 'llamada' | 'correo' | 'reunión' | 'visita';
  linkedTo: string; // e.g., opportunityId or clientId
}
