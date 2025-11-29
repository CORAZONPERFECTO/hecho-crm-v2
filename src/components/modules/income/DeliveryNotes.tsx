
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Package } from 'lucide-react';
import DocumentActions from './DocumentActions';

interface DeliveryNote {
  id: string;
  invoice: string;
  client: string;
  items: number;
  deliveryDate: string;
  status: string;
  location: string;
  driver: string;
}

interface DeliveryNotesProps {
  searchTerm: string;
}

const DeliveryNotes: React.FC<DeliveryNotesProps> = ({ searchTerm }) => {
  const [deliveryNotes] = useState<DeliveryNote[]>([
    {
      id: 'CON-001',
      invoice: 'FAC-2025-001',
      client: 'Empresa ABC S.A.',
      items: 3,
      deliveryDate: '2025-06-16',
      status: 'entregado',
      location: 'Santo Domingo Este',
      driver: 'Carlos Pérez'
    },
    {
      id: 'CON-002',
      invoice: 'FAC-2025-003',
      client: 'TechCorp Solutions',
      items: 5,
      deliveryDate: '2025-06-17',
      status: 'en_transito',
      location: 'Santiago',
      driver: 'María González'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'en_transito': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'entregado': return 'Entregado';
      case 'en_transito': return 'En Tránsito';
      case 'pendiente': return 'Pendiente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredDeliveryNotes = deliveryNotes.filter(note =>
    note.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Conduces de Entrega</h3>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Truck size={16} className="mr-2" />
          Nuevo Conduce
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
                <TableHead>Ítems</TableHead>
                <TableHead>Fecha Entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveryNotes.map((note) => (
                <TableRow key={note.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{note.invoice}</Badge>
                  </TableCell>
                  <TableCell>{note.client}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package size={16} className="mr-2 text-blue-500" />
                      {note.items}
                    </div>
                  </TableCell>
                  <TableCell>{note.deliveryDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(note.status)}>
                      {getStatusText(note.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{note.location}</TableCell>
                  <TableCell>{note.driver}</TableCell>
                  <TableCell>
                    <DocumentActions
                      documentId={note.id}
                      documentType="delivery_note"
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

export default DeliveryNotes;
