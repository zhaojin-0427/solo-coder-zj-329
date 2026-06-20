import request from './request';
import type { TouringVenue, TouringExhibition, TouringExhibitionReviewStatus, ArtworkTouringInfo } from '../types/touringExhibition';

export interface TouringVenueQuery {
  keyword?: string;
}

export interface TouringExhibitionQuery {
  venueId?: string;
  reviewStatus?: TouringExhibitionReviewStatus;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface ArtworkConflictQuery {
  startDate: string;
  endDate: string;
  excludeId?: string;
}

export const getTouringVenues = (params?: TouringVenueQuery): Promise<TouringVenue[]> => {
  return request.get('/touring-venues', { params });
};

export const getTouringVenue = (id: string): Promise<TouringVenue> => {
  return request.get(`/touring-venues/${id}`);
};

export const createTouringVenue = (data: Omit<TouringVenue, 'id' | 'createdAt' | 'updatedAt'>): Promise<TouringVenue> => {
  return request.post('/touring-venues', data);
};

export const updateTouringVenue = (id: string, data: Partial<TouringVenue>): Promise<TouringVenue> => {
  return request.put(`/touring-venues/${id}`, data);
};

export const deleteTouringVenue = (id: string): Promise<void> => {
  return request.delete(`/touring-venues/${id}`);
};

export const getTouringExhibitions = (params?: TouringExhibitionQuery): Promise<TouringExhibition[]> => {
  return request.get('/touring-exhibitions', { params });
};

export const getTouringExhibition = (id: string): Promise<TouringExhibition> => {
  return request.get(`/touring-exhibitions/${id}`);
};

export const createTouringExhibition = (data: Omit<TouringExhibition, 'id' | 'createdAt' | 'updatedAt' | 'reviewStatus' | 'rejectionReason'>): Promise<TouringExhibition> => {
  return request.post('/touring-exhibitions', data);
};

export const updateTouringExhibition = (id: string, data: Partial<TouringExhibition>): Promise<TouringExhibition> => {
  return request.put(`/touring-exhibitions/${id}`, data);
};

export const approveTouringExhibition = (id: string): Promise<TouringExhibition> => {
  return request.post(`/touring-exhibitions/${id}/approve`);
};

export const rejectTouringExhibition = (id: string, rejectionReason: string): Promise<TouringExhibition> => {
  return request.post(`/touring-exhibitions/${id}/reject`, { rejectionReason });
};

export const cancelTouringExhibition = (id: string): Promise<TouringExhibition> => {
  return request.post(`/touring-exhibitions/${id}/cancel`);
};

export const checkArtworkConflict = (artworkId: string, params: ArtworkConflictQuery): Promise<{
  artworkId: string;
  artworkTitle: string;
  isConflict: boolean;
  isOccupied: boolean;
  currentTouring: TouringExhibition | null;
  latestTouring: TouringExhibition | null;
}> => {
  return request.get(`/touring-exhibitions/artwork-conflicts/${artworkId}`, { params });
};
