export type RevenueStatus = 'pending' | 'distributed';

export interface RevenueRecord {
  id: string;
  artworkId: string;
  subscriptionId: string;
  author: string;
  totalAmount: number;
  authorShare: number;
  platformShare: number;
  authorRatio: number;
  status: RevenueStatus;
  dealDate: string;
  distributeDate: string | null;
  operator: string;
  remarks: string;
}
