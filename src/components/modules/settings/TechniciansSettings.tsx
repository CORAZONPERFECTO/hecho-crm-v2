
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Plus, Trash2, Users } from 'lucide-react';
import { useSupabaseTechnicians, Technician } from '@/hooks/useSupabaseTechnicians';

const TechniciansSettings: React.FC = () => {
  const { technicians, loading, addTechnician, updateTechnician, deleteTechnician } = useSupabaseTechnicians();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'technician' as 'technician' | 'manager' | 'supervisor',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTechnician) {
        await updateTechnician(editingTechnician.id, {
          ...formData,
          status: editingTechnician.status
        });
        setEditingTechnician(null);
      } else {
        await addTechnician({
          ...formData,
          status: 'active'
        });
        setShowAddDialog(false);
      }
      setFormData({ name: '', role: 'technician', email: '', phone: '' });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name,
      role: technician.role,
      email: technician.email || '',
      phone: technician.phone || ''
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTechnician(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleToggleStatus = async (technician: Technician) => {
    try {
      await updateTechnician(technician.id, {
        status: technician.status === 'active' ? 'inactive' : 'active'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Users size={20} className="mr-2" />
            Gestión de Técnicos y Gerentes
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-2" />
                Agregar Técnico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Técnico</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value: 'technician' | 'manager' | 'supervisor') => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Agregar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicians.map((technician) => (
              <div key={technician.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{technician.name}</h4>
                    <Badge variant={technician.role === 'manager' ? 'default' : technician.role === 'supervisor' ? 'secondary' : 'outline'}>
                      {technician.role === 'manager' ? 'Gerente' : technician.role === 'supervisor' ? 'Supervisor' : 'Técnico'}
                    </Badge>
                    <Badge variant={technician.status === 'active' ? 'default' : 'destructive'}>
                      {technician.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {technician.email && <span>{technician.email}</span>}
                    {technician.email && technician.phone && <span> • </span>}
                    {technician.phone && <span>{technician.phone}</span>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(technician)}
                  >
                    {technician.status === 'active' ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(technician)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(technician.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingTechnician && (
        <Dialog open={!!editingTechnician} onOpenChange={() => setEditingTechnician(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Técnico</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={formData.role} onValueChange={(value: 'technician' | 'manager' | 'supervisor') => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">Técnico</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Actualizar
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingTechnician(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TechniciansSettings;
