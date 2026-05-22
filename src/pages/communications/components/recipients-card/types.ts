export type RecipientItem = {
  id?: string;
  email: string;
  recipientType: 'to' | 'cc' | 'bcc';
};

export type RecipientsCardProps = {
  recipients: RecipientItem[];
  disabled?: boolean;
  onAddClick: () => void;
  onRemove: (recipient: RecipientItem) => void;
};
