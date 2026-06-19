import { v4 as uuidv4 } from 'uuid';
import type { Artwork } from '../types/artwork';
import type { Exhibition } from '../types/exhibition';
import type { Subscription } from '../types/subscription';
import type { PickupRecord } from '../types/pickup';

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

export const store = {
  artworks,
  exhibitions,
  subscriptions,
  pickupRecords,

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
  }
};
