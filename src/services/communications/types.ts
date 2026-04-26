export type CommunicationChannel = 'email';

export type CommunicationSourceType = 'manual' | 'template';

export type CommunicationStatus = 'draft' | 'scheduled' | 'processing' | 'sent' | 'failed' | 'canceled';

export type CommunicationBodyType = 'text' | 'html' | null;

export type CommunicationTemplateVariables = Record<string, string | number | boolean> | null;

export type Communication = {
  id: string;
  channel: CommunicationChannel;
  sourceType: CommunicationSourceType;
  status: CommunicationStatus;
  subject: string | null;
  body: string | null;
  bodyType: CommunicationBodyType;
  templateVersionId: string | null;
  templateVariablesJson: CommunicationTemplateVariables;
  scheduledAt: string | null;
  processingAt: string | null;
  sentAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
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

export type FindCommunicationsResponse = {
  communications: Communication[];
};

export type FindCommunicationByIdResponse = Communication & {
  attachments: CommunicationAttachment[];
};
