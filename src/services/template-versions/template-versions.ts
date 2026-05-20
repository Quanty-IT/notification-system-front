import { api } from '../axios';
import * as T from './types';

export const createTemplateVersion = async (payload: T.CreateTemplateVersionRequest) => {
  const { data } = await api.post<T.TemplateVersion>('/template-versions', payload);
  return data;
};

export const getTemplateVersions = async ({ templateId, isActive }: T.GetTemplateVersionsRequest) => {
  const { data } = await api.get<T.GetTemplateVersionsResponse>(`/templates/${templateId}/versions`, {
    params: {
      isActive,
    },
  });

  return data;
};

export const getTemplateVersionByUuid = async ({ uuid }: T.GetTemplateVersionByUuidRequest) => {
  const { data } = await api.get<T.TemplateVersion>(`/template-versions/${uuid}`);
  return data;
};

export const updateTemplateVersion = async ({ uuid, data: payload }: T.UpdateTemplateVersionRequest) => {
  const { data } = await api.patch<T.TemplateVersion>(`/template-versions/${uuid}`, payload);
  return data;
};

export const deleteTemplateVersion = async ({ uuid }: T.DeleteTemplateVersionRequest) => {
  await api.delete(`/template-versions/${uuid}`);
};

export const activateTemplateVersion = async ({ uuid }: T.ActivateTemplateVersionRequest) => {
  const { data } = await api.patch<T.TemplateVersion>(`/template-versions/${uuid}/activate`);
  return data;
};

export const deactivateTemplateVersion = async ({ uuid }: T.DeactivateTemplateVersionRequest) => {
  const { data } = await api.patch<T.TemplateVersion>(`/template-versions/${uuid}/deactivate`);
  return data;
};
