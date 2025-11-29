import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Paperclip, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Quotation {
    id: string;
    client: string;
    amount: string;
    status: string;
    validUntil: string;
    createdDate: string;
    items: number;
    ticket: string;
}

interface CreateQuotationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuotation: (quotation: Quotation) => void;
  existingQuotations: Quotation[];
  duplicateFrom?: Quotation;
  customers?: Array<{ id: string; name: string; email: string; }>;
}

interface QuotationItem {
  id: string;
  description: string;
  reference: string;
  quantity: number;
  price: number;
  amount: number;
}

const CreateQuotationForm: React.FC<CreateQuotationFormProps> = ({ 
  isOpen, 
  onClose, 
  onCreateQuotation, 
  existingQuotations,
  duplicateFrom,
  customers = []
}) => {
  // Client Information
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [selectedClient, setSelectedClient] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientRnc, setNewClientRnc] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Quotation Data
  const [quotationNumber, setQuotationNumber] = useState('');
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('De contado');
  const [customerType, setCustomerType] = useState('Empresa');

  // Internal Assignment
  const [preparedBy, setPreparedBy] = useState('Usuario Actual');
  const [department, setDepartment] = useState('');
  const [associatedProject, setAssociatedProject] = useState('');

  // Internal Observations
  const [internalObservation, setInternalObservation] = useState('');
  const [priority, setPriority] = useState('Media');

  // Quick Access Options
  const [attachFile, setAttachFile] = useState(false);
  const [markRecurring, setMarkRecurring] = useState(false);
  const [requestApproval, setRequestApproval] = useState(false);

  // Items
  const [items, setItems] = useState<QuotationItem[]>([
    { id: '1', description: '', reference: '', quantity: 1, price: 0, amount: 0 }
  ]);

  React.useEffect(() => {
    const newIdNumber = (existingQuotations.length > 0 ? 
      Math.max(...existingQuotations.map(q => parseInt(q.id.split('-')[2]))) : 0) + 1;
    setQuotationNumber(`C2024${String(newIdNumber).padStart(6, '0')}`);
  }, [existingQuotations]);

  // Load data if duplicating from existing quotation
  React.useEffect(() => {
    if (duplicateFrom) {
      setSelectedClient(duplicateFrom.client);
      setClientType('existing');
      setValidUntil(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setCreatedDate(new Date().toISOString().split('T')[0]);
      // Keep the same number format but with new number
      const newIdNumber = (existingQuotations.length > 0 ? 
        Math.max(...existingQuotations.map(q => parseInt(q.id.split('-')[2]))) : 0) + 1;
      setQuotationNumber(`C2024${String(newIdNumber).padStart(6, '0')}`);
    }
  }, [duplicateFrom, existingQuotations]);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '',
      reference: '',
      quantity: 1,
      price: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.amount = updated.quantity * updated.price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discount = 0;
  const total = subtotal - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientName = clientType === 'existing' ? selectedClient : newClientName;
    
    const newQuotation: Quotation = {
      id: quotationNumber,
      client: clientName,
      amount: `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: 'borrador',
      validUntil,
      createdDate,
      items: items.length,
      ticket: '',
    };
    
    onCreateQuotation(newQuotation);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {duplicateFrom ? `Duplicar Cotización ${duplicateFrom.id}` : 'Nueva Cotización'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Client Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">1. Información del Cliente</h3>
              
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  variant={clientType === 'existing' ? 'default' : 'outline'}
                  onClick={() => setClientType('existing')}
                >
                  Cliente Existente
                </Button>
                <Button
                  type="button"
                  variant={clientType === 'new' ? 'default' : 'outline'}
                  onClick={() => setClientType('new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Contacto
                </Button>
              </div>

              {clientType === 'existing' ? (
                <div>
                  <Label htmlFor="client-search">Cliente</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar cliente existente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.name}>
                            {customer.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="HECHO SRL">HECHO SRL</SelectItem>
                          <SelectItem value="Tech Solutions">Tech Solutions</SelectItem>
                          <SelectItem value="Innovatech">Innovatech</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Nombre/Razón Social</Label>
                    <Input
                      id="client-name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Nombre del cliente"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-rnc">RNC/Cédula</Label>
                    <Input
                      id="client-rnc"
                      value={newClientRnc}
                      onChange={(e) => setNewClientRnc(e.target.value)}
                      placeholder="000-0000000-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-email">Correo</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="cliente@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-phone">Teléfono</Label>
                    <Input
                      id="client-phone"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="(809) 000-0000"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Quotation Key Data */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">2. Datos clave de la cotización</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="quotation-number">Número de cotización</Label>
                  <Input
                    id="quotation-number"
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                    placeholder="C2024060001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer-type">Tipo de cliente</Label>
                  <Select value={customerType} onValueChange={setCustomerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empresa">Empresa</SelectItem>
                      <SelectItem value="Persona física">Persona física</SelectItem>
                      <SelectItem value="Gobierno">Gobierno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="created-date">Fecha de creación</Label>
                  <Input
                    id="created-date"
                    type="date"
                    value={createdDate}
                    onChange={(e) => setCreatedDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid-until">Fecha de vencimiento</Label>
                  <Input
                    id="valid-until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="payment-terms">Términos de pago</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="De contado">De contado</SelectItem>
                    <SelectItem value="15 días">15 días</SelectItem>
                    <SelectItem value="30 días">30 días</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 3. Internal Assignment */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">3. Asignación interna</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prepared-by">Elaborado por</Label>
                  <Input
                    id="prepared-by"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    placeholder="Usuario logueado"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento o área</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instalaciones">Instalaciones</SelectItem>
                      <SelectItem value="Ventas">Ventas</SelectItem>
                      <SelectItem value="Soporte técnico">Soporte técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="associated-project">Proyecto asociado (opcional)</Label>
                  <Select value={associatedProject} onValueChange={setAssociatedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Conecta con módulo de Proyectos..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proyecto A">Proyecto A</SelectItem>
                      <SelectItem value="Proyecto B">Proyecto B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Internal Observations */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">4. Observaciones internas</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="internal-observation">Observación interna</Label>
                  <Textarea
                    id="internal-observation"
                    value={internalObservation}
                    onChange={(e) => setInternalObservation(e.target.value)}
                    placeholder="No se imprime; visible solo para administradores"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Nivel de prioridad o urgencia</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Quick Access Options */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">5. Accesos rápidos</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attach-file"
                    checked={attachFile}
                    onCheckedChange={(checked) => setAttachFile(checked === true)}
                  />
                  <Label htmlFor="attach-file" className="flex items-center">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Adjuntar archivo (Ej. planos, requerimientos, PDF del cliente)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mark-recurring"
                    checked={markRecurring}
                    onCheckedChange={(checked) => setMarkRecurring(checked === true)}
                  />
                  <Label htmlFor="mark-recurring">
                    Marcar como recurrente (vincular a facturación mensual)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="request-approval"
                    checked={requestApproval}
                    onCheckedChange={(checked) => setRequestApproval(checked === true)}
                  />
                  <Label htmlFor="request-approval" className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Solicitar aprobación antes de enviar
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Crear y continuar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuotationForm;
