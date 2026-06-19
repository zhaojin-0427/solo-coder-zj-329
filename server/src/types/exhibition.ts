export type ExhibitionStatus = 'upcoming' | 'ongoing' | 'ended';

export interface Exhibition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  description: string;
}
