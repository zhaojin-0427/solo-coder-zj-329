import type { HandoverType, HandoverProcessStatus } from './handover';
import type { TouringStats } from './touringExhibition';

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
}

export interface StatisticsData {
  categoryStats: CategoryStats;
  exhibitionStats: ExhibitionStat[];
  authorStats: AuthorStat[];
  uncollectedStats: UncollectedStats;
  handoverStats: HandoverStats;
  touringStats: TouringStats;
  total: TotalStats;
}
