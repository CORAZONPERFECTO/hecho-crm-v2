
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FixedExpense, TicketExpense } from '@/hooks/useExpenses';

interface ExpensesListProps {
  expenses: FixedExpense[] | TicketExpense[];
  type: 'fixed' | 'variable';
  loading: boolean;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, type, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay gastos {type === 'fixed' ? 'fijos' : 'variables'} registrados
      </div>
    );
  }

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {type === 'fixed' ? (
            <>
              <TableHead>Período</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Descripción</TableHead>
            </>
          ) : (
            <>
              <TableHead>Ticket</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            {type === 'fixed' ? (
              <>
                <TableCell>
                  <Badge variant="outline">
                    {getMonthName((expense as FixedExpense).month)} {(expense as FixedExpense).year}
                  </Badge>
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="font-medium">
                  ${expense.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600">
                  {expense.description || '-'}
                </TableCell>
              </>
            ) : (
              <>
                <TableCell>
                  <Badge variant="secondary">
                    {(expense as TicketExpense).ticket_id.slice(0, 8)}...
                  </Badge>
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="font-medium">
                  ${expense.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600">
                  {expense.description || '-'}
                </TableCell>
                <TableCell>
                  {format(new Date(expense.created_at), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpensesList;
