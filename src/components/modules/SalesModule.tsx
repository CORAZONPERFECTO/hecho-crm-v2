
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, DollarSign, ShoppingCart, Search, FileText } from 'lucide-react';
import Quotations from './income/Quotations';
import CreateQuotationForm from './income/CreateQuotationForm';
import { useContacts } from '@/hooks/useContacts';

const SalesModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false);
  const { customers } = useContacts();

  // Sample quotations data
  const [quotations, setQuotations] = useState([
    {
      id: 'COT-2025-001',
      client: 'HECHO SRL',
      amount: 'RD$ 45,000.00',
      status: 'aprobada',
      validUntil: '2025-01-15',
      createdDate: '2025-01-08',
      items: 3,
      ticket: 'T-001'
    },
    {
      id: 'COT-2025-002', 
      client: 'Tech Solutions',
      amount: 'RD$ 28,500.00',
      status: 'enviada',
      validUntil: '2025-01-20',
      createdDate: '2025-01-07',
      items: 2,
      ticket: ''
    },
    {
      id: 'COT-2025-003',
      client: 'Innovate Corp',
      amount: 'RD$ 65,000.00', 
      status: 'borrador',
      validUntil: '2025-01-25',
      createdDate: '2025-01-06',
      items: 4,
      ticket: 'T-003'
    }
  ]);

  // Generar datos de ventas basados en los clientes reales
  const salesData = customers.slice(0, 4).map((customer, index) => ({
    id: customer.id,
    customer: customer.name,
    amount: `RD$ ${(customer.accountsReceivable || 15000 + index * 5000).toLocaleString()}`,
    status: index === 0 ? 'Cerrada' : index === 1 ? 'En proceso' : 'Propuesta',
    date: new Date(customer.updatedAt).toLocaleDateString()
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cerrada': return 'bg-green-100 text-green-800';
      case 'En proceso': return 'bg-blue-100 text-blue-800';
      case 'Propuesta': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateQuotation = (newQuotation: any) => {
    setQuotations(prev => [...prev, newQuotation]);
    setIsCreateQuotationOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Módulo de Ventas</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateQuotationOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText size={16} className="mr-2" />
            Nueva Cotización
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <Plus size={16} className="mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold text-green-600">$58,250</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cotizaciones Activas</p>
                <p className="text-2xl font-bold text-blue-600">{quotations.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crecimiento</p>
                <p className="text-2xl font-bold text-purple-600">+18%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar cotizaciones, clientes, ventas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="quotations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quotations" className="flex items-center space-x-2">
            <FileText size={16} />
            <span>Cotizaciones</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <ShoppingCart size={16} />
            <span>Ventas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotations" className="mt-6">
          <Quotations 
            searchTerm={searchTerm} 
            quotations={quotations} 
            onCreateQuotation={handleCreateQuotation}
          />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-gray-600">Cliente</th>
                      <th className="text-left p-4 font-medium text-gray-600">Monto</th>
                      <th className="text-left p-4 font-medium text-gray-600">Estado</th>
                      <th className="text-left p-4 font-medium text-gray-600">Fecha</th>
                      <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{sale.customer}</td>
                        <td className="p-4 text-green-600 font-semibold">{sale.amount}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-600">{sale.date}</td>
                        <td className="p-4">
                          <Button variant="outline" size="sm">Ver Detalles</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Quotation Dialog */}
        <CreateQuotationForm
        isOpen={isCreateQuotationOpen}
        onClose={() => setIsCreateQuotationOpen(false)}
        onCreateQuotation={handleCreateQuotation}
        existingQuotations={quotations}
        customers={customers}
      />
    </div>
  );
};

export default SalesModule;
