import { z } from 'zod';

export const templateVariableTypes = ['string', 'number', 'boolean', 'date'] as const;

export const templateVariableTypeSchema = z.enum(templateVariableTypes);

export type TemplateVariableType = z.infer<typeof templateVariableTypeSchema>;

const getUnsafeHtmlReasons = (value: string) => {
  const reasons: string[] = [];

  const forbiddenTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'button',
    'link',
  ];

  forbiddenTags.forEach((tag) => {
    const regex = new RegExp(`<\\s*\\/?\\s*${tag}\\b[^>]*>`, 'i');

    if (regex.test(value)) {
      reasons.push(`<${tag}>`);
    }
  });

  if (/\son[a-z]+\s*=/i.test(value)) {
    reasons.push('event attributes, such as onclick, onload, or onerror');
  }

  if (/javascript\s*:/i.test(value)) {
    reasons.push('javascript protocol');
  }

  return reasons;
};

export const createTemplateVersionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required').superRefine((value, ctx) => {
    const reasons = getUnsafeHtmlReasons(value);
    if (reasons.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Body contains unsafe HTML: ${reasons.join(', ')}`,
      });
    }
  }),
  bodyType: z.enum(['html', 'text']),
  variablesSchemaJson: z.record(z.string(), templateVariableTypeSchema),
});

export type CreateTemplateVersionFormData = z.infer<typeof createTemplateVersionSchema>;
