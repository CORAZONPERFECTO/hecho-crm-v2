
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const AccountingDashboard: React.FC = () => {
  const dashboardData = {
    totalIncome: 125750,
    totalExpenses: 78250,
    netBalance: 47500,
    pendingInvoices: 15,
    overdueInvoices: 3,
    activeQuotations: 8
  };

  const recentTransactions = [
    { id: 1, type: 'income', description: 'Pago Factura #001', amount: 5000, date: '2024-06-15', client: 'Empresa ABC' },
    { id: 2, type: 'expense', description: 'Compra Materiales', amount: -2500, date: '2024-06-14', client: 'Proveedor XYZ' },
    { id: 3, type: 'income', description: 'Pago Factura #002', amount: 3200, date: '2024-06-13', client: 'Tech Solutions' },
    { id: 4, type: 'expense', description: 'Servicios Públicos', amount: -850, date: '2024-06-12', client: 'Empresa Eléctrica' },
  ];

  const pendingInvoices = [
    { id: 'F001', client: 'Empresa ABC', amount: 8500, dueDate: '2024-06-20', status: 'pending' },
    { id: 'F002', client: 'Global Corp', amount: 12000, dueDate: '2024-06-18', status: 'overdue' },
    { id: 'F003', client: 'Tech Innovations', amount: 6750, dueDate: '2024-06-25', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-800">${dashboardData.totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Gastos Totales</p>
                <p className="text-2xl font-bold text-red-800">${dashboardData.totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Balance Neto</p>
                <p className="text-2xl font-bold text-blue-800">${dashboardData.netBalance.toLocaleString()}</p>
              </div>
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Facturas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-800">{dashboardData.pendingInvoices}</p>
              </div>
              <Clock className="text-yellow-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Facturas Vencidas</p>
                <p className="text-2xl font-bold text-orange-800">{dashboardData.overdueInvoices}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Cotizaciones Activas</p>
                <p className="text-2xl font-bold text-purple-800">{dashboardData.activeQuotations}</p>
              </div>
              <CheckCircle className="text-purple-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Transacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.client} • {transaction.date}</p>
                  </div>
                  <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Facturas por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Factura {invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                    <p className="text-xs text-gray-500">Vence: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${invoice.amount.toLocaleString()}</p>
                    <Badge 
                      variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                      className="mt-1"
                    >
                      {invoice.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
