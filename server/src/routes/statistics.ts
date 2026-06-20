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
  const touringStats = getTouringStats();
  const transportDeliveryStats = getTransportDeliveryStats();
  const docentActivityStats = getDocentActivityStats();

  res.json({
    categoryStats,
    exhibitionStats,
    authorStats,
    uncollectedStats,
    handoverStats,
    touringStats,
    transportDeliveryStats,
    docentActivityStats,
    total: {
      artworks: store.artworks.length,
      exhibitions: store.exhibitions.length,
      subscriptions: store.subscriptions.length,
      pickupRecords: store.pickupRecords.length,
      handoverRecords: store.handoverRecords.length,
      touringVenues: store.touringVenues.length,
      touringExhibitions: store.touringExhibitions.length,
      transportBatches: store.transportBatches.filter(b => b.transportStatus !== 'canceled').length,
      insuranceClaims: store.insuranceClaims.length,
      docentVolunteers: store.volunteers.length,
      docentActivities: store.docentActivities.filter(a => a.status !== 'canceled').length
    }
  });
});

function getTouringStats() {
  const totalBookings = store.touringExhibitions.length;
  const approvedBookings = store.touringExhibitions.filter(e => e.reviewStatus === 'approved').length;
  const approvalRate = totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0;

  const venueUsageMap: Record<string, number> = {};
  store.touringExhibitions
    .filter(e => e.reviewStatus !== 'canceled' && e.reviewStatus !== 'rejected')
    .forEach(ex => {
      const venue = store.touringVenues.find(v => v.id === ex.venueId);
      if (venue) {
        venueUsageMap[venue.name] = (venueUsageMap[venue.name] || 0) + 1;
      }
    });
  const venueUsage = Object.entries(venueUsageMap)
    .map(([venueName, count]) => ({ venueName, count }))
    .sort((a, b) => b.count - a.count);

  const artworkParticipationMap: Record<string, { artworkId: string; title: string; author: string; count: number }> = {};
  store.touringExhibitions
    .filter(e => e.reviewStatus === 'approved')
    .forEach(ex => {
      ex.artworkIds.forEach(artworkId => {
        const artwork = store.artworks.find(a => a.id === artworkId);
        if (artwork) {
          if (!artworkParticipationMap[artworkId]) {
            artworkParticipationMap[artworkId] = {
              artworkId,
              title: artwork.title,
              author: artwork.author,
              count: 0
            };
          }
          artworkParticipationMap[artworkId].count++;
        }
      });
    });
  const artworkParticipation = Object.values(artworkParticipationMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const today = new Date();
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split('T')[0];
  const next7DaysStr = next7Days.toISOString().split('T')[0];

  const upcomingSetupList = store.touringExhibitions
    .filter(e => {
      if (e.reviewStatus !== 'approved') return false;
      return e.startDate >= todayStr && e.startDate <= next7DaysStr;
    })
    .map(ex => {
      const venue = store.touringVenues.find(v => v.id === ex.venueId);
      const artworks = ex.artworkIds.map(id => {
        const a = store.artworks.find(art => art.id === id);
        return a ? { id: a.id, title: a.title, author: a.author } : null;
      }).filter(Boolean);
      return {
        id: ex.id,
        bookingUnit: ex.bookingUnit,
        venueId: ex.venueId,
        venueName: venue?.name || '',
        venueAddress: venue?.address || '',
        startDate: ex.startDate,
        endDate: ex.endDate,
        artworkCount: ex.artworkIds.length,
        setupManager: ex.setupManager,
        transportMethod: ex.transportMethod,
        artworks
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  let conflictCount = 0;
  const activeExhibitions = store.touringExhibitions.filter(
    e => e.reviewStatus === 'approved' || e.reviewStatus === 'pending'
  );
  for (let i = 0; i < activeExhibitions.length; i++) {
    for (let j = i + 1; j < activeExhibitions.length; j++) {
      const ex1 = activeExhibitions[i];
      const ex2 = activeExhibitions[j];
      const hasVenueConflict = ex1.venueId === ex2.venueId && store.isDateOverlap(ex1.startDate, ex1.endDate, ex2.startDate, ex2.endDate);
      const hasArtworkConflict = ex1.artworkIds.some(id => ex2.artworkIds.includes(id)) && store.isDateOverlap(ex1.startDate, ex1.endDate, ex2.startDate, ex2.endDate);
      if (hasVenueConflict || hasArtworkConflict) {
        conflictCount++;
      }
    }
  }

  return {
    totalBookings,
    approvedBookings,
    approvalRate,
    venueUsage,
    artworkParticipation,
    upcomingSetupList,
    conflictCount
  };
}

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

function getTransportDeliveryStats() {
  const activeBatches = store.transportBatches.filter(b => b.transportStatus !== 'canceled');
  const totalBatches = activeBatches.length;

  const deliveredBatches = activeBatches.filter(b => b.transportStatus === 'delivered');
  const onTimeBatches = deliveredBatches.filter(
    b => b.actualArrivalTime &&
         b.plannedArrivalTime &&
         new Date(b.actualArrivalTime).getTime() <= new Date(b.plannedArrivalTime).getTime()
  );
  const onTimeRate = deliveredBatches.length > 0
    ? Math.round((onTimeBatches.length / deliveredBatches.length) * 100)
    : 0;

  const pendingReceiptCount = deliveredBatches.filter(b =>
    !b.siteReceiver || b.artworkChecks.some(c => c.receiveConclusion === 'pending')
  ).length;

  const overdueCount = activeBatches.filter(
    b => b.transportStatus !== 'delivered' &&
         b.plannedArrivalTime &&
         new Date(b.plannedArrivalTime).getTime() < Date.now()
  ).length;

  const totalClaims = store.insuranceClaims.length;
  const unsettledClaims = store.insuranceClaims
    .filter(c => c.claimStatus === 'pending' || c.claimStatus === 'processing')
    .map(c => {
      const artwork = store.artworks.find(a => a.id === c.artworkId);
      const batch = store.transportBatches.find(b => b.id === c.transportBatchId);
      const ex = batch ? store.touringExhibitions.find(e => e.id === batch.touringExhibitionId) : null;
      return {
        id: c.id,
        artworkId: c.artworkId,
        artworkTitle: artwork?.title || '',
        artworkAuthor: artwork?.author || '',
        transportBatchId: c.transportBatchId,
        bookingUnit: ex?.bookingUnit || '',
        responsibleParty: c.responsibleParty,
        claimAmount: c.claimAmount,
        claimStatus: c.claimStatus,
        handler: c.handler,
        handlingDescription: c.handlingDescription,
        createdAt: c.createdAt
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const carrierMethodMap: Record<string, { total: number; abnormal: number }> = {};
  activeBatches.forEach(b => {
    const method = b.carrierMethod || '未指定';
    if (!carrierMethodMap[method]) {
      carrierMethodMap[method] = { total: 0, abnormal: 0 };
    }
    carrierMethodMap[method].total++;
    const hasClaim = store.getClaimsByBatch(b.id).length > 0;
    const hasDamage = b.artworkChecks.some(
      c => c.arrivalCheckStatus === 'damaged' || c.arrivalCheckStatus === 'missing'
    );
    if (hasClaim || hasDamage) {
      carrierMethodMap[method].abnormal++;
    }
  });
  const carrierExceptionRate = Object.entries(carrierMethodMap).map(([method, data]) => ({
    method,
    total: data.total,
    abnormal: data.abnormal,
    exceptionRate: data.total > 0 ? Math.round((data.abnormal / data.total) * 100) : 0
  })).sort((a, b) => b.exceptionRate - a.exceptionRate);

  const today = new Date();
  const todayStr = today.toISOString();
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const upcomingOutboundList = activeBatches
    .filter(b =>
      b.transportStatus === 'pending' &&
      b.plannedOutboundTime >= todayStr &&
      b.plannedOutboundTime <= next7Days
    )
    .map(b => {
      const ex = store.touringExhibitions.find(e => e.id === b.touringExhibitionId);
      const venue = ex ? store.touringVenues.find(v => v.id === ex.venueId) : null;
      const artworks = b.artworkChecks.map(check => {
        const a = store.artworks.find(art => art.id === check.artworkId);
        return a ? { id: a.id, title: a.title, author: a.author } : null;
      }).filter(Boolean);
      return {
        id: b.id,
        bookingUnit: ex?.bookingUnit || '',
        venueName: venue?.name || '',
        carrierMethod: b.carrierMethod,
        carrierContact: b.carrierContact,
        carrierPhone: b.carrierPhone,
        plannedOutboundTime: b.plannedOutboundTime,
        plannedArrivalTime: b.plannedArrivalTime,
        insuranceAmount: b.insuranceAmount,
        artworkCount: b.artworkChecks.length,
        artworks
      };
    })
    .sort((a, b) => a.plannedOutboundTime.localeCompare(b.plannedOutboundTime));

  const byStatus: Record<string, number> = {};
  activeBatches.forEach(b => {
    byStatus[b.transportStatus] = (byStatus[b.transportStatus] || 0) + 1;
  });

  const byClaimStatus: Record<string, number> = {};
  store.insuranceClaims.forEach(c => {
    byClaimStatus[c.claimStatus] = (byClaimStatus[c.claimStatus] || 0) + 1;
  });

  return {
    totalBatches,
    deliveredCount: deliveredBatches.length,
    onTimeRate,
    onTimeCount: onTimeBatches.length,
    pendingReceiptCount,
    overdueCount,
    totalClaims,
    unsettledClaimsCount: unsettledClaims.length,
    carrierExceptionRate,
    upcomingOutboundList,
    unsettledClaims,
    byStatus,
    byClaimStatus
  };
}

function getDocentActivityStats() {
  const activeActivities = store.docentActivities.filter(a => a.status !== 'canceled');
  const totalActivities = activeActivities.length;

  const completedCount = activeActivities.filter(a => a.status === 'completed').length;
  const completionRate = totalActivities > 0
    ? Math.round((completedCount / totalActivities) * 100)
    : 0;

  const byStatus: Record<string, number> = {};
  activeActivities.forEach(a => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
  });

  const volunteerServiceMap: Record<string, { volunteerId: string; name: string; expertiseCategory: string; organization: string; count: number }> = {};
  activeActivities.forEach(activity => {
    activity.volunteerAssignments.forEach(assignment => {
      const volunteer = store.volunteers.find(v => v.id === assignment.volunteerId);
      if (!volunteerServiceMap[assignment.volunteerId]) {
        volunteerServiceMap[assignment.volunteerId] = {
          volunteerId: assignment.volunteerId,
          name: volunteer?.name || assignment.volunteerId,
          expertiseCategory: volunteer?.expertiseCategory || '',
          organization: volunteer?.organization || '',
          count: 0
        };
      }
      volunteerServiceMap[assignment.volunteerId].count++;
    });
  });
  const volunteerServiceRanking = Object.values(volunteerServiceMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const venueMap: Record<string, number> = {};
  activeActivities.forEach(activity => {
    const venue = store.touringVenues.find(v => v.id === activity.venueId);
    const venueName = venue?.name || '未指定场地';
    venueMap[venueName] = (venueMap[venueName] || 0) + 1;
  });
  const venueDistribution = Object.entries(venueMap)
    .map(([venueName, count]) => ({ venueName, count }))
    .sort((a, b) => b.count - a.count);

  const artworkDocentMap: Record<string, { artworkId: string; title: string; author: string; count: number }> = {};
  activeActivities.forEach(activity => {
    activity.artworkIds.forEach(artworkId => {
      const artwork = store.artworks.find(a => a.id === artworkId);
      if (!artworkDocentMap[artworkId]) {
        artworkDocentMap[artworkId] = {
          artworkId,
          title: artwork?.title || artworkId,
          author: artwork?.author || '',
          count: 0
        };
      }
      artworkDocentMap[artworkId].count++;
    });
  });
  const artworkDocentRanking = Object.values(artworkDocentMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next7DaysStr = next7Days.toISOString().split('T')[0];

  const upcomingDocentList = activeActivities
    .filter(a => a.status === 'scheduled' && a.docentDate >= todayStr && a.docentDate <= next7DaysStr)
    .map(activity => {
      const tour = store.touringExhibitions.find(e => e.id === activity.touringExhibitionId);
      const venue = store.touringVenues.find(v => v.id === activity.venueId);
      const volunteers = activity.volunteerAssignments.map(assignment => {
        const v = store.volunteers.find(vol => vol.id === assignment.volunteerId);
        return { id: assignment.volunteerId, name: v?.name || '', role: assignment.role };
      });
      return {
        id: activity.id,
        theme: activity.theme,
        bookingUnit: tour?.bookingUnit || '',
        venueName: venue?.name || '',
        docentDate: activity.docentDate,
        startTime: activity.startTime,
        endTime: activity.endTime,
        manager: activity.manager,
        expectedAttendees: activity.expectedAttendees,
        artworkCount: activity.artworkIds.length,
        volunteers
      };
    })
    .sort((a, b) => a.docentDate.localeCompare(b.docentDate) || a.startTime.localeCompare(b.startTime));

  const volunteerActivitiesMap: Record<string, typeof activeActivities> = {};
  activeActivities.forEach(activity => {
    activity.volunteerAssignments.forEach(assignment => {
      if (!volunteerActivitiesMap[assignment.volunteerId]) {
        volunteerActivitiesMap[assignment.volunteerId] = [];
      }
      volunteerActivitiesMap[assignment.volunteerId].push(activity);
    });
  });

  let conflictCount = 0;
  const conflictDetails: Array<{ volunteerName: string; theme: string; docentDate: string; startTime: string; endTime: string }> = [];
  Object.values(volunteerActivitiesMap).forEach(list => {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (
          list[i].docentDate === list[j].docentDate &&
          store.isTimeOverlap(list[i].startTime, list[i].endTime, list[j].startTime, list[j].endTime)
        ) {
          conflictCount++;
          const volunteer = store.volunteers.find(v =>
            list[i].volunteerAssignments.some(a => a.volunteerId === v.id) &&
            list[j].volunteerAssignments.some(a => a.volunteerId === v.id)
          );
          conflictDetails.push({
            volunteerName: volunteer?.name || '',
            theme: `${list[i].theme} / ${list[j].theme}`,
            docentDate: list[i].docentDate,
            startTime: list[i].startTime,
            endTime: list[i].endTime
          });
        }
      }
    }
  });

  return {
    totalActivities,
    completedCount,
    completionRate,
    byStatus,
    volunteerServiceRanking,
    venueDistribution,
    artworkDocentRanking,
    upcomingDocentList,
    conflictCount,
    conflictDetails
  };
}

export default router;
