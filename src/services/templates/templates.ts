import { api } from '../axios';
import * as T from './types';

export const createTemplate = async (payload: T.CreateTemplateRequest) => {
  const { data } = await api.post<T.Template>('/templates', payload);
  return data;
};

export const getTemplates = async (params?: T.GetTemplatesRequest) => {
  const { data } = await api.get<T.GetTemplatesResponse>('/templates', {
    params,
  });

  return data;
};

export const getTemplateByUuid = async ({ uuid }: T.GetTemplateByUuidRequest) => {
  const { data } = await api.get<T.Template>(`/templates/${uuid}`);
  return data;
};

export const updateTemplate = async ({ uuid, data: payload }: T.UpdateTemplateRequest) => {
  const { data } = await api.patch<T.Template>(`/templates/${uuid}`, payload);
  return data;
};

export const deleteTemplate = async ({ uuid }: T.DeleteTemplateRequest) => {
  await api.delete(`/templates/${uuid}`);
};

export const activateTemplate = async ({ uuid }: T.ActivateTemplateRequest) => {
  const { data } = await api.patch<T.Template>(`/templates/${uuid}/activate`);
  return data;
};

export const deactivateTemplate = async ({ uuid }: T.DeactivateTemplateRequest) => {
  const { data } = await api.patch<T.Template>(`/templates/${uuid}/deactivate`);
  return data;
};
