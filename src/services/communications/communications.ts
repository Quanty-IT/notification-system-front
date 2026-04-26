import { api } from '../axios';
import type { FindCommunicationByIdResponse, FindCommunicationsResponse } from './types';

export const findCommunications = async () => {
  const { data } = await api.get<FindCommunicationsResponse>('/communications');
  return data;
};

export const findCommunicationById = async (id: string) => {
  const { data } = await api.get<FindCommunicationByIdResponse>(`/communications/${id}`);
  return data;
};
