import request from './request';
import type {
  Volunteer,
  DocentActivity,
  DocentVolunteerQuery,
  DocentActivityQuery,
  CreateDocentActivityPayload,
  RegisterAttendancePayload
} from '../types/docentActivity';

export const getVolunteers = (params?: DocentVolunteerQuery): Promise<Volunteer[]> => {
  return request.get('/docent-volunteers', { params });
};

export const getVolunteer = (id: string): Promise<Volunteer> => {
  return request.get(`/docent-volunteers/${id}`);
};

export const createVolunteer = (data: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt' | 'serviceCount'>): Promise<Volunteer> => {
  return request.post('/docent-volunteers', data);
};

export const updateVolunteer = (id: string, data: Partial<Volunteer>): Promise<Volunteer> => {
  return request.put(`/docent-volunteers/${id}`, data);
};

export const deleteVolunteer = (id: string): Promise<void> => {
  return request.delete(`/docent-volunteers/${id}`);
};

export const getDocentActivities = (params?: DocentActivityQuery): Promise<DocentActivity[]> => {
  return request.get('/docent-activities', { params });
};

export const getDocentActivity = (id: string): Promise<DocentActivity> => {
  return request.get(`/docent-activities/${id}`);
};

export const getDocentActivitiesByTouring = (touringId: string): Promise<DocentActivity[]> => {
  return request.get(`/docent-activities/by-touring/${touringId}`);
};

export const createDocentActivity = (data: CreateDocentActivityPayload): Promise<DocentActivity> => {
  return request.post('/docent-activities', data);
};

export const updateDocentActivity = (id: string, data: CreateDocentActivityPayload): Promise<DocentActivity> => {
  return request.put(`/docent-activities/${id}`, data);
};

export const startDocentActivity = (id: string): Promise<DocentActivity> => {
  return request.post(`/docent-activities/${id}/start`);
};

export const completeDocentActivity = (id: string): Promise<DocentActivity> => {
  return request.post(`/docent-activities/${id}/complete`);
};

export const cancelDocentActivity = (id: string): Promise<DocentActivity> => {
  return request.post(`/docent-activities/${id}/cancel`);
};

export const registerDocentAttendance = (id: string, data: RegisterAttendancePayload): Promise<DocentActivity> => {
  return request.post(`/docent-activities/${id}/register`, data);
};
