
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Upload, Edit, Trash2, Filter, Calendar, User, Wrench, Fuel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExpenseRegistry: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpenseType, setSelectedExpenseType] = useState('general');
  const { toast } = useToast();

  const expenseCategories = [
    'Materiales',
    'Servicios',
    'Viáticos y Transporte',
    'Salarios',
    'Servicios Públicos',
    'Alquiler',
    'Seguros',
    'Gastos Diarios',
    'Combustible',
    'Otros'
  ];

  const dailyExpenseTypes = [
    { id: 'salary', label: 'Sueldo Diario', icon: User, color: 'bg-blue-100 text-blue-800' },
    { id: 'workday', label: 'Día de Trabajo', icon: Calendar, color: 'bg-green-100 text-green-800' },
    { id: 'materials', label: 'Materiales Adicionales', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
    { id: 'fuel', label: 'Combustible', icon: Fuel, color: 'bg-red-100 text-red-800' }
  ];

  const expenseData = [
    {
      id: 1,
      date: '2024-06-15',
      supplier: 'Juan Pérez (Técnico)',
      rnc: '402-1234567-8',
      amount: 1500,
      category: 'Gastos Diarios',
      subCategory: 'Sueldo Diario',
      paymentMethod: 'efectivo',
      description: 'Pago sueldo diario - Instalación sistema eléctrico',
      hasReceipt: true,
      project: 'PROJ-202406-A123'
    },
    {
      id: 2,
      date: '2024-06-15',
      supplier: 'Gasolinera Shell',
      rnc: '101-7777777-7',
      amount: 850,
      category: 'Gastos Diarios',
      subCategory: 'Combustible',
      paymentMethod: 'tarjeta',
      description: 'Combustible para vehículo de servicio',
      hasReceipt: true,
      project: 'PROJ-202406-A123'
    },
    {
      id: 3,
      date: '2024-06-14',
      supplier: 'Ferretería Central',
      rnc: '131-55555-5',
      amount: 650,
      category: 'Gastos Diarios',
      subCategory: 'Materiales Adicionales',
      paymentMethod: 'efectivo',
      description: 'Cables y conectores adicionales no previstos',
      hasReceipt: true,
      project: 'PROJ-202406-B456'
    },
    {
      id: 4,
      date: '2024-06-14',
      supplier: 'Carlos Martínez (Técnico)',
      rnc: '402-9876543-2',
      amount: 1200,
      category: 'Gastos Diarios',
      subCategory: 'Día de Trabajo',
      paymentMethod: 'transferencia',
      description: 'Pago por día completo de trabajo - Mantenimiento industrial',
      hasReceipt: false,
      project: 'PROJ-202406-C789'
    }
  ];

  const handleAddExpense = () => {
    toast({
      title: "Gasto registrado exitosamente",
      description: "El nuevo gasto diario ha sido añadido al sistema.",
    });
    setShowAddForm(false);
  };

  const getCategoryColor = (category: string, subCategory?: string) => {
    if (category === 'Gastos Diarios' && subCategory) {
      const dailyType = dailyExpenseTypes.find(type => type.label === subCategory);
      return dailyType?.color || 'bg-gray-100 text-gray-800';
    }
    
    const colors: { [key: string]: string } = {
      'Materiales': 'bg-blue-100 text-blue-800',
      'Servicios': 'bg-green-100 text-green-800',
      'Viáticos y Transporte': 'bg-yellow-100 text-yellow-800',
      'Salarios': 'bg-purple-100 text-purple-800',
      'Servicios Públicos': 'bg-orange-100 text-orange-800',
      'Alquiler': 'bg-red-100 text-red-800',
      'Seguros': 'bg-indigo-100 text-indigo-800',
      'Gastos Diarios': 'bg-pink-100 text-pink-800',
      'Combustible': 'bg-red-100 text-red-800',
      'Otros': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'efectivo': return 'bg-green-100 text-green-800';
      case 'transferencia': return 'bg-blue-100 text-blue-800';
      case 'tarjeta': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExpenses = expenseData.filter(expense =>
    expense.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (expense.subCategory && expense.subCategory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Registro de Gastos</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Plus size={16} className="mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Quick Add Daily Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Gastos Diarios Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dailyExpenseTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    setSelectedExpenseType(type.id);
                    setShowAddForm(true);
                  }}
                >
                  <IconComponent size={24} />
                  <span className="text-sm">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar por proveedor, descripción, categoría o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedExpenseType !== 'general' ? 
                `Registrar ${dailyExpenseTypes.find(t => t.id === selectedExpenseType)?.label}` : 
                'Registrar Nuevo Gasto'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense-date">Fecha del Gasto</Label>
                <Input type="date" id="expense-date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor/Técnico</Label>
                <Input id="supplier" placeholder="Nombre del proveedor o técnico" />
              </div>
              <div>
                <Label htmlFor="rnc">RNC/Cédula</Label>
                <Input id="rnc" placeholder="000-0000000-0" />
              </div>
              <div>
                <Label htmlFor="expense-amount">Monto</Label>
                <Input type="number" id="expense-amount" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="category">Categoría del Gasto</Label>
                <Select defaultValue={selectedExpenseType !== 'general' ? 'gastos-diarios' : ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase().replace(' ', '-')}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedExpenseType !== 'general' && (
                <div>
                  <Label htmlFor="subcategory">Tipo de Gasto Diario</Label>
                  <Select defaultValue={selectedExpenseType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {dailyExpenseTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="project">Proyecto Asociado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proyecto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proj-1">PROJ-202406-A123 - Instalación Industrial ABC</SelectItem>
                    <SelectItem value="proj-2">PROJ-202406-B456 - Mantenimiento Hotel XYZ</SelectItem>
                    <SelectItem value="proj-3">PROJ-202406-C789 - Servicio Residencial DEF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expense-payment-method">Forma de Pago</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="expense-description">Descripción</Label>
                <Textarea 
                  id="expense-description" 
                  placeholder={
                    selectedExpenseType === 'salary' ? 'Ej: Pago sueldo diario - Instalación sistema eléctrico' :
                    selectedExpenseType === 'workday' ? 'Ej: Pago por día completo de trabajo - Mantenimiento' :
                    selectedExpenseType === 'materials' ? 'Ej: Materiales adicionales no previstos en presupuesto' :
                    selectedExpenseType === 'fuel' ? 'Ej: Combustible para vehículo de servicio' :
                    'Detalle del gasto...'
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="expense-receipt">Comprobante</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload size={16} className="mr-2" />
                    Subir Comprobante
                  </Button>
                  <span className="text-sm text-gray-500">PDF, JPG, PNG (máx. 5MB)</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowAddForm(false);
                setSelectedExpenseType('general');
              }}>
                Cancelar
              </Button>
              <Button onClick={handleAddExpense} className="bg-red-600 hover:bg-red-700">
                Registrar Gasto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left p-3 font-medium text-gray-600">Proveedor/Técnico</th>
                  <th className="text-left p-3 font-medium text-gray-600">RNC</th>
                  <th className="text-left p-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left p-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-left p-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left p-3 font-medium text-gray-600">Proyecto</th>
                  <th className="text-left p-3 font-medium text-gray-600">Método</th>
                  <th className="text-left p-3 font-medium text-gray-600">Comprobante</th>
                  <th className="text-left p-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{expense.date}</td>
                    <td className="p-3 font-medium">{expense.supplier}</td>
                    <td className="p-3 text-sm text-gray-600">{expense.rnc}</td>
                    <td className="p-3 font-bold text-red-600">${expense.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {expense.subCategory && (
                        <Badge className={getCategoryColor(expense.category, expense.subCategory)}>
                          {expense.subCategory}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {expense.project && (
                        <Badge variant="outline">{expense.project}</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={getPaymentMethodColor(expense.paymentMethod)}>
                        {expense.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {expense.hasReceipt ? (
                        <Badge className="bg-green-100 text-green-800">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit size={14} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseRegistry;
