
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useExpenses } from '@/hooks/useExpenses';
import ProfitFilters from './profit/ProfitFilters';
import ProfitTable from './profit/ProfitTable';
import ProfitCharts from './profit/ProfitCharts';

const ProfitAnalysisModule: React.FC = () => {
  const { tickets, loading: ticketsLoading } = useTickets();
  const { fixedExpenses, ticketExpenses, loading: expensesLoading } = useExpenses();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [excludeFromAnalysis, setExcludeFromAnalysis] = useState(false);

  const loading = ticketsLoading || expensesLoading;

  // Filtrar tickets según criterios
  const filteredTickets = tickets.filter(ticket => {
    if (excludeFromAnalysis && ticket.exclude_from_profit_loss) return false;
    
    if (dateRange.from && dateRange.to) {
      const ticketDate = new Date(ticket.created_at);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      return ticketDate >= fromDate && ticketDate <= toDate;
    }
    
    return true;
  });

  // Calcular ingresos por tickets facturados
  const revenue = filteredTickets
    .filter(ticket => ticket.status === 'facturado-finalizado')
    .reduce((sum, ticket) => {
      // Por ahora asumimos un valor promedio, luego conectaremos con facturas reales
      return sum + 500; // Valor ejemplo
    }, 0);

  // Calcular gastos variables de los tickets filtrados
  const variableExpenses = ticketExpenses
    .filter(expense => filteredTickets.some(ticket => ticket.id === expense.ticket_id))
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calcular gastos fijos del período
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyFixedExpenses = fixedExpenses
    .filter(expense => expense.month === currentMonth && expense.year === currentYear)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = variableExpenses + monthlyFixedExpenses;
  const profit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100) : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Rentabilidad</h1>
          <p className="text-gray-600">
            Analiza ganancias y pérdidas por tickets y períodos
          </p>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`${profit >= 0 ? 'bg-green-500' : 'bg-red-500'} p-3 rounded-lg`}>
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`${profitMargin >= 0 ? 'bg-blue-500' : 'bg-red-500'} p-3 rounded-lg`}>
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Margen</p>
                <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="detailed">Detalle por Ticket</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProfitFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            excludeFromAnalysis={excludeFromAnalysis}
            onExcludeChange={setExcludeFromAnalysis}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Rentabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">Tickets analizados:</span>
                  <Badge variant="outline">{filteredTickets.length}</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                  <span className="font-medium">Ingresos totales:</span>
                  <span className="font-bold text-green-600">${revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded">
                  <span className="font-medium">Gastos variables:</span>
                  <span className="font-bold text-red-600">${variableExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                  <span className="font-medium">Gastos fijos del mes:</span>
                  <span className="font-bold text-blue-600">${monthlyFixedExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded border-t-2">
                  <span className="font-bold text-lg">Resultado neto:</span>
                  <span className={`font-bold text-xl ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <ProfitTable 
            tickets={filteredTickets}
            ticketExpenses={ticketExpenses}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <ProfitCharts 
            tickets={filteredTickets}
            fixedExpenses={fixedExpenses}
            ticketExpenses={ticketExpenses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfitAnalysisModule;
