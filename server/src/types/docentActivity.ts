import type { ArtworkCategory } from './artwork';

export type DocentActivityStatus = 'scheduled' | 'ongoing' | 'completed' | 'canceled';

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  expertiseCategory: ArtworkCategory;
  availableTimeSlots: string;
  organization: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerAssignment {
  volunteerId: string;
  role: string;
}

export interface DocentActivity {
  id: string;
  touringExhibitionId: string;
  theme: string;
  docentDate: string;
  startTime: string;
  endTime: string;
  venueId: string;
  artworkIds: string[];
  manager: string;
  volunteerAssignments: VolunteerAssignment[];
  expectedAttendees: number;
  status: DocentActivityStatus;
  actualAttendees: number | null;
  audienceFeedback: string;
  exceptionRemarks: string;
  createdAt: string;
  updatedAt: string;
}

export const DOCENT_ACTIVITY_STATUS_MAP: Record<DocentActivityStatus, string> = {
  scheduled: '待开始',
  ongoing: '进行中',
  completed: '已结束',
  canceled: '已取消'
};

export const VOLUNTEER_ROLE_OPTIONS = ['主讲', '助理', '引导', '机动'];
