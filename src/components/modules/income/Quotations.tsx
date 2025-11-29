
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, ArrowRight, CheckCircle, Copy } from 'lucide-react';
import DocumentActions from './DocumentActions';
import DocumentViewer from './DocumentViewer';
import ConvertToInvoiceDialog from './ConvertToInvoiceDialog';
import CreateQuotationForm from './CreateQuotationForm';
import { generateSalesPDF } from './utils/salesPDFGenerator';
import { useToast } from '@/hooks/use-toast';

interface Quotation {
  id: string;
  client: string;
  amount: string;
  status: string;
  validUntil: string;
  createdDate: string;
  items: number;
  ticket: string;
  convertedToInvoice?: boolean;
  total?: number;
  number?: string;
}

interface QuotationsProps {
  searchTerm: string;
  quotations: Quotation[];
  onCreateQuotation: (quotation: Quotation) => void;
}

const Quotations: React.FC<QuotationsProps> = ({ searchTerm, quotations, onCreateQuotation }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<string>('');
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [quotationToConvert, setQuotationToConvert] = useState<Quotation | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [quotationToDuplicate, setQuotationToDuplicate] = useState<Quotation | null>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'enviada': return 'bg-blue-100 text-blue-800';
      case 'aprobada': return 'bg-green-100 text-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'borrador': return 'Borrador';
      case 'enviada': return 'Enviada';
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      default: return status;
    }
  };

  const filteredQuotations = quotations.filter(quotation =>
    quotation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (quotationId: string) => {
    setSelectedQuotation(quotationId);
    setViewerOpen(true);
  };

  const handleEdit = (quotationId: string) => {
    console.log(`Editing quotation: ${quotationId}`);
    // Implementar lógica de edición
  };

  const handleConvertToInvoice = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (quotation) {
      setQuotationToConvert(quotation);
      setConvertDialogOpen(true);
    }
  };

  const handleGeneratePDF = async (quotation: Quotation) => {
    toast({
      title: "Generando PDF",
      description: `Generando cotización ${quotation.id}`,
    });
    
    try {
      const quotationData = {
        type: 'quotation' as const,
        title: 'Cotización',
        number: quotation.id,
        clientName: quotation.client,
        items: [
          {
            id: '1',
            description: 'Servicios según cotización',
            quantity: quotation.items,
            unitPrice: parseFloat(quotation.amount.replace(/[$,]/g, '')) / quotation.items,
          }
        ],
        subtotal: parseFloat(quotation.amount.replace(/[$,]/g, '')),
        discount: 0,
        tax: 0,
        total: parseFloat(quotation.amount.replace(/[$,]/g, '')),
        notes: `Cotización válida hasta: ${quotation.validUntil}`,
        date: quotation.createdDate,
      };
      
      await generateSalesPDF(quotationData);
      
      toast({
        title: "PDF generado",
        description: "La cotización ha sido descargada exitosamente",
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

  const handleDuplicate = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (quotation) {
      setQuotationToDuplicate(quotation);
      setDuplicateDialogOpen(true);
    }
  };

  const handleConversionSuccess = () => {
    setConvertDialogOpen(false);
    setQuotationToConvert(null);
  };

  const handleDuplicateSuccess = () => {
    setDuplicateDialogOpen(false);
    setQuotationToDuplicate(null);
    toast({
      title: "Cotización duplicada",
      description: "La cotización ha sido duplicada exitosamente",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cotizaciones</h3>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <FileText size={16} className="mr-2" />
          Nueva Cotización
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
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Válida Hasta</TableHead>
                <TableHead>Ticket Origen</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{quotation.id}</TableCell>
                  <TableCell>{quotation.client}</TableCell>
                  <TableCell className="font-semibold text-green-600">{quotation.amount}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quotation.status)}>
                      {getStatusText(quotation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{quotation.createdDate}</TableCell>
                  <TableCell>{quotation.validUntil}</TableCell>
                  <TableCell>
                    {quotation.ticket ? (
                      <Badge variant="outline">{quotation.ticket}</Badge>
                    ) : (
                      <span className="text-gray-400">Manual</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGeneratePDF(quotation)}
                        title="Generar PDF Profesional"
                      >
                        <FileText size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(quotation.id)}
                        title="Duplicar cotización"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy size={16} />
                      </Button>
                      <DocumentActions
                        documentId={quotation.id}
                        documentType="quotation"
                        onView={handleView}
                        onEdit={handleEdit}
                      />
                      {quotation.convertedToInvoice ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1" />
                          <span className="text-xs">Facturada</span>
                        </div>
                      ) : quotation.status === 'aprobada' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleConvertToInvoice(quotation.id)}
                          title="Convertir a factura"
                        >
                          <ArrowRight size={16} />
                        </Button>
                      )}
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
        documentId={selectedQuotation}
        documentType="quotation"
      />

      {quotationToConvert && (
        <ConvertToInvoiceDialog
          isOpen={convertDialogOpen}
          onClose={() => setConvertDialogOpen(false)}
          quotationId={quotationToConvert.id}
          quotationData={quotationToConvert}
          onSuccess={handleConversionSuccess}
        />
      )}

      {quotationToDuplicate && (
        <CreateQuotationForm
          isOpen={duplicateDialogOpen}
          onClose={() => setDuplicateDialogOpen(false)}
          onCreateQuotation={(newQuotation) => {
            onCreateQuotation(newQuotation);
            handleDuplicateSuccess();
          }}
          existingQuotations={quotations}
          duplicateFrom={quotationToDuplicate}
        />
      )}
    </div>
  );
};

export default Quotations;
