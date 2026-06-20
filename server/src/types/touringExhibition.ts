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
}

export const TOURING_REVIEW_STATUS_MAP: Record<TouringExhibitionReviewStatus, string> = {
  pending: '待审核',
  approved: '审核通过',
  rejected: '已驳回',
  canceled: '已取消'
};
