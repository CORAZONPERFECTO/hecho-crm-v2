
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, DollarSign, Calendar, FileText } from 'lucide-react';
import { useTicketExpenseReceipts } from '@/hooks/useTicketExpenseReceipts';

interface UploadExpenseReceiptDialogProps {
  ticketId: string;
  currentUser: string;
  onClose: () => void;
}

const UploadExpenseReceiptDialog: React.FC<UploadExpenseReceiptDialogProps> = ({
  ticketId,
  currentUser,
  onClose
}) => {
  const { uploadReceipt } = useTicketExpenseReceipts(ticketId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedAmount, setDetectedAmount] = useState<number | null>(null);
  const [confirmedAmount, setConfirmedAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG o PDF');
      return;
    }

    // Validar tamaño (máximo 500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 500MB');
      return;
    }

    setSelectedFile(file);

    // Simular OCR (en una implementación real, esto se conectaría a un servicio de OCR)
    if (file.type.startsWith('image/')) {
      setOcrProcessing(true);
      // Simular procesamiento
      setTimeout(() => {
        // Generar un monto aleatorio para demostración
        const mockAmount = Math.floor(Math.random() * 5000) + 100;
        setDetectedAmount(mockAmount);
        setConfirmedAmount(mockAmount.toString());
        setOcrProcessing(false);
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !confirmedAmount) {
      alert('Por favor selecciona un archivo y confirma el monto');
      return;
    }

    try {
      setUploading(true);
      await uploadReceipt(
        selectedFile,
        parseFloat(confirmedAmount),
        description || undefined,
        expenseDate,
        detectedAmount || undefined,
        currentUser
      );
      onClose();
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Subir Factura de Gasto</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de archivo */}
            <div className="space-y-2">
              <Label>Archivo de Factura</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Haz clic para seleccionar una imagen o PDF'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 500MB • JPG, PNG, PDF
                </p>
              </div>
            </div>

            {/* Vista previa del archivo */}
            {selectedFile && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* OCR Processing */}
            {ocrProcessing && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800">Procesando factura con OCR...</span>
                </div>
              </div>
            )}

            {/* Monto detectado y confirmado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detectedAmount && (
                <div className="space-y-2">
                  <Label>Monto Detectado (OCR)</Label>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      RD$ {detectedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="confirmedAmount">Monto Confirmado *</Label>
                <Input
                  id="confirmedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={confirmedAmount}
                  onChange={(e) => setConfirmedAmount(e.target.value)}
                  placeholder="Ej: 1500.00"
                  required
                />
              </div>
            </div>

            {/* Fecha del gasto */}
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Fecha del Gasto</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra de materiales, transporte, etc."
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedFile || !confirmedAmount || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploading ? 'Subiendo...' : 'Subir Factura'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadExpenseReceiptDialog;
