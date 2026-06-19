import request from './request';
import type { HandoverRecord, HandoverType, HandoverProcessStatus, HandoverCheckItems } from '../types/handover';
import type { ArtworkCategory } from '../types/artwork';

export interface HandoverQuery {
  type?: HandoverType;
  processStatus?: HandoverProcessStatus;
  category?: ArtworkCategory;
  keyword?: string;
}

export interface HandoverCreateData {
  artworkId: string;
  type: HandoverType;
  handlerName: string;
  handlerPhone: string;
  handoverTime: string;
  checkItems?: HandoverCheckItems;
  photoDescription?: string;
  exceptionDescription?: string;
  processStatus?: HandoverProcessStatus;
  processorName?: string;
}

export interface HandoverUpdateData {
  processStatus?: HandoverProcessStatus;
  processorName?: string;
  exceptionDescription?: string;
  checkItems?: Partial<HandoverCheckItems>;
  photoDescription?: string;
}

export const getHandovers = (params?: HandoverQuery): Promise<HandoverRecord[]> => {
  return request.get('/handovers', { params });
};

export const getHandover = (id: string): Promise<HandoverRecord> => {
  return request.get(`/handovers/${id}`);
};

export const createHandover = (data: HandoverCreateData): Promise<HandoverRecord> => {
  return request.post('/handovers', data);
};

export const updateHandover = (id: string, data: HandoverUpdateData): Promise<HandoverRecord> => {
  return request.put(`/handovers/${id}`, data);
};

export const deleteHandover = (id: string): Promise<void> => {
  return request.delete(`/handovers/${id}`);
};
