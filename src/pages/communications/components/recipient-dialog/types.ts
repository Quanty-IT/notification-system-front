import { UseFormRegisterReturn } from 'react-hook-form';

export type RecipientDialogProps = {
  open: boolean;
  isLoading?: boolean;
  emailError?: string;
  recipientTypeValue: string;
  emailRegister: UseFormRegisterReturn;
  onRecipientTypeChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};
