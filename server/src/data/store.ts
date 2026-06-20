import { v4 as uuidv4 } from 'uuid';
import type { Artwork } from '../types/artwork';
import type { Exhibition } from '../types/exhibition';
import type { Subscription } from '../types/subscription';
import type { PickupRecord } from '../types/pickup';
import type { RevenueRecord } from '../types/revenue';
import type { HandoverRecord, HandoverType, HandoverProcessStatus } from '../types/handover';
import type { TouringVenue, TouringExhibition, TouringExhibitionReviewStatus } from '../types/touringExhibition';
import type { TransportBatch, TransportArtworkCheck, InsuranceClaim, TransportStatus, TransportCheckStatus, TransportReceiveConclusion, ClaimStatus } from '../types/transportDelivery';
import type { Volunteer, DocentActivity, VolunteerAssignment, DocentActivityStatus } from '../types/docentActivity';

const now = new Date().toISOString();

const exhibitions: Exhibition[] = [
  {
    id: 'exh-001',
    name: '2024春季非遗艺术展',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'ended',
    description: '春季非遗艺术作品展，汇集各类传统艺术精品'
  },
  {
    id: 'exh-002',
    name: '2024夏季文化艺术节',
    startDate: '2024-06-15',
    endDate: '2024-07-15',
    status: 'ongoing',
    description: '夏季文化艺术节，展示多种传统技艺'
  }
];

const artworks: Artwork[] = [
  {
    id: 'art-001',
    title: '宁静致远',
    author: '王羲之',
    category: '书法',
    size: '138cm x 68cm',
    material: '宣纸、墨',
    status: 'showing',
    description: '行书作品，笔力遒劲，意境深远',
    theme: '山水意境',
    exhibitionId: 'exh-002',
    createdAt: '2024-02-15T10:00:00.000Z',
    updatedAt: '2024-06-10T14:30:00.000Z'
  },
  {
    id: 'art-002',
    title: '喜鹊登梅',
    author: '张爱华',
    category: '剪纸',
    size: '40cm x 40cm',
    material: '红色宣纸',
    status: 'showing',
    description: '传统剪纸艺术，寓意吉祥如意',
    theme: '吉祥图案',
    exhibitionId: 'exh-002',
    createdAt: '2024-03-01T09:00:00.000Z',
    updatedAt: '2024-06-12T11:00:00.000Z'
  },
  {
    id: 'art-003',
    title: '百子图',
    author: '李锦绣',
    category: '布艺',
    size: '80cm x 120cm',
    material: '丝绸、棉线',
    status: 'sold',
    description: '刺绣作品，图案精美，色彩丰富',
    theme: '传统民俗',
    exhibitionId: 'exh-001',
    createdAt: '2024-01-20T08:30:00.000Z',
    updatedAt: '2024-03-25T16:00:00.000Z'
  },
  {
    id: 'art-004',
    title: '陋室铭',
    author: '颜真卿',
    category: '书法',
    size: '180cm x 90cm',
    material: '宣纸、墨',
    status: 'returned',
    description: '楷书精品，结构严谨，气势恢宏',
    theme: '古典文学',
    exhibitionId: 'exh-001',
    createdAt: '2024-02-10T10:30:00.000Z',
    updatedAt: '2024-04-01T09:00:00.000Z'
  },
  {
    id: 'art-005',
    title: '龙凤呈祥',
    author: '陈刻石',
    category: '篆刻',
    size: '5cm x 5cm',
    material: '寿山石',
    status: 'showing',
    description: '篆刻印章，刀法精湛，布局巧妙',
    theme: '吉祥图案',
    exhibitionId: 'exh-002',
    createdAt: '2024-04-05T13:00:00.000Z',
    updatedAt: '2024-06-15T10:00:00.000Z'
  },
  {
    id: 'art-006',
    title: '花开富贵',
    author: '王绣花',
    category: '布艺',
    size: '60cm x 80cm',
    material: '真丝、金线',
    status: 'draft',
    description: '苏绣作品，针法细腻，栩栩如生',
    theme: '花卉',
    exhibitionId: null,
    createdAt: '2024-05-10T14:00:00.000Z',
    updatedAt: '2024-05-20T11:30:00.000Z'
  },
  {
    id: 'art-007',
    title: '年年有余',
    author: '刘剪纸',
    category: '剪纸',
    size: '50cm x 35cm',
    material: '彩色宣纸',
    status: 'showing',
    description: '鱼纹剪纸，寓意年年有余',
    theme: '传统民俗',
    exhibitionId: 'exh-002',
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-06-14T15:00:00.000Z'
  },
  {
    id: 'art-008',
    title: '梅兰竹菊',
    author: '苏篆刻',
    category: '篆刻',
    size: '4cm x 4cm x 4',
    material: '青田石',
    status: 'showing',
    description: '四君子印章套装，各有特色',
    theme: '四君子',
    exhibitionId: 'exh-002',
    createdAt: '2024-04-20T09:30:00.000Z',
    updatedAt: '2024-06-13T12:00:00.000Z'
  }
];

const subscriptions: Subscription[] = [
  {
    id: 'sub-001',
    artworkId: 'art-002',
    visitorName: '张小明',
    visitorPhone: '13800138001',
    queueNumber: 1,
    pickupMethod: 'onsite',
    remarks: '希望能尽快安排取件',
    status: 'pending',
    createdAt: '2024-06-16T10:00:00.000Z'
  },
  {
    id: 'sub-002',
    artworkId: 'art-003',
    visitorName: '李华',
    visitorPhone: '13900139002',
    queueNumber: 1,
    pickupMethod: 'delivery',
    remarks: '需要包装好，快递到付',
    status: 'deal',
    createdAt: '2024-03-10T14:30:00.000Z'
  },
  {
    id: 'sub-003',
    artworkId: 'art-005',
    visitorName: '王芳',
    visitorPhone: '13700137003',
    queueNumber: 1,
    pickupMethod: 'onsite',
    remarks: '周末可以来取',
    status: 'pending',
    createdAt: '2024-06-17T09:00:00.000Z'
  },
  {
    id: 'sub-004',
    artworkId: 'art-007',
    visitorName: '赵强',
    visitorPhone: '13600136004',
    queueNumber: 2,
    pickupMethod: 'onsite',
    remarks: '',
    status: 'canceled',
    createdAt: '2024-06-15T16:00:00.000Z'
  },
  {
    id: 'sub-005',
    artworkId: 'art-001',
    visitorName: '孙丽',
    visitorPhone: '13500135005',
    queueNumber: 1,
    pickupMethod: 'delivery',
    remarks: '作为礼物送人，请妥善包装',
    status: 'pending',
    createdAt: '2024-06-18T11:20:00.000Z'
  }
];

const pickupRecords: PickupRecord[] = [
  {
    id: 'pick-001',
    artworkId: 'art-003',
    subscriptionId: 'sub-002',
    type: 'sale',
    recipientName: '李华',
    recipientPhone: '13900139002',
    pickupDate: '2024-03-28T10:00:00.000Z',
    operator: '管理员',
    remarks: '已完成交易，作品已交付'
  },
  {
    id: 'pick-002',
    artworkId: 'art-004',
    subscriptionId: null,
    type: 'return',
    recipientName: '工作人员',
    recipientPhone: '13000130000',
    pickupDate: '2024-04-01T14:00:00.000Z',
    operator: '管理员',
    remarks: '展期结束，作品退回库房'
  },
  {
    id: 'pick-003',
    artworkId: 'art-002',
    subscriptionId: null,
    type: 'return',
    recipientName: '库房管理员',
    recipientPhone: '13100131000',
    pickupDate: '2024-06-10T09:30:00.000Z',
    operator: '管理员',
    remarks: '更换展品，临时撤回'
  }
];

const revenueRecords: RevenueRecord[] = [
  {
    id: 'rev-001',
    artworkId: 'art-003',
    subscriptionId: 'sub-002',
    author: '李锦绣',
    totalAmount: 1200,
    authorShare: 840,
    platformShare: 360,
    authorRatio: 70,
    status: 'distributed',
    dealDate: '2024-03-25T10:00:00.000Z',
    distributeDate: '2024-03-28T14:00:00.000Z',
    operator: '管理员',
    remarks: '百子图刺绣作品成交收益已发放'
  },
  {
    id: 'rev-002',
    artworkId: 'art-001',
    subscriptionId: 'sub-005',
    author: '王羲之',
    totalAmount: 2000,
    authorShare: 1400,
    platformShare: 600,
    authorRatio: 70,
    status: 'pending',
    dealDate: '2024-06-19T11:00:00.000Z',
    distributeDate: null,
    operator: '管理员',
    remarks: '等待统一结算发放'
  }
];

const touringVenues: TouringVenue[] = [
  {
    id: 'venue-001',
    name: '阳光社区活动中心',
    contactPerson: '张主任',
    contactPhone: '13800000001',
    address: '北京市朝阳区阳光路88号',
    maxArtworkCount: 30,
    openHours: '周一至周五 9:00-17:00',
    transportRequirements: '有电梯，可进货车，需提前24小时预约',
    remarks: '社区老年人口较多，建议多展示书法和剪纸类作品',
    createdAt: '2024-05-10T10:00:00.000Z',
    updatedAt: '2024-05-10T10:00:00.000Z'
  },
  {
    id: 'venue-002',
    name: '幸福养老院',
    contactPerson: '李院长',
    contactPhone: '13800000002',
    address: '北京市海淀区幸福路12号',
    maxArtworkCount: 20,
    openHours: '全天开放',
    transportRequirements: '只能走货梯，尺寸限制2米×1.5米',
    remarks: '老人居多，作品需便于观赏，建议配解说人员',
    createdAt: '2024-05-15T09:00:00.000Z',
    updatedAt: '2024-05-15T09:00:00.000Z'
  },
  {
    id: 'venue-003',
    name: '市图书馆一楼展厅',
    contactPerson: '王馆长',
    contactPhone: '13800000003',
    address: '北京市西城区文化路66号',
    maxArtworkCount: 50,
    openHours: '周二至周日 9:00-20:00',
    transportRequirements: '专业展厅，有展墙和灯光，大型作品需提前沟通',
    remarks: '人流量大，建议安排工作人员值守，可配合举办讲座',
    createdAt: '2024-05-20T14:00:00.000Z',
    updatedAt: '2024-05-20T14:00:00.000Z'
  }
];

const touringExhibitions: TouringExhibition[] = [
  {
    id: 'tour-001',
    bookingUnit: '阳光社区居委会',
    bookingPerson: '张主任',
    contactPhone: '13800000001',
    startDate: '2024-07-01',
    endDate: '2024-07-07',
    venueId: 'venue-001',
    artworkIds: ['art-001', 'art-002', 'art-005'],
    transportMethod: '学校专车运输',
    setupManager: '王管理员',
    reviewStatus: 'approved',
    rejectionReason: '',
    createdAt: '2024-06-10T10:00:00.000Z',
    updatedAt: '2024-06-12T14:30:00.000Z'
  },
  {
    id: 'tour-002',
    bookingUnit: '幸福养老院活动部',
    bookingPerson: '赵老师',
    contactPhone: '13900000001',
    startDate: '2024-07-15',
    endDate: '2024-07-21',
    venueId: 'venue-002',
    artworkIds: ['art-007', 'art-008'],
    transportMethod: '第三方物流',
    setupManager: '李管理员',
    reviewStatus: 'pending',
    rejectionReason: '',
    createdAt: '2024-06-15T11:00:00.000Z',
    updatedAt: '2024-06-15T11:00:00.000Z'
  },
  {
    id: 'tour-003',
    bookingUnit: '市图书馆文化宣传部',
    bookingPerson: '刘老师',
    contactPhone: '13700000001',
    startDate: '2024-07-10',
    endDate: '2024-07-20',
    venueId: 'venue-003',
    artworkIds: ['art-001', 'art-002'],
    transportMethod: '学校专车运输',
    setupManager: '张管理员',
    reviewStatus: 'rejected',
    rejectionReason: '拟展作品数量偏少，建议增加作品数量后重新提交',
    createdAt: '2024-06-08T09:00:00.000Z',
    updatedAt: '2024-06-09T16:00:00.000Z'
  }
];

const handoverRecords: HandoverRecord[] = [
  {
    id: 'han-001',
    artworkId: 'art-001',
    type: 'entry',
    handlerName: '张管理员',
    handlerPhone: '13800000001',
    handoverTime: '2024-06-10T09:30:00.000Z',
    artworkStatusAtHandover: 'draft',
    checkItems: { packagingOk: true, noDamage: true, noMissing: true },
    photoDescription: '作品完整无损，包装完好，已拍照存档',
    exceptionDescription: '',
    processStatus: 'resolved',
    processorName: '张管理员',
    createdAt: '2024-06-10T09:30:00.000Z',
    updatedAt: '2024-06-10T09:30:00.000Z'
  },
  {
    id: 'han-002',
    artworkId: 'art-003',
    type: 'sale',
    handlerName: '李管理员',
    handlerPhone: '13800000002',
    handoverTime: '2024-03-25T14:00:00.000Z',
    artworkStatusAtHandover: 'showing',
    checkItems: { packagingOk: true, noDamage: true, noMissing: true },
    photoDescription: '作品经买家验收无误，已拍照确认',
    exceptionDescription: '',
    processStatus: 'resolved',
    processorName: '李管理员',
    createdAt: '2024-03-25T14:00:00.000Z',
    updatedAt: '2024-03-25T14:00:00.000Z'
  },
  {
    id: 'han-003',
    artworkId: 'art-004',
    type: 'return',
    handlerName: '王管理员',
    handlerPhone: '13800000003',
    handoverTime: '2024-04-01T10:00:00.000Z',
    artworkStatusAtHandover: 'showing',
    checkItems: { packagingOk: true, noDamage: false, noMissing: true, notes: '画框边缘有轻微划痕' },
    photoDescription: '已拍摄划痕细节照片',
    exceptionDescription: '画框边缘有轻微划痕，需确认是否为展期造成',
    processStatus: 'processing',
    processorName: '王管理员',
    createdAt: '2024-04-01T10:00:00.000Z',
    updatedAt: '2024-04-02T15:00:00.000Z'
  },
  {
    id: 'han-004',
    artworkId: 'art-005',
    type: 'entry',
    handlerName: '赵管理员',
    handlerPhone: '13800000004',
    handoverTime: '2024-06-15T11:00:00.000Z',
    artworkStatusAtHandover: 'draft',
    checkItems: { packagingOk: true, noDamage: true, noMissing: true },
    photoDescription: '印章外包装完好，实物核对一致',
    exceptionDescription: '',
    processStatus: 'resolved',
    processorName: '赵管理员',
    createdAt: '2024-06-15T11:00:00.000Z',
    updatedAt: '2024-06-15T11:00:00.000Z'
  },
  {
    id: 'han-005',
    artworkId: 'art-002',
    type: 'return',
    handlerName: '孙管理员',
    handlerPhone: '13800000005',
    handoverTime: '2024-06-10T14:30:00.000Z',
    artworkStatusAtHandover: 'showing',
    checkItems: { packagingOk: true, noDamage: true, noMissing: true },
    photoDescription: '剪纸作品完好，包装完整',
    exceptionDescription: '',
    processStatus: 'resolved',
    processorName: '孙管理员',
    createdAt: '2024-06-10T14:30:00.000Z',
    updatedAt: '2024-06-10T14:30:00.000Z'
  },
  {
    id: 'han-006',
    artworkId: 'art-007',
    type: 'entry',
    handlerName: '周管理员',
    handlerPhone: '13800000006',
    handoverTime: '2024-06-14T10:00:00.000Z',
    artworkStatusAtHandover: 'draft',
    checkItems: { packagingOk: false, noDamage: true, noMissing: true, notes: '外包装盒有轻微压痕，内部作品无损' },
    photoDescription: '外包装压痕已拍照，内部作品检查无误',
    exceptionDescription: '外包装盒有轻微压痕，不影响作品本身',
    processStatus: 'pending',
    processorName: '',
    createdAt: '2024-06-14T10:00:00.000Z',
    updatedAt: '2024-06-14T10:00:00.000Z'
  }
];

const transportBatches: TransportBatch[] = [
  {
    id: 'tp-001',
    touringExhibitionId: 'tour-001',
    carrierMethod: '学校专车运输',
    carrierContact: '周师傅',
    carrierPhone: '13800138010',
    plannedOutboundTime: '2024-06-30T08:00:00.000Z',
    plannedArrivalTime: '2024-07-01T10:00:00.000Z',
    actualOutboundTime: '2024-06-30T08:30:00.000Z',
    actualArrivalTime: '2024-07-01T09:30:00.000Z',
    outboundOperator: '王管理员',
    siteReceiver: '张主任',
    transportStatus: 'delivered',
    trackingNo: 'XC-2024-0701-001',
    insuranceAmount: 8000,
    policyNo: 'PA-2024-0001',
    remarks: '社区巡展首批运输，含三件作品',
    artworkChecks: [
      {
        artworkId: 'art-001',
        outboundCheckStatus: 'normal',
        arrivalCheckStatus: 'normal',
        packagingCondition: '木框包装完好',
        damageDescription: '',
        receiveConclusion: 'accepted',
        triggerClaim: false
      },
      {
        artworkId: 'art-002',
        outboundCheckStatus: 'normal',
        arrivalCheckStatus: 'damaged',
        packagingCondition: '外包装轻微变形',
        damageDescription: '到场后发现剪纸边缘有折痕，疑似运输挤压所致',
        receiveConclusion: 'accepted',
        triggerClaim: true
      },
      {
        artworkId: 'art-005',
        outboundCheckStatus: 'normal',
        arrivalCheckStatus: 'normal',
        packagingCondition: '防震包装完好',
        damageDescription: '',
        receiveConclusion: 'accepted',
        triggerClaim: false
      }
    ],
    createdAt: '2024-06-25T10:00:00.000Z',
    updatedAt: '2024-07-01T09:30:00.000Z'
  },
  {
    id: 'tp-002',
    touringExhibitionId: 'tour-001',
    carrierMethod: '第三方物流',
    carrierContact: '顺达物流',
    carrierPhone: '13900139010',
    plannedOutboundTime: '2024-07-08T08:00:00.000Z',
    plannedArrivalTime: '2024-07-09T12:00:00.000Z',
    actualOutboundTime: '',
    actualArrivalTime: '',
    outboundOperator: '',
    siteReceiver: '',
    transportStatus: 'canceled',
    trackingNo: '',
    insuranceAmount: 0,
    policyNo: '',
    remarks: '展期延长，改用其他批次，本批次取消',
    artworkChecks: [
      {
        artworkId: 'art-001',
        outboundCheckStatus: 'pending',
        arrivalCheckStatus: 'pending',
        packagingCondition: '',
        damageDescription: '',
        receiveConclusion: 'pending',
        triggerClaim: false
      },
      {
        artworkId: 'art-002',
        outboundCheckStatus: 'pending',
        arrivalCheckStatus: 'pending',
        packagingCondition: '',
        damageDescription: '',
        receiveConclusion: 'pending',
        triggerClaim: false
      },
      {
        artworkId: 'art-005',
        outboundCheckStatus: 'pending',
        arrivalCheckStatus: 'pending',
        packagingCondition: '',
        damageDescription: '',
        receiveConclusion: 'pending',
        triggerClaim: false
      }
    ],
    createdAt: '2024-07-05T09:00:00.000Z',
    updatedAt: '2024-07-05T16:00:00.000Z'
  }
];

const insuranceClaims: InsuranceClaim[] = [
  {
    id: 'clm-001',
    artworkId: 'art-002',
    transportBatchId: 'tp-001',
    responsibleParty: '承运方',
    claimAmount: 1500,
    claimStatus: 'processing',
    handler: '王管理员',
    handlingDescription: '已联系承运方确认责任，正在协商赔偿金额',
    settleTime: '',
    createdAt: '2024-07-01T10:30:00.000Z',
    updatedAt: '2024-07-02T14:00:00.000Z'
  }
];

const volunteers: Volunteer[] = [
  {
    id: 'vol-001',
    name: '张文静',
    phone: '13800001001',
    expertiseCategory: '书法',
    availableTimeSlots: '周一至周五 9:00-17:00',
    organization: '阳光社区文化站',
    remarks: '擅长书法类作品讲解，有三年志愿讲解经验',
    createdAt: '2024-06-18T09:00:00.000Z',
    updatedAt: '2024-06-18T09:00:00.000Z'
  },
  {
    id: 'vol-002',
    name: '李艺涵',
    phone: '13800001002',
    expertiseCategory: '剪纸',
    availableTimeSlots: '周末 9:00-17:00',
    organization: '阳光社区文化站',
    remarks: '剪纸非遗传承爱好者，表达清晰',
    createdAt: '2024-06-18T09:10:00.000Z',
    updatedAt: '2024-06-18T09:10:00.000Z'
  },
  {
    id: 'vol-003',
    name: '王篆生',
    phone: '13800001003',
    expertiseCategory: '篆刻',
    availableTimeSlots: '周三、周五 14:00-17:00',
    organization: '市图书馆志愿队',
    remarks: '篆刻研究爱好者，可配合开展印章体验',
    createdAt: '2024-06-18T09:20:00.000Z',
    updatedAt: '2024-06-18T09:20:00.000Z'
  },
  {
    id: 'vol-004',
    name: '赵布心',
    phone: '13800001004',
    expertiseCategory: '布艺',
    availableTimeSlots: '全天可服务',
    organization: '幸福志愿团',
    remarks: '擅长布艺类讲解，可承担现场引导工作',
    createdAt: '2024-06-19T10:00:00.000Z',
    updatedAt: '2024-06-19T10:00:00.000Z'
  },
  {
    id: 'vol-005',
    name: '孙讲解',
    phone: '13800001005',
    expertiseCategory: '书法',
    availableTimeSlots: '周一至周五 9:00-12:00',
    organization: '市图书馆志愿队',
    remarks: '退休教师，讲解风格亲和',
    createdAt: '2024-06-19T10:10:00.000Z',
    updatedAt: '2024-06-19T10:10:00.000Z'
  }
];

const docentActivities: DocentActivity[] = [
  {
    id: 'da-001',
    touringExhibitionId: 'tour-001',
    theme: '书法与剪纸艺术赏析',
    docentDate: '2024-07-02',
    startTime: '09:00',
    endTime: '11:00',
    venueId: 'venue-001',
    artworkIds: ['art-001', 'art-002'],
    manager: '王管理员',
    volunteerAssignments: [
      { volunteerId: 'vol-001', role: '主讲' },
      { volunteerId: 'vol-002', role: '助理' }
    ],
    expectedAttendees: 30,
    status: 'completed',
    actualAttendees: 28,
    audienceFeedback: '观众反响热烈，互动积极，建议后续增加书法现场体验环节',
    exceptionRemarks: '',
    createdAt: '2024-06-25T10:00:00.000Z',
    updatedAt: '2024-07-02T11:30:00.000Z'
  },
  {
    id: 'da-002',
    touringExhibitionId: 'tour-001',
    theme: '篆刻文化讲堂',
    docentDate: '2024-07-04',
    startTime: '14:00',
    endTime: '16:00',
    venueId: 'venue-001',
    artworkIds: ['art-005'],
    manager: '李管理员',
    volunteerAssignments: [
      { volunteerId: 'vol-003', role: '主讲' },
      { volunteerId: 'vol-004', role: '引导' }
    ],
    expectedAttendees: 20,
    status: 'ongoing',
    actualAttendees: null,
    audienceFeedback: '',
    exceptionRemarks: '',
    createdAt: '2024-06-26T09:00:00.000Z',
    updatedAt: '2024-07-04T14:10:00.000Z'
  },
  {
    id: 'da-003',
    touringExhibitionId: 'tour-001',
    theme: '非遗综合讲解',
    docentDate: '2024-07-06',
    startTime: '10:00',
    endTime: '11:30',
    venueId: 'venue-001',
    artworkIds: ['art-001', 'art-002', 'art-005'],
    manager: '王管理员',
    volunteerAssignments: [
      { volunteerId: 'vol-001', role: '主讲' },
      { volunteerId: 'vol-005', role: '助理' }
    ],
    expectedAttendees: 40,
    status: 'scheduled',
    actualAttendees: null,
    audienceFeedback: '',
    exceptionRemarks: '',
    createdAt: '2024-06-28T14:00:00.000Z',
    updatedAt: '2024-06-28T14:00:00.000Z'
  }
];

export const store = {
  artworks,
  exhibitions,
  subscriptions,
  pickupRecords,
  revenueRecords,
  handoverRecords,
  touringVenues,
  touringExhibitions,
  transportBatches,
  insuranceClaims,
  volunteers,
  docentActivities,

  addArtwork(artwork: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Artwork {
    const newArtwork: Artwork = {
      ...artwork,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.artworks.push(newArtwork);
    return newArtwork;
  },

  updateArtwork(id: string, updates: Partial<Artwork>): Artwork | null {
    const index = this.artworks.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.artworks[index] = {
      ...this.artworks[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.artworks[index];
  },

  deleteArtwork(id: string): boolean {
    const index = this.artworks.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.artworks.splice(index, 1);
    return true;
  },

  addExhibition(exhibition: Omit<Exhibition, 'id'>): Exhibition {
    const newExhibition: Exhibition = {
      ...exhibition,
      id: uuidv4()
    };
    this.exhibitions.push(newExhibition);
    return newExhibition;
  },

  updateExhibition(id: string, updates: Partial<Exhibition>): Exhibition | null {
    const index = this.exhibitions.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.exhibitions[index] = { ...this.exhibitions[index], ...updates, id };
    return this.exhibitions[index];
  },

  deleteExhibition(id: string): boolean {
    const index = this.exhibitions.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.exhibitions.splice(index, 1);
    return true;
  },

  addSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'queueNumber'>): Subscription {
    const queueNumber = this.subscriptions.filter(s => s.artworkId === subscription.artworkId).length + 1;
    const newSubscription: Subscription = {
      ...subscription,
      id: uuidv4(),
      queueNumber,
      createdAt: new Date().toISOString()
    };
    this.subscriptions.push(newSubscription);
    return newSubscription;
  },

  updateSubscription(id: string, updates: Partial<Subscription>): Subscription | null {
    const index = this.subscriptions.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.subscriptions[index] = { ...this.subscriptions[index], ...updates, id };
    return this.subscriptions[index];
  },

  deleteSubscription(id: string): boolean {
    const index = this.subscriptions.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.subscriptions.splice(index, 1);
    return true;
  },

  addPickupRecord(record: Omit<PickupRecord, 'id'>): PickupRecord {
    const newRecord: PickupRecord = {
      ...record,
      id: uuidv4()
    };
    this.pickupRecords.push(newRecord);
    return newRecord;
  },

  addRevenueRecord(record: Omit<RevenueRecord, 'id'>): RevenueRecord {
    const newRecord: RevenueRecord = {
      ...record,
      id: uuidv4()
    };
    this.revenueRecords.push(newRecord);
    return newRecord;
  },

  updateRevenueRecord(id: string, updates: Partial<RevenueRecord>): RevenueRecord | null {
    const index = this.revenueRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.revenueRecords[index] = { ...this.revenueRecords[index], ...updates, id };
    return this.revenueRecords[index];
  },

  deleteRevenueRecord(id: string): boolean {
    const index = this.revenueRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.revenueRecords.splice(index, 1);
    return true;
  },

  addHandoverRecord(record: Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>): HandoverRecord {
    const newRecord: HandoverRecord = {
      ...record,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.handoverRecords.push(newRecord);
    return newRecord;
  },

  updateHandoverRecord(id: string, updates: Partial<HandoverRecord>): HandoverRecord | null {
    const index = this.handoverRecords.findIndex(h => h.id === id);
    if (index === -1) return null;
    this.handoverRecords[index] = {
      ...this.handoverRecords[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.handoverRecords[index];
  },

  deleteHandoverRecord(id: string): boolean {
    const index = this.handoverRecords.findIndex(h => h.id === id);
    if (index === -1) return false;
    this.handoverRecords.splice(index, 1);
    return true;
  },

  getLatestHandoverByArtwork(artworkId: string): HandoverRecord | null {
    const records = this.handoverRecords
      .filter(h => h.artworkId === artworkId)
      .sort((a, b) => new Date(b.handoverTime).getTime() - new Date(a.handoverTime).getTime());
    return records.length > 0 ? records[0] : null;
  },

  addTouringVenue(venue: Omit<TouringVenue, 'id' | 'createdAt' | 'updatedAt'>): TouringVenue {
    const newVenue: TouringVenue = {
      ...venue,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.touringVenues.push(newVenue);
    return newVenue;
  },

  updateTouringVenue(id: string, updates: Partial<TouringVenue>): TouringVenue | null {
    const index = this.touringVenues.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.touringVenues[index] = {
      ...this.touringVenues[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.touringVenues[index];
  },

  deleteTouringVenue(id: string): boolean {
    const index = this.touringVenues.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.touringVenues.splice(index, 1);
    return true;
  },

  isDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    return s1 <= e2 && s2 <= e1;
  },

  checkVenueConflict(venueId: string, startDate: string, endDate: string, excludeId?: string): TouringExhibition | null {
    for (const ex of this.touringExhibitions) {
      if (ex.id === excludeId) continue;
      if (ex.reviewStatus === 'canceled' || ex.reviewStatus === 'rejected') continue;
      if (ex.venueId !== venueId) continue;
      if (this.isDateOverlap(startDate, endDate, ex.startDate, ex.endDate)) {
        return ex;
      }
    }
    return null;
  },

  checkArtworkConflict(artworkIds: string[], startDate: string, endDate: string, excludeId?: string): string[] {
    const conflictArtworks: string[] = [];
    for (const artworkId of artworkIds) {
      for (const ex of this.touringExhibitions) {
        if (ex.id === excludeId) continue;
        if (ex.reviewStatus === 'canceled' || ex.reviewStatus === 'rejected') continue;
        if (!ex.artworkIds.includes(artworkId)) continue;
        if (this.isDateOverlap(startDate, endDate, ex.startDate, ex.endDate)) {
          if (!conflictArtworks.includes(artworkId)) {
            conflictArtworks.push(artworkId);
          }
          break;
        }
      }
    }
    return conflictArtworks;
  },

  getArtworkTouringInfo(artworkId: string): { isOccupied: boolean; currentTouring: TouringExhibition | null; latestTouring: TouringExhibition | null } {
    const now = new Date().toISOString().split('T')[0];
    const relevantExhibitions = this.touringExhibitions
      .filter(ex => ex.artworkIds.includes(artworkId) && ex.reviewStatus === 'approved');
    
    const currentTouring = relevantExhibitions.find(ex => 
      this.isDateOverlap(now, now, ex.startDate, ex.endDate)
    ) || null;

    const latestTouring = relevantExhibitions.length > 0
      ? relevantExhibitions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    return {
      isOccupied: !!currentTouring,
      currentTouring,
      latestTouring
    };
  },

  addTouringExhibition(exhibition: Omit<TouringExhibition, 'id' | 'createdAt' | 'updatedAt' | 'reviewStatus' | 'rejectionReason'>): TouringExhibition {
    const newExhibition: TouringExhibition = {
      ...exhibition,
      id: uuidv4(),
      reviewStatus: 'pending',
      rejectionReason: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.touringExhibitions.push(newExhibition);
    return newExhibition;
  },

  updateTouringExhibition(id: string, updates: Partial<TouringExhibition>): TouringExhibition | null {
    const index = this.touringExhibitions.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.touringExhibitions[index] = {
      ...this.touringExhibitions[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.touringExhibitions[index];
  },

  reviewTouringExhibition(id: string, status: 'approved' | 'rejected', rejectionReason?: string): TouringExhibition | null {
    const index = this.touringExhibitions.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.touringExhibitions[index] = {
      ...this.touringExhibitions[index],
      reviewStatus: status,
      rejectionReason: status === 'rejected' ? (rejectionReason || '') : '',
      updatedAt: new Date().toISOString()
    };
    return this.touringExhibitions[index];
  },

  cancelTouringExhibition(id: string): TouringExhibition | null {
    const index = this.touringExhibitions.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.touringExhibitions[index] = {
      ...this.touringExhibitions[index],
      reviewStatus: 'canceled',
      updatedAt: new Date().toISOString()
    };
    return this.touringExhibitions[index];
  },

  getActiveTransportBatchByTouring(touringExhibitionId: string): TransportBatch | null {
    return this.transportBatches.find(
      b => b.touringExhibitionId === touringExhibitionId && b.transportStatus !== 'canceled'
    ) || null;
  },

  getTransportBatchesByTouring(touringExhibitionId: string): TransportBatch[] {
    return this.transportBatches.filter(b => b.touringExhibitionId === touringExhibitionId);
  },

  getClaimsByBatch(batchId: string): InsuranceClaim[] {
    return this.insuranceClaims.filter(c => c.transportBatchId === batchId);
  },

  getClaimsByArtwork(artworkId: string): InsuranceClaim[] {
    return this.insuranceClaims.filter(c => c.artworkId === artworkId);
  },

  addTransportBatch(batch: Omit<TransportBatch, 'id' | 'createdAt' | 'updatedAt'>): TransportBatch {
    const newBatch: TransportBatch = {
      ...batch,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.transportBatches.push(newBatch);
    return newBatch;
  },

  updateTransportBatch(id: string, updates: Partial<TransportBatch>): TransportBatch | null {
    const index = this.transportBatches.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.transportBatches[index] = {
      ...this.transportBatches[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.transportBatches[index];
  },

  setTransportArtworkChecks(id: string, artworkChecks: TransportArtworkCheck[]): TransportBatch | null {
    const index = this.transportBatches.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.transportBatches[index] = {
      ...this.transportBatches[index],
      artworkChecks,
      updatedAt: new Date().toISOString()
    };
    return this.transportBatches[index];
  },

  addInsuranceClaim(claim: Omit<InsuranceClaim, 'id' | 'createdAt' | 'updatedAt'>): InsuranceClaim {
    const newClaim: InsuranceClaim = {
      ...claim,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.insuranceClaims.push(newClaim);
    return newClaim;
  },

  updateInsuranceClaim(id: string, updates: Partial<InsuranceClaim>): InsuranceClaim | null {
    const index = this.insuranceClaims.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.insuranceClaims[index] = {
      ...this.insuranceClaims[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.insuranceClaims[index];
  },

  getLatestTransportCheckByArtwork(artworkId: string): { batch: TransportBatch; check: TransportArtworkCheck } | null {
    const checks = this.transportBatches
      .filter(b => b.transportStatus !== 'canceled')
      .map(b => ({ batch: b, check: b.artworkChecks.find(c => c.artworkId === artworkId) }))
      .filter(item => !!item.check)
      .sort((a, b) => new Date(b.batch.actualOutboundTime || b.batch.plannedOutboundTime || b.batch.createdAt).getTime()
        - new Date(a.batch.actualOutboundTime || a.batch.plannedOutboundTime || a.batch.createdAt).getTime());
    return checks.length > 0 ? { batch: checks[0].batch, check: checks[0].check! } : null;
  },

  addVolunteer(volunteer: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>): Volunteer {
    const newVolunteer: Volunteer = {
      ...volunteer,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.volunteers.push(newVolunteer);
    return newVolunteer;
  },

  updateVolunteer(id: string, updates: Partial<Volunteer>): Volunteer | null {
    const index = this.volunteers.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.volunteers[index] = {
      ...this.volunteers[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.volunteers[index];
  },

  deleteVolunteer(id: string): boolean {
    const index = this.volunteers.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.volunteers.splice(index, 1);
    return true;
  },

  addDocentActivity(activity: Omit<DocentActivity, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'actualAttendees' | 'audienceFeedback' | 'exceptionRemarks'>): DocentActivity {
    const newActivity: DocentActivity = {
      ...activity,
      id: uuidv4(),
      status: 'scheduled',
      actualAttendees: null,
      audienceFeedback: '',
      exceptionRemarks: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.docentActivities.push(newActivity);
    return newActivity;
  },

  updateDocentActivity(id: string, updates: Partial<DocentActivity>): DocentActivity | null {
    const index = this.docentActivities.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.docentActivities[index] = {
      ...this.docentActivities[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return this.docentActivities[index];
  },

  setDocentActivityStatus(id: string, status: DocentActivityStatus): DocentActivity | null {
    return this.updateDocentActivity(id, { status });
  },

  registerDocentAttendance(id: string, actualAttendees: number, audienceFeedback: string, exceptionRemarks: string): DocentActivity | null {
    return this.updateDocentActivity(id, { actualAttendees, audienceFeedback, exceptionRemarks });
  },

  timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  },

  isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);
    return s1 < e2 && s2 < e1;
  },

  checkVolunteerConflict(volunteerId: string, docentDate: string, startTime: string, endTime: string, excludeActivityId?: string): DocentActivity | null {
    for (const activity of this.docentActivities) {
      if (activity.id === excludeActivityId) continue;
      if (activity.status === 'canceled') continue;
      if (activity.docentDate !== docentDate) continue;
      if (!activity.volunteerAssignments.some(a => a.volunteerId === volunteerId)) continue;
      if (this.isTimeOverlap(startTime, endTime, activity.startTime, activity.endTime)) {
        return activity;
      }
    }
    return null;
  },

  getDocentActivitiesByTouring(touringExhibitionId: string): DocentActivity[] {
    return this.docentActivities
      .filter(a => a.touringExhibitionId === touringExhibitionId)
      .sort((a, b) => a.docentDate.localeCompare(b.docentDate) || a.startTime.localeCompare(b.startTime));
  },

  getDocentActivitiesByArtwork(artworkId: string): DocentActivity[] {
    return this.docentActivities
      .filter(a => a.artworkIds.includes(artworkId) && a.status !== 'canceled')
      .sort((a, b) => new Date(b.docentDate).getTime() - new Date(a.docentDate).getTime());
  },

  getLatestDocentActivityByArtwork(artworkId: string): DocentActivity | null {
    const activities = this.getDocentActivitiesByArtwork(artworkId);
    return activities.length > 0 ? activities[0] : null;
  },

  getVolunteerServiceCount(volunteerId: string): number {
    return this.docentActivities
      .filter(a => a.status !== 'canceled' && a.volunteerAssignments.some(v => v.volunteerId === volunteerId))
      .length;
  }
};
