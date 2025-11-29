
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, AlertTriangle, FileText } from 'lucide-react';
import DocumentActions from './DocumentActions';
import DocumentViewer from './DocumentViewer';
import { generateSalesPDF } from './utils/salesPDFGenerator';
import { useToast } from '@/hooks/use-toast';

interface SalesInvoice {
  id: string;
  client: string;
  amount: string;
  status: 'pagada' | 'pendiente' | 'vencida' | string;
  dueDate: string;
  issueDate: string;
  items: number;
}

interface SalesInvoicesProps {
  searchTerm: string;
  invoices: SalesInvoice[];
}

const SalesInvoices: React.FC<SalesInvoicesProps> = ({ searchTerm, invoices }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pagada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pagada': return 'Pagada';
      case 'pendiente': return 'Pendiente';
      case 'vencida': return 'Vencida';
      default: return status;
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setViewerOpen(true);
  };

  const handleGeneratePDF = async (invoice: SalesInvoice) => {
    toast({
      title: "Generando PDF",
      description: `Generando factura ${invoice.id}`,
    });
    
    try {
      const invoiceData = {
        type: 'invoice' as const,
        title: 'Factura',
        number: invoice.id,
        clientName: invoice.client,
        items: [
          {
            id: '1',
            description: 'Servicios según factura',
            quantity: invoice.items,
            unitPrice: parseFloat(invoice.amount.replace(/[$,]/g, '')) / invoice.items,
          }
        ],
        subtotal: parseFloat(invoice.amount.replace(/[$,]/g, '')) / 1.18, // Assuming 18% tax
        discount: 0,
        tax: parseFloat(invoice.amount.replace(/[$,]/g, '')) * 0.18 / 1.18,
        total: parseFloat(invoice.amount.replace(/[$,]/g, '')),
        notes: `Fecha de vencimiento: ${invoice.dueDate}`,
        date: invoice.issueDate,
        dueDate: invoice.dueDate,
      };
      
      await generateSalesPDF(invoiceData);
      
      toast({
        title: "PDF generado",
        description: "La factura ha sido descargada exitosamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (invoiceId: string) => {
    console.log(`Editing invoice: ${invoiceId}`);
    // Implementar lógica de edición
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Facturas de Venta</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Ítems</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell className="font-semibold text-green-600">{invoice.amount}</TableCell>
                  <TableCell>{invoice.items}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                      {invoice.status === 'vencida' && (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGeneratePDF(invoice)}
                        title="Generar PDF Profesional"
                      >
                        <FileText size={16} />
                      </Button>
                      <DocumentActions
                        documentId={invoice.id}
                        documentType="invoice"
                        onView={handleView}
                        onEdit={handleEdit}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentId={selectedInvoice}
        documentType="invoice"
      />
    </div>
  );
};

export default SalesInvoices;
