import { TemplateVariableType } from './schema';

export const extractTemplateVariables = (body: string): string[] => {
  const variables = new Set<string>();
  let index = 0;

  while (index < body.length) {
    const start = body.indexOf('{{', index);
    if (start === -1) break;

    const end = body.indexOf('}}', start + 2);
    if (end === -1) break;

    const name = body.slice(start + 2, end).trim();

    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      variables.add(name);
    }

    index = end + 2;
  }

  return Array.from(variables).sort();
};

export const areTemplateVariablesEqual = (
  current: Record<string, TemplateVariableType>,
  next: Record<string, TemplateVariableType>,
) => {
  const currentKeys = Object.keys(current);
  const nextKeys = Object.keys(next);

  if (currentKeys.length !== nextKeys.length) return false;

  return currentKeys.every((key) => current[key] === next[key]);
};
