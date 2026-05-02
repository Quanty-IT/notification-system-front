import type { Template } from '../../types';

export type TemplateCardProps = {
  template: Template;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};
