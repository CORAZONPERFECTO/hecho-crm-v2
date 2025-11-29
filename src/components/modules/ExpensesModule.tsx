
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import FixedExpensesForm from './expenses/FixedExpensesForm';
import TicketExpensesForm from './expenses/TicketExpensesForm';
import ExpensesList from './expenses/ExpensesList';
import ExpensesStats from './expenses/ExpensesStats';

const ExpensesModule: React.FC = () => {
  const { fixedExpenses, ticketExpenses, loading, createFixedExpense, createTicketExpense } = useExpenses();
  const [showFixedForm, setShowFixedForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);

  const handleCreateFixedExpense = async (data: any) => {
    await createFixedExpense(data);
    setShowFixedForm(false);
  };

  const handleCreateTicketExpense = async (data: any) => {
    await createTicketExpense(data);
    setShowTicketForm(false);
  };

  if (showFixedForm) {
    return (
      <FixedExpensesForm
        onClose={() => setShowFixedForm(false)}
        onSubmit={handleCreateFixedExpense}
      />
    );
  }

  if (showTicketForm) {
    return (
      <TicketExpensesForm
        onClose={() => setShowTicketForm(false)}
        onSubmit={handleCreateTicketExpense}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
          <p className="text-gray-600">
            Controla gastos fijos mensuales y gastos variables por ticket
          </p>
        </div>
      </div>

      <ExpensesStats fixedExpenses={fixedExpenses} ticketExpenses={ticketExpenses} />

      <Tabs defaultValue="fixed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed">Gastos Fijos</TabsTrigger>
          <TabsTrigger value="variable">Gastos Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gastos Fijos Mensuales
              </CardTitle>
              <Button onClick={() => setShowFixedForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Gasto Fijo
              </Button>
            </CardHeader>
            <CardContent>
              <ExpensesList 
                expenses={fixedExpenses} 
                type="fixed" 
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variable" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Gastos Variables por Ticket
              </CardTitle>
              <Button onClick={() => setShowTicketForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Gasto Variable
              </Button>
            </CardHeader>
            <CardContent>
              <ExpensesList 
                expenses={ticketExpenses} 
                type="variable" 
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesModule;
