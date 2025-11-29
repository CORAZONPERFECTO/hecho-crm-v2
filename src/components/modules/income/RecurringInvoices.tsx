
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Calendar } from 'lucide-react';
import DocumentActions from './DocumentActions';

interface RecurringInvoice {
  id: string;
  client: string;
  amount: string;
  frequency: string;
  nextDate: string;
  status: string;
  template: string;
}

interface RecurringInvoicesProps {
  searchTerm: string;
}

const RecurringInvoices: React.FC<RecurringInvoicesProps> = ({ searchTerm }) => {
  const [invoices] = useState<RecurringInvoice[]>([
    {
      id: 'REC-001',
      client: 'TechCorp Solutions',
      amount: 'RD$ 15,000.00',
      frequency: 'Mensual',
      nextDate: '2025-07-15',
      status: 'activa',
      template: 'Soporte Técnico Mensual'
    },
    {
      id: 'REC-002',
      client: 'Global Industries',
      amount: 'RD$ 8,500.00',
      frequency: 'Trimestral',
      nextDate: '2025-09-01',
      status: 'pausada',
      template: 'Mantenimiento Equipos'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa': return 'bg-green-100 text-green-800';
      case 'pausada': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Facturas Recurrentes</h3>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw size={16} className="mr-2" />
          Nueva Factura Recurrente
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Próxima Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Plantilla</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell className="font-semibold text-green-600">{invoice.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-blue-500" />
                      {invoice.frequency}
                    </div>
                  </TableCell>
                  <TableCell>{invoice.nextDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.template}</TableCell>
                  <TableCell>
                    <DocumentActions
                      documentId={invoice.id}
                      documentType="recurring"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringInvoices;
