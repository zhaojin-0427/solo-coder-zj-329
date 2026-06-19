import request from './request';
import type { PickupRecord } from '../types/pickup';

export const getPickupRecords = (): Promise<PickupRecord[]> => {
  return request.get('/pickup-records');
};

export const createPickupRecord = (data: Omit<PickupRecord, 'id'>): Promise<PickupRecord> => {
  return request.post('/pickup-records', data);
};

export const deletePickupRecord = (id: string): Promise<void> => {
  return request.delete(`/pickup-records/${id}`);
};
