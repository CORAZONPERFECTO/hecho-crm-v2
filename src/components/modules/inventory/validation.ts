
import { z } from 'zod';

export const productSchema = z.object({
  type: z.enum(['Producto', 'Servicio'], { required_error: 'Seleccione el tipo.' }),
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  sku: z.string().min(3, { message: 'El SKU debe tener al menos 3 caracteres.' }),
  category: z.string().min(3, { message: 'La categoría debe tener al menos 3 caracteres.' }),
  stock: z.coerce.number().min(0, { message: 'El stock no puede ser negativo.' }),
  minStock: z.coerce.number().min(0, { message: 'El stock mínimo no puede ser negativo.' }),
  price: z.coerce.number().min(0, { message: 'El precio no puede ser negativo.' }),
  unit: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // Requiere unidad de medida si es Producto
  if (data.type === 'Producto' && (!data.unit || data.unit.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La unidad de medida es obligatoria para productos.',
      path: ['unit'],
    });
  }
});

export type ProductFormValues = z.infer<typeof productSchema>;
