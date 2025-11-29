
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Calendar, Mail, Phone, MapPin } from 'lucide-react';

interface DocumentPreviewProps {
  type: 'invoice' | 'quotation' | 'delivery_note' | 'purchase_order';
  templateId: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ type, templateId }) => {
  const getDocumentTitle = () => {
    switch (type) {
      case 'invoice': return 'FACTURA';
      case 'quotation': return 'COTIZACIÓN';
      case 'delivery_note': return 'CONDUCE';
      case 'purchase_order': return 'ORDEN DE COMPRA';
      default: return 'DOCUMENTO';
    }
  };

  const getDocumentNumber = () => {
    switch (type) {
      case 'invoice': return 'FAC-2024-001';
      case 'quotation': return 'COT-2024-001';
      case 'delivery_note': return 'CON-2024-001';
      case 'purchase_order': return 'OC-2024-001';
      default: return 'DOC-001';
    }
  };

  const getSampleItems = () => {
    switch (type) {
      case 'invoice':
        return [
          { desc: 'Instalación de sistema de CCTV', qty: 1, price: 15000, total: 15000 },
          { desc: 'Cámara IP 4MP con visión nocturna', qty: 4, price: 2500, total: 10000 },
          { desc: 'Configuración y puesta en marcha', qty: 1, price: 3000, total: 3000 }
        ];
      case 'quotation':
        return [
          { desc: 'Consultoría técnica especializada', qty: 8, price: 1200, total: 9600 },
          { desc: 'Soporte técnico remoto mensual', qty: 1, price: 5000, total: 5000 },
          { desc: 'Mantenimiento preventivo', qty: 1, price: 2500, total: 2500 }
        ];
      case 'delivery_note':
        return [
          { desc: 'Router empresarial TP-Link', qty: 2, price: 3500, total: 7000 },
          { desc: 'Switch 24 puertos gigabit', qty: 1, price: 8000, total: 8000 },
          { desc: 'Cable UTP Cat6 (metros)', qty: 100, price: 25, total: 2500 }
        ];
      case 'purchase_order':
        return [
          { desc: 'Servidores Dell PowerEdge', qty: 2, price: 45000, total: 90000 },
          { desc: 'Licencias Windows Server', qty: 2, price: 15000, total: 30000 },
          { desc: 'Instalación y configuración', qty: 1, price: 8000, total: 8000 }
        ];
      default:
        return [];
    }
  };

  const items = getSampleItems();
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const getTemplateStyles = () => {
    const baseStyles = "text-xs leading-relaxed";
    
    switch (templateId) {
      case 'classic':
      case 'elegant':
      case 'technical':
      case 'standard':
        return {
          container: "border-2 border-gray-800",
          header: "bg-gray-100 border-b-2 border-gray-800",
          title: "text-lg font-bold text-gray-800",
          table: "border border-gray-800",
          tableHeader: "bg-gray-200 border border-gray-800",
          tableCell: "border border-gray-800 p-2"
        };
      
      case 'modern':
      case 'simple':
      case 'logistic':
      case 'simple-po':
        return {
          container: "border border-gray-300 rounded-lg shadow-sm",
          header: "bg-blue-50 border-b border-blue-200 rounded-t-lg",
          title: "text-lg font-bold text-blue-800",
          table: "border-0",
          tableHeader: "bg-blue-100",
          tableCell: "border-b border-gray-200 p-2"
        };
      
      case 'compact':
      case 'corporate':
      case 'elegant-dn':
        return {
          container: "border border-gray-400",
          header: "bg-gray-800 text-white",
          title: "text-lg font-bold text-white",
          table: "border-0",
          tableHeader: "bg-gray-600 text-white",
          tableCell: "border-b border-gray-300 p-1 text-xs"
        };
      
      default:
        return {
          container: "border border-gray-300",
          header: "bg-gray-50 border-b",
          title: "text-lg font-bold",
          table: "border border-gray-300",
          tableHeader: "bg-gray-100",
          tableCell: "border border-gray-300 p-2"
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className={`${styles.container} p-4 bg-white text-black max-w-md mx-auto transform scale-75 origin-top`}>
      {/* Header */}
      <div className={`${styles.header} p-3 flex justify-between items-start`}>
        <div className="flex items-center space-x-2">
          <Building className="w-6 h-6" />
          <div>
            <div className="font-bold text-sm">TU EMPRESA S.A.</div>
            <div className="text-xs">RNC: 1-31-12345-6</div>
          </div>
        </div>
        <div className="text-right">
          <div className={styles.title}>{getDocumentTitle()}</div>
          <div className="text-sm font-semibold"># {getDocumentNumber()}</div>
        </div>
      </div>

      {/* Company Info */}
      <div className="p-2 border-b text-xs">
        <div className="flex items-center mb-1">
          <MapPin className="w-3 h-3 mr-1" />
          <span>Av. Principal #123, Ciudad</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Phone className="w-3 h-3 mr-1" />
            <span>(809) 555-0123</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-3 h-3 mr-1" />
            <span>ventas@empresa.com</span>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="p-2 border-b bg-gray-50">
        <div className="text-xs font-semibold mb-1">CLIENTE:</div>
        <div className="text-xs">Empresa ABC S.A.</div>
        <div className="text-xs text-gray-600">RNC: 1-01-98765-4</div>
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Fecha: {new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className={styles.table}>
        <div className={`${styles.tableHeader} grid grid-cols-12 gap-1 p-1 text-xs font-semibold`}>
          <div className="col-span-1">#</div>
          <div className="col-span-6">Descripción</div>
          <div className="col-span-1">Cant.</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Total</div>
        </div>
        
        {items.map((item, index) => (
          <div key={index} className={`${styles.tableCell} grid grid-cols-12 gap-1 text-xs`}>
            <div className="col-span-1">{index + 1}</div>
            <div className="col-span-6">{item.desc}</div>
            <div className="col-span-1">{item.qty}</div>
            <div className="col-span-2">RD$ {item.price.toLocaleString()}</div>
            <div className="col-span-2">RD$ {item.total.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-2 bg-gray-50 border-t">
        <div className="text-right space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>RD$ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>ITBIS (18%):</span>
            <span>RD$ {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1">
            <span>TOTAL:</span>
            <span>RD$ {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t text-center">
        <div className="text-xs text-gray-600">
          {type === 'quotation' && 'Cotización válida por 30 días'}
          {type === 'invoice' && 'Forma de pago: 30 días'}
          {type === 'delivery_note' && 'Entrega conforme recibida'}
          {type === 'purchase_order' && 'Orden sujeta a términos acordados'}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
