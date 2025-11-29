
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, RotateCcw } from 'lucide-react';
import DocumentActions from './DocumentActions';

interface CreditNote {
  id: string;
  invoice: string;
  client: string;
  amount: string;
  reason: string;
  date: string;
  status: string;
  type: string;
}

interface CreditNotesProps {
  searchTerm: string;
}

const CreditNotes: React.FC<CreditNotesProps> = ({ searchTerm }) => {
  const [creditNotes] = useState<CreditNote[]>([
    {
      id: 'NC-001',
      invoice: 'FAC-2025-002',
      client: 'TechCorp Solutions',
      amount: 'RD$ 2,500.00',
      reason: 'Devolución parcial de productos',
      date: '2025-06-10',
      status: 'emitida',
      type: 'Parcial'
    },
    {
      id: 'NC-002',
      invoice: 'FAC-2025-001',
      client: 'Empresa ABC S.A.',
      amount: 'RD$ 1,200.00',
      reason: 'Descuento por demora en entrega',
      date: '2025-06-08',
      status: 'aplicada',
      type: 'Descuento'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emitida': return 'bg-blue-100 text-blue-800';
      case 'aplicada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Parcial': return 'bg-yellow-100 text-yellow-800';
      case 'Total': return 'bg-red-100 text-red-800';
      case 'Descuento': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCreditNotes = creditNotes.filter(note =>
    note.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notas de Crédito</h3>
        <Button className="bg-red-600 hover:bg-red-700">
          <RotateCcw size={16} className="mr-2" />
          Nueva Nota de Crédito
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Factura Origen</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreditNotes.map((note) => (
                <TableRow key={note.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{note.invoice}</Badge>
                  </TableCell>
                  <TableCell>{note.client}</TableCell>
                  <TableCell className="font-semibold text-red-600">{note.amount}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(note.type)}>
                      {note.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={note.reason}>
                    {note.reason}
                  </TableCell>
                  <TableCell>{note.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(note.status)}>
                      {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DocumentActions
                      documentId={note.id}
                      documentType="credit"
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

export default CreditNotes;
