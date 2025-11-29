import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  DollarSign,
  CalendarDays,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useClientRevenues, ClientRevenue, ClientRevenueFilters } from '@/hooks/useClientRevenues';
import { useToast } from '@/hooks/use-toast';

const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' }
];

const ClientRevenueTable: React.FC = () => {
  const { 
    revenues, 
    loading, 
    createRevenue, 
    updateRevenue, 
    deleteRevenue, 
    fetchRevenues,
    getUniqueClients,
    getTotalRevenue 
  } = useClientRevenues();
  
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<ClientRevenue | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Formulario
  const [formData, setFormData] = useState({
    client_name: '',
    revenue_date: new Date(),
    invoiced_amount: '',
    associated_service: '',
    payment_method: '',
    observations: '',
    created_by: ''
  });

  // Filtros
  const [filters, setFilters] = useState<ClientRevenueFilters>({});
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const resetForm = () => {
    setFormData({
      client_name: '',
      revenue_date: new Date(),
      invoiced_amount: '',
      associated_service: '',
      payment_method: '',
      observations: '',
      created_by: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.invoiced_amount || !formData.payment_method) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      const revenueData = {
        ...formData,
        revenue_date: format(formData.revenue_date, 'yyyy-MM-dd'),
        invoiced_amount: Number(formData.invoiced_amount),
        payment_method: formData.payment_method as 'efectivo' | 'transferencia' | 'tarjeta' | 'otro',
        created_by: 'Admin' // En una implementación real, obtener del contexto de usuario
      };

      if (editingRevenue) {
        await updateRevenue(editingRevenue.id, revenueData);
        setShowEditDialog(false);
        setEditingRevenue(null);
      } else {
        await createRevenue(revenueData);
        setShowCreateDialog(false);
      }
      
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (revenue: ClientRevenue) => {
    setEditingRevenue(revenue);
    setFormData({
      client_name: revenue.client_name,
      revenue_date: new Date(revenue.revenue_date),
      invoiced_amount: revenue.invoiced_amount.toString(),
      associated_service: revenue.associated_service || '',
      payment_method: revenue.payment_method,
      observations: revenue.observations || '',
      created_by: revenue.created_by
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este ingreso?')) {
      await deleteRevenue(id);
    }
  };

  const applyFilters = () => {
    const newFilters: ClientRevenueFilters = {
      ...filters,
      date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
      date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined
    };
    fetchRevenues(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setDateFrom(undefined);
    setDateTo(undefined);
    fetchRevenues();
  };

  const exportToCSV = () => {
    const headers = ['Cliente', 'Fecha', 'Monto', 'Servicio', 'Método de Pago', 'Observaciones'];
    const csvContent = [
      headers.join(','),
      ...revenues.map(revenue => [
        revenue.client_name,
        revenue.revenue_date,
        revenue.invoiced_amount,
        revenue.associated_service || '',
        revenue.payment_method,
        revenue.observations || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos-clientes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      efectivo: 'default',
      transferencia: 'secondary',
      tarjeta: 'outline',
      otro: 'destructive'
    };
    return <Badge variant={variants[method] || 'default'}>{method}</Badge>;
  };

  const uniqueClients = getUniqueClients();
  const totalRevenue = getTotalRevenue(filters);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                <p className="text-2xl font-bold text-foreground">{revenues.length}</p>
              </div>
              <div className="text-blue-600">
                <Search className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Facturado</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                <p className="text-2xl font-bold text-foreground">{uniqueClients.length}</p>
              </div>
              <div className="text-purple-600">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ingresos por Cliente</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Ingreso
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Ingreso</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_name">Cliente *</Label>
                        <Input
                          id="client_name"
                          value={formData.client_name}
                          onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                          placeholder="Nombre del cliente"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="revenue_date">Fecha *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {format(formData.revenue_date, 'dd/MM/yyyy', { locale: es })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-background">
                            <Calendar
                              mode="single"
                              selected={formData.revenue_date}
                              onSelect={(date) => date && setFormData({...formData, revenue_date: date})}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoiced_amount">Monto Facturado *</Label>
                        <Input
                          id="invoiced_amount"
                          type="number"
                          step="0.01"
                          value={formData.invoiced_amount}
                          onChange={(e) => setFormData({...formData, invoiced_amount: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment_method">Método de Pago *</Label>
                        <Select 
                          value={formData.payment_method} 
                          onValueChange={(value) => setFormData({...formData, payment_method: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="associated_service">Servicio Asociado</Label>
                      <Input
                        id="associated_service"
                        value={formData.associated_service}
                        onChange={(e) => setFormData({...formData, associated_service: e.target.value})}
                        placeholder="Descripción del servicio"
                      />
                    </div>

                    <div>
                      <Label htmlFor="observations">Observaciones</Label>
                      <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => setFormData({...formData, observations: e.target.value})}
                        placeholder="Observaciones adicionales"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Guardar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Filtros */}
        {showFilters && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Cliente</Label>
                <Input
                  placeholder="Buscar cliente..."
                  value={filters.client_name || ''}
                  onChange={(e) => setFilters({...filters, client_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Fecha Desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Fecha Hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Método de Pago</Label>
                <Select value={filters.payment_method || ''} onValueChange={(value) => setFilters({...filters, payment_method: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters}>Aplicar Filtros</Button>
              <Button variant="outline" onClick={clearFilters}>Limpiar</Button>
            </div>
          </CardContent>
        )}

        {/* Tabla */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : revenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No hay ingresos registrados</TableCell>
                </TableRow>
              ) : (
                revenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell className="font-medium">{revenue.client_name}</TableCell>
                    <TableCell>{format(new Date(revenue.revenue_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                    <TableCell>${revenue.invoiced_amount.toLocaleString()}</TableCell>
                    <TableCell>{revenue.associated_service || '-'}</TableCell>
                    <TableCell>{getPaymentMethodBadge(revenue.payment_method)}</TableCell>
                    <TableCell className="max-w-xs truncate">{revenue.observations || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(revenue)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(revenue.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ingreso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_client_name">Cliente *</Label>
                <Input
                  id="edit_client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_revenue_date">Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {format(formData.revenue_date, 'dd/MM/yyyy', { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background">
                    <Calendar
                      mode="single"
                      selected={formData.revenue_date}
                      onSelect={(date) => date && setFormData({...formData, revenue_date: date})}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_invoiced_amount">Monto Facturado *</Label>
                <Input
                  id="edit_invoiced_amount"
                  type="number"
                  step="0.01"
                  value={formData.invoiced_amount}
                  onChange={(e) => setFormData({...formData, invoiced_amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_payment_method">Método de Pago *</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value) => setFormData({...formData, payment_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_associated_service">Servicio Asociado</Label>
              <Input
                id="edit_associated_service"
                value={formData.associated_service}
                onChange={(e) => setFormData({...formData, associated_service: e.target.value})}
                placeholder="Descripción del servicio"
              />
            </div>

            <div>
              <Label htmlFor="edit_observations">Observaciones</Label>
              <Textarea
                id="edit_observations"
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                placeholder="Observaciones adicionales"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientRevenueTable;