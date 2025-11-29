
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ticket } from './types';
import { getPriorityColor } from './utils';
import StatusIcon from './StatusIcon';

interface TicketsListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

const TicketsList: React.FC<TicketsListProps> = ({ tickets, onSelectTicket }) => {
  return (
    <div className="space-y-4">
      {/* Desktop View (Table) */}
      <Card className="border-0 shadow-lg hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Ticket</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">{ticket.ticketNumber}</TableCell>
                  <TableCell>{ticket.client}</TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <StatusIcon status={ticket.status} />
                      <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.assignedTo}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectTicket(ticket)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="shadow-sm active:scale-[0.98] transition-transform" onClick={() => onSelectTicket(ticket)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">#{ticket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{ticket.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-1">{ticket.client}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StatusIcon status={ticket.status} />
                  <span className="capitalize text-gray-700">{ticket.status.replace('-', ' ')}</span>
                </div>
                <div className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                  {ticket.assignedTo}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
          No se encontraron tickets que coincidan con los filtros aplicados
        </div>
      )}
    </div>
  );
};

export default TicketsList;
