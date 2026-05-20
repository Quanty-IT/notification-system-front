export type TemplateVersionCardData = {
  id: string;
  version: number;
  subject: string;
  isActive: boolean;
  variablesSchemaJson?: Record<string, string>;
};

export type TemplateVersionCardProps = {
  version: TemplateVersionCardData;
  onToggle: (uuid: string, isActive: boolean) => void;
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};
