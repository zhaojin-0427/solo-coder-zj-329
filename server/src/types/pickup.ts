export type PickupType = 'sale' | 'return';

export interface PickupRecord {
  id: string;
  artworkId: string;
  subscriptionId: string | null;
  type: PickupType;
  recipientName: string;
  recipientPhone: string;
  pickupDate: string;
  operator: string;
  remarks: string;
}
