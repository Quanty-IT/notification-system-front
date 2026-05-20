export type TemplateVariableType = 'string' | 'number' | 'boolean' | 'date';

export type TemplateVariablesSchemaJson = Record<string, TemplateVariableType>;

export type TemplateVersion = {
  id: string;
  templateId: string;
  version: number;
  subject: string;
  body: string;
  variablesSchemaJson: TemplateVariablesSchemaJson;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateVersionRequest = {
  templateId: string;
  subject: string;
  body: string;
  variablesSchemaJson: TemplateVariablesSchemaJson;
};

export type GetTemplateVersionsRequest = {
  templateId: string;
  isActive?: boolean;
};

export type GetTemplateVersionsResponse = {
  templateVersions: TemplateVersion[];
};

export type GetTemplateVersionByUuidRequest = {
  uuid: string;
};

export type UpdateTemplateVersionRequest = {
  uuid: string;
  data: {
    subject: string;
    body: string;
    variablesSchemaJson: TemplateVariablesSchemaJson;
  };
};

export type DeleteTemplateVersionRequest = {
  uuid: string;
};

export type ActivateTemplateVersionRequest = {
  uuid: string;
};

export type DeactivateTemplateVersionRequest = {
  uuid: string;
};
