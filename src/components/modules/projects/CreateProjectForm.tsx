import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Project } from './types';
import { generateProjectCode } from './utils';
import { useSupabaseTechnicians } from '@/hooks/useSupabaseTechnicians';

interface CreateProjectFormProps {
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'documents' | 'comments' | 'milestones'>) => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onClose, onCreateProject }) => {
  const { getActiveTechnicians, getActiveManagers } = useSupabaseTechnicians();
  const activeTechnicians = getActiveTechnicians();
  const activeManagers = getActiveManagers();

  const [formData, setFormData] = useState({
    projectCode: generateProjectCode(),
    name: '',
    description: '',
    client: '',
    location: '',
    status: 'active' as const,
    startDate: new Date().toISOString().split('T')[0],
    estimatedEndDate: '',
    assignedBudget: 0,
    executedAmount: 0,
    assignedTechnicians: [] as string[],
    manager: '',
    progress: 0
  });

  const clients = [
    'Empresa ABC S.A.',
    'TechCorp Solutions',
    'Construcciones del Norte',
    'Servicios Integrados S.R.L.',
    'Grupo Industrial del Caribe'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(formData);
    onClose();
  };

  const handleTechnicianToggle = (technicianName: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTechnicians: prev.assignedTechnicians.includes(technicianName)
        ? prev.assignedTechnicians.filter(t => t !== technicianName)
        : [...prev.assignedTechnicians, technicianName]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">Crear Nuevo Proyecto</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectCode">Código del Proyecto</Label>
                <Input
                  id="projectCode"
                  value={formData.projectCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectCode: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proyecto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={formData.client} onValueChange={(value) => setFormData(prev => ({ ...prev, client: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedEndDate">Fecha Estimada de Fin</Label>
                <Input
                  id="estimatedEndDate"
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedEndDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedBudget">Presupuesto Asignado</Label>
                <Input
                  id="assignedBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.assignedBudget}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedBudget: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Gerente del Proyecto</Label>
              <Select value={formData.manager} onValueChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar gerente" />
                </SelectTrigger>
                <SelectContent>
                  {activeManagers.map(manager => (
                    <SelectItem key={manager.id} value={manager.name}>{manager.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Técnicos Asignados</Label>
              {activeTechnicians.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay técnicos activos disponibles. Ve a Configuración → Técnicos para agregar técnicos.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activeTechnicians.map(technician => (
                    <div key={technician.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`tech-${technician.id}`}
                        checked={formData.assignedTechnicians.includes(technician.name)}
                        onChange={() => handleTechnicianToggle(technician.name)}
                        className="rounded"
                      />
                      <Label htmlFor={`tech-${technician.id}`} className="text-sm">{technician.name}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Crear Proyecto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProjectForm;
