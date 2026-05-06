import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

import { CreateTemplateVersionFormData, createTemplateVersionSchema, TemplateVariableType } from './schema';

import { areTemplateVariablesEqual, extractTemplateVariables } from './template-variable-utils';

export const useTemplateVersionForm = () => {
  const form = useForm<CreateTemplateVersionFormData>({
    resolver: zodResolver(createTemplateVersionSchema),
    defaultValues: {
      subject: '',
      body: '',
      bodyType: 'html',
      variablesSchemaJson: {},
    },
  });

  const body = form.watch('body');

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      const detectedVariables = extractTemplateVariables(body || '');
      const currentVariables = form.getValues('variablesSchemaJson') ?? {};

      const nextVariables = detectedVariables.reduce<Record<string, TemplateVariableType>>((acc, name) => {
        acc[name] = currentVariables[name] ?? 'string';
        return acc;
      }, {});

      if (!areTemplateVariablesEqual(currentVariables, nextVariables)) {
        form.setValue('variablesSchemaJson', nextVariables, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [body, form]);

  return form;
};
