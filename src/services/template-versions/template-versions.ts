import { api } from '../axios';

export type TemplateVersion = {
  id: string;
  templateId: string;
  version: number;
  subject: string;
  body: string;
  bodyType: 'text' | 'html';
  variablesSchemaJson: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetTemplateVersionsResponse = {
  templateVersions: TemplateVersion[];
};

export const getTemplateVersionsByTemplateId = async (templateId: string): Promise<GetTemplateVersionsResponse> => {
  const { data } = await api.get<GetTemplateVersionsResponse>(`/template-versions/template/${templateId}`);
  return data;
};

export const getTemplateVersionById = async (id: string): Promise<TemplateVersion> => {
  const { data } = await api.get<TemplateVersion>(`/template-versions/${id}`);
  return data;
};
