import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, FileDown } from 'lucide-react';
import { generateProfessionalPDF } from './utils/professionalPDFGenerator';

interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  itemDiscount?: number;
}

interface ProfessionalDocumentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'quotation' | 'proforma' | 'invoice';
  existingData?: any;
}

const ProfessionalDocumentGenerator: React.FC<ProfessionalDocumentGeneratorProps> = ({
  isOpen,
  onClose,
  documentType,
  existingData
}) => {
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [includeITBIS, setIncludeITBIS] = useState(documentType === 'invoice');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'none' | 'global' | 'item'>('none');
  const [notes, setNotes] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('inmediato');
  const [validityHours, setValidityHours] = useState(72);
  const [isMaintenanceDocument, setIsMaintenanceDocument] = useState(false);
  const [isEquipmentSale, setIsEquipmentSale] = useState(false);

  const getDocumentTitle = () => {
    switch (documentType) {
      case 'quotation': return 'Cotización';
      case 'proforma': return 'Factura Proforma';
      case 'invoice': return 'Factura';
      default: return 'Documento';
    }
  };

  const getDocumentPrefix = () => {
    switch (documentType) {
      case 'quotation': return 'COT-2025-';
      case 'proforma': return 'FACPR-2025-';
      case 'invoice': return 'FAC-2025-';
      default: return 'DOC-2025-';
    }
  };

  const addItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof DocumentItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscountAmount = item.itemDiscount ? (itemTotal * item.itemDiscount / 100) : 0;
      return sum + (itemTotal - itemDiscountAmount);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const globalDiscountAmount = discountType === 'global' ? (subtotal * globalDiscount / 100) : 0;
    const subtotalAfterDiscount = subtotal - globalDiscountAmount;
    const itbisAmount = includeITBIS ? (subtotalAfterDiscount * 0.18) : 0;
    return subtotalAfterDiscount + itbisAmount;
  };

  const generateStandardNotes = () => {
    let standardNotes = `Tiempo de entrega estimado: ${deliveryTime}\n`;
    
    if (documentType !== 'invoice') {
      standardNotes += `${getDocumentTitle()} válida por ${validityHours} horas\n\n`;
    }

    if (isMaintenanceDocument) {
      standardNotes += "EXCLUSIONES PARA MANTENIMIENTO:\n";
      standardNotes += "• No incluye reparaciones\n";
      standardNotes += "• No incluye refrigerantes\n";
      standardNotes += "• No incluye trabajos adicionales (instalaciones, piezas, correctivos)\n\n";
    }

    if (isEquipmentSale) {
      standardNotes += "EXCLUSIONES PARA VENTA DE EQUIPOS:\n";
      standardNotes += "• 1 año de garantía por desperfectos mecánicos\n";
      standardNotes += "• No incluye garantía en piezas electrónicas\n";
      standardNotes += "• Sujeto a disponibilidad del equipo\n\n";
    }

    return standardNotes + notes;
  };

  const handleGeneratePDF = async () => {
    const documentData = {
      type: documentType,
      title: getDocumentTitle(),
      number: getDocumentPrefix() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      clientName,
      items,
      subtotal: calculateSubtotal(),
      globalDiscount: discountType === 'global' ? globalDiscount : 0,
      includeITBIS,
      total: calculateTotal(),
      notes: generateStandardNotes(),
      date: new Date().toLocaleDateString('es-DO')
    };

    await generateProfessionalPDF(documentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Generar {getDocumentTitle()}</span>
            <Badge variant="secondary">Formato Profesional</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nombre del Cliente</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Empresa ABC S.A."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeITBIS"
                    checked={includeITBIS}
                    onCheckedChange={setIncludeITBIS}
                    disabled={documentType === 'invoice'}
                  />
                  <Label htmlFor="includeITBIS">Incluir ITBIS (18%)</Label>
                  {documentType === 'invoice' && (
                    <Badge variant="destructive">Obligatorio</Badge>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="discountType">Tipo de Descuento</Label>
                  <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin descuento</SelectItem>
                      <SelectItem value="global">Descuento global</SelectItem>
                      <SelectItem value="item">Descuento por ítem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discountType === 'global' && (
                  <div>
                    <Label htmlFor="globalDiscount">Descuento Global (%)</Label>
                    <Input
                      id="globalDiscount"
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isMaintenanceDocument"
                    checked={isMaintenanceDocument}
                    onCheckedChange={setIsMaintenanceDocument}
                  />
                  <Label htmlFor="isMaintenanceDocument">Documento de Mantenimiento</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEquipmentSale"
                    checked={isEquipmentSale}
                    onCheckedChange={setIsEquipmentSale}
                  />
                  <Label htmlFor="isEquipmentSale">Venta de Equipos</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Items del Documento
                <Button onClick={addItem} size="sm">
                  <Plus size={16} className="mr-1" />
                  Agregar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">Ítem {index + 1}</span>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Label>Descripción (multilínea)</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción detallada del producto/servicio"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <Label>Precio Unitario</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {discountType === 'item' && (
                        <div>
                          <Label>Descuento (%)</Label>
                          <Input
                            type="number"
                            value={item.itemDiscount || 0}
                            onChange={(e) => updateItem(item.id, 'itemDiscount', Number(e.target.value))}
                            min="0"
                            max="100"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className="font-medium">
                        Subtotal: ${((item.quantity * item.unitPrice) * (1 - (item.itemDiscount || 0) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                {discountType === 'global' && globalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Descuento ({globalDiscount}%):</span>
                    <span>-${(calculateSubtotal() * globalDiscount / 100).toFixed(2)}</span>
                  </div>
                )}
                {includeITBIS && (
                  <div className="flex justify-between">
                    <span>ITBIS (18%):</span>
                    <span>${((calculateSubtotal() - (discountType === 'global' ? calculateSubtotal() * globalDiscount / 100 : 0)) * 0.18).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total General:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuraciones Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryTime">Tiempo de Entrega</Label>
                  <Input
                    id="deliveryTime"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                  />
                </div>
                
                {documentType !== 'invoice' && (
                  <div>
                    <Label htmlFor="validityHours">Validez (horas)</Label>
                    <Input
                      id="validityHours"
                      type="number"
                      value={validityHours}
                      onChange={(e) => setValidityHours(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales específicas para este documento"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleGeneratePDF} className="bg-gradient-to-r from-green-600 to-green-700">
              <FileDown size={16} className="mr-2" />
              Generar PDF Profesional
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalDocumentGenerator;