import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { Artwork } from '../types/artwork';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { category, status, exhibitionId, keyword } = req.query;
  let filtered = [...store.artworks];
  
  if (category) {
    filtered = filtered.filter(a => a.category === category);
  }
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }
  if (exhibitionId) {
    filtered = filtered.filter(a => a.exhibitionId === exhibitionId);
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(kw) ||
      a.author.toLowerCase().includes(kw) ||
      a.description.toLowerCase().includes(kw) ||
      a.theme.toLowerCase().includes(kw)
    );
  }
  
  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const artwork = store.artworks.find(a => a.id === req.params.id);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  res.json(artwork);
});

router.get('/:id/latest-handover', (req: Request, res: Response) => {
  const artwork = store.artworks.find(a => a.id === req.params.id);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  const latest = store.getLatestHandoverByArtwork(req.params.id);
  res.json(latest);
});

router.get('/:id/touring-info', (req: Request, res: Response) => {
  const artwork = store.artworks.find(a => a.id === req.params.id);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  const touringInfo = store.getArtworkTouringInfo(req.params.id);
  let latestWithVenue = null;
  if (touringInfo.latestTouring) {
    const venue = store.touringVenues.find(v => v.id === touringInfo.latestTouring!.venueId);
    latestWithVenue = {
      ...touringInfo.latestTouring,
      venueName: venue?.name || ''
    };
  }
  let currentWithVenue = null;
  if (touringInfo.currentTouring) {
    const venue = store.touringVenues.find(v => v.id === touringInfo.currentTouring!.venueId);
    currentWithVenue = {
      ...touringInfo.currentTouring,
      venueName: venue?.name || ''
    };
  }
  res.json({
    isOccupied: touringInfo.isOccupied,
    currentTouring: currentWithVenue,
    latestTouring: latestWithVenue
  });
});

router.get('/:id/latest-transport-check', (req: Request, res: Response) => {
  const artwork = store.artworks.find(a => a.id === req.params.id);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  const latest = store.getLatestTransportCheckByArtwork(req.params.id);
  if (!latest) {
    res.json(null);
    return;
  }
  const ex = store.touringExhibitions.find(e => e.id === latest.batch.touringExhibitionId);
  const venue = ex ? store.touringVenues.find(v => v.id === ex.venueId) : null;
  res.json({
    batchId: latest.batch.id,
    touringExhibitionId: latest.batch.touringExhibitionId,
    bookingUnit: ex?.bookingUnit || '',
    venueName: venue?.name || '',
    carrierMethod: latest.batch.carrierMethod,
    transportStatus: latest.batch.transportStatus,
    outboundCheckStatus: latest.check.outboundCheckStatus,
    arrivalCheckStatus: latest.check.arrivalCheckStatus,
    damageDescription: latest.check.damageDescription,
    receiveConclusion: latest.check.receiveConclusion,
    triggerClaim: latest.check.triggerClaim,
    actualOutboundTime: latest.batch.actualOutboundTime,
    actualArrivalTime: latest.batch.actualArrivalTime
  });
});

router.post('/', (req: Request, res: Response) => {
  const { title, author, category, size, material, status, description, theme, exhibitionId } = req.body;
  
  if (!title || !author || !category) {
    res.status(400).json({ message: '标题、作者、类别为必填项' });
    return;
  }
  
  const newArtwork = store.addArtwork({
    title,
    author,
    category,
    size: size || '',
    material: material || '',
    status: status || 'draft',
    description: description || '',
    theme: theme || '',
    exhibitionId: exhibitionId || null
  });
  
  res.status(201).json(newArtwork);
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateArtwork(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = store.deleteArtwork(req.params.id);
  if (!success) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
