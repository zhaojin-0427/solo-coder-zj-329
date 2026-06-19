export type ArtworkCategory = '书法' | '剪纸' | '布艺' | '篆刻';

export type ArtworkStatus = 'draft' | 'showing' | 'returned' | 'sold';

export interface Artwork {
  id: string;
  title: string;
  author: string;
  category: ArtworkCategory;
  size: string;
  material: string;
  status: ArtworkStatus;
  description: string;
  theme: string;
  exhibitionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ARTWORK_STATUS_MAP: Record<ArtworkStatus, string> = {
  draft: '草稿',
  showing: '展出中',
  returned: '已返还',
  sold: '已售出'
};

export const ARTWORK_CATEGORIES: ArtworkCategory[] = [
  '书法',
  '剪纸',
  '布艺',
  '篆刻'
];
