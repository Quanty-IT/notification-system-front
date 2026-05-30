import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;
