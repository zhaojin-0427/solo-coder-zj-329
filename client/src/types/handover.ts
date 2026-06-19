import type { ArtworkCategory } from './artwork';

export type HandoverType = 'entry' | 'sale' | 'return';

export type HandoverProcessStatus = 'pending' | 'processing' | 'resolved';

export interface HandoverCheckItems {
  packagingOk: boolean;
  noDamage: boolean;
  noMissing: boolean;
  notes?: string;
}

export interface HandoverRecord {
  id: string;
  artworkId: string;
  type: HandoverType;
  handlerName: string;
  handlerPhone: string;
  handoverTime: string;
  artworkStatusAtHandover: string;
  checkItems: HandoverCheckItems;
  photoDescription: string;
  exceptionDescription: string;
  processStatus: HandoverProcessStatus;
  processorName: string;
  createdAt: string;
  updatedAt: string;
  artworkTitle?: string;
  artworkAuthor?: string;
  artworkCategory?: ArtworkCategory;
}

export const HANDOVER_TYPE_MAP: Record<HandoverType, string> = {
  entry: '入展交接',
  sale: '成交交接',
  return: '返还交接'
};

export const HANDOVER_TYPE_LIST: HandoverType[] = ['entry', 'sale', 'return'];

export const HANDOVER_PROCESS_STATUS_MAP: Record<HandoverProcessStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决'
};

export const HANDOVER_PROCESS_STATUS_LIST: HandoverProcessStatus[] = ['pending', 'processing', 'resolved'];
