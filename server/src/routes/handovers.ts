import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { HandoverRecord, HandoverType, HandoverProcessStatus, HandoverCheckItems } from '../types/handover';
import type { ArtworkStatus } from '../types/artwork';

const router = Router();

const HANDOVER_TYPE_MAP: Record<HandoverType, string> = {
  entry: '入展交接',
  sale: '成交交接',
  return: '返还交接'
};

const HANDOVER_TYPE_TO_STATUS: Record<HandoverType, ArtworkStatus> = {
  entry: 'showing',
  sale: 'sold',
  return: 'returned'
};

function validateArtworkTransition(artworkId: string, type: HandoverType): { valid: boolean; message?: string } {
  const artwork = store.artworks.find(a => a.id === artworkId);
  if (!artwork) {
    return { valid: false, message: '作品不存在' };
  }

  if (type === 'entry') {
    if (artwork.status !== 'draft') {
      return { valid: false, message: `入展交接仅支持草稿状态的作品，当前作品状态为"${artwork.status}"` };
    }
  } else if (type === 'sale') {
    if (artwork.status === 'sold') {
      return { valid: false, message: '该作品已成交，不可重复成交' };
    }
    if (artwork.status === 'returned') {
      return { valid: false, message: '已返还作品不可执行成交交接' };
    }
  } else if (type === 'return') {
    if (artwork.status === 'sold') {
      return { valid: false, message: '已成交作品不可执行返还交接' };
    }
    if (artwork.status === 'returned') {
      return { valid: false, message: '该作品已返还，不可重复返还' };
    }
  }

  return { valid: true };
}

router.get('/', (req: Request, res: Response) => {
  const { type, processStatus, category, keyword } = req.query;
  let filtered = [...store.handoverRecords];

  if (type) {
    filtered = filtered.filter(h => h.type === type);
  }
  if (processStatus) {
    filtered = filtered.filter(h => h.processStatus === processStatus);
  }
  if (category) {
    const artworkIds = store.artworks
      .filter(a => a.category === category)
      .map(a => a.id);
    filtered = filtered.filter(h => artworkIds.includes(h.artworkId));
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(h => {
      const artwork = store.artworks.find(a => a.id === h.artworkId);
      const artworkMatch = artwork
        ? artwork.title.toLowerCase().includes(kw) ||
          artwork.author.toLowerCase().includes(kw)
        : false;
      return (
        artworkMatch ||
        h.handlerName.toLowerCase().includes(kw) ||
        h.handlerPhone.includes(kw) ||
        h.exceptionDescription.toLowerCase().includes(kw) ||
        h.processorName.toLowerCase().includes(kw)
      );
    });
  }

  const result = filtered.map(record => {
    const artwork = store.artworks.find(a => a.id === record.artworkId);
    return {
      ...record,
      artworkTitle: artwork?.title || '',
      artworkAuthor: artwork?.author || '',
      artworkCategory: artwork?.category || ''
    };
  });

  result.sort((a, b) => new Date(b.handoverTime).getTime() - new Date(a.handoverTime).getTime());
  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const record = store.handoverRecords.find(h => h.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: '交接记录不存在' });
    return;
  }

  const artwork = store.artworks.find(a => a.id === record.artworkId);
  res.json({
    ...record,
    artworkTitle: artwork?.title || '',
    artworkAuthor: artwork?.author || '',
    artworkCategory: artwork?.category || ''
  });
});

router.post('/', (req: Request, res: Response) => {
  const {
    artworkId,
    type,
    handlerName,
    handlerPhone,
    handoverTime,
    checkItems,
    photoDescription,
    exceptionDescription,
    processStatus,
    processorName
  } = req.body;

  if (!artworkId || !type || !handlerName || !handlerPhone || !handoverTime) {
    res.status(400).json({ message: '作品ID、交接类型、交接人、联系方式、交接时间为必填项' });
    return;
  }

  const validation = validateArtworkTransition(artworkId, type as HandoverType);
  if (!validation.valid) {
    res.status(400).json({ message: validation.message });
    return;
  }

  const artwork = store.artworks.find(a => a.id === artworkId)!;
  const artworkStatusAtHandover = artwork.status;

  const defaultCheckItems: HandoverCheckItems = {
    packagingOk: true,
    noDamage: true,
    noMissing: true,
    ...checkItems
  };

  const defaultProcessStatus: HandoverProcessStatus =
    exceptionDescription && exceptionDescription.trim()
      ? (processStatus || 'pending')
      : (processStatus || 'resolved');

  const newRecord = store.addHandoverRecord({
    artworkId,
    type: type as HandoverType,
    handlerName,
    handlerPhone,
    handoverTime,
    artworkStatusAtHandover,
    checkItems: defaultCheckItems,
    photoDescription: photoDescription || '',
    exceptionDescription: exceptionDescription || '',
    processStatus: defaultProcessStatus,
    processorName: processorName || ''
  });

  const targetStatus = HANDOVER_TYPE_TO_STATUS[type as HandoverType];
  store.updateArtwork(artworkId, { status: targetStatus });

  res.status(201).json(newRecord);
});

router.put('/:id', (req: Request, res: Response) => {
  const record = store.handoverRecords.find(h => h.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: '交接记录不存在' });
    return;
  }

  const { processStatus, processorName, exceptionDescription, checkItems, photoDescription } = req.body;

  const updates: Partial<HandoverRecord> = {};

  if (processStatus !== undefined) {
    updates.processStatus = processStatus as HandoverProcessStatus;
  }
  if (processorName !== undefined) {
    updates.processorName = processorName;
  }
  if (exceptionDescription !== undefined) {
    updates.exceptionDescription = exceptionDescription;
  }
  if (checkItems !== undefined) {
    updates.checkItems = { ...record.checkItems, ...checkItems };
  }
  if (photoDescription !== undefined) {
    updates.photoDescription = photoDescription;
  }

  const updated = store.updateHandoverRecord(req.params.id, updates);
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = store.deleteHandoverRecord(req.params.id);
  if (!success) {
    res.status(404).json({ message: '交接记录不存在' });
    return;
  }
  res.json({ message: '删除成功' });
});

export default router;
