
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SupabaseTicket } from '@/hooks/useTickets';
import { FixedExpense, TicketExpense } from '@/hooks/useExpenses';

interface ProfitChartsProps {
  tickets: SupabaseTicket[];
  fixedExpenses: FixedExpense[];
  ticketExpenses: TicketExpense[];
}

const ProfitCharts: React.FC<ProfitChartsProps> = ({ tickets, fixedExpenses, ticketExpenses }) => {
  // Preparar datos para gráfico de barras mensual
  const monthlyData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthNumber = index + 1;
      
      // Ingresos del mes (tickets facturados)
      const monthlyRevenue = tickets
        .filter(ticket => {
          const ticketDate = new Date(ticket.created_at);
          return ticketDate.getMonth() + 1 === monthNumber && 
                 ticketDate.getFullYear() === currentYear &&
                 ticket.status === 'facturado-finalizado';
        })
        .length * 500; // Valor ejemplo

      // Gastos fijos del mes
      const monthlyFixed = fixedExpenses
        .filter(expense => expense.month === monthNumber && expense.year === currentYear)
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Gastos variables del mes
      const monthlyVariable = ticketExpenses
        .filter(expense => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate.getMonth() + 1 === monthNumber && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        month,
        ingresos: monthlyRevenue,
        gastosFijos: monthlyFixed,
        gastosVariables: monthlyVariable,
        ganancia: monthlyRevenue - monthlyFixed - monthlyVariable
      };
    });
  }, [tickets, fixedExpenses, ticketExpenses]);

  // Preparar datos para gráfico de pie de gastos
  const expensesCategoryData = React.useMemo(() => {
    const fixedByCategory = fixedExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const variableByCategory = ticketExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const allCategories = { ...fixedByCategory, ...variableByCategory };

    return Object.entries(allCategories).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
  }, [fixedExpenses, ticketExpenses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" />
              <Bar dataKey="gastosFijos" fill="#EF4444" name="Gastos Fijos" />
              <Bar dataKey="gastosVariables" fill="#F59E0B" name="Gastos Variables" />
              <Bar dataKey="ganancia" fill="#3B82F6" name="Ganancia" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expensesCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitCharts;
