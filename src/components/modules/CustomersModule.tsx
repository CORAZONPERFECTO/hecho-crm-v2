import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Star, MapPin, Upload, Phone, Mail, Building, UserCheck } from 'lucide-react';
import CreateContactForm from './contacts/CreateContactForm';
import ImportContacts from './contacts/ImportContacts';
import { Contact } from './contacts/types';
import { useToast } from '@/hooks/use-toast';
import { useContacts } from '@/hooks/useContacts';

const CustomersModule: React.FC = () => {
  const { 
    contacts: customers, 
    loading, 
    createContact, 
    stats 
  } = useContacts();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const { toast } = useToast();

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createContact(contactData);
      setShowCreateForm(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleImportContacts = async (contacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      for (const contact of contacts) {
        await createContact(contact);
      }
      setShowImportForm(false);
      
      toast({
        title: "Contactos importados",
        description: `${contacts.length} contactos han sido importados exitosamente.`,
      });
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cliente': return 'bg-blue-100 text-blue-800';
      case 'proveedor': return 'bg-green-100 text-green-800';
      case 'ambos': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setShowImportForm(true)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Upload size={16} className="mr-2" />
              Importar Clientes
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Estado activo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solo Clientes</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
              <p className="text-xs text-muted-foreground">Tipo cliente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
              <p className="text-xs text-muted-foreground">Tipo proveedor</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-600">Cliente</th>
                    <th className="text-left p-4 font-medium text-gray-600">Contacto</th>
                    <th className="text-left p-4 font-medium text-gray-600">Tipo</th>
                    <th className="text-left p-4 font-medium text-gray-600">Ubicación</th>
                    <th className="text-left p-4 font-medium text-gray-600">Última Act.</th>
                    <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="border px-4 py-8 text-center text-gray-500">
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border px-4 py-8 text-center text-gray-500">
                        No hay clientes registrados
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{customer.name}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm">{customer.phone1}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getTypeColor(customer.type)}>
                            {customer.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm">{customer.municipality}, {customer.province}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(customer.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button variant="outline" size="sm">Ver Perfil</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showCreateForm && (
        <CreateContactForm
          onClose={() => setShowCreateForm(false)}
          onSave={handleSaveContact}
        />
      )}
      
      {showImportForm && (
        <ImportContacts
          onClose={() => setShowImportForm(false)}
          onImport={handleImportContacts}
        />
      )}
    </>
  );
};

export default CustomersModule;