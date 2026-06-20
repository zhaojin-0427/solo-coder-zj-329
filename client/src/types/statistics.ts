import type { HandoverType, HandoverProcessStatus } from './handover';
import type { TouringStats } from './touringExhibition';
import type { ClaimStatus } from './transportDelivery';

export interface CategoryStats {
  [key: string]: number;
}

export interface ExhibitionStat {
  id: string;
  name: string;
  status: string;
  totalArtworks: number;
  soldArtworks: number;
  dealRate: number;
}

export interface AuthorStat {
  author: string;
  totalWorks: number;
  soldWorks: number;
  activityScore: number;
}

export interface UncollectedStats {
  totalPending: number;
  byPickupMethod: {
    onsite: number;
    delivery: number;
    [key: string]: number;
  };
  byArtworkCategory: {
    [key: string]: number;
  };
}

export interface PendingHandoverException {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkCategory: string;
  type: HandoverType;
  exceptionDescription: string;
  processStatus: HandoverProcessStatus;
  handlerName: string;
  handoverTime: string;
}

export interface HandoverStats {
  totalRecords: number;
  completedRecords: number;
  completionRate: number;
  totalExceptions: number;
  pendingExceptions: PendingHandoverException[];
  byCategory: { [key: string]: number };
  byType: { [key in HandoverType]?: number };
  byProcessStatus: { [key in HandoverProcessStatus]?: number };
}

export interface TotalStats {
  artworks: number;
  exhibitions: number;
  subscriptions: number;
  pickupRecords: number;
  handoverRecords: number;
  touringVenues: number;
  touringExhibitions: number;
  transportBatches: number;
  insuranceClaims: number;
}

export interface CarrierExceptionRateStat {
  method: string;
  total: number;
  abnormal: number;
  exceptionRate: number;
}

export interface UpcomingOutboundItem {
  id: string;
  bookingUnit: string;
  venueName: string;
  carrierMethod: string;
  carrierContact: string;
  carrierPhone: string;
  plannedOutboundTime: string;
  plannedArrivalTime: string;
  insuranceAmount: number;
  artworkCount: number;
  artworks: Array<{ id: string; title: string; author: string }>;
}

export interface UnsettledClaimItem {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkAuthor: string;
  transportBatchId: string;
  bookingUnit: string;
  responsibleParty: string;
  claimAmount: number;
  claimStatus: ClaimStatus;
  handler: string;
  handlingDescription: string;
  createdAt: string;
}

export interface TransportDeliveryStats {
  totalBatches: number;
  deliveredCount: number;
  onTimeRate: number;
  onTimeCount: number;
  pendingReceiptCount: number;
  overdueCount: number;
  totalClaims: number;
  unsettledClaimsCount: number;
  carrierExceptionRate: CarrierExceptionRateStat[];
  upcomingOutboundList: UpcomingOutboundItem[];
  unsettledClaims: UnsettledClaimItem[];
  byStatus: { [key: string]: number };
  byClaimStatus: { [key: string]: number };
}

export interface StatisticsData {
  categoryStats: CategoryStats;
  exhibitionStats: ExhibitionStat[];
  authorStats: AuthorStat[];
  uncollectedStats: UncollectedStats;
  handoverStats: HandoverStats;
  touringStats: TouringStats;
  transportDeliveryStats: TransportDeliveryStats;
  total: TotalStats;
}
