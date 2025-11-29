
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { FixedExpense } from '@/hooks/useExpenses';

interface FixedExpensesFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<FixedExpense, 'id' | 'created_at'>) => Promise<void>;
}

interface FormData {
  year: number;
  month: number;
  category: string;
  amount: number;
  description?: string;
}

const FixedExpensesForm: React.FC<FixedExpensesFormProps> = ({ onClose, onSubmit }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      year: currentYear,
      month: currentMonth
    }
  });

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    onClose();
  };

  const categories = [
    'Combustible',
    'Sueldos',
    'Viáticos',
    'Alquiler',
    'Servicios Públicos',
    'Seguros',
    'Mantenimiento Vehículos',
    'Materiales Generales',
    'Otros'
  ];

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">
              Nuevo Gasto Fijo Mensual
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Año *</Label>
                <Input
                  type="number"
                  {...register('year', { 
                    required: 'Año es requerido',
                    min: { value: 2020, message: 'Año mínimo 2020' },
                    max: { value: 2030, message: 'Año máximo 2030' }
                  })}
                />
                {errors.year && <span className="text-red-500 text-sm">{errors.year.message}</span>}
              </div>
              
              <div>
                <Label>Mes *</Label>
                <Select onValueChange={(value) => setValue('month', parseInt(value))} defaultValue={currentMonth.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Categoría *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <span className="text-red-500 text-sm">Categoría es requerida</span>}
            </div>

            <div>
              <Label>Monto *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { 
                  required: 'Monto es requerido',
                  min: { value: 0.01, message: 'Monto debe ser mayor a 0' }
                })}
              />
              {errors.amount && <span className="text-red-500 text-sm">{errors.amount.message}</span>}
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción adicional del gasto..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FixedExpensesForm;
