import type { ArtworkCategory, ArtworkStatus } from './artwork';

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
  serviceCount?: number;
}

export interface VolunteerAssignment {
  volunteerId: string;
  role: string;
}

export interface DocentArtworkDetail {
  id: string;
  title: string;
  author: string;
  category: ArtworkCategory;
  status: ArtworkStatus;
}

export interface DocentVolunteerAssignmentDetail {
  volunteerId: string;
  name: string;
  phone: string;
  expertiseCategory: ArtworkCategory | '';
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
  bookingUnit?: string;
  touringStartDate?: string;
  touringEndDate?: string;
  venueName?: string;
  artworkDetails?: DocentArtworkDetail[];
  volunteerAssignmentDetails?: DocentVolunteerAssignmentDetail[];
}

export interface ArtworkLatestDocentActivity {
  activityId: string;
  touringExhibitionId: string;
  bookingUnit: string;
  theme: string;
  docentDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  manager: string;
  status: DocentActivityStatus;
  expectedAttendees: number;
  actualAttendees: number | null;
  audienceFeedback: string;
  volunteerNames: string[];
}

export interface TouringDocentActivitySummary {
  id: string;
  theme: string;
  docentDate: string;
  startTime: string;
  endTime: string;
  status: DocentActivityStatus;
  manager: string;
  expectedAttendees: number;
  actualAttendees: number | null;
  artworkCount: number;
  volunteerAssignments: Array<{ volunteerId: string; name: string; role: string }>;
}

export interface VolunteerServiceRankItem {
  volunteerId: string;
  name: string;
  expertiseCategory: string;
  organization: string;
  count: number;
}

export interface DocentVenueDistributionItem {
  venueName: string;
  count: number;
}

export interface ArtworkDocentRankItem {
  artworkId: string;
  title: string;
  author: string;
  count: number;
}

export interface UpcomingDocentItem {
  id: string;
  theme: string;
  bookingUnit: string;
  venueName: string;
  docentDate: string;
  startTime: string;
  endTime: string;
  manager: string;
  expectedAttendees: number;
  artworkCount: number;
  volunteers: Array<{ id: string; name: string; role: string }>;
}

export interface DocentConflictItem {
  volunteerName: string;
  theme: string;
  docentDate: string;
  startTime: string;
  endTime: string;
}

export interface DocentActivityStats {
  totalActivities: number;
  completedCount: number;
  completionRate: number;
  byStatus: { [key: string]: number };
  volunteerServiceRanking: VolunteerServiceRankItem[];
  venueDistribution: DocentVenueDistributionItem[];
  artworkDocentRanking: ArtworkDocentRankItem[];
  upcomingDocentList: UpcomingDocentItem[];
  conflictCount: number;
  conflictDetails: DocentConflictItem[];
}

export interface DocentVolunteerQuery {
  keyword?: string;
  expertiseCategory?: ArtworkCategory;
}

export interface DocentActivityQuery {
  touringExhibitionId?: string;
  venueId?: string;
  status?: DocentActivityStatus;
  volunteerId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface CreateDocentActivityPayload {
  touringExhibitionId: string;
  theme: string;
  docentDate: string;
  startTime: string;
  endTime: string;
  artworkIds: string[];
  manager: string;
  volunteerAssignments: VolunteerAssignment[];
  expectedAttendees: number;
}

export interface RegisterAttendancePayload {
  actualAttendees: number;
  audienceFeedback?: string;
  exceptionRemarks?: string;
}

export const DOCENT_ACTIVITY_STATUS_MAP: Record<DocentActivityStatus, string> = {
  scheduled: '待开始',
  ongoing: '进行中',
  completed: '已结束',
  canceled: '已取消'
};

export const DOCENT_ACTIVITY_STATUS_COLOR: Record<DocentActivityStatus, string> = {
  scheduled: 'blue',
  ongoing: 'processing',
  completed: 'green',
  canceled: 'default'
};

export const VOLUNTEER_ROLE_OPTIONS = ['主讲', '助理', '引导', '机动'];
