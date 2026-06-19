import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type { HandoverCheckItems } from '../types/handover';

const router = Router();

function hasHandoverException(checkItems: HandoverCheckItems | undefined, exceptionDescription: string | undefined): boolean {
  const checkAbnormal = checkItems
    ? !checkItems.packagingOk || !checkItems.noDamage || !checkItems.noMissing
    : false;
  const hasDescription = !!(exceptionDescription && exceptionDescription.trim());
  return checkAbnormal || hasDescription;
}

router.get('/', (req: Request, res: Response) => {
  const categoryStats = getCategoryStats();
  const exhibitionStats = getExhibitionStats();
  const authorStats = getAuthorStats();
  const uncollectedStats = getUncollectedStats();
  const handoverStats = getHandoverStats();

  res.json({
    categoryStats,
    exhibitionStats,
    authorStats,
    uncollectedStats,
    handoverStats,
    total: {
      artworks: store.artworks.length,
      exhibitions: store.exhibitions.length,
      subscriptions: store.subscriptions.length,
      pickupRecords: store.pickupRecords.length,
      handoverRecords: store.handoverRecords.length
    }
  });
});

function getCategoryStats() {
  const stats: Record<string, number> = {};
  store.artworks.forEach(artwork => {
    stats[artwork.category] = (stats[artwork.category] || 0) + 1;
  });
  return stats;
}

function getExhibitionStats() {
  return store.exhibitions.map(exhibition => {
    const exhibitionArtworks = store.artworks.filter(a => a.exhibitionId === exhibition.id);
    const totalArtworks = exhibitionArtworks.length;
    const soldArtworks = exhibitionArtworks.filter(a => a.status === 'sold').length;
    const dealRate = totalArtworks > 0 ? Math.round((soldArtworks / totalArtworks) * 100) : 0;

    return {
      id: exhibition.id,
      name: exhibition.name,
      status: exhibition.status,
      totalArtworks,
      soldArtworks,
      dealRate
    };
  });
}

function getAuthorStats() {
  const authorMap: Record<string, { count: number; sold: number }> = {};
  
  store.artworks.forEach(artwork => {
    if (!authorMap[artwork.author]) {
      authorMap[artwork.author] = { count: 0, sold: 0 };
    }
    authorMap[artwork.author].count++;
    if (artwork.status === 'sold') {
      authorMap[artwork.author].sold++;
    }
  });

  return Object.entries(authorMap)
    .map(([author, data]) => ({
      author,
      totalWorks: data.count,
      soldWorks: data.sold,
      activityScore: data.count * 10 + data.sold * 5
    }))
    .sort((a, b) => b.activityScore - a.activityScore);
}

function getUncollectedStats() {
  const pendingSubscriptions = store.subscriptions.filter(s => s.status === 'pending');
  
  const byPickupMethod: Record<string, number> = {};
  pendingSubscriptions.forEach(sub => {
    byPickupMethod[sub.pickupMethod] = (byPickupMethod[sub.pickupMethod] || 0) + 1;
  });

  const byArtwork = pendingSubscriptions.reduce((acc, sub) => {
    const artwork = store.artworks.find(a => a.id === sub.artworkId);
    if (artwork) {
      if (!acc[artwork.category]) {
        acc[artwork.category] = 0;
      }
      acc[artwork.category]++;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalPending: pendingSubscriptions.length,
    byPickupMethod,
    byArtworkCategory: byArtwork
  };
}

function getHandoverStats() {
  const totalRecords = store.handoverRecords.length;
  const completedRecords = store.handoverRecords.filter(h => h.processStatus === 'resolved').length;
  const completionRate = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 100;

  const exceptionRecords = store.handoverRecords.filter(h =>
    hasHandoverException(h.checkItems, h.exceptionDescription)
  );
  const totalExceptions = exceptionRecords.length;

  const pendingExceptions = exceptionRecords
    .filter(h => h.processStatus !== 'resolved')
    .map(h => {
      const artwork = store.artworks.find(a => a.id === h.artworkId);
      return {
        id: h.id,
        artworkId: h.artworkId,
        artworkTitle: artwork?.title || '',
        artworkCategory: artwork?.category || '',
        type: h.type,
        exceptionDescription: h.exceptionDescription,
        processStatus: h.processStatus,
        handlerName: h.handlerName,
        handoverTime: h.handoverTime
      };
    })
    .sort((a, b) => new Date(b.handoverTime).getTime() - new Date(a.handoverTime).getTime());

  const byCategory: Record<string, number> = {};
  exceptionRecords.forEach(h => {
    const artwork = store.artworks.find(a => a.id === h.artworkId);
    if (artwork) {
      byCategory[artwork.category] = (byCategory[artwork.category] || 0) + 1;
    }
  });

  const byType: Record<string, number> = {};
  exceptionRecords.forEach(h => {
    byType[h.type] = (byType[h.type] || 0) + 1;
  });

  const byProcessStatus: Record<string, number> = {};
  store.handoverRecords.forEach(h => {
    byProcessStatus[h.processStatus] = (byProcessStatus[h.processStatus] || 0) + 1;
  });

  return {
    totalRecords,
    completedRecords,
    completionRate,
    totalExceptions,
    pendingExceptions,
    byCategory,
    byType,
    byProcessStatus
  };
}

export default router;
