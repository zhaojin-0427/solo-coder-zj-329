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
}
