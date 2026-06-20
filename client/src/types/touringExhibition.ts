import type { ArtworkStatus, ArtworkCategory } from './artwork';

export type TouringExhibitionReviewStatus = 'pending' | 'approved' | 'rejected' | 'canceled';

export interface TouringVenue {
  id: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  maxArtworkCount: number;
  openHours: string;
  transportRequirements: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface TouringArtworkDetail {
  id: string;
  title: string;
  author: string;
  category: ArtworkCategory;
  status: ArtworkStatus;
}

export interface TouringExhibition {
  id: string;
  bookingUnit: string;
  bookingPerson: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  venueId: string;
  artworkIds: string[];
  transportMethod: string;
  setupManager: string;
  reviewStatus: TouringExhibitionReviewStatus;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
  venueName?: string;
  venueAddress?: string;
  artworkDetails?: TouringArtworkDetail[];
}

export interface ArtworkTouringInfo {
  isOccupied: boolean;
  currentTouring: (TouringExhibition & { venueName?: string }) | null;
  latestTouring: (TouringExhibition & { venueName?: string }) | null;
}

export interface UpcomingSetupItem {
  id: string;
  bookingUnit: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
  artworkCount: number;
  setupManager: string;
  transportMethod: string;
  artworks: Array<{ id: string; title: string; author: string }>;
}

export interface VenueUsageStat {
  venueName: string;
  count: number;
}

export interface ArtworkParticipationStat {
  artworkId: string;
  title: string;
  author: string;
  count: number;
}

export interface TouringStats {
  totalBookings: number;
  approvedBookings: number;
  approvalRate: number;
  venueUsage: VenueUsageStat[];
  artworkParticipation: ArtworkParticipationStat[];
  upcomingSetupList: UpcomingSetupItem[];
  conflictCount: number;
}

export const TOURING_REVIEW_STATUS_MAP: Record<TouringExhibitionReviewStatus, string> = {
  pending: '待审核',
  approved: '审核通过',
  rejected: '已驳回',
  canceled: '已取消'
};

export const TOURING_REVIEW_STATUS_COLOR: Record<TouringExhibitionReviewStatus, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'red',
  canceled: 'default'
};

export const TRANSPORT_METHOD_OPTIONS = [
  '学校专车运输',
  '第三方物流',
  '自行运送',
  '场地自提'
];
