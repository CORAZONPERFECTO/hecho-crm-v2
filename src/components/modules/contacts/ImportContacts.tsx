
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
  FileText,
  Eye
} from 'lucide-react';
import { Contact, ImportPreview } from './types';

interface ImportContactsProps {
  onClose: () => void;
  onImport: (contacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

const ImportContacts: React.FC<ImportContactsProps> = ({
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
      setSelectedFile(file);
      processFile(file);
    }
  };

  const detectSeparator = (line: string): string => {
    const tabCount = (line.match(/\t/g) || []).length;
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    
    // Detectar el separador más común
    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
    return ',';
  };

  const cleanValue = (value: string): string => {
    if (!value) return '';
    return value.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, ' ');
  };

  const validateMinimalContactData = (contact: Partial<Contact>): string[] => {
    const errors: string[] = [];
    
    // Solo validar que tenga nombre - eso es todo lo que requerimos
    if (!contact.name?.trim()) {
      errors.push('Nombre/Razón social es requerido');
    }
    
    return errors;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      // Dividir por líneas y limpiar cada línea
      const allLines = text.split(/\r?\n/);
      const lines = allLines.map(line => line.trim()).filter(line => line.length > 0);
      
      console.log(`Total de líneas en el archivo: ${allLines.length}`);
      console.log(`Líneas no vacías: ${lines.length}`);
      
      if (lines.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      // Detectar el separador basado en la primera línea
      const separator = detectSeparator(lines[0]);
      console.log('Separador detectado:', separator === '\t' ? 'tabulaciones' : separator === ';' ? 'punto y coma' : 'comas');

      const headers = lines[0].split(separator).map(h => cleanValue(h));
      console.log('Encabezados encontrados:', headers);
      console.log('Número de encabezados:', headers.length);
      
      const data: Partial<Contact>[] = [];
      const errors: string[] = [];
      const duplicates: string[] = [];
      const warnings: string[] = [];

      // Mapeo de encabezados más flexible
      const headerMapping: { [key: string]: keyof Contact } = {
        // Nombres más flexibles
        'nombre': 'name',
        'nombre/razón social': 'name',
        'razon social': 'name',
        'razón social': 'name',
        'cliente': 'name',
        'empresa': 'name',
        
        // Identificación
        'tipo de identificación': 'identificationType',
        'tipo identificación': 'identificationType',
        'tipo_identificacion': 'identificationType',
        'rnc/cédula': 'identificationNumber',
        'rnc/cedula': 'identificationNumber',
        'identificacion': 'identificationNumber',
        'rnc': 'identificationNumber',
        'cedula': 'identificationNumber',
        'cédula': 'identificationNumber',
        
        // Teléfonos
        'teléfono 1': 'phone1',
        'telefono 1': 'phone1',
        'teléfono': 'phone1',
        'telefono': 'phone1',
        'tel1': 'phone1',
        'teléfono 2': 'phone2',
        'telefono 2': 'phone2',
        'tel2': 'phone2',
        'celular': 'mobile',
        'móvil': 'mobile',
        'movil': 'mobile',
        'cel': 'mobile',
        'fax': 'fax',
        
        // Ubicación
        'dirección': 'address',
        'direccion': 'address',
        'provincia': 'province',
        'municipio': 'municipality',
        'ciudad': 'municipality',
        'país': 'country',
        'pais': 'country',
        
        // Contacto
        'correo': 'email',
        'email': 'email',
        'correo electrónico': 'email',
        'correo electronico': 'email',
        'e-mail': 'email',
        
        // Información comercial
        'cuenta por cobrar': 'accountsReceivable',
        'cuentas por cobrar': 'accountsReceivable',
        'cxc': 'accountsReceivable',
        'cuenta por pagar': 'accountsPayable',
        'cuentas por pagar': 'accountsPayable',
        'cxp': 'accountsPayable',
        'término de pago': 'paymentTerms',
        'termino de pago': 'paymentTerms',
        'terminos': 'paymentTerms',
        'lista de precios': 'priceList',
        'lista precios': 'priceList',
        'precio': 'priceList',
        'vendedor': 'assignedSalesperson',
        'límite de crédito': 'creditLimit',
        'limite de credito': 'creditLimit',
        'credito': 'creditLimit'
      };

      // Normalizar los encabezados para el mapeo
      const normalizedHeaders = headers.map(h => h.toLowerCase());

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === '') {
          console.log(`Saltando línea vacía ${i + 1}`);
          continue;
        }

        const values = line.split(separator);
        console.log(`Procesando fila ${i + 1}: ${values.length} valores`);
        
        const contact: Partial<Contact> = {
          type: 'cliente',
          status: 'activo'
        };

        // Procesar cada campo
        normalizedHeaders.forEach((header, index) => {
          const mappedField = headerMapping[header];
          const rawValue = values[index] || '';
          const value = cleanValue(rawValue);
          
          if (mappedField && value) {
            if (mappedField === 'creditLimit' || mappedField === 'accountsReceivable' || mappedField === 'accountsPayable') {
              const numValue = parseFloat(value.replace(/[,$\s]/g, ''));
              (contact as any)[mappedField] = isNaN(numValue) ? 0 : numValue;
            } else if (mappedField === 'identificationType') {
              const idType = value.toLowerCase();
              if (idType.includes('rnc')) {
                (contact as any)[mappedField] = 'rnc';
              } else if (idType.includes('cedula') || idType.includes('cédula')) {
                (contact as any)[mappedField] = 'cedula';
              } else if (idType.includes('pasaporte')) {
                (contact as any)[mappedField] = 'pasaporte';
              } else {
                (contact as any)[mappedField] = 'rnc'; // Default para empresas
              }
            } else {
              (contact as any)[mappedField] = value;
            }
          }
        });

        // Establecer valores por defecto
        if (!contact.country) contact.country = 'República Dominicana';
        if (!contact.paymentTerms) contact.paymentTerms = '30 días';
        if (!contact.priceList) contact.priceList = 'Estándar';
        if (!contact.creditLimit) contact.creditLimit = 0;
        if (!contact.accountsReceivable) contact.accountsReceivable = 0;
        if (!contact.accountsPayable) contact.accountsPayable = 0;
        if (!contact.address) contact.address = '';
        if (!contact.province) contact.province = '';
        if (!contact.municipality) contact.municipality = '';
        if (!contact.email) contact.email = '';
        if (!contact.fax) contact.fax = '';
        if (!contact.phone2) contact.phone2 = '';
        if (!contact.phone1) contact.phone1 = '';
        if (!contact.mobile) contact.mobile = '';
        
        // Asignar tipo de identificación por defecto si hay número pero no tipo
        if (contact.identificationNumber && !contact.identificationType) {
          contact.identificationType = 'rnc';
        }

        console.log(`Contacto procesado fila ${i + 1}:`, contact);

        // Validar solo el nombre - es lo único obligatorio
        const contactErrors = validateMinimalContactData(contact);
        if (contactErrors.length > 0) {
          errors.push(`Fila ${i + 1}: ${contactErrors.join(', ')}`);
          continue; // Saltar este contacto si no tiene nombre
        }

        // Generar advertencias para contactos sin teléfono/email pero permitir la importación
        const hasContact = contact.phone1 || contact.phone2 || contact.mobile || contact.email;
        if (!hasContact) {
          warnings.push(`Fila ${i + 1}: ${contact.name} - sin información de contacto (teléfono/email)`);
        }

        // Verificar duplicados solo si hay información suficiente
        if (contact.name) {
          const existing = data.find(c => {
            if (c.identificationNumber && contact.identificationNumber && 
                c.identificationNumber === contact.identificationNumber) {
              return true;
            }
            return c.name?.toLowerCase() === contact.name?.toLowerCase();
          });
          
          if (existing) {
            duplicates.push(`Fila ${i + 1}: ${contact.name} posible duplicado`);
          }
        }

        data.push(contact);
      }

      console.log(`Procesamiento completado:`);
      console.log(`- Total de líneas procesadas: ${lines.length - 1}`);
      console.log(`- Contactos válidos: ${data.length}`);
      console.log(`- Errores: ${errors.length}`);
      console.log(`- Duplicados: ${duplicates.length}`);
      console.log(`- Advertencias: ${warnings.length}`);

      setImportPreview({ 
        data, 
        errors, 
        duplicates: [...duplicates, ...warnings] // Combinar duplicados y advertencias
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      setImportPreview({
        data: [],
        errors: [error instanceof Error ? error.message : 'Error al procesar el archivo'],
        duplicates: []
      });
    }
    
    setIsProcessing(false);
  };

  const handleImport = () => {
    if (importPreview && importPreview.data.length > 0) {
      // Importar todos los contactos que tengan al menos nombre
      const validContacts = importPreview.data.filter(contact => 
        contact.name?.trim()
      ) as Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[];
      
      console.log(`Importando ${validContacts.length} contactos válidos`);
      onImport(validContacts);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Nombre/Razón social,Tipo de identificación,RNC/Cédula,Teléfono 1,Teléfono 2,Fax,Celular,Dirección,Provincia,Municipio,País,Correo,Cuenta por cobrar,Cuenta por pagar,Término de pago,Lista de precios,Vendedor,Límite de crédito',
      'Empresa Ejemplo S.R.L.,RNC,131-000000-1,(809) 555-0000,(809) 555-0001,(809) 555-0002,(829) 555-0000,Av. Principal #123,Santo Domingo,Distrito Nacional,República Dominicana,info@empresa.com,15000,2000,30 días,Estándar,Juan Pérez,50000'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_clientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Importar Clientes</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instrucciones de Importación</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sube un archivo CSV (.csv) o de texto (.txt) con los datos de clientes</li>
              <li>• Descarga la plantilla para ver el formato correcto</li>
              <li>• <strong>Campo obligatorio:</strong> Solo Nombre/Razón social</li>
              <li>• Los contactos sin teléfono/email se importarán con advertencia</li>
              <li>• Los duplicados serán marcados pero podrás importar de todas formas</li>
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
                Selecciona el archivo de clientes
              </h3>
              <p className="text-gray-500 mb-4">
                Formatos soportados: CSV, TXT (máximo 500MB)
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-600">{importPreview.data.length}</p>
                    <p className="text-sm text-gray-600">Registros a importar</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
                    <p className="text-2xl font-bold text-red-600">{importPreview.errors.length}</p>
                    <p className="text-sm text-gray-600">Errores (omitidos)</p>
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
                  <h5 className="font-medium text-yellow-900 mb-2">Advertencias (se importarán de todas formas):</h5>
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
                  <h5 className="font-medium mb-2">Vista Previa (primeros 5 registros):</h5>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Nombre</th>
                          <th className="text-left p-2">Identificación</th>
                          <th className="text-left p-2">Teléfono</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Límite Crédito</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.data.slice(0, 5).map((contact, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{contact.name || '-'}</td>
                            <td className="p-2">{contact.identificationNumber || '-'}</td>
                            <td className="p-2">{contact.phone1 || contact.mobile || '-'}</td>
                            <td className="p-2">{contact.email || '-'}</td>
                            <td className="p-2">{contact.creditLimit ? `$${contact.creditLimit.toLocaleString()}` : '-'}</td>
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
                  Importar {importPreview.data.length} Clientes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportContacts;
