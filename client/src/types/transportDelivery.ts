import type { ArtworkCategory } from './artwork';

export type TransportStatus = 'pending' | 'in_transit' | 'delivered' | 'canceled';

export type TransportCheckStatus = 'pending' | 'normal' | 'damaged' | 'missing';

export type TransportReceiveConclusion = 'pending' | 'accepted' | 'rejected';

export type ClaimStatus = 'pending' | 'processing' | 'settled' | 'rejected';

export type BatchClaimStatus = 'none' | 'pending' | 'settled';

export interface TransportArtworkCheck {
  artworkId: string;
  outboundCheckStatus: TransportCheckStatus;
  arrivalCheckStatus: TransportCheckStatus;
  packagingCondition: string;
  damageDescription: string;
  receiveConclusion: TransportReceiveConclusion;
  triggerClaim: boolean;
  artworkTitle?: string;
  artworkAuthor?: string;
  artworkCategory?: ArtworkCategory;
}

export interface TransportBatchTouringInfo {
  id: string;
  bookingUnit: string;
  venueId: string;
  venueName: string;
  startDate: string;
  endDate: string;
}

export interface TransportClaimSummary {
  total: number;
  pending: number;
  settled: number;
  claimStatus: BatchClaimStatus;
  hasClaim: boolean;
}

export interface InsuranceClaim {
  id: string;
  artworkId: string;
  transportBatchId: string;
  responsibleParty: string;
  claimAmount: number;
  claimStatus: ClaimStatus;
  handler: string;
  handlingDescription: string;
  settleTime: string;
  createdAt: string;
  updatedAt: string;
  artworkTitle?: string;
  artworkAuthor?: string;
}

export interface TransportBatch {
  id: string;
  touringExhibitionId: string;
  carrierMethod: string;
  carrierContact: string;
  carrierPhone: string;
  plannedOutboundTime: string;
  plannedArrivalTime: string;
  actualOutboundTime: string;
  actualArrivalTime: string;
  outboundOperator: string;
  siteReceiver: string;
  transportStatus: TransportStatus;
  trackingNo: string;
  insuranceAmount: number;
  policyNo: string;
  remarks: string;
  artworkChecks: TransportArtworkCheck[];
  createdAt: string;
  updatedAt: string;
  touringExhibition?: TransportBatchTouringInfo | null;
  claims?: InsuranceClaim[];
  claimSummary?: TransportClaimSummary;
  isOverdue?: boolean;
  pendingReceipt?: boolean;
  onTime?: boolean;
  newlyCreatedClaimIds?: string[];
}

export interface TransportDeliveryQuery {
  touringExhibitionId?: string;
  transportStatus?: TransportStatus | 'all';
  claimStatus?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface CreateTransportBatchPayload {
  touringExhibitionId: string;
  carrierMethod: string;
  carrierContact: string;
  carrierPhone: string;
  plannedOutboundTime: string;
  plannedArrivalTime: string;
  outboundOperator?: string;
  trackingNo?: string;
  insuranceAmount?: number;
  policyNo?: string;
  remarks?: string;
}

export interface UpdateTransportBatchPayload {
  carrierMethod?: string;
  carrierContact?: string;
  carrierPhone?: string;
  plannedOutboundTime?: string;
  plannedArrivalTime?: string;
  trackingNo?: string;
  insuranceAmount?: number;
  policyNo?: string;
  remarks?: string;
}

export interface OutboundCheckItem {
  artworkId: string;
  outboundCheckStatus: TransportCheckStatus;
  packagingCondition: string;
}

export interface OutboundPayload {
  actualOutboundTime: string;
  outboundOperator: string;
  trackingNo?: string;
  outboundChecks: OutboundCheckItem[];
}

export interface ReceiveCheckItem {
  artworkId: string;
  arrivalCheckStatus: TransportCheckStatus;
  packagingCondition: string;
  damageDescription: string;
  receiveConclusion: TransportReceiveConclusion;
}

export interface ReceivePayload {
  siteReceiver: string;
  receiveChecks: ReceiveCheckItem[];
}

export interface UpdateClaimPayload {
  responsibleParty?: string;
  claimAmount?: number;
  claimStatus?: ClaimStatus;
  handler?: string;
  handlingDescription?: string;
  settleTime?: string;
}

export const TRANSPORT_STATUS_MAP: Record<TransportStatus, string> = {
  pending: '待出库',
  in_transit: '运输中',
  delivered: '已送达',
  canceled: '已取消'
};

export const TRANSPORT_STATUS_COLOR: Record<TransportStatus, string> = {
  pending: 'default',
  in_transit: 'processing',
  delivered: 'green',
  canceled: 'red'
};

export const TRANSPORT_CHECK_STATUS_MAP: Record<TransportCheckStatus, string> = {
  pending: '未检查',
  normal: '正常',
  damaged: '破损',
  missing: '缺件'
};

export const TRANSPORT_CHECK_STATUS_COLOR: Record<TransportCheckStatus, string> = {
  pending: 'default',
  normal: 'green',
  damaged: 'red',
  missing: 'volcano'
};

export const TRANSPORT_RECEIVE_CONCLUSION_MAP: Record<TransportReceiveConclusion, string> = {
  pending: '待签收',
  accepted: '已签收',
  rejected: '拒收'
};

export const TRANSPORT_RECEIVE_CONCLUSION_COLOR: Record<TransportReceiveConclusion, string> = {
  pending: 'gold',
  accepted: 'green',
  rejected: 'red'
};

export const CLAIM_STATUS_MAP: Record<ClaimStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  settled: '已结案',
  rejected: '已拒赔'
};

export const CLAIM_STATUS_COLOR: Record<ClaimStatus, string> = {
  pending: 'red',
  processing: 'gold',
  settled: 'green',
  rejected: 'default'
};

export const BATCH_CLAIM_STATUS_MAP: Record<BatchClaimStatus, string> = {
  none: '无理赔',
  pending: '理赔处理中',
  settled: '理赔已结案'
};

export const CARRIER_METHOD_OPTIONS = [
  '学校专车运输',
  '第三方物流',
  '快递',
  '自行运送',
  '场地自提'
];
