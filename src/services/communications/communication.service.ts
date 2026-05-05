import { api } from '../axios';

export type CommunicationStatus = 'draft' | 'scheduled' | 'processing' | 'sent' | 'failed' | 'canceled';
export type CommunicationChannel = 'email';
export type CommunicationSourceType = 'manual' | 'template';
export type CommunicationBodyType = 'text' | 'html' | null;

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

export type CommunicationRecipient = {
  id: string;
  communicationId: string;
  recipientType: 'to' | 'cc' | 'bcc';
  email: string;
  status: 'pending' | 'sent' | 'failed';
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type Communication = {
  id: string;
  channel: CommunicationChannel;
  sourceType: CommunicationSourceType;
  status: CommunicationStatus;
  subject: string | null;
  body: string | null;
  bodyType: CommunicationBodyType;
  templateVersionId: string | null;
  templateVariablesJson: Record<string, string | number | boolean> | null;
  scheduledAt: string | null;
  processingAt: string | null;
  sentAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: CommunicationAttachment[];
  recipients: CommunicationRecipient[];
};

export type UpdateCommunicationInput = {
  subject?: string | null;
  body?: string | null;
  bodyType?: CommunicationBodyType;
  templateVersionId?: string | null;
  templateVariablesJson?: Record<string, string | number | boolean> | null;
  scheduledAt?: string | null;
};

export type CreateRecipientInput = {
  recipientType: 'to' | 'cc' | 'bcc';
  email: string;
};

export type CreateCommunicationInput = {
  channel: CommunicationChannel;
  sourceType: CommunicationSourceType;
  status?: 'draft' | 'scheduled';
  subject?: string | null;
  body?: string | null;
  bodyType?: CommunicationBodyType;
  templateVersionId?: string | null;
  templateVariablesJson?: Record<string, unknown> | null;
  scheduledAt?: string | null;
  recipients?: CreateRecipientInput[];
};

export type GetCommunicationsResponse = {
  communications: Communication[];
};

export const getCommunications = async (): Promise<GetCommunicationsResponse> => {
  const { data } = await api.get<GetCommunicationsResponse>('/communications');
  return data;
};

export const createCommunication = async (data: CreateCommunicationInput): Promise<Communication> => {
  const { data: response } = await api.post<Communication>('/communications', data);
  return response;
};

export const getCommunicationById = async (id: string): Promise<Communication> => {
  const { data } = await api.get<Communication>(`/communications/${id}`);
  return data;
};

export const updateCommunication = async (id: string, data: UpdateCommunicationInput): Promise<Communication> => {
  const { data: response } = await api.patch<Communication>(`/communications/${id}`, data);
  return response;
};

export const addRecipient = async (id: string, recipient: CreateRecipientInput): Promise<CommunicationRecipient> => {
  const { data } = await api.post<CommunicationRecipient>(`/communications/${id}/recipients`, recipient);
  return data;
};

export const removeRecipient = async (id: string, recipientId: string): Promise<void> => {
  await api.delete(`/communications/${id}/recipients/${recipientId}`);
};

export const addAttachment = async (id: string, file: File): Promise<CommunicationAttachment> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<CommunicationAttachment>(`/communications/${id}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const removeAttachment = async (id: string, attachmentId: string): Promise<void> => {
  await api.delete(`/communications/${id}/attachments/${attachmentId}`);
};
