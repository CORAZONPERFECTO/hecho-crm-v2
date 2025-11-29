
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CreditCard,
  Receipt,
  RefreshCw
} from 'lucide-react';
import IncomeStats from './income/IncomeStats';
import SalesCharts from './income/SalesCharts';
import SalesInvoices from './income/SalesInvoices';
import RecurringInvoices from './income/RecurringInvoices';
import ReceivedPayments from './income/ReceivedPayments';
import CreditNotes from './income/CreditNotes';
import Quotations from './income/Quotations';
import DeliveryNotes from './income/DeliveryNotes';
import CreateInvoiceForm from './income/CreateInvoiceForm';
import CreateQuotationForm from './income/CreateQuotationForm';
import ProfessionalDocumentGenerator from './income/ProfessionalDocumentGenerator';
import EvidenceManagement from './income/EvidenceManagement';

const IncomeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false);
  const [isProfessionalDocOpen, setIsProfessionalDocOpen] = useState(false);
  const [professionalDocType, setProfessionalDocType] = useState<'quotation' | 'proforma' | 'invoice'>('quotation');

  const [invoices, setInvoices] = useState([
    {
      id: 'FAC-2025-001',
      client: 'Empresa ABC S.A.',
      amount: '$15,750.00',
      status: 'pagada',
      dueDate: '2025-06-30',
      issueDate: '2025-06-15',
      items: 3
    },
    {
      id: 'FAC-2025-002',
      client: 'TechCorp Solutions',
      amount: '$8,250.00',
      status: 'pendiente',
      dueDate: '2025-07-15',
      issueDate: '2025-06-10',
      items: 2
    },
    {
      id: 'FAC-2025-003',
      client: 'Global Industries',
      amount: '$22,500.00',
      status: 'vencida',
      dueDate: '2025-06-01',
      issueDate: '2025-05-15',
      items: 5
    }
  ]);

  const [quotations, setQuotations] = useState([
    {
      id: 'COT-2025-001',
      client: 'Nueva Empresa S.A.',
      amount: '$18,500.00',
      status: 'enviada',
      validUntil: '2025-07-15',
      createdDate: '2025-06-15',
      items: 4,
      ticket: 'TK-2025-06-0003'
    },
    {
      id: 'COT-2025-002',
      client: 'Startup Innovation',
      amount: '$12,750.00',
      status: 'aprobada',
      validUntil: '2025-06-30',
      createdDate: '2025-06-10',
      items: 3,
      ticket: 'TK-2025-06-0004'
    },
    {
      id: 'COT-2025-003',
      client: 'Corporate Solutions',
      amount: '$25,000.00',
      status: 'borrador',
      validUntil: '2025-07-01',
      createdDate: '2025-06-12',
      items: 6,
      ticket: ''
    },
    {
      id: 'COT-2025-004',
      client: 'Tech Ventures',
      amount: '$8,200.00',
      status: 'rechazada',
      validUntil: '2025-06-20',
      createdDate: '2025-06-05',
      items: 2,
      ticket: 'TK-2025-06-0005'
    }
  ]);

  const handleCreateInvoice = (newInvoice: any) => {
    setInvoices(prev => [...prev, newInvoice]);
  };

  const handleCreateQuotation = (newQuotation: any) => {
    setQuotations(prev => [...prev, newQuotation]);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Ventas</h1>
          <p className="text-gray-600">
            Gestión centralizada de todas las operaciones relacionadas con la emisión de documentos de ventas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            onClick={() => {
              setProfessionalDocType('invoice');
              setIsProfessionalDocOpen(true);
            }}
          >
            <Plus size={20} className="mr-2" />
            Factura Profesional 2025
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={() => {
              setProfessionalDocType('quotation');
              setIsProfessionalDocOpen(true);
            }}
          >
            <FileText size={20} className="mr-2" />
            Cotización Profesional 2025
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            onClick={() => {
              setProfessionalDocType('proforma');
              setIsProfessionalDocOpen(true);
            }}
          >
            <Receipt size={20} className="mr-2" />
            Factura Proforma 2025
          </Button>
        </div>
      </div>

      {/* Charts */}
      <SalesCharts />

      {/* Stats Cards */}
      <IncomeStats />

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, número de documento o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="invoices" className="flex items-center space-x-2">
                <Receipt size={16} />
                <span className="hidden sm:inline">Facturas Venta</span>
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center space-x-2">
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Fact. Recurrentes</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center space-x-2">
                <CreditCard size={16} />
                <span className="hidden sm:inline">Pagos Recibidos</span>
              </TabsTrigger>
              <TabsTrigger value="credits" className="flex items-center space-x-2">
                <DollarSign size={16} />
                <span className="hidden sm:inline">Notas Crédito</span>
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span className="hidden sm:inline">Conduces</span>
              </TabsTrigger>
              <TabsTrigger value="evidences" className="flex items-center space-x-2">
                <FileText size={16} />
                <span className="hidden sm:inline">Evidencias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="mt-6">
              <SalesInvoices searchTerm={searchTerm} invoices={invoices} />
            </TabsContent>

            <TabsContent value="recurring" className="mt-6">
              <RecurringInvoices searchTerm={searchTerm} />
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <ReceivedPayments searchTerm={searchTerm} />
            </TabsContent>

            <TabsContent value="credits" className="mt-6">
              <CreditNotes searchTerm={searchTerm} />
            </TabsContent>


            <TabsContent value="delivery" className="mt-6">
              <DeliveryNotes searchTerm={searchTerm} />
            </TabsContent>

            <TabsContent value="evidences" className="mt-6">
              <EvidenceManagement searchTerm={searchTerm} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <CreateInvoiceForm 
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onCreateInvoice={handleCreateInvoice}
        existingInvoices={invoices}
      />
      <CreateQuotationForm
        isOpen={isCreateQuotationOpen}
        onClose={() => setIsCreateQuotationOpen(false)}
        onCreateQuotation={handleCreateQuotation}
        existingQuotations={quotations}
      />
      <ProfessionalDocumentGenerator
        isOpen={isProfessionalDocOpen}
        onClose={() => setIsProfessionalDocOpen(false)}
        documentType={professionalDocType}
      />
    </div>
  );
};

export default IncomeModule;
