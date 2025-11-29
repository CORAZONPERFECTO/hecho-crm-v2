
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SupabaseTicket } from '@/hooks/useTickets';
import { TicketExpense } from '@/hooks/useExpenses';

interface ProfitTableProps {
  tickets: SupabaseTicket[];
  ticketExpenses: TicketExpense[];
  loading: boolean;
}

const ProfitTable: React.FC<ProfitTableProps> = ({ tickets, ticketExpenses, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTicketExpenses = (ticketId: string) => {
    return ticketExpenses
      .filter(expense => expense.ticket_id === ticketId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'facturado-finalizado': return 'bg-green-100 text-green-800';
      case 'aprobado-factura': return 'bg-blue-100 text-blue-800';
      case 'cerrado-pendiente-cotizar': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle por Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Gastos Variables</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const expenses = getTicketExpenses(ticket.id);
              const revenue = ticket.status === 'facturado-finalizado' ? 500 : 0; // Valor ejemplo
              const profit = revenue - expenses;
              
              return (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    {ticket.ticket_number}
                  </TableCell>
                  <TableCell>{ticket.client}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ${revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-red-600">
                    ${expenses.toLocaleString()}
                  </TableCell>
                  <TableCell className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profit.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProfitTable;
