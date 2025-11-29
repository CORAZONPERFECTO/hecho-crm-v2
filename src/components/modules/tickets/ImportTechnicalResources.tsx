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
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface TechnicalResource {
  id: string;
  manufacturer: string;
  error_code: string;
  error_description: string;
  cause: string;
  solution: string;
  category: string;
  difficulty: 'facil' | 'medio' | 'dificil';
}

interface ImportPreview {
  data: Partial<TechnicalResource>[];
  errors: string[];
  duplicates: string[];
  skippedRows: number;
}

interface ImportTechnicalResourcesProps {
  onClose: () => void;
  onImport: (resources: TechnicalResource[]) => void;
}

const ImportTechnicalResources: React.FC<ImportTechnicalResourcesProps> = ({
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
      if (file.size > 500 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. El máximo permitido es 500MB.');
        return;
      }
      
      setSelectedFile(file);
      processFile(file);
    }
  };

  const isExcelFile = (file: File): boolean => {
    const excelTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];
    
    return excelTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );
  };

  const isValidTextFile = (content: string): boolean => {
    try {
      const hasControlChars = /[\x00-\x08\x0E-\x1F\x7F]/.test(content.substring(0, 1000));
      if (hasControlChars) {
        return false;
      }
      
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const detectSeparator = (line: string): string => {
    const tabCount = (line.match(/\t/g) || []).length;
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    
    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
    return ',';
  };

  const cleanValue = (value: string): string => {
    if (!value) return '';
    return value.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, ' ');
  };

  const generateId = (index: number): string => {
    return `resource-${Date.now()}-${index}`;
  };

  const validateResourceData = (resource: Partial<TechnicalResource>): string[] => {
    const errors: string[] = [];
    
    if (!resource.manufacturer?.trim()) {
      errors.push('Fabricante es requerido');
    }
    
    if (!resource.error_code?.trim()) {
      errors.push('Código de error es requerido');
    }
    
    if (!resource.error_description?.trim()) {
      errors.push('Descripción del error es requerida');
    }
    
    if (!resource.cause?.trim()) {
      errors.push('Causa es requerida');
    }
    
    if (!resource.solution?.trim()) {
      errors.push('Solución es requerida');
    }
    
    return errors;
  };

  const processExcelFile = async (file: File): Promise<void> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convertir a JSON manteniendo los headers originales
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    
    if (jsonData.length < 2) {
      throw new Error('El archivo Excel debe contener al menos una fila de encabezados y una fila de datos');
    }

    const headers = jsonData[0].map(h => String(h || '').trim());
    const dataRows = jsonData.slice(1);

    console.log('Headers Excel detectados:', headers);

    const data: Partial<TechnicalResource>[] = [];
    const errors: string[] = [];
    const duplicates: string[] = [];
    const usedErrorCodes = new Set<string>();
    let skippedRows = 0;
    let processedCount = 0;

    // Mapeo específico para tu Excel
    const getColumnIndex = (possibleNames: string[]): number => {
      return headers.findIndex(header => 
        possibleNames.some(name => 
          header.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(header.toLowerCase())
        )
      );
    };

    const fabricanteIndex = getColumnIndex(['fabricante', 'marca']);
    const codigoIndex = getColumnIndex(['código de error', 'codigo de error', 'código', 'codigo', 'error']);
    const descripcionIndex = getColumnIndex(['descripción del error', 'descripcion del error', 'descripción', 'descripcion']);
    const causasIndex = getColumnIndex(['causas posibles', 'causa', 'causas']);
    
    // Buscar las columnas de solución
    const solucion1Index = getColumnIndex(['cómo solucionarlo (1)', 'como solucionarlo (1)', 'solución 1', 'solucion 1']);
    const solucion2Index = getColumnIndex(['cómo solucionarlo (2)', 'como solucionarlo (2)', 'solución 2', 'solucion 2']);
    const solucion3Index = getColumnIndex(['cómo solucionarlo (3)', 'como solucionarlo (3)', 'solución 3', 'solucion 3']);

    console.log('Índices encontrados:', {
      fabricante: fabricanteIndex,
      codigo: codigoIndex,
      descripcion: descripcionIndex,
      causas: causasIndex,
      solucion1: solucion1Index,
      solucion2: solucion2Index,
      solucion3: solucion3Index
    });

    if (fabricanteIndex === -1 || codigoIndex === -1 || descripcionIndex === -1 || causasIndex === -1) {
      throw new Error('No se encontraron todas las columnas requeridas. Verifica que el archivo tenga: Fabricante, Código de Error, Descripción del Error, Causas Posibles');
    }

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.length === 0) {
        skippedRows++;
        continue;
      }

      const fabricante = cleanValue(String(row[fabricanteIndex] || ''));
      const codigo = cleanValue(String(row[codigoIndex] || ''));
      const descripcion = cleanValue(String(row[descripcionIndex] || ''));
      const causas = cleanValue(String(row[causasIndex] || ''));

      // Combinar las soluciones
      const soluciones: string[] = [];
      if (solucion1Index !== -1 && row[solucion1Index]) {
        const sol1 = cleanValue(String(row[solucion1Index]));
        if (sol1) soluciones.push(`1. ${sol1}`);
      }
      if (solucion2Index !== -1 && row[solucion2Index]) {
        const sol2 = cleanValue(String(row[solucion2Index]));
        if (sol2) soluciones.push(`2. ${sol2}`);
      }
      if (solucion3Index !== -1 && row[solucion3Index]) {
        const sol3 = cleanValue(String(row[solucion3Index]));
        if (sol3) soluciones.push(`3. ${sol3}`);
      }

      const solucionCompleta = soluciones.length > 0 ? soluciones.join('\n\n') : '';

      // Verificar si la fila tiene datos válidos mínimos
      if (!fabricante || !codigo) {
        console.log(`Fila ${i + 2} omitida: falta fabricante o código`);
        skippedRows++;
        continue;
      }

      const resource: Partial<TechnicalResource> = {
        id: generateId(processedCount),
        manufacturer: fabricante,
        error_code: codigo,
        error_description: descripcion,
        cause: causas,
        solution: solucionCompleta,
        category: 'General',
        difficulty: 'medio'
      };

      console.log(`Fila ${i + 2} procesada:`, resource);

      // Validar datos del recurso
      const resourceErrors = validateResourceData(resource);
      if (resourceErrors.length > 0) {
        errors.push(`Fila ${i + 2}: ${resourceErrors.join(', ')}`);
        continue;
      }

      // Verificar duplicados por código de error y fabricante
      const resourceKey = `${resource.manufacturer}-${resource.error_code}`;
      if (usedErrorCodes.has(resourceKey)) {
        duplicates.push(`Fila ${i + 2}: Error ${resource.error_code} de ${resource.manufacturer} ya existe`);
        continue;
      }
      usedErrorCodes.add(resourceKey);

      data.push(resource);
      processedCount++;
    }

    console.log('Procesamiento Excel completado:', { 
      total: data.length, 
      errors: errors.length, 
      duplicates: duplicates.length, 
      skipped: skippedRows 
    });

    setImportPreview({ 
      data, 
      errors, 
      duplicates,
      skippedRows
    });
  };

  const processTextFile = async (file: File): Promise<void> => {
    const text = await file.text();
    
    if (!isValidTextFile(text)) {
      throw new Error('El archivo no parece ser un archivo CSV/TXT válido.');
    }
    
    const allLines = text.split(/\r?\n/);
    const lines = allLines.map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
    }

    const separator = detectSeparator(lines[0]);
    const headers = lines[0].split(separator).map(h => cleanValue(h));
    
    console.log('Headers detectados:', headers);
    
    const data: Partial<TechnicalResource>[] = [];
    const errors: string[] = [];
    const duplicates: string[] = [];
    const usedErrorCodes = new Set<string>();
    let skippedRows = 0;
    let processedCount = 0;

    // Mapeo mejorado de encabezados para tu Excel específico
    const headerMapping: { [key: string]: keyof TechnicalResource } = {
      'fabricante': 'manufacturer',
      'marca': 'manufacturer',
      'código de error': 'error_code',
      'codigo de error': 'error_code',
      'código': 'error_code',
      'codigo': 'error_code',
      'error': 'error_code',
      'descripción del error': 'error_description',
      'descripcion del error': 'error_description',
      'descripción': 'error_description',
      'descripcion': 'error_description',
      'problema': 'error_description',
      'causas posibles': 'cause',
      'causa': 'cause',
      'causa probable': 'cause',
      'origen': 'cause',
      'categoría': 'category',
      'categoria': 'category',
      'tipo': 'category',
      'dificultad': 'difficulty',
      'nivel': 'difficulty',
      'complejidad': 'difficulty'
    };

    // Mapeo especial para las columnas de solución
    const solutionHeaders: string[] = [
      'cómo solucionarlo (1)',
      'como solucionarlo (1)',
      'solución 1',
      'solucion 1',
      'cómo solucionarlo (2)',
      'como solucionarlo (2)',
      'solución 2',
      'solucion 2',
      'cómo solucionarlo (3)',
      'como solucionarlo (3)',
      'solución 3',
      'solucion 3',
      'solución',
      'solucion',
      'reparación',
      'reparacion'
    ];

    const normalizedHeaders = headers.map(h => h.toLowerCase());
    console.log('Headers normalizados:', normalizedHeaders);

    // Encontrar índices de columnas de solución
    const solutionIndices: number[] = [];
    normalizedHeaders.forEach((header, index) => {
      if (solutionHeaders.some(sh => header.includes(sh.toLowerCase()) || sh.toLowerCase().includes(header))) {
        solutionIndices.push(index);
      }
    });

    console.log('Índices de soluciones encontrados:', solutionIndices);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') {
        skippedRows++;
        continue;
      }

      const values = line.split(separator);
      
      const resource: Partial<TechnicalResource> = {
        id: generateId(processedCount),
        category: 'General',
        difficulty: 'medio'
      };

      // Procesar campos básicos
      normalizedHeaders.forEach((header, index) => {
        const mappedField = headerMapping[header];
        const rawValue = values[index] || '';
        const value = cleanValue(rawValue);
        
        if (mappedField && value) {
          if (mappedField === 'difficulty') {
            const diffValue = value.toLowerCase();
            if (diffValue.includes('facil') || diffValue.includes('fácil') || diffValue.includes('bajo')) {
              (resource as any)[mappedField] = 'facil';
            } else if (diffValue.includes('dificil') || diffValue.includes('difícil') || diffValue.includes('alto')) {
              (resource as any)[mappedField] = 'dificil';
            } else {
              (resource as any)[mappedField] = 'medio';
            }
          } else {
            (resource as any)[mappedField] = value;
          }
        }
      });

      // Combinar múltiples columnas de solución
      const solutions: string[] = [];
      solutionIndices.forEach(index => {
        const solutionValue = cleanValue(values[index] || '');
        if (solutionValue && solutionValue.length > 0) {
          solutions.push(solutionValue);
        }
      });

      // Si no se encontraron soluciones en columnas específicas, buscar en cualquier columna que contenga "solucion"
      if (solutions.length === 0) {
        normalizedHeaders.forEach((header, index) => {
          if (header.includes('solucion') || header.includes('solución') || header.includes('reparacion') || header.includes('reparación')) {
            const solutionValue = cleanValue(values[index] || '');
            if (solutionValue && solutionValue.length > 0) {
              solutions.push(solutionValue);
            }
          }
        });
      }

      if (solutions.length > 0) {
        resource.solution = solutions.join('\n\n');
      }

      console.log(`Fila ${i + 1} procesada:`, resource);

      // Verificar si la fila tiene datos válidos mínimos
      if (!resource.manufacturer?.trim() || !resource.error_code?.trim()) {
        console.log(`Fila ${i + 1} omitida: falta fabricante o código`);
        skippedRows++;
        continue;
      }

      // Validar datos del recurso
      const resourceErrors = validateResourceData(resource);
      if (resourceErrors.length > 0) {
        errors.push(`Fila ${i + 1}: ${resourceErrors.join(', ')}`);
        continue;
      }

      // Verificar duplicados por código de error y fabricante
      const resourceKey = `${resource.manufacturer}-${resource.error_code}`;
      if (usedErrorCodes.has(resourceKey)) {
        duplicates.push(`Fila ${i + 1}: Error ${resource.error_code} de ${resource.manufacturer} ya existe`);
        continue;
      }
      usedErrorCodes.add(resourceKey);

      data.push(resource);
      processedCount++;
    }

    console.log('Procesamiento completado:', { total: data.length, errors: errors.length, duplicates: duplicates.length, skipped: skippedRows });

    setImportPreview({ 
      data, 
      errors, 
      duplicates,
      skippedRows
    });
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      if (isExcelFile(file)) {
        console.log('Procesando archivo Excel:', file.name);
        await processExcelFile(file);
      } else {
        console.log('Procesando archivo de texto:', file.name);
        await processTextFile(file);
      }
    } catch (error) {
      console.error('Error procesando archivo:', error);
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
      const validResources = importPreview.data.filter(resource => 
        resource.manufacturer?.trim() && 
        resource.error_code?.trim() &&
        resource.error_description?.trim() &&
        resource.cause?.trim() &&
        resource.solution?.trim()
      ) as TechnicalResource[];
      
      onImport(validResources);
      toast.success(`${validResources.length} recursos técnicos importados exitosamente`);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Fabricante,Código de Error,Descripción del Error,Causas Posibles,Cómo Solucionarlo (1),Cómo Solucionarlo (2),Cómo Solucionarlo (3),Categoría,Dificultad',
      'Samsung,E1,Error de sensor de temperatura,Sensor defectuoso o desconectado,Verificar conexiones del sensor,Limpiar contactos,Reemplazar sensor si es necesario,Aire Acondicionado,Medio',
      'LG,CH05,No enfría correctamente,Filtro sucio o bajo refrigerante,Limpiar filtros,Verificar nivel de gas,Revisar compresor,Aire Acondicionado,Fácil',
      'Carrier,F0,Falla en tarjeta electrónica,Sobretensión o humedad,Verificar instalación eléctrica,Secar tarjeta si hay humedad,Reemplazar tarjeta electrónica,Aire Acondicionado,Difícil'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_recursos_tecnicos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Importar Recursos Técnicos</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instrucciones de Importación</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>¡Ahora soporta archivos Excel (.xlsx) directamente!</strong></li>
              <li>• <strong>Columnas requeridas:</strong> Fabricante, Código de Error, Descripción del Error, Causas Posibles</li>
              <li>• <strong>Soluciones (opcionales):</strong> Cómo Solucionarlo (1), Cómo Solucionarlo (2), Cómo Solucionarlo (3)</li>
              <li>• Las múltiples columnas de solución se combinarán automáticamente</li>
              <li>• También acepta archivos CSV y TXT con separadores: comas, tabulaciones o punto y coma</li>
              <li>• Se omitirán automáticamente las filas sin datos mínimos requeridos</li>
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
                Selecciona tu archivo Excel (.xlsx) o CSV/TXT
              </h3>
              <p className="text-gray-500 mb-4">
                ¡Ahora puedes subir directamente tu archivo Excel! También soporta CSV y TXT (máximo 50MB)
              </p>
              
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                Seleccionar Archivo
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.txt,.csv"
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
                    <span className="text-sm">Procesando...</span>
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
                    <p className="text-sm text-gray-600">Duplicados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Errors */}
              {importPreview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 mb-2">Errores encontrados:</h5>
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

              {/* Duplicates */}
              {importPreview.duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Duplicados encontrados:</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {importPreview.duplicates.slice(0, 10).map((duplicate, index) => (
                      <p key={index} className="text-sm text-yellow-700">{duplicate}</p>
                    ))}
                    {importPreview.duplicates.length > 10 && (
                      <p className="text-sm text-yellow-600 mt-2">... y {importPreview.duplicates.length - 10} duplicados más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {importPreview.data.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Vista Previa (primeros 3 registros válidos):</h5>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Fabricante</th>
                          <th className="text-left p-2">Código</th>
                          <th className="text-left p-2">Descripción</th>
                          <th className="text-left p-2">Causas</th>
                          <th className="text-left p-2">Soluciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.data.slice(0, 3).map((resource, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{resource.manufacturer}</td>
                            <td className="p-2">{resource.error_code}</td>
                            <td className="p-2 max-w-xs truncate">{resource.error_description}</td>
                            <td className="p-2 max-w-xs truncate">{resource.cause}</td>
                            <td className="p-2 max-w-xs truncate">{resource.solution}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importPreview.data.length > 3 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ... y {importPreview.data.length - 3} registros más
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
                  Importar {importPreview.data.length} Recursos
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportTechnicalResources;
