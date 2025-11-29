
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { TicketExpense } from '@/hooks/useExpenses';
import { useTickets } from '@/hooks/useTickets';

interface TicketExpensesFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<TicketExpense, 'id' | 'created_at'>) => Promise<void>;
}

interface FormData {
  ticket_id: string;
  category: string;
  amount: number;
  description?: string;
}

const TicketExpensesForm: React.FC<TicketExpensesFormProps> = ({ onClose, onSubmit }) => {
  const { tickets } = useTickets();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    onClose();
  };

  const categories = [
    'Materiales Extra',
    'Tiempo Extra',
    'Retrabajo',
    'Transporte Adicional',
    'Herramientas Especiales',
    'Subcontratación',
    'Otros'
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">
              Nuevo Gasto Variable de Ticket
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <Label>Ticket *</Label>
              <Select onValueChange={(value) => setValue('ticket_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ticket" />
                </SelectTrigger>
                <SelectContent>
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.ticket_number} - {ticket.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ticket_id && <span className="text-red-500 text-sm">Ticket es requerido</span>}
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
                placeholder="Descripción del gasto variable..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
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

export default TicketExpensesForm;
