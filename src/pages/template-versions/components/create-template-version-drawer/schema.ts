import { z } from 'zod';

export const templateVariableTypes = ['string', 'number', 'boolean', 'date'] as const;

export const templateVariableTypeSchema = z.enum(templateVariableTypes);

export type TemplateVariableType = z.infer<typeof templateVariableTypeSchema>;

export const createTemplateVersionSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject must be at most 255 characters'),
  body: z.string().min(1, 'Body is required'),
  variablesSchemaJson: z.record(z.string(), templateVariableTypeSchema),
});

export type CreateTemplateVersionFormData = z.infer<typeof createTemplateVersionSchema>;
