import { Template } from '../../types';

export type TemplateCardProps = {
  template: Template;
  onToggle: (id: string, isActive: boolean) => void;
  isToggling?: boolean;
};
