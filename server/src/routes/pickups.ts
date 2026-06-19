import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { type, artworkId } = req.query;
  let filtered = [...store.pickupRecords];
  
  if (type) {
    filtered = filtered.filter(p => p.type === type);
  }
  if (artworkId) {
    filtered = filtered.filter(p => p.artworkId === artworkId);
  }
  
  res.json(filtered);
});

router.get('/:id', (req: Request, res: Response) => {
  const record = store.pickupRecords.find(p => p.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: '取件记录不存在' });
    return;
  }
  res.json(record);
});

router.post('/', (req: Request, res: Response) => {
  const { artworkId, subscriptionId, type, recipientName, recipientPhone, pickupDate, operator, remarks } = req.body;
  
  if (!artworkId || !type || !recipientName || !recipientPhone) {
    res.status(400).json({ message: '作品ID、类型、收件人姓名、联系电话为必填项' });
    return;
  }
  
  const artwork = store.artworks.find(a => a.id === artworkId);
  if (!artwork) {
    res.status(404).json({ message: '作品不存在' });
    return;
  }
  
  const newRecord = store.addPickupRecord({
    artworkId,
    subscriptionId: subscriptionId || null,
    type,
    recipientName,
    recipientPhone,
    pickupDate: pickupDate || new Date().toISOString(),
    operator: operator || '系统',
    remarks: remarks || ''
  });
  
  res.status(201).json(newRecord);
});

export default router;
