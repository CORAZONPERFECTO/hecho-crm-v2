
import * as z from 'zod';

export const companySettingsSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  taxId: z.string().min(1, "El RNC/ID Fiscal es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  website: z.string().optional(),
  ticketPrefix: z.string().optional(),
  quotePrefix: z.string().optional(),
  invoicePrefix: z.string().optional(),
  proformaPrefix: z.string().optional(),
  deliveryNotePrefix: z.string().optional(),
  ncfEnabled: z.boolean().default(false),
});

export const ncfSettingsSchema = z.object({
  ncfEnabled: z.boolean(),
  ncfSeries: z.record(z.string(), z.object({
    sequence: z.number(),
    rangeFrom: z.number(),
    rangeTo: z.number(),
    description: z.string().optional(),
  })).optional(),
});

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;
