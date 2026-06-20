import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { ArtworkCategory } from '../types/artwork';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { keyword, expertiseCategory } = req.query;
  let filtered = [...store.volunteers];

  if (expertiseCategory) {
    filtered = filtered.filter(v => v.expertiseCategory === expertiseCategory);
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(v =>
      v.name.toLowerCase().includes(kw) ||
      v.phone.includes(kw) ||
      v.organization.toLowerCase().includes(kw) ||
      v.availableTimeSlots.toLowerCase().includes(kw)
    );
  }

  const result = filtered.map(v => ({
    ...v,
    serviceCount: store.getVolunteerServiceCount(v.id)
  }));

  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const volunteer = store.volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    res.status(404).json({ message: '志愿者不存在' });
    return;
  }
  res.json({
    ...volunteer,
    serviceCount: store.getVolunteerServiceCount(volunteer.id)
  });
});

router.post('/', (req: Request, res: Response) => {
  const { name, phone, expertiseCategory, availableTimeSlots, organization, remarks } = req.body;

  if (!name || !phone || !expertiseCategory) {
    res.status(400).json({ message: '姓名、联系电话、擅长类别为必填项' });
    return;
  }

  const validCategories: ArtworkCategory[] = ['书法', '剪纸', '布艺', '篆刻'];
  if (!validCategories.includes(expertiseCategory)) {
    res.status(400).json({ message: '擅长类别无效' });
    return;
  }

  const newVolunteer = store.addVolunteer({
    name,
    phone,
    expertiseCategory,
    availableTimeSlots: availableTimeSlots || '',
    organization: organization || '',
    remarks: remarks || ''
  });

  res.status(201).json(newVolunteer);
});

router.put('/:id', (req: Request, res: Response) => {
  const existing = store.volunteers.find(v => v.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: '志愿者不存在' });
    return;
  }
  const { expertiseCategory } = req.body;
  if (expertiseCategory) {
    const validCategories: ArtworkCategory[] = ['书法', '剪纸', '布艺', '篆刻'];
    if (!validCategories.includes(expertiseCategory)) {
      res.status(400).json({ message: '擅长类别无效' });
      return;
    }
  }
  const updated = store.updateVolunteer(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: '志愿者不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = store.deleteVolunteer(req.params.id);
  if (!success) {
    res.status(404).json({ message: '志愿者不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
