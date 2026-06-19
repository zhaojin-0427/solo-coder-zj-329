import request from './request';
import type { Subscription, SubscriptionStatus } from '../types/subscription';

export interface SubscriptionQuery {
  artworkId?: string;
  status?: SubscriptionStatus;
}

export const getSubscriptions = (params?: SubscriptionQuery): Promise<Subscription[]> => {
  return request.get('/subscriptions', { params });
};

export const getSubscription = (id: string): Promise<Subscription> => {
  return request.get(`/subscriptions/${id}`);
};

export const createSubscription = (data: Omit<Subscription, 'id' | 'queueNumber' | 'status' | 'createdAt'>): Promise<Subscription> => {
  return request.post('/subscriptions', data);
};

export const updateSubscriptionStatus = (id: string, status: SubscriptionStatus): Promise<Subscription> => {
  return request.put(`/subscriptions/${id}/status`, { status });
};

export const deleteSubscription = (id: string): Promise<void> => {
  return request.delete(`/subscriptions/${id}`);
};
