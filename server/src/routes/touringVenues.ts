import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { TouringVenue } from '../types/touringExhibition';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { keyword } = req.query;
  let filtered = [...store.touringVenues];
  
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(v =>
      v.name.toLowerCase().includes(kw) ||
      v.contactPerson.toLowerCase().includes(kw) ||
      v.contactPhone.includes(kw) ||
      v.address.toLowerCase().includes(kw)
    );
  }
  
  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const venue = store.touringVenues.find(v => v.id === req.params.id);
  if (!venue) {
    res.status(404).json({ message: '场地不存在' });
    return;
  }
  res.json(venue);
});

router.post('/', (req: Request, res: Response) => {
  const { name, contactPerson, contactPhone, address, maxArtworkCount, openHours, transportRequirements, remarks } = req.body;
  
  if (!name || !contactPerson || !contactPhone || !address) {
    res.status(400).json({ message: '场地名称、联系人、联系电话、地址为必填项' });
    return;
  }
  
  const newVenue = store.addTouringVenue({
    name,
    contactPerson,
    contactPhone,
    address,
    maxArtworkCount: maxArtworkCount || 10,
    openHours: openHours || '',
    transportRequirements: transportRequirements || '',
    remarks: remarks || ''
  });
  
  res.status(201).json(newVenue);
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateTouringVenue(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: '场地不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const hasActiveExhibitions = store.touringExhibitions.some(e => 
    e.venueId === req.params.id && 
    (e.reviewStatus === 'pending' || e.reviewStatus === 'approved')
  );
  if (hasActiveExhibitions) {
    res.status(400).json({ message: '该场地存在有效巡展预约，无法删除' });
    return;
  }
  
  const success = store.deleteTouringVenue(req.params.id);
  if (!success) {
    res.status(404).json({ message: '场地不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
