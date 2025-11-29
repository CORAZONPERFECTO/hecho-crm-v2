
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Contact, ContactFilters } from './types';
import { 
  getContactTypeColor, 
  getStatusColor, 
  filterContacts, 
  formatCurrency,
  checkCreditLimit,
  exportToCSV
} from './utils';

interface ContactsListProps {
  userRole: 'admin' | 'technician' | 'manager';
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({
  userRole,
  onEditContact,
  onDeleteContact,
  onViewDetails
}) => {
  // Sample data - would come from API
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Tech Solutions S.R.L.',
      type: 'cliente',
      identificationType: 'rnc',
      identificationNumber: '131-000000-1',
      phone1: '(809) 555-0001',
      mobile: '(829) 555-0001',
      address: 'Av. 27 de Febrero #123',
      province: 'Santo Domingo',
      municipality: 'Distrito Nacional',
      country: 'República Dominicana',
      email: 'contacto@techsolutions.com',
      paymentTerms: '30 días',
      priceList: 'VIP',
      assignedSalesperson: 'Carlos Méndez',
      creditLimit: 100000,
      accountsReceivable: 75000,
      accountsPayable: 0,
      internalNotes: 'Cliente preferencial',
      createdAt: '2024-01-15',
      updatedAt: '2024-06-15',
      status: 'activo'
    },
    {
      id: '2',
      name: 'Distribuidora Eléctrica del Caribe',
      type: 'proveedor',
      identificationType: 'rnc',
      identificationNumber: '131-000001-2',
      phone1: '(809) 555-0002',
      mobile: '(829) 555-0002',
      address: 'Zona Industrial de Herrera',
      province: 'Santo Domingo',
      municipality: 'Santo Domingo Este',
      country: 'República Dominicana',
      email: 'ventas@distribuidora.com',
      paymentTerms: '15 días',
      priceList: 'Mayorista',
      creditLimit: 0,
      accountsReceivable: 0,
      accountsPayable: 25000,
      createdAt: '2024-02-10',
      updatedAt: '2024-06-10',
      status: 'activo'
    }
  ]);

  const [filters, setFilters] = useState<ContactFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredContacts = filterContacts(contacts, filters);

  const handleFilterChange = (key: keyof ContactFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleExport = () => {
    const csv = exportToCSV(filteredContacts);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contactos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const canEdit = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar por nombre, ID o email..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de contacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="proveedor">Proveedor</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.province || ''} onValueChange={(value) => handleFilterChange('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Santo Domingo">Santo Domingo</SelectItem>
                <SelectItem value="Santiago">Santiago</SelectItem>
                <SelectItem value="La Vega">La Vega</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Tarjetas
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Tabla
              </Button>
            </div>
            
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {filteredContacts.length} de {contacts.length} contactos
        </p>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card 
              key={contact.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onViewDetails(contact)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-sm text-gray-500">{contact.identificationNumber}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getContactTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                    
                    {checkCreditLimit(contact) && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                    
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact);
                          }}>
                            <Edit size={16} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteContact(contact.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{contact.phone1 || contact.mobile || 'Sin teléfono'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span>{contact.email || 'Sin email'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{contact.province}, {contact.municipality}</span>
                  </div>
                  
                  {contact.type === 'cliente' && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Por cobrar:</span>
                        <span className={contact.accountsReceivable > 0 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                          {formatCurrency(contact.accountsReceivable)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Límite crédito:</span>
                        <span className="text-gray-600">
                          {formatCurrency(contact.creditLimit)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {contact.type === 'proveedor' && contact.accountsPayable > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Por pagar:</span>
                        <span className="text-red-600 font-medium">
                          {formatCurrency(contact.accountsPayable)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium">Contacto</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">Teléfono</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Ubicación</th>
                    <th className="text-left p-4 font-medium">Estado Financiero</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    {canEdit && <th className="text-left p-4 font-medium">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewDetails(contact)}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium flex items-center">
                            {contact.name}
                            {checkCreditLimit(contact) && (
                              <AlertTriangle size={14} className="text-red-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{contact.identificationNumber}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getContactTypeColor(contact.type)}>
                          {contact.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">{contact.phone1 || contact.mobile || '-'}</td>
                      <td className="p-4 text-sm">{contact.email || '-'}</td>
                      <td className="p-4 text-sm">{contact.province}, {contact.municipality}</td>
                      <td className="p-4 text-sm">
                        {contact.type === 'cliente' && contact.accountsReceivable > 0 && (
                          <span className="text-orange-600">
                            Por cobrar: {formatCurrency(contact.accountsReceivable)}
                          </span>
                        )}
                        {contact.type === 'proveedor' && contact.accountsPayable > 0 && (
                          <span className="text-red-600">
                            Por pagar: {formatCurrency(contact.accountsPayable)}
                          </span>
                        )}
                        {contact.accountsReceivable === 0 && contact.accountsPayable === 0 && '-'}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                      </td>
                      {canEdit && (
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onEditContact(contact);
                              }}>
                                <Edit size={16} className="mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteContact(contact.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron contactos</h3>
            <p className="text-gray-500">
              {filters.search || filters.type || filters.province 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer contacto'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactsList;
