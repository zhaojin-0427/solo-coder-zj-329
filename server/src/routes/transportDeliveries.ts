import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import type {
  TransportBatch,
  TransportArtworkCheck,
  TransportCheckStatus,
  TransportReceiveConclusion,
  ClaimStatus
} from '../types/transportDelivery';

const router = Router();

const PHONE_REGEX = /^1[3-9]\d{9}$/;
const VALID_TRANSPORT_STATUSES = ['pending', 'in_transit', 'delivered', 'canceled'];
const VALID_CHECK_STATUSES: TransportCheckStatus[] = ['pending', 'normal', 'damaged', 'missing'];
const VALID_RECEIVE_CONCLUSIONS: TransportReceiveConclusion[] = ['pending', 'accepted', 'rejected'];
const VALID_CLAIM_STATUSES: ClaimStatus[] = ['pending', 'processing', 'settled', 'rejected'];

function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

function buildArtworkCheckSummary(check: TransportArtworkCheck) {
  const artwork = store.artworks.find(a => a.id === check.artworkId);
  return {
    ...check,
    artworkTitle: artwork?.title || '',
    artworkAuthor: artwork?.author || '',
    artworkCategory: artwork?.category || ''
  };
}

function getBatchClaimSummary(batchId: string) {
  const claims = store.getClaimsByBatch(batchId);
  const pending = claims.filter(c => c.claimStatus === 'pending' || c.claimStatus === 'processing').length;
  const settled = claims.filter(c => c.claimStatus === 'settled' || c.claimStatus === 'rejected').length;
  let claimStatus: 'none' | 'pending' | 'settled' = 'none';
  if (claims.length > 0) {
    claimStatus = pending > 0 ? 'pending' : 'settled';
  }
  return {
    total: claims.length,
    pending,
    settled,
    claimStatus,
    hasClaim: claims.length > 0
  };
}

function enrichBatch(batch: TransportBatch) {
  const ex = store.touringExhibitions.find(e => e.id === batch.touringExhibitionId);
  const venue = ex ? store.touringVenues.find(v => v.id === ex.venueId) : null;
  const claimSummary = getBatchClaimSummary(batch.id);
  const claims = store.getClaimsByBatch(batch.id).map(c => {
    const artwork = store.artworks.find(a => a.id === c.artworkId);
    return {
      ...c,
      artworkTitle: artwork?.title || '',
      artworkAuthor: artwork?.author || ''
    };
  });

  const now = new Date();
  const isOverdue =
    batch.transportStatus !== 'canceled' &&
    batch.transportStatus !== 'delivered' &&
    !!batch.plannedArrivalTime &&
    new Date(batch.plannedArrivalTime).getTime() < now.getTime();

  const pendingReceipt =
    batch.transportStatus === 'delivered' &&
    (!batch.siteReceiver ||
      batch.artworkChecks.some(c => c.receiveConclusion === 'pending'));

  const onTime =
    batch.transportStatus === 'delivered' &&
    !!batch.actualArrivalTime &&
    !!batch.plannedArrivalTime &&
    new Date(batch.actualArrivalTime).getTime() <= new Date(batch.plannedArrivalTime).getTime();

  return {
    ...batch,
    touringExhibition: ex
      ? {
          id: ex.id,
          bookingUnit: ex.bookingUnit,
          venueId: ex.venueId,
          venueName: venue?.name || '',
          startDate: ex.startDate,
          endDate: ex.endDate
        }
      : null,
    artworkChecks: batch.artworkChecks.map(buildArtworkCheckSummary),
    claims,
    claimSummary,
    isOverdue,
    pendingReceipt,
    onTime
  };
}

router.get('/', (req: Request, res: Response) => {
  const { touringExhibitionId, transportStatus, claimStatus, startDate, endDate, keyword } = req.query;
  let filtered = [...store.transportBatches];

  if (touringExhibitionId) {
    filtered = filtered.filter(b => b.touringExhibitionId === touringExhibitionId);
  }
  if (transportStatus && transportStatus !== 'all') {
    filtered = filtered.filter(b => b.transportStatus === transportStatus);
  }
  if (startDate) {
    filtered = filtered.filter(b => b.plannedOutboundTime >= (startDate as string));
  }
  if (endDate) {
    filtered = filtered.filter(b => b.plannedOutboundTime <= (endDate as string));
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    filtered = filtered.filter(b => {
      const ex = store.touringExhibitions.find(e => e.id === b.touringExhibitionId);
      const artworkMatch = b.artworkChecks.some(check => {
        const artwork = store.artworks.find(a => a.id === check.artworkId);
        return artwork
          ? artwork.title.toLowerCase().includes(kw) || artwork.author.toLowerCase().includes(kw)
          : false;
      });
      return (
        b.carrierMethod.toLowerCase().includes(kw) ||
        b.carrierContact.toLowerCase().includes(kw) ||
        b.carrierPhone.includes(kw) ||
        b.trackingNo.toLowerCase().includes(kw) ||
        b.policyNo.toLowerCase().includes(kw) ||
        b.outboundOperator.toLowerCase().includes(kw) ||
        b.siteReceiver.toLowerCase().includes(kw) ||
        (ex?.bookingUnit || '').toLowerCase().includes(kw) ||
        artworkMatch
      );
    });
  }
  if (claimStatus && claimStatus !== 'all') {
    filtered = filtered.filter(b => {
      const summary = getBatchClaimSummary(b.id);
      if (claimStatus === 'has_claim') return summary.hasClaim;
      if (claimStatus === 'no_claim') return !summary.hasClaim;
      if (claimStatus === 'pending') return summary.hasClaim && summary.pending > 0;
      if (claimStatus === 'settled') return summary.hasClaim && summary.pending === 0;
      return true;
    });
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filtered.map(enrichBatch));
});

router.get('/:id', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  res.json(enrichBatch(batch));
});

router.post('/', (req: Request, res: Response) => {
  const {
    touringExhibitionId,
    carrierMethod,
    carrierContact,
    carrierPhone,
    plannedOutboundTime,
    plannedArrivalTime,
    outboundOperator,
    trackingNo,
    insuranceAmount,
    policyNo,
    remarks
  } = req.body;

  if (!touringExhibitionId || !carrierMethod || !carrierContact || !carrierPhone || !plannedOutboundTime || !plannedArrivalTime) {
    res.status(400).json({ message: '巡展预约、承运方式、承运联系人、联系电话、计划出库时间、计划送达时间为必填项' });
    return;
  }

  const exhibition = store.touringExhibitions.find(e => e.id === touringExhibitionId);
  if (!exhibition) {
    res.status(400).json({ message: '巡展预约不存在' });
    return;
  }
  if (exhibition.reviewStatus !== 'approved') {
    res.status(400).json({ message: '只有已审核通过的巡展预约才能创建运输批次' });
    return;
  }

  const activeBatch = store.getActiveTransportBatchByTouring(touringExhibitionId);
  if (activeBatch) {
    res.status(400).json({ message: '该巡展预约已存在未取消的运输批次，不可重复创建' });
    return;
  }

  if (!isValidPhone(carrierPhone)) {
    res.status(400).json({ message: '承运联系电话格式不正确，请输入11位手机号' });
    return;
  }

  if (new Date(plannedArrivalTime).getTime() < new Date(plannedOutboundTime).getTime()) {
    res.status(400).json({ message: '计划送达时间不得早于计划出库时间' });
    return;
  }

  if (exhibition.artworkIds.length === 0) {
    res.status(400).json({ message: '该巡展预约未关联作品，无法创建运输批次' });
    return;
  }

  const artworkChecks: TransportArtworkCheck[] = exhibition.artworkIds.map(artworkId => ({
    artworkId,
    outboundCheckStatus: 'pending',
    arrivalCheckStatus: 'pending',
    packagingCondition: '',
    damageDescription: '',
    receiveConclusion: 'pending',
    triggerClaim: false
  }));

  const newBatch = store.addTransportBatch({
    touringExhibitionId,
    carrierMethod,
    carrierContact,
    carrierPhone,
    plannedOutboundTime,
    plannedArrivalTime,
    actualOutboundTime: '',
    actualArrivalTime: '',
    outboundOperator: outboundOperator || '',
    siteReceiver: '',
    transportStatus: 'pending',
    trackingNo: trackingNo || '',
    insuranceAmount: Number(insuranceAmount) || 0,
    policyNo: policyNo || '',
    remarks: remarks || '',
    artworkChecks
  });

  res.status(201).json(enrichBatch(newBatch));
});

router.put('/:id', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  if (batch.transportStatus === 'canceled') {
    res.status(400).json({ message: '已取消的运输批次不可修改' });
    return;
  }

  const {
    carrierMethod,
    carrierContact,
    carrierPhone,
    plannedOutboundTime,
    plannedArrivalTime,
    trackingNo,
    insuranceAmount,
    policyNo,
    remarks
  } = req.body;

  if (carrierPhone !== undefined && carrierPhone !== '' && !isValidPhone(carrierPhone)) {
    res.status(400).json({ message: '承运联系电话格式不正确，请输入11位手机号' });
    return;
  }

  const finalOutbound = plannedOutboundTime || batch.plannedOutboundTime;
  const finalArrival = plannedArrivalTime || batch.plannedArrivalTime;
  if (new Date(finalArrival).getTime() < new Date(finalOutbound).getTime()) {
    res.status(400).json({ message: '计划送达时间不得早于计划出库时间' });
    return;
  }

  const updates: Partial<TransportBatch> = {};
  if (carrierMethod !== undefined) updates.carrierMethod = carrierMethod;
  if (carrierContact !== undefined) updates.carrierContact = carrierContact;
  if (carrierPhone !== undefined) updates.carrierPhone = carrierPhone;
  if (plannedOutboundTime !== undefined) updates.plannedOutboundTime = plannedOutboundTime;
  if (plannedArrivalTime !== undefined) updates.plannedArrivalTime = plannedArrivalTime;
  if (trackingNo !== undefined) updates.trackingNo = trackingNo;
  if (insuranceAmount !== undefined) updates.insuranceAmount = Number(insuranceAmount) || 0;
  if (policyNo !== undefined) updates.policyNo = policyNo;
  if (remarks !== undefined) updates.remarks = remarks;

  const updated = store.updateTransportBatch(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  res.json(enrichBatch(updated));
});

router.post('/:id/outbound', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  if (batch.transportStatus !== 'pending') {
    res.status(400).json({ message: '只有待出库状态的批次可以登记出库' });
    return;
  }

  const { actualOutboundTime, outboundOperator, trackingNo, outboundChecks } = req.body;
  if (!actualOutboundTime || !outboundOperator) {
    res.status(400).json({ message: '实际出库时间、出库经办人为必填项' });
    return;
  }

  const updatedChecks = batch.artworkChecks.map(check => {
    const provided = outboundChecks?.find((c: { artworkId: string }) => c.artworkId === check.artworkId);
    if (provided) {
      const status: TransportCheckStatus = VALID_CHECK_STATUSES.includes(provided.outboundCheckStatus)
        ? provided.outboundCheckStatus
        : check.outboundCheckStatus;
      return {
        ...check,
        outboundCheckStatus: status,
        packagingCondition: provided.packagingCondition ?? check.packagingCondition
      };
    }
    return check;
  });
  store.setTransportArtworkChecks(req.params.id, updatedChecks);

  const updated = store.updateTransportBatch(req.params.id, {
    actualOutboundTime,
    outboundOperator,
    trackingNo: trackingNo || batch.trackingNo,
    transportStatus: 'in_transit'
  });
  res.json(enrichBatch(updated!));
});

router.post('/:id/arrive', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  if (batch.transportStatus !== 'in_transit') {
    res.status(400).json({ message: '只有运输中状态的批次可以登记送达' });
    return;
  }

  const { actualArrivalTime } = req.body;
  if (!actualArrivalTime) {
    res.status(400).json({ message: '实际送达时间为必填项' });
    return;
  }
  if (!batch.actualOutboundTime) {
    res.status(400).json({ message: '尚未登记实际出库时间，无法登记送达' });
    return;
  }
  if (new Date(actualArrivalTime).getTime() < new Date(batch.actualOutboundTime).getTime()) {
    res.status(400).json({ message: '实际送达时间不得早于实际出库时间' });
    return;
  }

  const updated = store.updateTransportBatch(req.params.id, {
    actualArrivalTime,
    transportStatus: 'delivered'
  });
  res.json(enrichBatch(updated!));
});

router.post('/:id/receive', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  if (batch.transportStatus !== 'delivered') {
    res.status(400).json({ message: '只有运输状态为"已送达"时才允许录入场地签收和到场检查' });
    return;
  }

  const { siteReceiver, receiveChecks } = req.body;
  if (!siteReceiver || !siteReceiver.trim()) {
    res.status(400).json({ message: '场地签收人为必填项' });
    return;
  }
  if (!receiveChecks || !Array.isArray(receiveChecks) || receiveChecks.length === 0) {
    res.status(400).json({ message: '请提交作品到场检查信息' });
    return;
  }

  const newClaims: string[] = [];
  const updatedChecks: TransportArtworkCheck[] = batch.artworkChecks.map(check => {
    const provided = receiveChecks.find((c: { artworkId: string }) => c.artworkId === check.artworkId);
    if (!provided) return check;

    const arrivalStatus: TransportCheckStatus = VALID_CHECK_STATUSES.includes(provided.arrivalCheckStatus)
      ? provided.arrivalCheckStatus
      : 'pending';
    const conclusion: TransportReceiveConclusion = VALID_RECEIVE_CONCLUSIONS.includes(provided.receiveConclusion)
      ? provided.receiveConclusion
      : 'pending';

    const hasDamage = arrivalStatus === 'damaged' || arrivalStatus === 'missing';
    const shouldTrigger = hasDamage && conclusion !== 'rejected';

    if (shouldTrigger && !check.triggerClaim) {
      const existingClaim = store.insuranceClaims.find(
        c => c.artworkId === check.artworkId && c.transportBatchId === batch.id
      );
      if (!existingClaim) {
        const claim = store.addInsuranceClaim({
          artworkId: check.artworkId,
          transportBatchId: batch.id,
          responsibleParty: '承运方',
          claimAmount: 0,
          claimStatus: 'pending',
          handler: '',
          handlingDescription: provided.damageDescription || '',
          settleTime: ''
        });
        newClaims.push(claim.id);
      }
    }

    return {
      ...check,
      arrivalCheckStatus: arrivalStatus,
      packagingCondition: provided.packagingCondition ?? check.packagingCondition,
      damageDescription: provided.damageDescription ?? check.damageDescription,
      receiveConclusion: conclusion,
      triggerClaim: shouldTrigger ? true : check.triggerClaim
    };
  });

  store.setTransportArtworkChecks(req.params.id, updatedChecks);
  const updated = store.updateTransportBatch(req.params.id, {
    siteReceiver: siteReceiver.trim()
  });

  const result = enrichBatch(updated!);
  res.json({ ...result, newlyCreatedClaimIds: newClaims });
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  if (batch.transportStatus === 'canceled') {
    res.status(400).json({ message: '该运输批次已取消' });
    return;
  }
  if (batch.transportStatus === 'delivered') {
    res.status(400).json({ message: '已送达的运输批次不可取消' });
    return;
  }

  const updated = store.updateTransportBatch(req.params.id, { transportStatus: 'canceled' });
  res.json(enrichBatch(updated!));
});

router.get('/:id/claims', (req: Request, res: Response) => {
  const batch = store.transportBatches.find(b => b.id === req.params.id);
  if (!batch) {
    res.status(404).json({ message: '运输批次不存在' });
    return;
  }
  const claims = store.getClaimsByBatch(req.params.id).map(c => {
    const artwork = store.artworks.find(a => a.id === c.artworkId);
    return {
      ...c,
      artworkTitle: artwork?.title || '',
      artworkAuthor: artwork?.author || ''
    };
  });
  res.json(claims);
});

router.put('/claims/:claimId', (req: Request, res: Response) => {
  const claim = store.insuranceClaims.find(c => c.id === req.params.claimId);
  if (!claim) {
    res.status(404).json({ message: '理赔记录不存在' });
    return;
  }

  const { responsibleParty, claimAmount, claimStatus, handler, handlingDescription, settleTime } = req.body;
  const updates: Partial<typeof claim> = {};

  if (responsibleParty !== undefined) updates.responsibleParty = responsibleParty;
  if (claimAmount !== undefined) updates.claimAmount = Number(claimAmount) || 0;
  if (handler !== undefined) updates.handler = handler;
  if (handlingDescription !== undefined) updates.handlingDescription = handlingDescription;

  if (claimStatus !== undefined) {
    if (!VALID_CLAIM_STATUSES.includes(claimStatus)) {
      res.status(400).json({ message: '理赔状态非法' });
      return;
    }
    updates.claimStatus = claimStatus;
    if ((claimStatus === 'settled' || claimStatus === 'rejected') && !claim.settleTime) {
      updates.settleTime = settleTime || new Date().toISOString();
    }
    if (claimStatus !== 'settled' && claimStatus !== 'rejected') {
      updates.settleTime = '';
    }
  } else if (settleTime !== undefined) {
    updates.settleTime = settleTime;
  }

  const updated = store.updateInsuranceClaim(req.params.claimId, updates);
  if (!updated) {
    res.status(404).json({ message: '理赔记录不存在' });
    return;
  }

  const artwork = store.artworks.find(a => a.id === updated.artworkId);
  res.json({
    ...updated,
    artworkTitle: artwork?.title || '',
    artworkAuthor: artwork?.author || ''
  });
});

export default router;
