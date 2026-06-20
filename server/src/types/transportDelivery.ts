export type TransportStatus = 'pending' | 'in_transit' | 'delivered' | 'canceled';

export type TransportCheckStatus = 'pending' | 'normal' | 'damaged' | 'missing';

export type TransportReceiveConclusion = 'pending' | 'accepted' | 'rejected';

export type ClaimStatus = 'pending' | 'processing' | 'settled' | 'rejected';

export interface TransportArtworkCheck {
  artworkId: string;
  outboundCheckStatus: TransportCheckStatus;
  arrivalCheckStatus: TransportCheckStatus;
  packagingCondition: string;
  damageDescription: string;
  receiveConclusion: TransportReceiveConclusion;
  triggerClaim: boolean;
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
}

export const TRANSPORT_STATUS_MAP: Record<TransportStatus, string> = {
  pending: '待出库',
  in_transit: '运输中',
  delivered: '已送达',
  canceled: '已取消'
};

export const TRANSPORT_CHECK_STATUS_MAP: Record<TransportCheckStatus, string> = {
  pending: '未检查',
  normal: '正常',
  damaged: '破损',
  missing: '缺件'
};

export const TRANSPORT_RECEIVE_CONCLUSION_MAP: Record<TransportReceiveConclusion, string> = {
  pending: '待签收',
  accepted: '已签收',
  rejected: '拒收'
};

export const CLAIM_STATUS_MAP: Record<ClaimStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  settled: '已结案',
  rejected: '已拒赔'
};

export const CARRIER_METHOD_OPTIONS = [
  '学校专车运输',
  '第三方物流',
  '快递',
  '自行运送',
  '场地自提'
];
