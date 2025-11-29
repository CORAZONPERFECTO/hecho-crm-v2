
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Opportunity } from './types';

interface CreateOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (opportunity: Omit<Opportunity, 'id'>) => void;
  customers?: Array<{ id: string; name: string; email: string; }>;
}

const CreateOpportunityForm: React.FC<CreateOpportunityFormProps> = ({ isOpen, onClose, onCreate, customers = [] }) => {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [stage, setStage] = useState<Opportunity['stage']>('Prospecto');
  const [value, setValue] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [owner, setOwner] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientName || !stage || !value || !closeDate || !owner) {
        return;
    }
    onCreate({
      name,
      clientName,
      stage,
      value: parseFloat(value),
      closeDate,
      owner
    });
    // Reset form and close
    setName('');
    setClientName('');
    setStage('Prospecto');
    setValue('');
    setCloseDate('');
    setOwner('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Oportunidad</DialogTitle>
          <DialogDescription>
            Registra una nueva oportunidad de venta para darle seguimiento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="opp-name">Nombre de la Oportunidad</Label>
                    <Input id="opp-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Nuevo Sitio Web" required />
                </div>
                <div>
                    <Label htmlFor="opp-client">Cliente</Label>
                    {customers.length > 0 ? (
                      <Select onValueChange={setClientName} value={clientName}>
                        <SelectTrigger id="opp-client">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.name}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="opp-client" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre del cliente" required />
                    )}
                </div>
                 <div>
                    <Label htmlFor="opp-stage">Etapa</Label>
                    <Select onValueChange={(val: Opportunity['stage']) => setStage(val)} defaultValue={stage}>
                      <SelectTrigger id="opp-stage">
                        <SelectValue placeholder="Seleccionar etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prospecto">Prospecto</SelectItem>
                        <SelectItem value="En negociación">En negociación</SelectItem>
                        <SelectItem value="Cerrada ganada">Cerrada ganada</SelectItem>
                        <SelectItem value="Cerrada perdida">Cerrada perdida</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="opp-value">Valor Estimado ($)</Label>
                    <Input id="opp-value" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="500000" required />
                </div>
                 <div>
                    <Label htmlFor="opp-close-date">Fecha de Cierre Estimada</Label>
                    <Input id="opp-close-date" type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} required />
                </div>
                 <div>
                    <Label htmlFor="opp-owner">Responsable</Label>
                    <Input id="opp-owner" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Ej: Ana G." required />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Crear Oportunidad</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityForm;
