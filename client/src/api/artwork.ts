import request from './request';
import type { Artwork, ArtworkCategory, ArtworkStatus } from '../types/artwork';

export interface ArtworkQuery {
  category?: ArtworkCategory;
  status?: ArtworkStatus;
  keyword?: string;
}

export const getArtworks = (params?: ArtworkQuery): Promise<Artwork[]> => {
  return request.get('/artworks', { params });
};

export const getArtwork = (id: string): Promise<Artwork> => {
  return request.get(`/artworks/${id}`);
};

export const createArtwork = (data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artwork> => {
  return request.post('/artworks', data);
};

export const updateArtwork = (id: string, data: Partial<Artwork>): Promise<Artwork> => {
  return request.put(`/artworks/${id}`, data);
};

export const deleteArtwork = (id: string): Promise<void> => {
  return request.delete(`/artworks/${id}`);
};
