import { z } from 'zod';

export const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type UpdateTemplateFormData = z.infer<typeof updateTemplateSchema>;
