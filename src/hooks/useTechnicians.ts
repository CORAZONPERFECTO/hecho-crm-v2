
import { useState } from 'react';

export interface Technician {
  id: string;
  name: string;
  role: 'technician' | 'manager' | 'supervisor';
  status: 'active' | 'inactive';
  email?: string;
  phone?: string;
}

const initialTechnicians: Technician[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    role: 'manager',
    status: 'active',
    email: 'juan.perez@company.com',
    phone: '+506 8888-9999'
  },
  {
    id: '2',
    name: 'María García',
    role: 'technician',
    status: 'active',
    email: 'maria.garcia@company.com',
    phone: '+506 7777-8888'
  },
  {
    id: '3',
    name: 'Carlos López',
    role: 'technician',
    status: 'active',
    email: 'carlos.lopez@company.com',
    phone: '+506 6666-7777'
  },
  {
    id: '4',
    name: 'Ana Martínez',
    role: 'supervisor',
    status: 'active',
    email: 'ana.martinez@company.com',
    phone: '+506 5555-4444'
  },
  {
    id: '5',
    name: 'Luis Rodríguez',
    role: 'technician',
    status: 'active',
    email: 'luis.rodriguez@company.com',
    phone: '+506 4444-3333'
  }
];

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);

  const addTechnician = (technicianData: Omit<Technician, 'id'>) => {
    const newTechnician: Technician = {
      ...technicianData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTechnicians(prev => [...prev, newTechnician]);
  };

  const updateTechnician = (id: string, updates: Partial<Technician>) => {
    setTechnicians(prev => 
      prev.map(tech => 
        tech.id === id ? { ...tech, ...updates } : tech
      )
    );
  };

  const deleteTechnician = (id: string) => {
    setTechnicians(prev => prev.filter(tech => tech.id !== id));
  };

  const getActiveTechnicians = () => {
    return technicians.filter(tech => tech.status === 'active');
  };

  const getActiveManagers = () => {
    return technicians.filter(tech => 
      tech.status === 'active' && (tech.role === 'manager' || tech.role === 'supervisor')
    );
  };

  return {
    technicians,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    getActiveTechnicians,
    getActiveManagers
  };
};
