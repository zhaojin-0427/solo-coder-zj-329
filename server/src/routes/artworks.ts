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
