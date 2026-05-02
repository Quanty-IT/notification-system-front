import { api } from '../axios';
import * as T from './types';

export const getTemplates = async () => {
  const { data } = await api.get<T.GetTemplatesResponse>('/templates');
  return data;
};

export const activateTemplate = async ({ uuid }: T.ActivateTemplateRequest) => {
  const { data } = await api.patch<T.ToggleTemplateStatusResponse>(`/templates/${uuid}/activate`);
  return data;
};

export const deactivateTemplate = async ({ uuid }: T.DeactivateTemplateRequest) => {
  const { data } = await api.patch<T.ToggleTemplateStatusResponse>(`/templates/${uuid}/deactivate`);
  return data;
};
