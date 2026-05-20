import { api } from '../axios';
import * as T from './types';

export const createCommunication = async (payload: T.CreateCommunicationInput) => {
  const { data } = await api.post<T.Communication>('/communications', payload);
  return data;
};

export const getCommunications = async () => {
  const { data } = await api.get<T.GetCommunicationsResponse>('/communications');
  return data;
};

export const getCommunicationById = async ({ id }: T.GetCommunicationByIdRequest) => {
  const { data } = await api.get<T.CommunicationDetail>(`/communications/${id}`);
  return data;
};

export const updateCommunication = async ({ id, data: payload }: T.UpdateCommunicationRequest) => {
  const { data } = await api.patch<T.Communication>(`/communications/${id}`, payload);
  return data;
};

export const deleteCommunication = async ({ id }: T.DeleteCommunicationRequest) => {
  await api.delete(`/communications/${id}`);
};

export const sendCommunicationNow = async ({ id }: T.SendCommunicationNowRequest) => {
  await api.post(`/communications/${id}/send`);
};

export const addCommunicationRecipient = async ({
  communicationId,
  data: payload,
}: T.AddCommunicationRecipientRequest) => {
  const { data } = await api.post<T.CommunicationRecipient>(`/communications/${communicationId}/recipients`, payload);

  return data;
};

export const removeCommunicationRecipient = async ({
  communicationId,
  recipientId,
}: T.RemoveCommunicationRecipientRequest) => {
  await api.delete(`/communications/${communicationId}/recipients/${recipientId}`);
};

export const getCommunicationRecipients = async ({ communicationId }: T.GetCommunicationRecipientsRequest) => {
  const { data } = await api.get<T.GetCommunicationRecipientsResponse>(`/communications/${communicationId}/recipients`);

  return data;
};

export const uploadCommunicationAttachment = async ({
  communicationId,
  file,
}: T.UploadCommunicationAttachmentRequest) => {
  const formData = new FormData();

  formData.append('file', file);

  const { data } = await api.post<T.CommunicationAttachment>(
    `/communications/${communicationId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return data;
};

export const removeCommunicationAttachment = async ({
  communicationId,
  attachmentId,
}: T.RemoveCommunicationAttachmentRequest) => {
  await api.delete(`/communications/${communicationId}/attachments/${attachmentId}`);
};

export const getCommunicationAttachments = async ({ communicationId }: T.GetCommunicationAttachmentsRequest) => {
  const { data } = await api.get<T.GetCommunicationAttachmentsResponse>(
    `/communications/${communicationId}/attachments`,
  );

  return data;
};

export const getCommunicationDispatches = async ({ communicationId }: T.GetCommunicationDispatchesRequest) => {
  const { data } = await api.get<T.GetCommunicationDispatchesResponse>(`/communications/${communicationId}/dispatches`);

  return data;
};

export const getCommunicationDispatchById = async ({ dispatchId }: T.GetCommunicationDispatchByIdRequest) => {
  const { data } = await api.get<T.CommunicationDispatch>(`/communications/dispatches/${dispatchId}`);
  return data;
};
