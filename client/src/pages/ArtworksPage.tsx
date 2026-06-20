import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Select,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Descriptions,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import {
  getArtworks,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  getArtworkTouringInfo
} from '../api/artwork';
import { getHandovers } from '../api/handover';
import type { Artwork, ArtworkStatus, ArtworkCategory } from '../types/artwork';
import { ARTWORK_STATUS_MAP, ARTWORK_CATEGORIES } from '../types/artwork';
import type { HandoverRecord } from '../types/handover';
import { HANDOVER_TYPE_MAP, HANDOVER_PROCESS_STATUS_MAP } from '../types/handover';
import type { ArtworkTouringInfo } from '../types/touringExhibition';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const mockArtworks: Artwork[] = [
  { id: 'art-001', title: '锦绣山河', author: '李锦绣', category: '书法', size: '138×69cm', material: '宣纸、墨', status: 'showing', description: '行书作品，书写大气磅礴', theme: '山水', exhibitionId: 'exh-001', createdAt: '2024-01-15', updatedAt: '2024-01-20' },
  { id: 'art-002', title: '迎春纳福', author: '王艺剪', category: '剪纸', size: '50×50cm', material: '红色宣纸', status: 'showing', description: '传统剪纸艺术，寓意吉祥', theme: '春节', exhibitionId: 'exh-001', createdAt: '2024-02-10', updatedAt: '2024-02-15' },
  { id: 'art-003', title: '布艺老虎', author: '陈锦绣', category: '布艺', size: '30×20cm', material: '棉布、丝线', status: 'sold', description: '传统布艺老虎，手工缝制', theme: '民俗', exhibitionId: null, createdAt: '2024-01-20', updatedAt: '2024-02-28' },
  { id: 'art-004', title: '松鹤延年', author: '赵篆刻', category: '篆刻', size: '3×3×6cm', material: '寿山石', status: 'draft', description: '篆刻印章作品', theme: '长寿', exhibitionId: null, createdAt: '2024-03-05', updatedAt: '2024-03-05' },
  { id: 'art-005', title: '花开富贵', author: '王艺剪', category: '剪纸', size: '60×40cm', material: '彩色宣纸', status: 'returned', description: '精美剪纸作品', theme: '花卉', exhibitionId: 'exh-002', createdAt: '2024-02-25', updatedAt: '2024-03-15' },
  { id: 'art-006', title: '宁静致远', author: '李锦绣', category: '书法', size: '180×97cm', material: '宣纸、墨', status: 'showing', description: '楷书作品，笔力遒劲', theme: '励志', exhibitionId: 'exh-002', createdAt: '2024-03-01', updatedAt: '2024-03-10' }
];

function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Artwork | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Artwork | null>(null);
  const [viewingTouringInfo, setViewingTouringInfo] = useState<ArtworkTouringInfo | null>(null);
  const [form] = Form.useForm();
  const [categoryFilter, setCategoryFilter] = useState<ArtworkCategory | undefined>();
  const [statusFilter, setStatusFilter] = useState<ArtworkStatus | undefined>();
  const [keyword, setKeyword] = useState('');
  
  const [touringInfoMap, setTouringInfoMap] = useState<Record<string, ArtworkTouringInfo>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getArtworks({ category: categoryFilter, status: statusFilter, keyword });
      setArtworks(data);
    } catch {
      setArtworks(mockArtworks);
    } finally {
      setLoading(false);
    }
  };

  const fetchHandovers = async () => {
    try {
      const data = await getHandovers();
      setHandovers(data);
    } catch {
      setHandovers([]);
    }
  };

  const fetchTouringInfo = async (artworkIds: string[]) => {
    const infoMap: Record<string, ArtworkTouringInfo> = {};
    await Promise.all(
      artworkIds.map(async (id) => {
        try {
          const info = await getArtworkTouringInfo(id);
          infoMap[id] = info;
        } catch {
        }
      })
    );
    setTouringInfoMap(infoMap);
  };

  useEffect(() => {
    fetchData();
    fetchHandovers();
  }, [categoryFilter, statusFilter, keyword]);

  useEffect(() => {
    if (artworks.length > 0) {
      fetchTouringInfo(artworks.map(a => a.id));
    }
  }, [artworks]);

  const handleViewDetail = async (record: Artwork) => {
    setViewingRecord(record);
    try {
      const info = await getArtworkTouringInfo(record.id);
      setViewingTouringInfo(info);
    } catch {
      setViewingTouringInfo(null);
    }
    setDetailModalVisible(true);
  };

  const getLatestHandover = (artworkId: string): HandoverRecord | null => {
    const records = handovers
      .filter(h => h.artworkId === artworkId)
      .sort((a, b) => new Date(b.handoverTime).getTime() - new Date(a.handoverTime).getTime());
    return records.length > 0 ? records[0] : null;
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Artwork) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArtwork(id);
      message.success('删除成功');
      fetchData();
    } catch {
      setArtworks(artworks.filter(item => item.id !== id));
      message.success('删除成功');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await updateArtwork(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createArtwork(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch {
      if (editingRecord) {
        setArtworks(artworks.map(item =>
          item.id === editingRecord.id ? { ...item, ...form.getFieldsValue() } : item
        ));
        message.success('更新成功');
      } else {
        const newArtwork: Artwork = {
          ...form.getFieldsValue(),
          id: `art-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setArtworks([...artworks, newArtwork]);
        message.success('创建成功');
      }
      setModalVisible(false);
    }
  };

  const getStatusTag = (status: ArtworkStatus) => {
    const colorMap: Record<ArtworkStatus, string> = {
      draft: 'default',
      showing: 'blue',
      returned: 'orange',
      sold: 'green'
    };
    return <Tag color={colorMap[status]}>{ARTWORK_STATUS_MAP[status]}</Tag>;
  };

  const columns = [
    {
      title: '作品名称',
      dataIndex: 'title',
      key: 'title',
      width: 160
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      key: 'size',
      width: 140
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
      width: 140
    },
    {
      title: '主题',
      dataIndex: 'theme',
      key: 'theme',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ArtworkStatus) => getStatusTag(status)
    },
    {
      title: '最近交接',
      key: 'latestHandover',
      width: 200,
      render: (_: unknown, record: Artwork) => {
        const latest = getLatestHandover(record.id);
        if (!latest) {
          return <span style={{ color: '#999' }}>暂无交接记录</span>;
        }
        const typeColor: Record<string, string> = { entry: 'blue', sale: 'green', return: 'orange' };
        const statusColor: Record<string, string> = { pending: 'red', processing: 'gold', resolved: 'green' };
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Tag color={typeColor[latest.type]} style={{ marginRight: 6 }}>
                {HANDOVER_TYPE_MAP[latest.type]}
              </Tag>
              <Tag color={statusColor[latest.processStatus]}>
                {HANDOVER_PROCESS_STATUS_MAP[latest.processStatus]}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {dayjs(latest.handoverTime).format('MM-DD HH:mm')} · {latest.handlerName}
            </div>
          </div>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120
    },
    {
      title: '巡展状态',
      key: 'touringStatus',
      width: 140,
      render: (_: unknown, record: Artwork) => {
        const info = touringInfoMap[record.id];
        if (!info || !info.isOccupied) {
          return <Tag color="default">未占用</Tag>;
        }
        return (
          <Tooltip title={`巡展场地：${info.currentTouring?.venueName || ''}\n展期：${info.currentTouring?.startDate} ~ ${info.currentTouring?.endDate}`}>
            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
              巡展占用中
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '最近巡展',
      key: 'latestTouring',
      width: 180,
      render: (_: unknown, record: Artwork) => {
        const info = touringInfoMap[record.id];
        if (!info?.latestTouring) {
          return <span style={{ color: '#999' }}>暂无</span>;
        }
        return (
          <Tooltip title={`预约单位：${info.latestTouring.bookingUnit}`}>
            <div>
              <Tag color="blue" style={{ marginRight: 6 }}>
                {info.latestTouring.venueName || '-'}
              </Tag>
              <div style={{ fontSize: 12, color: '#999' }}>
                {info.latestTouring.startDate} ~ {info.latestTouring.endDate}
              </div>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: Artwork) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个作品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h1 className="page-title">作品档案</h1>
      <div className="page-card">
        <div className="filter-section">
          <Select
            placeholder="选择类别"
            allowClear
            style={{ width: 140 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            {ARTWORK_CATEGORIES.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            {Object.entries(ARTWORK_STATUS_MAP).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
          <Input
            placeholder="搜索作品名称或作者"
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增作品
          </Button>
        </div>
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={artworks}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1500 }}
          />
        </div>
      </div>

      <Modal
        title={editingRecord ? '编辑作品' : '新增作品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={680}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="title"
            label="作品名称"
            rules={[{ required: true, message: '请输入作品名称' }]}
          >
            <Input placeholder="请输入作品名称" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="category"
              label="类别"
              rules={[{ required: true, message: '请选择类别' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择类别">
                {ARTWORK_CATEGORIES.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="author"
              label="作者"
              rules={[{ required: true, message: '请输入作者' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入作者" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="size"
              label="尺寸"
              rules={[{ required: true, message: '请输入尺寸' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="例如：138×69cm" />
            </Form.Item>
            <Form.Item
              name="material"
              label="材质"
              rules={[{ required: true, message: '请输入材质' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="例如：宣纸、墨" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="theme"
              label="主题"
              rules={[{ required: true, message: '请输入主题' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="例如：山水、花卉" />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择状态">
                {Object.entries(ARTWORK_STATUS_MAP).map(([value, label]) => (
                  <Option key={value} value={value}>{label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            name="exhibitionId"
            label="所属展期"
          >
            <Input placeholder="请输入展期ID（可选）" allowClear />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入作品描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="作品详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={720}
        destroyOnClose
      >
        {viewingRecord && (
          <div>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="作品名称" span={2}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{viewingRecord.title}</span>
              </Descriptions.Item>
              <Descriptions.Item label="类别">{viewingRecord.category}</Descriptions.Item>
              <Descriptions.Item label="作者">{viewingRecord.author}</Descriptions.Item>
              <Descriptions.Item label="尺寸">{viewingRecord.size}</Descriptions.Item>
              <Descriptions.Item label="材质">{viewingRecord.material}</Descriptions.Item>
              <Descriptions.Item label="主题">{viewingRecord.theme}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(viewingRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(viewingRecord.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {viewingRecord.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16 }}>
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 6 }} />
                巡展占用信息
              </div>
              {viewingTouringInfo ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ marginRight: 12 }}>当前状态：</span>
                    {viewingTouringInfo.isOccupied ? (
                      <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                        巡展占用中
                      </Tag>
                    ) : (
                      <Tag color="green">未占用</Tag>
                    )}
                  </div>
                  {viewingTouringInfo.currentTouring && (
                    <Descriptions title="当前巡展" bordered column={2} size="small" style={{ marginBottom: 12 }}>
                      <Descriptions.Item label="场地">
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {viewingTouringInfo.currentTouring.venueName || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="预约单位">
                        {viewingTouringInfo.currentTouring.bookingUnit}
                      </Descriptions.Item>
                      <Descriptions.Item label="展期" span={2}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {viewingTouringInfo.currentTouring.startDate} ~ {viewingTouringInfo.currentTouring.endDate}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                  {viewingTouringInfo.latestTouring && viewingTouringInfo.latestTouring.id !== viewingTouringInfo.currentTouring?.id && (
                    <Descriptions title="最近一次巡展预约" bordered column={2} size="small">
                      <Descriptions.Item label="场地">
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {viewingTouringInfo.latestTouring.venueName || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="预约单位">
                        {viewingTouringInfo.latestTouring.bookingUnit}
                      </Descriptions.Item>
                      <Descriptions.Item label="展期" span={2}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {viewingTouringInfo.latestTouring.startDate} ~ {viewingTouringInfo.latestTouring.endDate}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                  {!viewingTouringInfo.latestTouring && (
                    <div style={{ color: '#999', padding: '12px 0', textAlign: 'center' }}>
                      暂无巡展预约记录
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#999', padding: '12px 0', textAlign: 'center' }}>
                  暂无巡展信息
                </div>
              )}
            </div>

            {getLatestHandover(viewingRecord.id) && (
              <>
                <Divider />
                <Descriptions title="最近交接记录" bordered column={2} size="small">
                  <Descriptions.Item label="交接类型">
                    {(() => {
                      const h = getLatestHandover(viewingRecord.id)!;
                      const typeColor: Record<string, string> = { entry: 'blue', sale: 'green', return: 'orange' };
                      return <Tag color={typeColor[h.type]}>{HANDOVER_TYPE_MAP[h.type]}</Tag>;
                    })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="处理状态">
                    {(() => {
                      const h = getLatestHandover(viewingRecord.id)!;
                      const statusColor: Record<string, string> = { pending: 'red', processing: 'gold', resolved: 'green' };
                      return <Tag color={statusColor[h.processStatus]}>{HANDOVER_PROCESS_STATUS_MAP[h.processStatus]}</Tag>;
                    })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="交接人">
                    {getLatestHandover(viewingRecord.id)!.handlerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="交接时间">
                    {dayjs(getLatestHandover(viewingRecord.id)!.handoverTime).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ArtworksPage;
