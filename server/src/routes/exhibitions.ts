import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  let filtered = [...store.exhibitions];
  
  if (status) {
    filtered = filtered.filter(e => e.status === status);
  }
  
  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const exhibition = store.exhibitions.find(e => e.id === req.params.id);
  if (!exhibition) {
    res.status(404).json({ message: '展期不存在' });
    return;
  }
  res.json(exhibition);
});

router.get('/:id/artworks', (req: Request, res: Response) => {
  const artworks = store.artworks.filter(a => a.exhibitionId === req.params.id);
  res.json(artworks);
});

router.post('/', (req: Request, res: Response) => {
  const { name, startDate, endDate, status, description } = req.body;
  
  if (!name || !startDate || !endDate) {
    res.status(400).json({ message: '名称、开始日期、结束日期为必填项' });
    return;
  }
  
  const newExhibition = store.addExhibition({
    name,
    startDate,
    endDate,
    status: status || 'upcoming',
    description: description || ''
  });
  
  res.status(201).json(newExhibition);
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateExhibition(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: '展期不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = store.deleteExhibition(req.params.id);
  if (!success) {
    res.status(404).json({ message: '展期不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
