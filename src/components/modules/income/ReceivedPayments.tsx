
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, DollarSign } from 'lucide-react';
import DocumentActions from './DocumentActions';

interface ReceivedPayment {
  id: string;
  invoice: string;
  client: string;
  amount: string;
  method: string;
  date: string;
  status: string;
  reference: string;
}

interface ReceivedPaymentsProps {
  searchTerm: string;
}

const ReceivedPayments: React.FC<ReceivedPaymentsProps> = ({ searchTerm }) => {
  const [payments] = useState<ReceivedPayment[]>([
    {
      id: 'PAG-001',
      invoice: 'FAC-2025-001',
      client: 'Empresa ABC S.A.',
      amount: 'RD$ 15,750.00',
      method: 'Transferencia',
      date: '2025-06-15',
      status: 'confirmado',
      reference: 'TRF-123456789'
    },
    {
      id: 'PAG-002',
      invoice: 'FAC-2025-003',
      client: 'TechCorp Solutions',
      amount: 'RD$ 5,000.00',
      method: 'Cheque',
      date: '2025-06-14',
      status: 'pendiente',
      reference: 'CHK-987654321'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'transferencia':
      case 'deposito':
        return <CreditCard size={16} className="text-blue-500" />;
      case 'efectivo':
        return <DollarSign size={16} className="text-green-500" />;
      default:
        return <CreditCard size={16} className="text-gray-500" />;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pagos Recibidos</h3>
        <Button className="bg-green-600 hover:bg-green-700">
          <DollarSign size={16} className="mr-2" />
          Registrar Pago
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.invoice}</Badge>
                  </TableCell>
                  <TableCell>{payment.client}</TableCell>
                  <TableCell className="font-semibold text-green-600">{payment.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getMethodIcon(payment.method)}
                      <span className="ml-2">{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                  <TableCell>
                    <DocumentActions
                      documentId={payment.id}
                      documentType="payment"
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

export default ReceivedPayments;
