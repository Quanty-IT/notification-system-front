import type { Template } from '../../../../services/templates/types';

export type TemplateCardProps = {
  template: Template;
  onClick?: () => void;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};
