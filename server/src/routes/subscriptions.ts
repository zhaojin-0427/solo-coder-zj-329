import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { artworkId, status } = req.query;
  let filtered = [...store.subscriptions];
  
  if (artworkId) {
    filtered = filtered.filter(s => s.artworkId === artworkId);
  }
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }
  
  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const subscription = store.subscriptions.find(s => s.id === req.params.id);
  if (!subscription) {
    res.status(404).json({ message: '认购记录不存在' });
    return;
  }
  res.json(subscription);
});

router.post('/', (req: Request, res: Response) => {
  const { artworkId, visitorName, visitorPhone, pickupMethod, remarks, status } = req.body;
  
  if (!artworkId || !visitorName || !visitorPhone) {
    res.status(400).json({ message: '作品ID、访客姓名、联系电话为必填项' });
    return;
  }
  
  const artwork = store.artworks.find(a => a.id === artworkId);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  
  const newSubscription = store.addSubscription({
    artworkId,
    visitorName,
    visitorPhone,
    pickupMethod: pickupMethod || 'onsite',
    remarks: remarks || '',
    status: status || 'pending'
  });
  
  res.status(201).json(newSubscription);
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateSubscription(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: '认购记录不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = store.deleteSubscription(req.params.id);
  if (!success) {
    res.status(404).json({ message: '认购记录不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
