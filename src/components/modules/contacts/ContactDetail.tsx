
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  FileText,
  Plus,
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Contact } from './types';
import { 
  getContactTypeColor, 
  getStatusColor, 
  formatCurrency, 
  checkCreditLimit 
} from './utils';

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  userRole: 'admin' | 'technician' | 'manager';
}

const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  onClose,
  onEdit,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('general');

  // Sample related data - would come from API
  const relatedTickets = [
    { id: 'T001', title: 'Instalación Eléctrica', status: 'completado', date: '2024-06-10', amount: 15000 },
    { id: 'T002', title: 'Mantenimiento AC', status: 'en_progreso', date: '2024-06-15', amount: 8000 }
  ];

  const relatedInvoices = [
    { id: 'F001', number: 'FAC-2024-001', status: 'pagada', date: '2024-06-01', amount: 15000 },
    { id: 'F002', number: 'FAC-2024-002', status: 'pendiente', date: '2024-06-15', amount: 8000, dueDate: '2024-07-15' }
  ];

  const relatedQuotations = [
    { id: 'C001', number: 'COT-2024-001', status: 'aprobada', date: '2024-05-20', amount: 25000 },
    { id: 'C002', number: 'COT-2024-002', status: 'pendiente', date: '2024-06-10', amount: 12000 }
  ];

  const paymentHistory = [
    { id: 'P001', date: '2024-06-01', amount: 15000, method: 'Transferencia', reference: 'TRF-001' },
    { id: 'P002', date: '2024-05-15', amount: 20000, method: 'Cheque', reference: 'CHK-445521' }
  ];

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const hasFinancialAlert = checkCreditLimit(contact);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div>
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              <p className="text-gray-500">{contact.identificationNumber}</p>
            </div>
            <Badge className={getContactTypeColor(contact.type)}>
              {contact.type}
            </Badge>
            <Badge className={getStatusColor(contact.status)}>
              {contact.status}
            </Badge>
            {hasFinancialAlert && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Límite de crédito excedido</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Button onClick={() => onEdit(contact)}>
                <Edit size={16} className="mr-2" />
                Editar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="financial">Estado Financiero</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <TabsContent value="general" className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Phone size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Teléfono Principal</p>
                          <p>{contact.phone1 || 'No especificado'}</p>
                        </div>
                      </div>
                      
                      {contact.mobile && (
                        <div className="flex items-center space-x-3">
                          <Phone size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Celular</p>
                            <p>{contact.mobile}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <Mail size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p>{contact.email || 'No especificado'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MapPin size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Dirección</p>
                          <p>{contact.address}</p>
                          <p className="text-sm text-gray-500">
                            {contact.municipality}, {contact.province}, {contact.country}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información Comercial</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Términos de Pago</p>
                        <p>{contact.paymentTerms}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Lista de Precios</p>
                        <p>{contact.priceList}</p>
                      </div>
                      
                      {contact.assignedSalesperson && (
                        <div>
                          <p className="text-sm text-gray-600">Vendedor Asignado</p>
                          <p>{contact.assignedSalesperson}</p>
                        </div>
                      )}
                      
                      {contact.internalNotes && (
                        <div>
                          <p className="text-sm text-gray-600">Observaciones Internas</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{contact.internalNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-6">
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contact.type === 'cliente' && (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Límite de Crédito</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(contact.creditLimit)}
                              </p>
                            </div>
                            <CreditCard className="text-blue-600" size={24} />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Por Cobrar</p>
                              <p className={`text-2xl font-bold ${hasFinancialAlert ? 'text-red-600' : 'text-orange-600'}`}>
                                {formatCurrency(contact.accountsReceivable)}
                              </p>
                            </div>
                            <TrendingUp className={hasFinancialAlert ? 'text-red-600' : 'text-orange-600'} size={24} />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Crédito Disponible</p>
                              <p className={`text-2xl font-bold ${hasFinancialAlert ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(contact.creditLimit - contact.accountsReceivable)}
                              </p>
                            </div>
                            <div className={`p-2 rounded-full ${hasFinancialAlert ? 'bg-red-100' : 'bg-green-100'}`}>
                              <span className={`text-xs font-bold ${hasFinancialAlert ? 'text-red-600' : 'text-green-600'}`}>
                                {Math.round(((contact.creditLimit - contact.accountsReceivable) / contact.creditLimit) * 100)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {contact.type === 'proveedor' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Por Pagar</p>
                            <p className="text-2xl font-bold text-red-600">
                              {formatCurrency(contact.accountsPayable)}
                            </p>
                          </div>
                          <TrendingUp className="text-red-600" size={24} />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Payment History */}
                {contact.type === 'cliente' && paymentHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Pagos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paymentHistory.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount)}</p>
                              <p className="text-sm text-gray-600">{payment.method} - {payment.reference}</p>
                            </div>
                            <p className="text-sm text-gray-500">{payment.date}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                {/* Related Tickets */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tickets Relacionados</CardTitle>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Nuevo Ticket
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedTickets.map((ticket) => (
                        <div key={ticket.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-gray-600">#{ticket.id}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={ticket.status === 'completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {ticket.status}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">{ticket.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Related Invoices */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Facturas</CardTitle>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Nueva Factura
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedInvoices.map((invoice) => (
                        <div key={invoice.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">{invoice.number}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(invoice.amount)}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={invoice.status === 'pagada' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                              {invoice.status}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">{invoice.date}</p>
                            {invoice.dueDate && invoice.status === 'pendiente' && (
                              <p className="text-xs text-red-600">Vence: {invoice.dueDate}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Related Quotations */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cotizaciones</CardTitle>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Nueva Cotización
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedQuotations.map((quotation) => (
                        <div key={quotation.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">{quotation.number}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(quotation.amount)}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={quotation.status === 'aprobada' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {quotation.status}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">{quotation.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Documentos</CardTitle>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Subir Documento
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                      <p className="text-gray-500">Los documentos subidos aparecerán aquí</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default ContactDetail;
