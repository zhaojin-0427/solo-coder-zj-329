import request from './request';
import type { Exhibition } from '../types/exhibition';

export const getExhibitions = (): Promise<Exhibition[]> => {
  return request.get('/exhibitions');
};

export const getExhibition = (id: string): Promise<Exhibition> => {
  return request.get(`/exhibitions/${id}`);
};

export const createExhibition = (data: Omit<Exhibition, 'id' | 'status'>): Promise<Exhibition> => {
  return request.post('/exhibitions', data);
};

export const updateExhibition = (id: string, data: Partial<Exhibition>): Promise<Exhibition> => {
  return request.put(`/exhibitions/${id}`, data);
};

export const deleteExhibition = (id: string): Promise<void> => {
  return request.delete(`/exhibitions/${id}`);
};
