import { Control, FieldErrors } from 'react-hook-form';

export type DeliveryFormValues = {
  scheduledAt?: Date | null;
};

export type DeliveryCardProps<T extends DeliveryFormValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
};
