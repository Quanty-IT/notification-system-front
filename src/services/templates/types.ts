export type Template = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateRequest = {
  name: string;
  description: string;
};

export type GetTemplatesRequest = {
  isActive?: boolean;
};

export type GetTemplatesResponse = {
  templates: Template[];
};

export type GetTemplateByUuidRequest = {
  uuid: string;
};

export type UpdateTemplateRequest = {
  uuid: string;
  data: {
    name: string;
    description: string;
  };
};

export type DeleteTemplateRequest = {
  uuid: string;
};

export type ActivateTemplateRequest = {
  uuid: string;
};

export type DeactivateTemplateRequest = {
  uuid: string;
};
