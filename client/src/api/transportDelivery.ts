import request from './request';
import type {
  TransportBatch,
  TransportDeliveryQuery,
  CreateTransportBatchPayload,
  UpdateTransportBatchPayload,
  OutboundPayload,
  ReceivePayload,
  InsuranceClaim,
  UpdateClaimPayload
} from '../types/transportDelivery';

export const getTransportBatches = (params?: TransportDeliveryQuery): Promise<TransportBatch[]> => {
  return request.get('/transport-deliveries', { params });
};

export const getTransportBatch = (id: string): Promise<TransportBatch> => {
  return request.get(`/transport-deliveries/${id}`);
};

export const createTransportBatch = (data: CreateTransportBatchPayload): Promise<TransportBatch> => {
  return request.post('/transport-deliveries', data);
};

export const updateTransportBatch = (id: string, data: UpdateTransportBatchPayload): Promise<TransportBatch> => {
  return request.put(`/transport-deliveries/${id}`, data);
};

export const recordOutbound = (id: string, data: OutboundPayload): Promise<TransportBatch> => {
  return request.post(`/transport-deliveries/${id}/outbound`, data);
};

export const recordArrival = (id: string, actualArrivalTime: string): Promise<TransportBatch> => {
  return request.post(`/transport-deliveries/${id}/arrive`, { actualArrivalTime });
};

export const recordReceive = (id: string, data: ReceivePayload): Promise<TransportBatch> => {
  return request.post(`/transport-deliveries/${id}/receive`, data);
};

export const cancelTransportBatch = (id: string): Promise<TransportBatch> => {
  return request.post(`/transport-deliveries/${id}/cancel`);
};

export const getBatchClaims = (id: string): Promise<InsuranceClaim[]> => {
  return request.get(`/transport-deliveries/${id}/claims`);
};

export const updateClaim = (claimId: string, data: UpdateClaimPayload): Promise<InsuranceClaim> => {
  return request.put(`/transport-deliveries/claims/${claimId}`, data);
};
