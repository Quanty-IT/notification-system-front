import React from 'react';

export type LocalAttachment = {
  type: 'local';
  file: File;
  index: number;
};

export type PersistedAttachment = {
  type: 'persisted';
  id: string;
  originalFileName: string;
  fileSizeBytes: number;
};

export type AttachmentItem = LocalAttachment | PersistedAttachment;

export type AttachmentsCardProps = {
  attachments: AttachmentItem[];
  disabled?: boolean;
  isLoading?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (attachment: AttachmentItem) => void;
};
