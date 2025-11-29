import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2, FileText, Download, Building, MapPin, Phone, Mail } from 'lucide-react';
import { Ticket, QuotationItem, Quotation } from './types';
import { serviceTypes, getServiceTypeName, getServiceTypePrice, generateQuotationNumber } from './utils';

interface CreateQuotationFormProps {
  ticket: Ticket;
  existingQuotations: Quotation[];
  onClose: () => void;
  onCreateQuotation: (quotationData: Quotation) => void;
}

interface CompanyInfo {
  companyName: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
}

const CreateQuotationForm: React.FC<CreateQuotationFormProps> = ({
  ticket,
  existingQuotations,
  onClose,
  onCreateQuotation
}) => {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState('');
  const [taxRate] = useState(0.18); // 18% IGV
  const [validityDays, setValidityDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState('30 días');
  const [deliveryTime, setDeliveryTime] = useState('15 días laborables');
  const [warranty, setWarranty] = useState('12 meses');
  const [currency, setCurrency] = useState('USD');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: 'TU EMPRESA S.A.',
    taxId: '1-31-12345-6',
    address: 'Av. Principal #123, Ciudad',
    phone: '+1 (809) 555-0123',
    email: 'ventas@tuempresa.com',
    website: 'www.tuempresa.com'
  });
  const [companyLogo, setCompanyLogo] = useState<string>('');

  // Load company information and logo from localStorage
  useEffect(() => {
    const savedCompanyData = localStorage.getItem('companySettings');
    if (savedCompanyData) {
      try {
        const parsedData = JSON.parse(savedCompanyData);
        setCompanyInfo({
          companyName: parsedData.companyName || 'TU EMPRESA S.A.',
          taxId: parsedData.taxId || '1-31-12345-6',
          address: parsedData.address || 'Av. Principal #123, Ciudad',
          phone: parsedData.phone || '+1 (809) 555-0123',
          email: parsedData.email || 'ventas@tuempresa.com',
          website: parsedData.website || 'www.tuempresa.com'
        });
      } catch (error) {
        console.error('Error parsing company data:', error);
      }
    }

    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }
  }, []);

  // Initialize items based on ticket services
  React.useEffect(() => {
    const serviceItems: QuotationItem[] = [];
    
    ticket.visits.forEach(visit => {
      visit.services?.forEach(service => {
        const existingItem = serviceItems.find(item => item.serviceType === service.type);
        
        if (existingItem) {
          existingItem.quantity += service.quantity;
          existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
        } else {
          serviceItems.push({
            id: Math.random().toString(36).substr(2, 9),
            serviceType: service.type,
            quantity: service.quantity,
            unitPrice: getServiceTypePrice(service.type),
            totalPrice: service.quantity * getServiceTypePrice(service.type),
            description: service.description
          });
        }
      });
    });

    setItems(serviceItems);
  }, [ticket]);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Math.random().toString(36).substr(2, 9),
      serviceType: 'otros',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: ''
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'RD$';
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const generatePDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const quotationNumber = generateQuotationNumber(existingQuotations);
    const currentDate = new Date().toLocaleDateString('es-ES');
    const validUntilDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Cotización ${quotationNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .company-info { flex: 1; }
            .logo { width: 120px; height: 80px; object-fit: contain; }
            .company-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
            .company-details { font-size: 11px; color: #6b7280; line-height: 1.5; }
            .quotation-info { text-align: right; }
            .quotation-title { font-size: 24px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; }
            .quotation-number { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .client-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .client-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #374151; }
            .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .client-item { font-size: 11px; }
            .client-label { font-weight: bold; color: #6b7280; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th { background: #374151; color: white; padding: 12px 8px; text-align: left; font-size: 11px; font-weight: bold; }
            .items-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
            .items-table tbody tr:nth-child(even) { background: #f9fafb; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .totals-table { width: 100%; max-width: 300px; margin-left: auto; }
            .totals-table td { padding: 5px 10px; font-size: 12px; }
            .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #374151; }
            .terms-section { margin-bottom: 20px; }
            .terms-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #374151; }
            .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .terms-item { font-size: 11px; }
            .notes { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; }
            @media print {
              body { print-color-adjust: exact; }
              .container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="logo">` : ''}
                <div class="company-name">${companyInfo.companyName}</div>
                <div class="company-details">
                  ${companyInfo.address}<br>
                  Tel: ${companyInfo.phone}<br>
                  Email: ${companyInfo.email}<br>
                  ${companyInfo.website ? `Web: ${companyInfo.website}<br>` : ''}
                  RNC: ${companyInfo.taxId}
                </div>
              </div>
              <div class="quotation-info">
                <div class="quotation-title">COTIZACIÓN</div>
                <div class="quotation-number"># ${quotationNumber}</div>
                <div>Fecha: ${currentDate}</div>
                <div>Válida hasta: ${validUntilDate}</div>
              </div>
            </div>

            <!-- Client Information -->
            <div class="client-section">
              <div class="client-title">INFORMACIÓN DEL CLIENTE</div>
              <div class="client-grid">
                <div class="client-item">
                  <div class="client-label">Cliente:</div>
                  <div>${ticket.client}</div>
                </div>
                <div class="client-item">
                  <div class="client-label">Ticket:</div>
                  <div>${ticket.ticketNumber}</div>
                </div>
                <div class="client-item">
                  <div class="client-label">Ubicación:</div>
                  <div>${ticket.location}</div>
                </div>
                <div class="client-item">
                  <div class="client-label">Técnico Asignado:</div>
                  <div>${ticket.assignedTo}</div>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 45%">Descripción del Servicio</th>
                  <th style="width: 10%" class="text-center">Cant.</th>
                  <th style="width: 15%" class="text-right">Precio Unit.</th>
                  <th style="width: 15%" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>
                      <div style="font-weight: bold;">${getServiceTypeName(item.serviceType)}</div>
                      ${item.description ? `<div style="color: #6b7280; font-size: 10px; margin-top: 2px;">${item.description}</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right">${formatCurrency(item.totalPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td>ITBIS (18%):</td>
                  <td class="text-right">${formatCurrency(tax)}</td>
                </tr>
                <tr class="total-row">
                  <td>TOTAL:</td>
                  <td class="text-right">${formatCurrency(total)}</td>
                </tr>
              </table>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
              <div class="terms-title">TÉRMINOS Y CONDICIONES</div>
              <div class="terms-grid">
                <div class="terms-item">
                  <strong>Forma de Pago:</strong><br>
                  ${paymentTerms}
                </div>
                <div class="terms-item">
                  <strong>Tiempo de Entrega:</strong><br>
                  ${deliveryTime}
                </div>
                <div class="terms-item">
                  <strong>Garantía:</strong><br>
                  ${warranty}
                </div>
                <div class="terms-item">
                  <strong>Moneda:</strong><br>
                  ${currency === 'USD' ? 'Dólares Americanos' : currency === 'EUR' ? 'Euros' : 'Pesos Dominicanos'}
                </div>
              </div>
              ${notes ? `
                <div class="notes">
                  <strong>Observaciones:</strong><br>
                  ${notes.replace(/\n/g, '<br>')}
                </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>Esta cotización es válida por ${validityDays} días a partir de la fecha de emisión.</p>
              <p>Agradecemos la oportunidad de servirle.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quotation: Quotation = {
      id: Math.random().toString(36).substr(2, 9),
      quotationNumber: generateQuotationNumber(existingQuotations),
      ticketId: ticket.id,
      clientName: ticket.client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
      subtotal,
      tax,
      total,
      status: 'pendiente',
      validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
      notes
    };

    onCreateQuotation(quotation);
    onClose();
  };

  return (
    <Card className="border-0 shadow-xl max-w-6xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building size={24} className="text-purple-600" />
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Generar Cotización Profesional
              </CardTitle>
              <p className="text-sm text-gray-600">{ticket.ticketNumber} - {ticket.client}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Company Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Building size={24} className="text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{companyInfo.companyName}</h3>
                <p className="text-sm text-gray-600">{companyInfo.address}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="flex items-center"><Phone size={12} className="mr-1" />{companyInfo.phone}</p>
              <p className="flex items-center"><Mail size={12} className="mr-1" />{companyInfo.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quotation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Cotización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Válida por (días)</Label>
                  <Input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Términos de Pago</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contado">Contado</SelectItem>
                      <SelectItem value="15 días">15 días</SelectItem>
                      <SelectItem value="30 días">30 días</SelectItem>
                      <SelectItem value="45 días">45 días</SelectItem>
                      <SelectItem value="60 días">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tiempo de Entrega</Label>
                  <Input
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="ej: 15 días laborables"
                  />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólares</SelectItem>
                      <SelectItem value="DOP">DOP - Pesos Dominicanos</SelectItem>
                      <SelectItem value="EUR">EUR - Euros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label>Garantía</Label>
                <Input
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="ej: 12 meses"
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Information Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin size={18} className="mr-2" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Cliente:</strong> {ticket.client}</p>
                  <p><strong>Ubicación:</strong> {ticket.location}</p>
                </div>
                <div>
                  <p><strong>Ticket:</strong> {ticket.ticketNumber}</p>
                  <p><strong>Técnico:</strong> {ticket.assignedTo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services and Pricing */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Servicios y Precios</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus size={16} className="mr-1" />
                  Agregar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 grid grid-cols-12 gap-2 p-3 text-sm font-medium">
                  <div className="col-span-4">Servicio</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-2">Precio Unit.</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-2">Acciones</div>
                </div>

                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                    <div className="col-span-4">
                      <div className="space-y-1">
                        <Select 
                          value={item.serviceType} 
                          onValueChange={(value) => {
                            updateItem(item.id, 'serviceType', value);
                            updateItem(item.id, 'unitPrice', getServiceTypePrice(value));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Descripción adicional"
                          value={item.description || ''}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No hay servicios agregados. Haz clic en "Agregar Item" para comenzar.
                  </div>
                )}
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ITBIS (18%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observaciones y Términos</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Términos y condiciones adicionales, observaciones especiales..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={items.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <FileText size={16} className="mr-1" />
              Generar Cotización
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={generatePDF}
              disabled={items.length === 0}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Download size={16} className="mr-1" />
              Vista Previa PDF
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateQuotationForm;
