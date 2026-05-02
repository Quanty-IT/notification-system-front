export type Template = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetTemplatesResponse = {
  templates: Template[];
};

export type ActivateTemplateRequest = {
  uuid: string;
};

export type DeactivateTemplateRequest = {
  uuid: string;
};

export type ToggleTemplateStatusResponse = {
  id: string;
  isActive: boolean;
  updatedAt: string;
};
