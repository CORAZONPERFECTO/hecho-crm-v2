
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, AlertTriangle } from 'lucide-react';

const CustomerAccountStatus: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customerData = [
    {
      id: 1,
      name: 'Empresa ABC',
      totalBilled: 45000,
      totalPaid: 32000,
      pendingBalance: 13000,
      invoices: [
        { id: 'F001', amount: 15000, status: 'paid', date: '2024-05-15', dueDate: '2024-05-30' },
        { id: 'F003', amount: 17000, status: 'paid', date: '2024-05-20', dueDate: '2024-06-04' },
        { id: 'F007', amount: 13000, status: 'pending', date: '2024-06-10', dueDate: '2024-06-25' }
      ]
    },
    {
      id: 2,
      name: 'Tech Solutions',
      totalBilled: 28500,
      totalPaid: 20000,
      pendingBalance: 8500,
      invoices: [
        { id: 'F002', amount: 12000, status: 'paid', date: '2024-05-18', dueDate: '2024-06-02' },
        { id: 'F005', amount: 8000, status: 'paid', date: '2024-05-25', dueDate: '2024-06-09' },
        { id: 'F008', amount: 8500, status: 'overdue', date: '2024-06-01', dueDate: '2024-06-16' }
      ]
    },
    {
      id: 3,
      name: 'Global Industries',
      totalBilled: 52000,
      totalPaid: 52000,
      pendingBalance: 0,
      invoices: [
        { id: 'F004', amount: 22000, status: 'paid', date: '2024-05-22', dueDate: '2024-06-06' },
        { id: 'F006', amount: 18000, status: 'paid', date: '2024-05-28', dueDate: '2024-06-12' },
        { id: 'F009', amount: 12000, status: 'paid', date: '2024-06-05', dueDate: '2024-06-20' }
      ]
    }
  ];

  const filteredCustomers = customerData.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Estado de Cuenta por Cliente</h2>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          Exportar Todo
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Account Status */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-gray-800">{customer.name}</CardTitle>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Facturado</p>
                      <p className="text-lg font-bold text-blue-600">${customer.totalBilled.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Pagado</p>
                      <p className="text-lg font-bold text-green-600">${customer.totalPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Saldo Pendiente</p>
                      <p className={`text-lg font-bold ${customer.pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${customer.pendingBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye size={14} className="mr-2" />
                    Ver Detalle
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={14} className="mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Factura</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Fecha</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Vencimiento</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Monto</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{invoice.id}</td>
                        <td className="p-3 text-gray-600">{invoice.date}</td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center">
                            {invoice.dueDate}
                            {invoice.status === 'overdue' && (
                              <AlertTriangle size={14} className="ml-2 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-semibold">${invoice.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusText(invoice.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerAccountStatus;
