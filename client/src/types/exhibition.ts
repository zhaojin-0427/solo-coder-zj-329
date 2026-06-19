export type ExhibitionStatus = 'upcoming' | 'ongoing' | 'ended';

export interface Exhibition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  description: string;
}

export const EXHIBITION_STATUS_MAP: Record<ExhibitionStatus, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  ended: '已结束'
};
