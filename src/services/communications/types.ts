export type RecipientType = 'to' | 'cc' | 'bcc';
export type CommunicationSourceType = 'manual' | 'template';
export type CommunicationStatus = 'draft' | 'scheduled' | 'processing' | 'sent' | 'failed' | 'canceled';
export type CommunicationDispatchStatus = 'processing' | 'sent' | 'failed';
export type EmailProviderName = 'resend' | 'mailtrap';

export type CommunicationRecipientInput = {
  recipientType: RecipientType;
  email: string;
};

export type CreateCommunicationInput = {
  channel: 'email';
  sourceType: CommunicationSourceType;
  subject?: string | null;
  body?: string | null;
  templateVersionId?: string | null;
  templateVariablesJson?: Record<string, unknown> | null;
  scheduledAt?: string;
  recipients: CommunicationRecipientInput[];
};

export type UpdateCommunicationInput = Partial<{
  subject: string;
  body: string;
  templateVersionId: string;
  templateVariablesJson: Record<string, unknown>;
  scheduledAt: string;
}>;

export type Communication = {
  id: string;
  channel: 'email';
  sourceType: CommunicationSourceType;
  status: CommunicationStatus;
  subject: string | null;
  body: string | null;
  templateVersionId: string | null;
  templateVariablesJson: Record<string, unknown> | null;
  scheduledAt: string | null;
  processingAt: string | null;
  sentAt: string | null;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunicationRecipient = {
  id: string;
  communicationId: string;
  recipientType: RecipientType;
  email: string;
  createdAt: string;
};

export type CommunicationAttachment = {
  id: string;
  communicationId: string;
  originalFileName: string;
  storageProvider: 'r2';
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
};

export type CommunicationDispatch = {
  id: string;
  communicationId: string;
  attemptNumber: number;
  provider: EmailProviderName;
  status: CommunicationDispatchStatus;
  startedAt: string;
  finishedAt: string | null;
};

export type CommunicationDetail = Communication & {
  attachments: CommunicationAttachment[];
  recipients: CommunicationRecipient[];
  dispatches: CommunicationDispatch[];
};

export type GetCommunicationsResponse = {
  communications: Communication[];
};

export type GetCommunicationByIdRequest = {
  id: string;
};

export type UpdateCommunicationRequest = {
  id: string;
  data: UpdateCommunicationInput;
};

export type DeleteCommunicationRequest = {
  id: string;
};

export type SendCommunicationNowRequest = {
  id: string;
};

export type AddCommunicationRecipientRequest = {
  communicationId: string;
  data: CommunicationRecipientInput;
};

export type RemoveCommunicationRecipientRequest = {
  communicationId: string;
  recipientId: string;
};

export type GetCommunicationRecipientsRequest = {
  communicationId: string;
};

export type GetCommunicationRecipientsResponse = {
  recipients: CommunicationRecipient[];
};

export type UploadCommunicationAttachmentRequest = {
  communicationId: string;
  file: File;
};

export type RemoveCommunicationAttachmentRequest = {
  communicationId: string;
  attachmentId: string;
};

export type GetCommunicationAttachmentsRequest = {
  communicationId: string;
};

export type GetCommunicationAttachmentsResponse = {
  attachments: CommunicationAttachment[];
};

export type GetCommunicationDispatchesRequest = {
  communicationId: string;
};

export type GetCommunicationDispatchesResponse = {
  dispatches: CommunicationDispatch[];
};

export type GetCommunicationDispatchByIdRequest = {
  dispatchId: string;
};
