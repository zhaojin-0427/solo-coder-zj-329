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

export interface TotalStats {
  artworks: number;
  exhibitions: number;
  subscriptions: number;
  pickupRecords: number;
}

export interface StatisticsData {
  categoryStats: CategoryStats;
  exhibitionStats: ExhibitionStat[];
  authorStats: AuthorStat[];
  uncollectedStats: UncollectedStats;
  total: TotalStats;
}
