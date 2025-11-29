
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SalesInvoice {
  id: string;
  client: string;
  amount: string;
  status: string;
  dueDate: string;
  issueDate: string;
  items: number;
}

interface CreateInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (invoice: SalesInvoice) => void;
  existingInvoices: SalesInvoice[];
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ isOpen, onClose, onCreateInvoice, existingInvoices }) => {
    const [client, setClient] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIdNumber = (existingInvoices.length > 0 ? Math.max(...existingInvoices.map(inv => parseInt(inv.id.split('-')[2]))) : 0) + 1;
        const newInvoice: SalesInvoice = {
            id: `FAC-2025-${String(newIdNumber).padStart(3, '0')}`,
            client,
            amount: `$${parseFloat(amount).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: 'pendiente',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: 1, // Simplified
        };
        onCreateInvoice(newInvoice);
        setClient('');
        setAmount('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva Factura</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="client-invoice">Cliente</Label>
                            <Input id="client-invoice" value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre del cliente" required />
                        </div>
                        <div>
                            <Label htmlFor="amount-invoice">Monto</Label>
                            <Input id="amount-invoice" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Crear Factura</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateInvoiceForm;
