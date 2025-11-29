
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { FixedExpense, TicketExpense } from '@/hooks/useExpenses';

interface ExpensesStatsProps {
  fixedExpenses: FixedExpense[];
  ticketExpenses: TicketExpense[];
}

const ExpensesStats: React.FC<ExpensesStatsProps> = ({ fixedExpenses, ticketExpenses }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthFixed = fixedExpenses
    .filter(expense => expense.month === currentMonth && expense.year === currentYear)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalVariable = ticketExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const currentMonthVariable = ticketExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      title: 'Gastos Fijos del Mes',
      value: currentMonthFixed,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Gastos Variables del Mes',
      value: currentMonthVariable,
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      title: 'Total Gastos Fijos',
      value: totalFixed,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Gastos Variables',
      value: totalVariable,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpensesStats;
