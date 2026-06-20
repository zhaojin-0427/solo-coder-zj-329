import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { DocentActivity, VolunteerAssignment } from '../types/docentActivity';

const router = Router();

interface ValidationResult {
  ok: boolean;
  message?: string;
  touringExhibitionId?: string;
  venueId?: string;
  artworkIds?: string[];
  volunteerAssignments?: VolunteerAssignment[];
}

function validateActivity(payload: any, excludeId?: string): ValidationResult {
  const {
    touringExhibitionId,
    theme,
    docentDate,
    startTime,
    endTime,
    artworkIds,
    manager,
    volunteerAssignments,
    expectedAttendees
  } = payload;

  if (!touringExhibitionId || !theme || !docentDate || !startTime || !endTime || !manager) {
    return { ok: false, message: '巡展预约、活动主题、讲解日期、起止时间、讲解负责人为必填项' };
  }

  const tour = store.touringExhibitions.find(e => e.id === touringExhibitionId);
  if (!tour) {
    return { ok: false, message: '巡展预约不存在' };
  }
  if (tour.reviewStatus !== 'approved') {
    return { ok: false, message: '只能基于已审核通过的巡展预约创建讲解活动' };
  }

  if (docentDate < tour.startDate || docentDate > tour.endDate) {
    return { ok: false, message: `讲解日期必须落在巡展展期内（${tour.startDate} 至 ${tour.endDate}）` };
  }

  if (store.timeToMinutes(startTime) >= store.timeToMinutes(endTime)) {
    return { ok: false, message: '开始时间必须早于结束时间' };
  }

  const finalArtworkIds: string[] = Array.isArray(artworkIds) ? artworkIds : [];
  if (finalArtworkIds.length === 0) {
    return { ok: false, message: '请至少选择一件关联作品' };
  }

  const invalidArtworks: string[] = [];
  const notInTour: string[] = [];
  const unavailable: string[] = [];
  for (const aid of finalArtworkIds) {
    const artwork = store.artworks.find(a => a.id === aid);
    if (!artwork) {
      invalidArtworks.push(aid);
      continue;
    }
    if (!tour.artworkIds.includes(aid)) {
      notInTour.push(`${artwork.title}`);
      continue;
    }
    if (artwork.status === 'sold' || artwork.status === 'returned') {
      unavailable.push(`${artwork.title}（${artwork.status === 'sold' ? '已成交' : '已返还'}）`);
    }
  }
  if (invalidArtworks.length > 0) {
    return { ok: false, message: `以下作品不存在：${invalidArtworks.join('、')}` };
  }
  if (notInTour.length > 0) {
    return { ok: false, message: `以下作品不属于该巡展预约：${notInTour.join('、')}` };
  }
  if (unavailable.length > 0) {
    return { ok: false, message: `以下作品状态不可用于讲解：${unavailable.join('、')}` };
  }

  const finalAssignments: VolunteerAssignment[] = Array.isArray(volunteerAssignments) ? volunteerAssignments : [];
  if (finalAssignments.length === 0) {
    return { ok: false, message: '请至少安排一名志愿者' };
  }

  const seenVolunteers = new Set<string>();
  for (const assignment of finalAssignments) {
    const volunteer = store.volunteers.find(v => v.id === assignment.volunteerId);
    if (!volunteer) {
      return { ok: false, message: `志愿者不存在：${assignment.volunteerId}` };
    }
    if (seenVolunteers.has(assignment.volunteerId)) {
      return { ok: false, message: `同一活动不可重复排班同一志愿者：${volunteer.name}` };
    }
    seenVolunteers.add(assignment.volunteerId);

    const conflict = store.checkVolunteerConflict(assignment.volunteerId, docentDate, startTime, endTime, excludeId);
    if (conflict) {
      return {
        ok: false,
        message: `志愿者「${volunteer.name}」在 ${docentDate} ${startTime}-${endTime} 已被安排至活动「${conflict.theme}」，不可重复排班`
      };
    }
  }

  if (expectedAttendees === undefined || expectedAttendees === null || Number(expectedAttendees) < 0) {
    return { ok: false, message: '预计参与人数需为不小于 0 的整数' };
  }

  return {
    ok: true,
    touringExhibitionId,
    venueId: tour.venueId,
    artworkIds: finalArtworkIds,
    volunteerAssignments: finalAssignments
  };
}

function enrichActivity(activity: DocentActivity) {
  const tour = store.touringExhibitions.find(e => e.id === activity.touringExhibitionId);
  const venue = store.touringVenues.find(v => v.id === activity.venueId);
  const artworkDetails = activity.artworkIds.map(id => {
    const a = store.artworks.find(art => art.id === id);
    return a ? { id: a.id, title: a.title, author: a.author, category: a.category, status: a.status } : null;
  }).filter(Boolean);
  const volunteerAssignmentDetails = activity.volunteerAssignments.map(assignment => {
    const v = store.volunteers.find(vol => vol.id === assignment.volunteerId);
    return {
      volunteerId: assignment.volunteerId,
      name: v?.name || '',
      phone: v?.phone || '',
      expertiseCategory: v?.expertiseCategory || '',
      role: assignment.role
    };
  });
  return {
    ...activity,
    bookingUnit: tour?.bookingUnit || '',
    touringStartDate: tour?.startDate || '',
    touringEndDate: tour?.endDate || '',
    venueName: venue?.name || '',
    artworkDetails,
    volunteerAssignmentDetails
  };
}

router.get('/', (req: Request, res: Response) => {
  const { touringExhibitionId, venueId, status, volunteerId, startDate, endDate, keyword } = req.query;
  let filtered = [...store.docentActivities];

  if (touringExhibitionId) {
    filtered = filtered.filter(a => a.touringExhibitionId === touringExhibitionId);
  }
  if (venueId) {
    filtered = filtered.filter(a => a.venueId === venueId);
  }
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }
  if (volunteerId) {
    filtered = filtered.filter(a => a.volunteerAssignments.some(v => v.volunteerId === volunteerId));
  }
  if (startDate) {
    filtered = filtered.filter(a => a.docentDate >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(a => a.docentDate <= endDate);
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(a =>
      a.theme.toLowerCase().includes(kw) ||
      a.manager.toLowerCase().includes(kw)
    );
  }

  const result = filtered
    .map(enrichActivity)
    .sort((a, b) => b.docentDate.localeCompare(a.docentDate) || b.startTime.localeCompare(a.startTime));

  res.json(result);
});

router.get('/by-touring/:touringId', (req: Request, res: Response) => {
  const tour = store.touringExhibitions.find(e => e.id === req.params.touringId);
  if (!tour) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  const activities = store.getDocentActivitiesByTouring(req.params.touringId).map(enrichActivity);
  res.json(activities);
});

router.get('/by-artwork/:artworkId/latest', (req: Request, res: Response) => {
  const artwork = store.artworks.find(a => a.id === req.params.artworkId);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  const latest = store.getLatestDocentActivityByArtwork(req.params.artworkId);
  if (!latest) {
    res.json(null);
    return;
  }
  res.json(enrichActivity(latest));
});

router.get('/:id', (req: Request, res: Response) => {
  const activity = store.docentActivities.find(a => a.id === req.params.id);
  if (!activity) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  res.json(enrichActivity(activity));
});

router.post('/', (req: Request, res: Response) => {
  const result = validateActivity(req.body);
  if (!result.ok) {
    res.status(400).json({ message: result.message });
    return;
  }

  const newActivity = store.addDocentActivity({
    touringExhibitionId: result.touringExhibitionId!,
    theme: req.body.theme,
    docentDate: req.body.docentDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    venueId: result.venueId!,
    artworkIds: result.artworkIds!,
    manager: req.body.manager,
    volunteerAssignments: result.volunteerAssignments!,
    expectedAttendees: Number(req.body.expectedAttendees) || 0
  });

  res.status(201).json(enrichActivity(newActivity));
});

router.put('/:id', (req: Request, res: Response) => {
  const existing = store.docentActivities.find(a => a.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  if (existing.status !== 'scheduled') {
    res.status(400).json({ message: '只有活动开始前（待开始状态）可编辑排班' });
    return;
  }

  const result = validateActivity(req.body, req.params.id);
  if (!result.ok) {
    res.status(400).json({ message: result.message });
    return;
  }

  const updated = store.updateDocentActivity(req.params.id, {
    touringExhibitionId: result.touringExhibitionId,
    theme: req.body.theme,
    docentDate: req.body.docentDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    venueId: result.venueId,
    artworkIds: result.artworkIds,
    manager: req.body.manager,
    volunteerAssignments: result.volunteerAssignments,
    expectedAttendees: Number(req.body.expectedAttendees) || 0
  });
  if (!updated) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  res.json(enrichActivity(updated));
});

router.post('/:id/start', (req: Request, res: Response) => {
  const existing = store.docentActivities.find(a => a.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  if (existing.status !== 'scheduled') {
    res.status(400).json({ message: '只有待开始的活动可开始' });
    return;
  }
  const updated = store.setDocentActivityStatus(req.params.id, 'ongoing');
  res.json(enrichActivity(updated!));
});

router.post('/:id/complete', (req: Request, res: Response) => {
  const existing = store.docentActivities.find(a => a.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  if (existing.status !== 'ongoing') {
    res.status(400).json({ message: '只有进行中的活动可结束' });
    return;
  }
  const updated = store.setDocentActivityStatus(req.params.id, 'completed');
  res.json(enrichActivity(updated!));
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  const existing = store.docentActivities.find(a => a.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  if (existing.status === 'completed') {
    res.status(400).json({ message: '已结束的活动不可取消' });
    return;
  }
  if (existing.status === 'canceled') {
    res.status(400).json({ message: '该活动已取消' });
    return;
  }
  const updated = store.setDocentActivityStatus(req.params.id, 'canceled');
  res.json(enrichActivity(updated!));
});

router.post('/:id/register', (req: Request, res: Response) => {
  const existing = store.docentActivities.find(a => a.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '讲解活动不存在' });
    return;
  }
  if (existing.status !== 'ongoing' && existing.status !== 'completed') {
    res.status(400).json({ message: '只有进行中或已结束的活动可登记签到反馈' });
    return;
  }
  const { actualAttendees, audienceFeedback, exceptionRemarks } = req.body;
  if (actualAttendees === undefined || actualAttendees === null || Number(actualAttendees) < 0) {
    res.status(400).json({ message: '签到人数需为不小于 0 的整数' });
    return;
  }
  const updated = store.registerDocentAttendance(
    req.params.id,
    Number(actualAttendees),
    audienceFeedback || '',
    exceptionRemarks || ''
  );
  res.json(enrichActivity(updated!));
});

export default router;
