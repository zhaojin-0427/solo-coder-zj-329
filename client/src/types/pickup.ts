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

export const PICKUP_TYPE_MAP: Record<PickupType, string> = {
  sale: '销售取件',
  return: '作品返还'
};
