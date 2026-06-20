import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { TouringExhibitionReviewStatus } from '../types/touringExhibition';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { venueId, reviewStatus, startDate, endDate, keyword } = req.query;
  let filtered = [...store.touringExhibitions];
  
  if (venueId) {
    filtered = filtered.filter(e => e.venueId === venueId);
  }
  if (reviewStatus) {
    filtered = filtered.filter(e => e.reviewStatus === reviewStatus);
  }
  if (startDate) {
    filtered = filtered.filter(e => e.endDate >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(e => e.startDate <= endDate);
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(e =>
      e.bookingUnit.toLowerCase().includes(kw) ||
      e.bookingPerson.toLowerCase().includes(kw) ||
      e.contactPhone.includes(kw) ||
      e.setupManager.toLowerCase().includes(kw)
    );
  }
  
  const result = filtered.map(ex => {
    const venue = store.touringVenues.find(v => v.id === ex.venueId);
    const artworks = ex.artworkIds.map(id => store.artworks.find(a => a.id === id)).filter(Boolean);
    return {
      ...ex,
      venueName: venue?.name || '',
      artworkDetails: artworks.map(a => ({
        id: a!.id,
        title: a!.title,
        author: a!.author,
        category: a!.category,
        status: a!.status
      }))
    };
  });
  
  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const ex = store.touringExhibitions.find(e => e.id === req.params.id);
  if (!ex) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  const venue = store.touringVenues.find(v => v.id === ex.venueId);
  const artworks = ex.artworkIds.map(id => store.artworks.find(a => a.id === id)).filter(Boolean);
  res.json({
    ...ex,
    venueName: venue?.name || '',
    venueAddress: venue?.address || '',
    artworkDetails: artworks.map(a => ({
      id: a!.id,
      title: a!.title,
      author: a!.author,
      category: a!.category,
      status: a!.status
    }))
  });
});

router.get('/artwork-conflicts/:artworkId', (req: Request, res: Response) => {
  const { startDate, endDate, excludeId } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ message: '请提供起止日期' });
    return;
  }
  const conflicts = store.checkArtworkConflict(
    [req.params.artworkId],
    startDate as string,
    endDate as string,
    excludeId as string | undefined
  );
  const isConflict = conflicts.length > 0;
  
  const artwork = store.artworks.find(a => a.id === req.params.artworkId);
  const touringInfo = store.getArtworkTouringInfo(req.params.artworkId);
  
  res.json({
    artworkId: req.params.artworkId,
    artworkTitle: artwork?.title || '',
    isConflict,
    isOccupied: touringInfo.isOccupied,
    currentTouring: touringInfo.currentTouring,
    latestTouring: touringInfo.latestTouring
  });
});

router.post('/', (req: Request, res: Response) => {
  const {
    bookingUnit,
    bookingPerson,
    contactPhone,
    startDate,
    endDate,
    venueId,
    artworkIds,
    transportMethod,
    setupManager
  } = req.body;
  
  if (!bookingUnit || !bookingPerson || !contactPhone || !startDate || !endDate || !venueId || !artworkIds || artworkIds.length === 0) {
    res.status(400).json({ message: '预约单位、预约人、联系电话、展期、场地、作品清单为必填项' });
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    res.status(400).json({ message: '开始日期不能晚于结束日期' });
    return;
  }
  
  const venue = store.touringVenues.find(v => v.id === venueId);
  if (!venue) {
    res.status(400).json({ message: '所选场地不存在' });
    return;
  }
  
  if (artworkIds.length > venue.maxArtworkCount) {
    res.status(400).json({ message: `拟展作品数量(${artworkIds.length})超过场地容量(${venue.maxArtworkCount})` });
    return;
  }
  
  const venueConflict = store.checkVenueConflict(venueId, startDate, endDate);
  if (venueConflict) {
    const conflictVenue = store.touringVenues.find(v => v.id === venueConflict.venueId);
    res.status(400).json({ 
      message: `该场地在 ${venueConflict.startDate} 至 ${venueConflict.endDate} 已有预约（${conflictVenue?.name || ''}）` 
    });
    return;
  }
  
  const artworkConflicts = store.checkArtworkConflict(artworkIds, startDate, endDate);
  if (artworkConflicts.length > 0) {
    const conflictTitles = artworkConflicts
      .map(id => store.artworks.find(a => a.id === id)?.title || id)
      .join('、');
    res.status(400).json({ message: `以下作品在同期已被其他巡展占用：${conflictTitles}` });
    return;
  }
  
  const newExhibition = store.addTouringExhibition({
    bookingUnit,
    bookingPerson,
    contactPhone,
    startDate,
    endDate,
    venueId,
    artworkIds,
    transportMethod: transportMethod || '',
    setupManager: setupManager || ''
  });
  
  res.status(201).json(newExhibition);
});

router.put('/:id', (req: Request, res: Response) => {
  const existing = store.touringExhibitions.find(e => e.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  
  const { startDate, endDate, venueId, artworkIds } = req.body;
  
  const finalStartDate = startDate || existing.startDate;
  const finalEndDate = endDate || existing.endDate;
  const finalVenueId = venueId || existing.venueId;
  const finalArtworkIds = artworkIds || existing.artworkIds;
  
  if (new Date(finalStartDate) > new Date(finalEndDate)) {
    res.status(400).json({ message: '开始日期不能晚于结束日期' });
    return;
  }
  
  const venue = store.touringVenues.find(v => v.id === finalVenueId);
  if (!venue) {
    res.status(400).json({ message: '所选场地不存在' });
    return;
  }
  
  if (finalArtworkIds.length > venue.maxArtworkCount) {
    res.status(400).json({ message: `拟展作品数量(${finalArtworkIds.length})超过场地容量(${venue.maxArtworkCount})` });
    return;
  }
  
  const venueConflict = store.checkVenueConflict(finalVenueId, finalStartDate, finalEndDate, req.params.id);
  if (venueConflict) {
    res.status(400).json({ message: `该场地在 ${venueConflict.startDate} 至 ${venueConflict.endDate} 已有预约` });
    return;
  }
  
  const artworkConflicts = store.checkArtworkConflict(finalArtworkIds, finalStartDate, finalEndDate, req.params.id);
  if (artworkConflicts.length > 0) {
    const conflictTitles = artworkConflicts
      .map(id => store.artworks.find(a => a.id === id)?.title || id)
      .join('、');
    res.status(400).json({ message: `以下作品在同期已被其他巡展占用：${conflictTitles}` });
    return;
  }
  
  const updated = store.updateTouringExhibition(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  res.json(updated);
});

router.post('/:id/approve', (req: Request, res: Response) => {
  const existing = store.touringExhibitions.find(e => e.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  if (existing.reviewStatus !== 'pending') {
    res.status(400).json({ message: '只有待审核的预约可以通过' });
    return;
  }
  
  const venueConflict = store.checkVenueConflict(existing.venueId, existing.startDate, existing.endDate, existing.id);
  if (venueConflict) {
    res.status(400).json({ message: `该场地在 ${venueConflict.startDate} 至 ${venueConflict.endDate} 已有其他通过的预约` });
    return;
  }
  
  const artworkConflicts = store.checkArtworkConflict(existing.artworkIds, existing.startDate, existing.endDate, existing.id);
  if (artworkConflicts.length > 0) {
    const conflictTitles = artworkConflicts
      .map(id => store.artworks.find(a => a.id === id)?.title || id)
      .join('、');
    res.status(400).json({ message: `以下作品在同期已被其他巡展占用：${conflictTitles}` });
    return;
  }
  
  const updated = store.reviewTouringExhibition(req.params.id, 'approved');
  res.json(updated);
});

router.post('/:id/reject', (req: Request, res: Response) => {
  const { rejectionReason } = req.body;
  const existing = store.touringExhibitions.find(e => e.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  if (existing.reviewStatus !== 'pending') {
    res.status(400).json({ message: '只有待审核的预约可以驳回' });
    return;
  }
  
  const updated = store.reviewTouringExhibition(req.params.id, 'rejected', rejectionReason);
  res.json(updated);
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  const existing = store.touringExhibitions.find(e => e.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '巡展预约不存在' });
    return;
  }
  if (existing.reviewStatus === 'canceled' || existing.reviewStatus === 'rejected') {
    res.status(400).json({ message: '该预约已取消或驳回' });
    return;
  }
  
  const updated = store.cancelTouringExhibition(req.params.id);
  res.json(updated);
});

export default router;
