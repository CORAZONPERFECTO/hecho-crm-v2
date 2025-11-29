
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Upload, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IncomeRegistry: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const incomeData = [
    {
      id: 1,
      date: '2024-06-15',
      client: 'Empresa ABC',
      amount: 15000,
      paymentMethod: 'transferencia',
      source: 'automatic',
      invoiceId: 'F001',
      observations: 'Pago completo de factura',
      hasReceipt: true
    },
    {
      id: 2,
      date: '2024-06-14',
      client: 'Tech Solutions',
      amount: 8500,
      paymentMethod: 'efectivo',
      source: 'manual',
      invoiceId: null,
      observations: 'Pago adelantado por servicios',
      hasReceipt: false
    },
    {
      id: 3,
      date: '2024-06-13',
      client: 'Global Industries',
      amount: 22000,
      paymentMethod: 'tarjeta',
      source: 'automatic',
      invoiceId: 'F002',
      observations: 'Pago de factura vencida',
      hasReceipt: true
    }
  ];

  const handleAddIncome = () => {
    toast({
      title: "Ingreso registrado exitosamente",
      description: "El nuevo ingreso ha sido añadido al sistema.",
    });
    setShowAddForm(false);
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'efectivo': return 'bg-green-100 text-green-800';
      case 'transferencia': return 'bg-blue-100 text-blue-800';
      case 'tarjeta': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    return source === 'automatic' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
  };

  const filteredIncome = incomeData.filter(income =>
    income.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.observations.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Registro de Ingresos</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Plus size={16} className="mr-2" />
          Nuevo Ingreso
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar por cliente o observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filtros Avanzados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Income Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Ingreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha del Ingreso</Label>
                <Input type="date" id="date" />
              </div>
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresa-abc">Empresa ABC</SelectItem>
                    <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                    <SelectItem value="global-industries">Global Industries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input type="number" id="amount" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="payment-method">Forma de Pago</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea id="observations" placeholder="Detalles adicionales..." />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="receipt">Comprobante de Pago</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload size={16} className="mr-2" />
                    Subir Archivo
                  </Button>
                  <span className="text-sm text-gray-500">PDF, JPG, PNG (máx. 5MB)</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddIncome} className="bg-green-600 hover:bg-green-700">
                Registrar Ingreso
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left p-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left p-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left p-3 font-medium text-gray-600">Método</th>
                  <th className="text-left p-3 font-medium text-gray-600">Origen</th>
                  <th className="text-left p-3 font-medium text-gray-600">Factura</th>
                  <th className="text-left p-3 font-medium text-gray-600">Comprobante</th>
                  <th className="text-left p-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.map((income) => (
                  <tr key={income.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{income.date}</td>
                    <td className="p-3 font-medium">{income.client}</td>
                    <td className="p-3 font-bold text-green-600">${income.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge className={getPaymentMethodColor(income.paymentMethod)}>
                        {income.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getSourceColor(income.source)}>
                        {income.source === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                    </td>
                    <td className="p-3">{income.invoiceId || '-'}</td>
                    <td className="p-3">
                      {income.hasReceipt ? (
                        <Badge className="bg-green-100 text-green-800">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit size={14} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeRegistry;
