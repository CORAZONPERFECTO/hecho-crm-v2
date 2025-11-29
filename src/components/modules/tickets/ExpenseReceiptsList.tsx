
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Calendar, 
  FileText, 
  DollarSign,
  Receipt
} from 'lucide-react';
import { useTicketExpenseReceipts, TicketExpenseReceipt } from '@/hooks/useTicketExpenseReceipts';

interface ExpenseReceiptsListProps {
  ticketId: string;
  userRole: 'admin' | 'technician' | 'manager';
}

const ExpenseReceiptsList: React.FC<ExpenseReceiptsListProps> = ({
  ticketId,
  userRole
}) => {
  const { receipts, loading, deleteReceipt, getTotalExpenses } = useTicketExpenseReceipts(ticketId);
  const [selectedReceipt, setSelectedReceipt] = useState<TicketExpenseReceipt | null>(null);

  const canEdit = userRole === 'admin';

  const handleViewReceipt = (receipt: TicketExpenseReceipt) => {
    // Abrir el archivo en una nueva ventana
    window.open(receipt.file_url, '_blank');
  };

  const handleDeleteReceipt = async (receipt: TicketExpenseReceipt) => {
    if (!canEdit) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la factura "${receipt.file_name}"?`
    );
    
    if (confirmed) {
      try {
        await deleteReceipt(receipt.id, receipt.file_url);
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Facturas de Gastos
          </CardTitle>
          {receipts.length > 0 && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Total: {formatCurrency(getTotalExpenses())}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {receipts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay facturas de gastos registradas</p>
            <p className="text-sm">Usa el botón "Subir factura de gasto" para agregar una</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{receipt.file_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {receipt.file_type.includes('pdf') ? 'PDF' : 'Imagen'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium text-green-600">
                          {formatCurrency(receipt.confirmed_amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(receipt.expense_date).toLocaleDateString('es-DO')}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Por: {receipt.uploaded_by}
                      </div>
                    </div>
                    
                    {receipt.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {receipt.description}
                      </p>
                    )}
                    
                    {receipt.detected_amount && receipt.detected_amount !== receipt.confirmed_amount && (
                      <div className="text-xs text-blue-600 mt-1">
                        OCR detectó: {formatCurrency(receipt.detected_amount)} (corregido manualmente)
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReceipt(receipt)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReceipt(receipt)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseReceiptsList;
