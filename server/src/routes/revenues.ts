import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { RevenueRecord } from '../types/revenue';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status, author } = req.query;
  let filtered = [...store.revenueRecords];

  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }
  if (author) {
    filtered = filtered.filter(r => r.author.includes(author as string));
  }

  res.json(filtered);
});

router.get('/summary', (req: Request, res: Response) => {
  const totalRevenue = store.revenueRecords.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalAuthorShare = store.revenueRecords.reduce((sum, r) => sum + r.authorShare, 0);
  const totalPlatformShare = store.revenueRecords.reduce((sum, r) => sum + r.platformShare, 0);
  const pendingCount = store.revenueRecords.filter(r => r.status === 'pending').length;
  const distributedCount = store.revenueRecords.filter(r => r.status === 'distributed').length;

  const authorStats: Record<string, { totalWorks: number; totalRevenue: number; totalShare: number }> = {};
  store.revenueRecords.forEach(r => {
    if (!authorStats[r.author]) {
      authorStats[r.author] = { totalWorks: 0, totalRevenue: 0, totalShare: 0 };
    }
    authorStats[r.author].totalWorks += 1;
    authorStats[r.author].totalRevenue += r.totalAmount;
    authorStats[r.author].totalShare += r.authorShare;
  });

  res.json({
    totalRevenue,
    totalAuthorShare,
    totalPlatformShare,
    pendingCount,
    distributedCount,
    authorStats
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const record = store.revenueRecords.find(r => r.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: '收益记录不存在' });
    return;
  }
  res.json(record);
});

router.post('/', (req: Request, res: Response) => {
  const {
    artworkId, subscriptionId, author, totalAmount,
    authorRatio, status, dealDate, operator, remarks
  } = req.body;

  if (!artworkId || !subscriptionId || !author || !totalAmount || !authorRatio) {
    res.status(400).json({ message: '作品ID、认购ID、作者、成交金额、作者分成比例为必填项' });
    return;
  }

  const ratio = Number(authorRatio);
  const amount = Number(totalAmount);
  if (isNaN(ratio) || ratio < 0 || ratio > 100) {
    res.status(400).json({ message: '作者分成比例应在0-100之间' });
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    res.status(400).json({ message: '成交金额必须大于0' });
    return;
  }

  const authorShare = Math.round(amount * ratio / 100 * 100) / 100;
  const platformShare = Math.round((amount - authorShare) * 100) / 100;

  const newRecord = store.addRevenueRecord({
    artworkId,
    subscriptionId,
    author,
    totalAmount: amount,
    authorShare,
    platformShare,
    authorRatio: ratio,
    status: status || 'pending',
    dealDate: dealDate || new Date().toISOString(),
    distributeDate: status === 'distributed' ? new Date().toISOString() : null,
    operator: operator || '系统',
    remarks: remarks || ''
  });

  res.status(201).json(newRecord);
});

router.put('/:id', (req: Request, res: Response) => {
  const record = store.revenueRecords.find(r => r.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: '收益记录不存在' });
    return;
  }

  const updates: Partial<RevenueRecord> = { ...req.body };

  if (updates.totalAmount !== undefined || updates.authorRatio !== undefined) {
    const amount = updates.totalAmount !== undefined ? Number(updates.totalAmount) : record.totalAmount;
    const ratio = updates.authorRatio !== undefined ? Number(updates.authorRatio) : record.authorRatio;
    updates.totalAmount = amount;
    updates.authorRatio = ratio;
    updates.authorShare = Math.round(amount * ratio / 100 * 100) / 100;
    updates.platformShare = Math.round((amount - updates.authorShare) * 100) / 100;
  }

  if (updates.status === 'distributed' && record.status !== 'distributed') {
    updates.distributeDate = new Date().toISOString();
  }

  const updated = store.updateRevenueRecord(req.params.id, updates);
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = store.deleteRevenueRecord(req.params.id);
  if (!success) {
    res.status(404).json({ message: '收益记录不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
