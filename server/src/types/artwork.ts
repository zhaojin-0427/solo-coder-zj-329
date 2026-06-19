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
