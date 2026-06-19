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

export const SUBSCRIPTION_STATUS_MAP: Record<SubscriptionStatus, string> = {
  pending: '待处理',
  deal: '已成交',
  canceled: '已取消'
};

export const PICKUP_METHOD_MAP: Record<PickupMethod, string> = {
  onsite: '现场取件',
  delivery: '快递配送'
};
