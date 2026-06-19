export type PickupMethod = 'onsite' | 'delivery';
export type SubscriptionStatus = 'pending' | 'deal' | 'canceled';

export interface Subscription {
  id: string;
  artworkId: string;
  visitorName: string;
  visitorPhone: string;
  queueNumber: number;
  pickupMethod: PickupMethod;
  remarks: string;
  status: SubscriptionStatus;
  createdAt: string;
}
