import request from './request';
import type { RevenueRecord } from '../types/revenue';

export interface RevenueQuery {
  status?: string;
  author?: string;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalAuthorShare: number;
  totalPlatformShare: number;
  pendingCount: number;
  distributedCount: number;
  authorStats: Record<string, { totalWorks: number; totalRevenue: number; totalShare: number }>;
}

export const getRevenues = (params?: RevenueQuery): Promise<RevenueRecord[]> => {
  return request.get('/revenues', { params });
};

export const getRevenueSummary = (): Promise<RevenueSummary> => {
  return request.get('/revenues/summary');
};

export const getRevenue = (id: string): Promise<RevenueRecord> => {
  return request.get(`/revenues/${id}`);
};

export const createRevenue = (data: Omit<RevenueRecord, 'id' | 'authorShare' | 'platformShare' | 'distributeDate'>): Promise<RevenueRecord> => {
  return request.post('/revenues', data);
};

export const updateRevenue = (id: string, data: Partial<RevenueRecord>): Promise<RevenueRecord> => {
  return request.put(`/revenues/${id}`, data);
};

export const deleteRevenue = (id: string): Promise<void> => {
  return request.delete(`/revenues/${id}`);
};
