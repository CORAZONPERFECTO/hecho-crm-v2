
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText
} from 'lucide-react';
import { Product } from './types';
import { ProductFormValues } from './validation';

interface ImportPreview {
  data: Partial<Product>[];
  errors: string[];
  duplicates: string[];
  skippedRows: number;
}

interface ImportProductsProps {
  onClose: () => void;
  onImport: (products: ProductFormValues[]) => void;
}

const ImportProducts: React.FC<ImportProductsProps> = ({
  onClose,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (máximo 500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('El archivo es demasiado grande. El máximo permitido es 500MB.');
        return;
      }
      
      setSelectedFile(file);
      processFile(file);
    }
  };

  const isValidTextFile = (content: string): boolean => {
    // Verificar que el contenido sea texto válido
    try {
      // Intentar detectar caracteres de control que indican archivo binario
      const hasControlChars = /[\x00-\x08\x0E-\x1F\x7F]/.test(content.substring(0, 1000));
      if (hasControlChars) {
        console.log('Archivo detectado como binario - contiene caracteres de control');
        return false;
      }
      
      // Verificar que tenga al menos algunas líneas con texto
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        console.log('Archivo no tiene suficientes líneas de texto');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validando archivo:', error);
      return false;
    }
  };

  const detectSeparator = (line: string): string => {
    const tabCount = (line.match(/\t/g) || []).length;
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    
    console.log(`Conteos de separadores - Tabs: ${tabCount}, Comas: ${commaCount}, Punto y coma: ${semicolonCount}`);
    
    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
    return ',';
  };

  const cleanValue = (value: string): string => {
    if (!value) return '';
    return value.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, ' ');
  };

  const generateSKU = (name: string, index: number): string => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = cleanName.substring(0, 6) || 'PROD';
    const suffix = String(index + 1).padStart(4, '0');
    return `${prefix}-${suffix}`;
  };

  const validateProductData = (product: Partial<Product>): string[] => {
    const errors: string[] = [];
    
    if (!product.name?.trim()) {
      errors.push('Nombre es requerido');
    }
    
    if (!product.category?.trim()) {
      errors.push('Categoría es requerida');
    }
    
    if (product.type === 'Producto' && !product.unit?.trim()) {
      errors.push('Unidad de medida es requerida para productos');
    }
    
    return errors;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      console.log(`Procesando archivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      
      // Leer el archivo como texto
      const text = await file.text();
      
      // Validar que sea un archivo de texto válido
      if (!isValidTextFile(text)) {
        throw new Error('El archivo no parece ser un archivo CSV/TXT válido. Por favor, asegúrate de subir un archivo de texto plano (.csv o .txt).');
      }
      
      const allLines = text.split(/\r?\n/);
      const lines = allLines.map(line => line.trim()).filter(line => line.length > 0);
      
      console.log(`Total de líneas en el archivo: ${allLines.length}`);
      console.log(`Líneas no vacías: ${lines.length}`);
      
      if (lines.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      const separator = detectSeparator(lines[0]);
      console.log('Separador detectado:', separator === '\t' ? 'tabulaciones' : separator === ';' ? 'punto y coma' : 'comas');

      const headers = lines[0].split(separator).map(h => cleanValue(h));
      console.log('Encabezados encontrados:', headers.slice(0, 10)); // Solo mostrar los primeros 10
      
      const data: Partial<Product>[] = [];
      const errors: string[] = [];
      const duplicates: string[] = [];
      const warnings: string[] = [];
      const usedSKUs = new Set<string>();
      let skippedRows = 0;
      let processedCount = 0;

      // Mapeo de encabezados más flexible y completo
      const headerMapping: { [key: string]: keyof Product } = {
        'tipo': 'type',
        'producto/servicio': 'type',
        'producto inventariable': 'type',
        'nombre': 'name',
        'producto': 'name',
        'servicio': 'name',
        'descripción': 'name',
        'descripcion': 'name',
        'sku': 'sku',
        'código': 'sku',
        'codigo': 'sku',
        'referencia': 'sku',
        'tipo de referencia': 'sku',
        'categoría': 'category',
        'categoria': 'category',
        'tipo de producto': 'category',
        'grupo': 'category',
        'unidad': 'unit',
        'unidad de medida': 'unit',
        'medida': 'unit',
        'um': 'unit',
        'stock': 'stock',
        'inventario': 'stock',
        'cantidad': 'stock',
        'existencia': 'stock',
        'stock mínimo': 'minStock',
        'stock minimo': 'minStock',
        'mínimo': 'minStock',
        'minimo': 'minStock',
        'min stock': 'minStock',
        'precio': 'price',
        'precio unitario': 'price',
        'precio base': 'price',
        'precio total': 'price',
        'costo': 'price',
        'costo inicial': 'price',
        'valor': 'price',
        'precio de venta': 'price'
      };

      const normalizedHeaders = headers.map(h => h.toLowerCase());

      // Procesar en lotes para archivos grandes
      const batchSize = 100;
      const totalRows = lines.length - 1;
      
      for (let batchStart = 1; batchStart < lines.length; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, lines.length);
        console.log(`Procesando lote ${Math.floor(batchStart / batchSize) + 1}: filas ${batchStart} a ${batchEnd - 1}`);
        
        for (let i = batchStart; i < batchEnd; i++) {
          const line = lines[i];
          if (!line || line.trim() === '') {
            skippedRows++;
            continue;
          }

          const values = line.split(separator);
          
          const product: Partial<Product> = {
            type: 'Producto',
            stock: 0,
            minStock: 0,
            price: 0,
            status: 'En Stock'
          };

          // Procesar cada campo
          normalizedHeaders.forEach((header, index) => {
            const mappedField = headerMapping[header];
            const rawValue = values[index] || '';
            const value = cleanValue(rawValue);
            
            if (mappedField && value) {
              if (mappedField === 'type') {
                const typeValue = value.toLowerCase();
                if (typeValue.includes('servicio')) {
                  (product as any)[mappedField] = 'Servicio';
                } else {
                  (product as any)[mappedField] = 'Producto';
                }
              } else if (mappedField === 'stock' || mappedField === 'minStock') {
                const numValue = parseInt(value.replace(/[,.\s]/g, ''));
                (product as any)[mappedField] = isNaN(numValue) ? 0 : numValue;
              } else if (mappedField === 'price') {
                const numValue = parseFloat(value.replace(/[,$\s]/g, ''));
                (product as any)[mappedField] = isNaN(numValue) ? 0 : numValue;
              } else {
                (product as any)[mappedField] = value;
              }
            }
          });

          // Verificar si la fila tiene nombre válido (REQUERIDO)
          if (!product.name?.trim()) {
            skippedRows++;
            continue;
          }

          // Establecer valores por defecto
          if (!product.category) product.category = 'General';
          if (product.type === 'Producto' && !product.unit) product.unit = 'Unidad';

          // Generar SKU automático si no existe
          if (!product.sku?.trim() && product.name?.trim()) {
            let generatedSKU = generateSKU(product.name, processedCount);
            let counter = 1;
            
            while (usedSKUs.has(generatedSKU)) {
              generatedSKU = generateSKU(product.name, processedCount + counter * 10000);
              counter++;
            }
            
            product.sku = generatedSKU;
          }

          // Validar datos del producto
          const productErrors = validateProductData(product);
          if (productErrors.length > 0) {
            errors.push(`Fila ${i + 1}: ${productErrors.join(', ')}`);
            continue;
          }

          // Verificar duplicados por SKU
          if (product.sku) {
            if (usedSKUs.has(product.sku)) {
              duplicates.push(`Fila ${i + 1}: SKU ${product.sku} ya existe`);
              continue;
            }
            usedSKUs.add(product.sku);
          }

          // Advertencias
          if (product.type === 'Producto' && product.stock === 0) {
            warnings.push(`Fila ${i + 1}: ${product.name} - sin stock inicial`);
          }

          data.push(product);
          processedCount++;
        }
        
        // Pequeña pausa para no bloquear la UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log(`Procesamiento completado:`);
      console.log(`- Total de filas procesadas: ${totalRows}`);
      console.log(`- Filas omitidas (sin nombre): ${skippedRows}`);
      console.log(`- Productos válidos: ${data.length}`);
      console.log(`- Errores: ${errors.length}`);
      console.log(`- Duplicados: ${duplicates.length}`);
      console.log(`- Advertencias: ${warnings.length}`);

      setImportPreview({ 
        data, 
        errors, 
        duplicates: [...duplicates, ...warnings],
        skippedRows
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      setImportPreview({
        data: [],
        errors: [error instanceof Error ? error.message : 'Error al procesar el archivo'],
        duplicates: [],
        skippedRows: 0
      });
    }
    
    setIsProcessing(false);
  };

  const handleImport = () => {
    if (importPreview && importPreview.data.length > 0) {
      const validProducts = importPreview.data.filter(product => 
        product.name?.trim() && product.category?.trim()
      ) as ProductFormValues[];
      
      console.log(`Importando ${validProducts.length} productos válidos`);
      onImport(validProducts);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Tipo,Nombre,SKU,Categoría,Unidad de medida,Stock,Stock Mínimo,Precio',
      'Producto,Laptop Dell Inspiron,LT-DELL-001,Electrónicos,Unidad,50,10,850.00',
      'Servicio,Instalación de Software,,Servicios,,-,-,75.00',
      'Producto,Mouse Inalámbrico,,Accesorios,Pieza,100,25,25.50'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Importar Productos y Servicios</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instrucciones de Importación</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sube un archivo CSV (.csv) o de texto (.txt) con los datos de productos/servicios</li>
              <li>• <strong>Soporta archivos grandes:</strong> hasta 250+ productos (máximo 50MB)</li>
              <li>• Descarga la plantilla para ver el formato correcto</li>
              <li>• <strong>Solo se requiere:</strong> Nombre (filas sin nombre serán omitidas automáticamente)</li>
              <li>• <strong>SKU opcional:</strong> Si no se proporciona, se generará automáticamente</li>
              <li>• <strong>Categoría opcional:</strong> Si no se proporciona, se usará "General"</li>
              <li>• Para productos: la unidad de medida se establecerá como "Unidad" si no se especifica</li>
              <li>• Los campos pueden estar separados por comas, tabulaciones o punto y coma</li>
            </ul>
          </div>

          {/* Template Download */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download size={16} className="mr-2" />
              Descargar Plantilla CSV
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona el archivo de productos/servicios
              </h3>
              <p className="text-gray-500 mb-4">
                Formatos soportados: CSV, TXT (máximo 50MB - soporta 250+ productos)
              </p>
              
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                Seleccionar Archivo
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText size={20} className="text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Procesando archivo grande...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Preview */}
          {importPreview && !isProcessing && (
            <div className="space-y-4">
              <h4 className="font-medium">Resultado de la Validación</h4>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-600">{importPreview.data.length}</p>
                    <p className="text-sm text-gray-600">Listos para importar</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle size={24} className="mx-auto text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-orange-600">{importPreview.skippedRows}</p>
                    <p className="text-sm text-gray-600">Filas omitidas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
                    <p className="text-2xl font-bold text-red-600">{importPreview.errors.length}</p>
                    <p className="text-sm text-gray-600">Errores</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle size={24} className="mx-auto text-yellow-600 mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{importPreview.duplicates.length}</p>
                    <p className="text-sm text-gray-600">Advertencias</p>
                  </CardContent>
                </Card>
              </div>

              {/* Success Message for Large Imports */}
              {importPreview.data.length > 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">¡Archivo grande procesado exitosamente!</h5>
                  <p className="text-sm text-green-700">
                    Se procesaron {importPreview.data.length} productos de un archivo grande. 
                    Todos los productos con nombres válidos están listos para importar.
                  </p>
                </div>
              )}

              {/* Skipped Rows Info */}
              {importPreview.skippedRows > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-medium text-orange-900 mb-2">Filas omitidas automáticamente:</h5>
                  <p className="text-sm text-orange-700">
                    Se omitieron {importPreview.skippedRows} filas porque no tenían nombre válido o estaban vacías.
                    Solo se importarán los productos con nombres válidos.
                  </p>
                </div>
              )}

              {/* Errors */}
              {importPreview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 mb-2">Errores encontrados (serán omitidos):</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {importPreview.errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                    {importPreview.errors.length > 10 && (
                      <p className="text-sm text-red-600 mt-2">... y {importPreview.errors.length - 10} errores más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Duplicates and Warnings */}
              {importPreview.duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Advertencias:</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {importPreview.duplicates.slice(0, 10).map((duplicate, index) => (
                      <p key={index} className="text-sm text-yellow-700">{duplicate}</p>
                    ))}
                    {importPreview.duplicates.length > 10 && (
                      <p className="text-sm text-yellow-600 mt-2">... y {importPreview.duplicates.length - 10} advertencias más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {importPreview.data.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Vista Previa (primeros 5 registros válidos):</h5>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Nombre</th>
                          <th className="text-left p-2">SKU</th>
                          <th className="text-left p-2">Categoría</th>
                          <th className="text-left p-2">Stock</th>
                          <th className="text-left p-2">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.data.slice(0, 5).map((product, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{product.type || '-'}</td>
                            <td className="p-2">{product.name || '-'}</td>
                            <td className="p-2">{product.sku || '-'}</td>
                            <td className="p-2">{product.category || '-'}</td>
                            <td className="p-2">{product.stock !== undefined ? product.stock : '-'}</td>
                            <td className="p-2">{product.price ? `$${product.price.toLocaleString()}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importPreview.data.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... y {importPreview.data.length - 5} registros más
                    </p>
                  )}
                </div>
              )}

              {/* Import Button */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleImport}
                  disabled={importPreview.data.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload size={16} className="mr-2" />
                  Importar {importPreview.data.length} Productos/Servicios
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportProducts;
