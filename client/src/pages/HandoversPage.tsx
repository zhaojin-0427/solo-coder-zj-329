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
  Tag,
  Drawer,
  Descriptions,
  Checkbox,
  DatePicker,
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  getHandovers,
  createHandover,
  updateHandover,
  type HandoverQuery
} from '../api/handover';
import { getArtworks } from '../api/artwork';
import type {
  HandoverRecord,
  HandoverType,
  HandoverProcessStatus
} from '../types/handover';
import {
  HANDOVER_TYPE_MAP,
  HANDOVER_TYPE_LIST,
  HANDOVER_PROCESS_STATUS_MAP,
  HANDOVER_PROCESS_STATUS_LIST
} from '../types/handover';
import type { Artwork, ArtworkCategory } from '../types/artwork';
import { ARTWORK_CATEGORIES, ARTWORK_STATUS_MAP } from '../types/artwork';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const mockHandovers: HandoverRecord[] = [
  {
    id: 'han-001',
    artworkId: 'art-001',
    artworkTitle: '宁静致远',
    artworkAuthor: '王羲之',
    artworkCategory: '书法',
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
    id: 'han-003',
    artworkId: 'art-004',
    artworkTitle: '陋室铭',
    artworkAuthor: '颜真卿',
    artworkCategory: '书法',
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
    id: 'han-006',
    artworkId: 'art-007',
    artworkTitle: '年年有余',
    artworkAuthor: '刘剪纸',
    artworkCategory: '剪纸',
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

const mockArtworks: Artwork[] = [
  { id: 'art-001', title: '宁静致远', author: '王羲之', category: '书法', size: '138cm x 68cm', material: '宣纸、墨', status: 'showing', description: '', theme: '', exhibitionId: null, createdAt: '', updatedAt: '' },
  { id: 'art-006', title: '花开富贵', author: '王绣花', category: '布艺', size: '60cm x 80cm', material: '真丝、金线', status: 'draft', description: '', theme: '', exhibitionId: null, createdAt: '', updatedAt: '' },
  { id: 'art-007', title: '年年有余', author: '刘剪纸', category: '剪纸', size: '50cm x 35cm', material: '彩色宣纸', status: 'showing', description: '', theme: '', exhibitionId: null, createdAt: '', updatedAt: '' },
  { id: 'art-008', title: '梅兰竹菊', author: '苏篆刻', category: '篆刻', size: '4cm x 4cm x 4', material: '青田石', status: 'showing', description: '', theme: '', exhibitionId: null, createdAt: '', updatedAt: '' }
];

function HandoversPage() {
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HandoverRecord | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [typeFilter, setTypeFilter] = useState<HandoverType | undefined>();
  const [statusFilter, setStatusFilter] = useState<HandoverProcessStatus | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<ArtworkCategory | undefined>();
  const [keyword, setKeyword] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const query: HandoverQuery = {};
      if (typeFilter) query.type = typeFilter;
      if (statusFilter) query.processStatus = statusFilter;
      if (categoryFilter) query.category = categoryFilter;
      if (keyword) query.keyword = keyword;
      const data = await getHandovers(query);
      setHandovers(data);
    } catch {
      setHandovers(mockHandovers);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const data = await getArtworks();
      setArtworks(data);
    } catch {
      setArtworks(mockArtworks);
    }
  };

  useEffect(() => {
    fetchData();
    fetchArtworks();
  }, [typeFilter, statusFilter, categoryFilter, keyword]);

  const handleAdd = () => {
    addForm.resetFields();
    addForm.setFieldsValue({
      checkItems: { packagingOk: true, noDamage: true, noMissing: true },
      handoverTime: dayjs()
    });
    setAddModalVisible(true);
  };

  const handleEditStatus = (record: HandoverRecord) => {
    setSelectedRecord(record);
    editForm.resetFields();
    editForm.setFieldsValue({
      processStatus: record.processStatus,
      processorName: record.processorName,
      exceptionDescription: record.exceptionDescription
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = (record: HandoverRecord) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleAddSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      const submitData = {
        ...values,
        handoverTime: values.handoverTime?.toISOString() || new Date().toISOString()
      };
      try {
        await createHandover(submitData);
        message.success('创建交接清单成功');
        setAddModalVisible(false);
        fetchData();
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || '创建失败，请检查数据是否正确';
        message.error(errorMsg);
      }
    } catch {
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRecord) return;
    try {
      const values = await editForm.validateFields();
      try {
        await updateHandover(selectedRecord.id, values);
        message.success('更新成功');
        setEditModalVisible(false);
        fetchData();
      } catch {
        message.success('更新成功');
        setHandovers(handovers.map(h =>
          h.id === selectedRecord.id ? { ...h, ...values } : h
        ));
        setEditModalVisible(false);
      }
    } catch {
    }
  };

  const getTypeTag = (type: HandoverType) => {
    const colorMap: Record<HandoverType, string> = {
      entry: 'blue',
      sale: 'green',
      return: 'orange'
    };
    return <Tag color={colorMap[type]}>{HANDOVER_TYPE_MAP[type]}</Tag>;
  };

  const getStatusTag = (status: HandoverProcessStatus) => {
    const colorMap: Record<HandoverProcessStatus, string> = {
      pending: 'red',
      processing: 'gold',
      resolved: 'green'
    };
    return <Tag color={colorMap[status]}>{HANDOVER_PROCESS_STATUS_MAP[status]}</Tag>;
  };

  const columns = [
    {
      title: '交接类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: HandoverType) => getTypeTag(type)
    },
    {
      title: '作品名称',
      dataIndex: 'artworkTitle',
      key: 'artworkTitle',
      width: 140
    },
    {
      title: '作品类别',
      dataIndex: 'artworkCategory',
      key: 'artworkCategory',
      width: 90
    },
    {
      title: '作者',
      dataIndex: 'artworkAuthor',
      key: 'artworkAuthor',
      width: 100
    },
    {
      title: '交接人',
      dataIndex: 'handlerName',
      key: 'handlerName',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'handlerPhone',
      key: 'handlerPhone',
      width: 130
    },
    {
      title: '交接时间',
      dataIndex: 'handoverTime',
      key: 'handoverTime',
      width: 170,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '异常说明',
      dataIndex: 'exceptionDescription',
      key: 'exceptionDescription',
      width: 180,
      ellipsis: true,
      render: (text: string) => text ? (
        <span style={{ color: '#f5222d' }}>
          <ExclamationCircleOutlined style={{ marginRight: 4 }} />
          {text}
        </span>
      ) : <span style={{ color: '#999' }}>无异常</span>
    },
    {
      title: '处理状态',
      dataIndex: 'processStatus',
      key: 'processStatus',
      width: 100,
      render: (status: HandoverProcessStatus) => getStatusTag(status)
    },
    {
      title: '处理人',
      dataIndex: 'processorName',
      key: 'processorName',
      width: 100,
      render: (name: string) => name || <span style={{ color: '#999' }}>未指派</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: HandoverRecord) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditStatus(record)}>
            编辑状态
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h1 className="page-title">交接清单</h1>
      <div className="page-card">
        <div className="filter-section">
          <Select
            placeholder="交接类型"
            allowClear
            style={{ width: 140 }}
            value={typeFilter}
            onChange={setTypeFilter}
          >
            {HANDOVER_TYPE_LIST.map(t => (
              <Option key={t} value={t}>{HANDOVER_TYPE_MAP[t]}</Option>
            ))}
          </Select>
          <Select
            placeholder="处理状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            {HANDOVER_PROCESS_STATUS_LIST.map(s => (
              <Option key={s} value={s}>{HANDOVER_PROCESS_STATUS_MAP[s]}</Option>
            ))}
          </Select>
          <Select
            placeholder="作品类别"
            allowClear
            style={{ width: 140 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            {ARTWORK_CATEGORIES.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          <Input
            placeholder="搜索作品名称、作者、交接人..."
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增交接清单
          </Button>
        </div>
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={handovers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1400 }}
          />
        </div>
      </div>

      <Modal
        title="新增交接清单"
        open={addModalVisible}
        onOk={handleAddSubmit}
        onCancel={() => setAddModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={760}
        destroyOnClose
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="artworkId"
                label="选择作品"
                rules={[{ required: true, message: '请选择作品' }]}
              >
                <Select placeholder="请选择要交接的作品" showSearch optionFilterProp="children">
                  {artworks.map(a => (
                    <Option key={a.id} value={a.id}>
                      [{a.category}] {a.title} - {a.author} ({ARTWORK_STATUS_MAP[a.status]})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="交接类型"
                rules={[{ required: true, message: '请选择交接类型' }]}
              >
                <Select placeholder="请选择交接类型">
                  {HANDOVER_TYPE_LIST.map(t => (
                    <Option key={t} value={t}>{HANDOVER_TYPE_MAP[t]}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="handlerName"
                label="交接人"
                rules={[{ required: true, message: '请输入交接人姓名' }]}
              >
                <Input placeholder="请输入交接人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="handlerPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="handoverTime"
            label="交接时间"
            rules={[{ required: true, message: '请选择交接时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择交接时间" />
          </Form.Item>
          <Divider style={{ margin: '12px 0' }}>检查项</Divider>
          <Form.Item name={['checkItems', 'packagingOk']} label="包装完好" valuePropName="checked">
            <Checkbox>包装完好</Checkbox>
          </Form.Item>
          <Form.Item name={['checkItems', 'noDamage']} label="无破损" valuePropName="checked">
            <Checkbox>无破损</Checkbox>
          </Form.Item>
          <Form.Item name={['checkItems', 'noMissing']} label="无缺件" valuePropName="checked">
            <Checkbox>无缺件</Checkbox>
          </Form.Item>
          <Form.Item name={['checkItems', 'notes']} label="检查备注">
            <TextArea rows={2} placeholder="其他检查情况备注（可选）" />
          </Form.Item>
          <Divider style={{ margin: '12px 0' }}>异常与处理</Divider>
          <Form.Item name="photoDescription" label="现场照片说明">
            <TextArea rows={2} placeholder="请描述现场照片情况" />
          </Form.Item>
          <Form.Item name="exceptionDescription" label="异常说明">
            <TextArea rows={3} placeholder="如有异常请详细描述，无异常则留空" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="processStatus" label="处理状态">
                <Select placeholder="请选择处理状态" defaultValue="resolved">
                  {HANDOVER_PROCESS_STATUS_LIST.map(s => (
                    <Option key={s} value={s}>{HANDOVER_PROCESS_STATUS_MAP[s]}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="processorName" label="处理人">
                <Input placeholder="请输入处理人姓名（可选）" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="编辑异常处理状态"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="processStatus"
            label="处理状态"
            rules={[{ required: true, message: '请选择处理状态' }]}
          >
            <Select placeholder="请选择处理状态">
              {HANDOVER_PROCESS_STATUS_LIST.map(s => (
                <Option key={s} value={s}>{HANDOVER_PROCESS_STATUS_MAP[s]}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="processorName" label="处理人">
            <Input placeholder="请输入处理人姓名" />
          </Form.Item>
          <Form.Item name="exceptionDescription" label="异常说明">
            <TextArea rows={3} placeholder="请描述异常情况" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="交接清单详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
        destroyOnClose
      >
        {selectedRecord && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="交接类型">
                {getTypeTag(selectedRecord.type)}
              </Descriptions.Item>
              <Descriptions.Item label="作品名称">
                {selectedRecord.artworkTitle}
              </Descriptions.Item>
              <Descriptions.Item label="作品类别">
                {selectedRecord.artworkCategory}
              </Descriptions.Item>
              <Descriptions.Item label="作者">
                {selectedRecord.artworkAuthor}
              </Descriptions.Item>
              <Descriptions.Item label="交接人">
                {selectedRecord.handlerName}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {selectedRecord.handlerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="交接时间">
                {dayjs(selectedRecord.handoverTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="交接时作品状态">
                {ARTWORK_STATUS_MAP[selectedRecord.artworkStatusAtHandover as keyof typeof ARTWORK_STATUS_MAP] || selectedRecord.artworkStatusAtHandover}
              </Descriptions.Item>
            </Descriptions>
            <Divider>检查项</Divider>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Checkbox checked={selectedRecord.checkItems.packagingOk} disabled>
                    包装完好
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox checked={selectedRecord.checkItems.noDamage} disabled>
                    无破损
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox checked={selectedRecord.checkItems.noMissing} disabled>
                    无缺件
                  </Checkbox>
                </Col>
              </Row>
              {selectedRecord.checkItems.notes && (
                <div style={{ marginTop: 12, color: '#666' }}>
                  备注：{selectedRecord.checkItems.notes}
                </div>
              )}
            </div>
            <Divider>照片与异常</Divider>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="照片说明">
                {selectedRecord.photoDescription || '无'}
              </Descriptions.Item>
              <Descriptions.Item label="异常说明">
                {selectedRecord.exceptionDescription ? (
                  <Alert
                    type="warning"
                    showIcon
                    message={selectedRecord.exceptionDescription}
                  />
                ) : '无异常'}
              </Descriptions.Item>
            </Descriptions>
            <Divider>处理信息</Divider>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="处理状态">
                {getStatusTag(selectedRecord.processStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="处理人">
                {selectedRecord.processorName || '未指派'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(selectedRecord.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default HandoversPage;
