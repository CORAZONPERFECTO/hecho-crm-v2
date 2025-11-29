
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { productSchema, ProductFormValues } from './validation';

interface AddProductFormProps {
  onAddProduct: (product: ProductFormValues) => void;
  setOpen: (open: boolean) => void;
}

const UNIDADES = [
  'Unidad',
  'Pieza',
  'Libra',
  'Pie',
  'Metro',
  'Caja',
  'Galón',
  'Lata',
  'Paquete',
];

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, setOpen }) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: 'Producto',
      name: '',
      sku: '',
      category: '',
      stock: 0,
      minStock: 10,
      price: 0,
      unit: '',
    },
  });

  const type = form.watch('type');

  const onSubmit = (values: ProductFormValues) => {
    onAddProduct(values);
    form.reset();
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Añadir Nuevo {type}</DialogTitle>
        <DialogDescription>
          Complete los detalles del nuevo {type?.toLowerCase()}.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Producto">Producto</option>
                      <option value="Servicio">Servicio</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: Laptop Dell XPS 13" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: LT-DELL-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: Electrónicos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {type === 'Producto' && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full mt-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Seleccione unidad...</option>
                        {UNIDADES.map((u) => (
                          <option value={u} key={u}>{u}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (sin ITBIS)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1299.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Guardar {type}</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddProductForm;
