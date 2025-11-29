
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, TrendingDown, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import AccountingDashboard from './accounting/AccountingDashboard';
import IncomeRegistry from './accounting/IncomeRegistry';
import ExpenseRegistry from './accounting/ExpenseRegistry';
import CustomerAccountStatus from './accounting/CustomerAccountStatus';
import BankReconciliation from './accounting/BankReconciliation';
import AccountingReports from './accounting/AccountingReports';

const AccountingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Módulo de Contabilidad Empresarial</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <BarChart3 size={16} />
          <span>Sistema Contable Integrado</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Panel General
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown size={16} />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <DollarSign size={16} />
            Estado Clientes
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <AlertCircle size={16} />
            Conciliación
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText size={16} />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AccountingDashboard />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <IncomeRegistry />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpenseRegistry />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomerAccountStatus />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-6">
          <BankReconciliation />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <AccountingReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountingModule;
