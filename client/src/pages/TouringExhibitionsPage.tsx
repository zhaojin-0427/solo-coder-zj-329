import { useState, useEffect, useMemo } from 'react';
import {
  Tabs,
  Table,
  Button,
  Space,
  Select,
  Input,
  DatePicker,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Descriptions,
  Divider,
  Checkbox,
  Tooltip,
  List,
  Card,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TeamOutlined,
  CarOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  getTouringVenues,
  createTouringVenue,
  updateTouringVenue,
  deleteTouringVenue,
  getTouringExhibitions,
  createTouringExhibition,
  approveTouringExhibition,
  rejectTouringExhibition,
  cancelTouringExhibition,
  getTouringExhibition,
  checkArtworkConflict
} from '../api/touringExhibition';
import { getArtworks } from '../api/artwork';
import type { TouringVenue, TouringExhibition, TouringExhibitionReviewStatus } from '../types/touringExhibition';
import { TOURING_REVIEW_STATUS_MAP, TOURING_REVIEW_STATUS_COLOR, TRANSPORT_METHOD_OPTIONS } from '../types/touringExhibition';
import type { Artwork } from '../types/artwork';
import { ARTWORK_STATUS_MAP, ARTWORK_STATUS_COLOR } from '../types/artwork';
import { TRANSPORT_STATUS_MAP, TRANSPORT_STATUS_COLOR } from '../types/transportDelivery';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface ArtworkSelectItem extends Artwork {
  isConflict?: boolean;
  isOccupied?: boolean;
  isUnavailable?: boolean;
  conflictInfo?: string;
  unavailableInfo?: string;
}

function TouringExhibitionsPage() {
  const [activeTab, setActiveTab] = useState('venues');

  const [venues, setVenues] = useState<TouringVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueModalVisible, setVenueModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState<TouringVenue | null>(null);
  const [venueForm] = Form.useForm();
  const [venueKeyword, setVenueKeyword] = useState('');

  const [exhibitions, setExhibitions] = useState<TouringExhibition[]>([]);
  const [exhibitionsLoading, setExhibitionsLoading] = useState(false);
  const [exhibitionModalVisible, setExhibitionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentExhibition, setCurrentExhibition] = useState<TouringExhibition | null>(null);
  const [detailExhibition, setDetailExhibition] = useState<TouringExhibition | null>(null);
  const [exhibitionForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  
  const [filterVenueId, setFilterVenueId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<TouringExhibitionReviewStatus | undefined>();
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');

  const [artworks, setArtworks] = useState<ArtworkSelectItem[]>([]);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
  const [artworksChecking, setArtworksChecking] = useState(false);

  const fetchVenues = async () => {
    setVenuesLoading(true);
    try {
      const data = await getTouringVenues({ keyword: venueKeyword });
      setVenues(data);
    } catch (e) {
      console.error(e);
      setVenues([]);
    } finally {
      setVenuesLoading(false);
    }
  };

  const fetchExhibitions = async () => {
    setExhibitionsLoading(true);
    try {
      const params: any = {};
      if (filterVenueId) params.venueId = filterVenueId;
      if (filterStatus) params.reviewStatus = filterStatus;
      if (filterDateRange && filterDateRange[0]) params.startDate = filterDateRange[0].format('YYYY-MM-DD');
      if (filterDateRange && filterDateRange[1]) params.endDate = filterDateRange[1].format('YYYY-MM-DD');
      if (filterKeyword) params.keyword = filterKeyword;
      const data = await getTouringExhibitions(params);
      setExhibitions(data);
    } catch (e) {
      console.error(e);
      setExhibitions([]);
    } finally {
      setExhibitionsLoading(false);
    }
  };

  const fetchArtworks = async () => {
    try {
      const data = await getArtworks();
      setArtworks(data.map(a => {
        const isUnavailable = a.status === 'sold' || a.status === 'returned';
        return {
          ...a,
          isConflict: false,
          isOccupied: false,
          isUnavailable,
          unavailableInfo: isUnavailable
            ? `该作品已${a.status === 'sold' ? '成交' : '返还'}，不可用于巡展`
            : ''
        };
      }));
    } catch (e) {
      console.error(e);
      setArtworks([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'venues') {
      fetchVenues();
    }
  }, [activeTab, venueKeyword]);

  useEffect(() => {
    if (activeTab === 'exhibitions') {
      fetchExhibitions();
      fetchVenues();
      fetchArtworks();
    }
  }, [activeTab, filterVenueId, filterStatus, filterDateRange, filterKeyword]);

  const checkArtworkConflicts = async (startDate: string, endDate: string, excludeId?: string) => {
    setArtworksChecking(true);
    try {
      const updatedArtworks = await Promise.all(
        artworks.map(async (artwork) => {
          try {
            const result = await checkArtworkConflict(artwork.id, { startDate, endDate, excludeId });
            return {
              ...artwork,
              isConflict: result.isConflict,
              isOccupied: result.isOccupied,
              conflictInfo: result.isConflict 
                ? `该作品在 ${startDate} 至 ${endDate} 期间已被占用` 
                : result.isOccupied 
                  ? '该作品当前正在巡展中'
                  : ''
            };
          } catch {
            return artwork;
          }
        })
      );
      setArtworks(updatedArtworks);
    } finally {
      setArtworksChecking(false);
    }
  };

  const handleAddVenue = () => {
    setEditingVenue(null);
    venueForm.resetFields();
    setVenueModalVisible(true);
  };

  const handleEditVenue = (record: TouringVenue) => {
    setEditingVenue(record);
    venueForm.setFieldsValue(record);
    setVenueModalVisible(true);
  };

  const handleDeleteVenue = async (id: string) => {
    try {
      await deleteTouringVenue(id);
      message.success('删除成功');
      fetchVenues();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '删除失败');
    }
  };

  const handleVenueSubmit = async () => {
    try {
      const values = await venueForm.validateFields();
      if (editingVenue) {
        await updateTouringVenue(editingVenue.id, values);
        message.success('更新成功');
      } else {
        await createTouringVenue(values);
        message.success('创建成功');
      }
      setVenueModalVisible(false);
      fetchVenues();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleAddExhibition = () => {
    setCurrentExhibition(null);
    exhibitionForm.resetFields();
    setSelectedArtworkIds([]);
    setArtworks(artworks.map(a => ({ ...a, isConflict: false, isOccupied: false })));
    setExhibitionModalVisible(true);
  };

  const handleViewDetail = async (id: string) => {
    try {
      const data = await getTouringExhibition(id);
      setDetailExhibition(data);
      setDetailModalVisible(true);
    } catch (e) {
      message.error('获取详情失败');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTouringExhibition(id);
      message.success('审核通过');
      fetchExhibitions();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '审核失败');
    }
  };

  const handleOpenReject = (record: TouringExhibition) => {
    setCurrentExhibition(record);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      if (currentExhibition) {
        await rejectTouringExhibition(currentExhibition.id, values.rejectionReason);
        message.success('已驳回');
        setRejectModalVisible(false);
        fetchExhibitions();
      }
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelTouringExhibition(id);
      message.success('已取消预约');
      fetchExhibitions();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleExhibitionSubmit = async () => {
    try {
      const values = await exhibitionForm.validateFields();
      if (selectedArtworkIds.length === 0) {
        message.error('请至少选择一件作品');
        return;
      }
      const startDate = values.dateRange[0].format('YYYY-MM-DD');
      const endDate = values.dateRange[1].format('YYYY-MM-DD');
      const data = {
        bookingUnit: values.bookingUnit,
        bookingPerson: values.bookingPerson,
        contactPhone: values.contactPhone,
        startDate,
        endDate,
        venueId: values.venueId,
        artworkIds: selectedArtworkIds,
        transportMethod: values.transportMethod || '',
        setupManager: values.setupManager || ''
      };
      await createTouringExhibition(data);
      message.success('创建成功');
      setExhibitionModalVisible(false);
      fetchExhibitions();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const venueColumns: TableColumnsType<TouringVenue> = [
    { title: '场地名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson', width: 100 },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 140 },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { 
      title: '容纳作品数', 
      dataIndex: 'maxArtworkCount', 
      key: 'maxArtworkCount', 
      width: 100,
      render: (count: number) => `${count} 件`
    },
    { title: '开放时间', dataIndex: 'openHours', key: 'openHours', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: unknown, record: TouringVenue) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditVenue(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个场地吗？"
            description="删除前请确认该场地没有有效预约"
            onConfirm={() => handleDeleteVenue(record.id)}
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

  const exhibitionColumns: TableColumnsType<TouringExhibition> = [
    { title: '预约单位', dataIndex: 'bookingUnit', key: 'bookingUnit', width: 180 },
    { title: '预约人', dataIndex: 'bookingPerson', key: 'bookingPerson', width: 100 },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 130 },
    {
      title: '展期',
      key: 'dateRange',
      width: 200,
      render: (_: unknown, record: TouringExhibition) => (
        <span>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {record.startDate} ~ {record.endDate}
        </span>
      )
    },
    { title: '场地', dataIndex: 'venueName', key: 'venueName', width: 180 },
    {
      title: '作品数',
      key: 'artworkCount',
      width: 80,
      render: (_: unknown, record: TouringExhibition) => `${record.artworkIds.length} 件`
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 100,
      render: (status: TouringExhibitionReviewStatus) => (
        <Tag color={TOURING_REVIEW_STATUS_COLOR[status]}>
          {TOURING_REVIEW_STATUS_MAP[status]}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right' as const,
      render: (_: unknown, record: TouringExhibition) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          {record.reviewStatus === 'pending' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>
                通过
              </Button>
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleOpenReject(record)}>
                驳回
              </Button>
            </>
          )}
          {(record.reviewStatus === 'pending' || record.reviewStatus === 'approved') && (
            <Popconfirm
              title="确定要取消这个预约吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: 'venues',
      label: '场地档案',
      children: (
        <div>
          <div className="filter-section">
            <Input
              placeholder="搜索场地名称、联系人、电话、地址"
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
              value={venueKeyword}
              onChange={(e) => setVenueKeyword(e.target.value)}
              allowClear
            />
            <div style={{ flex: 1 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddVenue}>
              新增场地
            </Button>
          </div>
          <div className="table-section">
            <Table
              columns={venueColumns}
              dataSource={venues}
              rowKey="id"
              loading={venuesLoading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'exhibitions',
      label: '巡展预约',
      children: (
        <div>
          <div className="filter-section">
            <Select
              placeholder="选择场地"
              allowClear
              style={{ width: 200 }}
              value={filterVenueId}
              onChange={setFilterVenueId}
            >
              {venues.map(v => (
                <Option key={v.id} value={v.id}>{v.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="审核状态"
              allowClear
              style={{ width: 140 }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              {Object.entries(TOURING_REVIEW_STATUS_MAP).map(([value, label]) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={filterDateRange}
              onChange={(dates) => setFilterDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              allowClear
            />
            <Input
              placeholder="搜索预约单位、预约人、电话"
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              allowClear
            />
            <div style={{ flex: 1 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddExhibition}>
              新增预约
            </Button>
          </div>
          <div className="table-section">
            <Table
              columns={exhibitionColumns}
              dataSource={exhibitions}
              rowKey="id"
              loading={exhibitionsLoading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1300 }}
            />
          </div>
        </div>
      )
    }
  ];

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      checkArtworkConflicts(
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD')
      );
    } else {
      setArtworks(artworks.map(a => ({ ...a, isConflict: false, isOccupied: false })));
    }
  };

  const selectedVenue = useMemo(() => {
    const venueId = exhibitionForm.getFieldValue('venueId');
    return venues.find(v => v.id === venueId);
  }, [venues, exhibitionForm]);

  return (
    <div>
      <h1 className="page-title">巡展预约与场地排期</h1>
      <div className="page-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>

      <Modal
        title={editingVenue ? '编辑场地' : '新增场地'}
        open={venueModalVisible}
        onOk={handleVenueSubmit}
        onCancel={() => setVenueModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={680}
        destroyOnClose
      >
        <Form form={venueForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="场地名称"
            rules={[{ required: true, message: '请输入场地名称' }]}
          >
            <Input placeholder="请输入场地名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxArtworkCount"
                label="可容纳作品数量"
                rules={[{ required: true, message: '请输入可容纳作品数量' }]}
              >
                <Input type="number" placeholder="请输入数量" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="openHours"
                label="开放时间段"
              >
                <Input placeholder="例如：周一至周五 9:00-17:00" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="transportRequirements" label="运输要求">
            <TextArea rows={2} placeholder="请输入运输要求" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增巡展预约"
        open={exhibitionModalVisible}
        onOk={handleExhibitionSubmit}
        onCancel={() => setExhibitionModalVisible(false)}
        okText="提交"
        cancelText="取消"
        width={800}
        destroyOnClose
      >
        <Form form={exhibitionForm} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bookingUnit"
                label="预约单位"
                rules={[{ required: true, message: '请输入预约单位' }]}
              >
                <Input placeholder="请输入预约单位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bookingPerson"
                label="预约人"
                rules={[{ required: true, message: '请输入预约人' }]}
              >
                <Input placeholder="请输入预约人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="预约展期"
                rules={[{ required: true, message: '请选择展期' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="venueId"
                label="目标场地"
                rules={[{ required: true, message: '请选择场地' }]}
              >
                <Select placeholder="请选择场地">
                  {venues.map(v => (
                    <Option key={v.id} value={v.id}>
                      {v.name}（可容纳 {v.maxArtworkCount} 件）
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="transportMethod"
                label="运输方式"
              >
                <Select placeholder="请选择运输方式" allowClear>
                  {TRANSPORT_METHOD_OPTIONS.map(opt => (
                    <Option key={opt} value={opt}>{opt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="setupManager"
            label="布展负责人"
          >
            <Input placeholder="请输入布展负责人" />
          </Form.Item>
          <Form.Item
            label="拟展作品清单"
            required
            tooltip="请选择拟展出的作品，系统会自动检测同期冲突"
          >
            <div>
              {selectedVenue && (
                <div style={{ marginBottom: 12 }}>
                  <Alert
                    type="info"
                    showIcon
                    message={`当前场地「${selectedVenue.name}」最多可容纳 ${selectedVenue.maxArtworkCount} 件作品，已选择 ${selectedArtworkIds.length} 件`}
                  />
                  {selectedArtworkIds.length > selectedVenue.maxArtworkCount && (
                    <Alert
                      type="error"
                      showIcon
                      style={{ marginTop: 8 }}
                      message={`选择数量超过场地容量，请减少 ${selectedArtworkIds.length - selectedVenue.maxArtworkCount} 件作品`}
                    />
                  )}
                </div>
              )}
              <Card
                size="small"
                style={{ maxHeight: 320, overflow: 'auto', background: '#fafafa' }}
                loading={artworksChecking}
              >
                <Checkbox
                  indeterminate={selectedArtworkIds.length > 0 && selectedArtworkIds.length < artworks.filter(a => !a.isConflict && !a.isUnavailable).length}
                  checked={artworks.length > 0 && selectedArtworkIds.length === artworks.filter(a => !a.isConflict && !a.isUnavailable).length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedArtworkIds(artworks.filter(a => !a.isConflict && !a.isUnavailable).map(a => a.id));
                    } else {
                      setSelectedArtworkIds([]);
                    }
                  }}
                  style={{ marginBottom: 12 }}
                >
                  全选（排除冲突与不可用作品）
                </Checkbox>
                <Divider style={{ margin: '8px 0' }} />
                <List
                  dataSource={artworks}
                  renderItem={(artwork) => (
                    <List.Item key={artwork.id} style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                        <Checkbox
                          checked={selectedArtworkIds.includes(artwork.id)}
                          disabled={artwork.isConflict || artwork.isUnavailable}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArtworkIds([...selectedArtworkIds, artwork.id]);
                            } else {
                              setSelectedArtworkIds(selectedArtworkIds.filter(id => id !== artwork.id));
                            }
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 500 }}>{artwork.title}</span>
                            <Tag color="blue">{artwork.category}</Tag>
                            <Tag color={ARTWORK_STATUS_COLOR[artwork.status]}>{ARTWORK_STATUS_MAP[artwork.status]}</Tag>
                            {artwork.isUnavailable && (
                              <Tooltip title={artwork.unavailableInfo}>
                                <Tag color="default" icon={<StopOutlined />}>
                                  不可用
                                </Tag>
                              </Tooltip>
                            )}
                            {(artwork.isConflict || artwork.isOccupied) && !artwork.isUnavailable && (
                              <Tooltip title={artwork.conflictInfo}>
                                <Tag color="red" icon={<ExclamationCircleOutlined />}>
                                  {artwork.isConflict ? '同期已占用' : '巡展中'}
                                </Tag>
                              </Tooltip>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#999' }}>
                            作者：{artwork.author}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="预约详情"
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
        {detailExhibition && (
          <div>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="预约单位" span={2}>
                {detailExhibition.bookingUnit}
              </Descriptions.Item>
              <Descriptions.Item label="预约人">
                <UserOutlined style={{ marginRight: 4 }} />
                {detailExhibition.bookingPerson}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <PhoneOutlined style={{ marginRight: 4 }} />
                {detailExhibition.contactPhone}
              </Descriptions.Item>
              <Descriptions.Item label="展期" span={2}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {detailExhibition.startDate} ~ {detailExhibition.endDate}
              </Descriptions.Item>
              <Descriptions.Item label="场地">
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {detailExhibition.venueName}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Tag color={TOURING_REVIEW_STATUS_COLOR[detailExhibition.reviewStatus]}>
                  {TOURING_REVIEW_STATUS_MAP[detailExhibition.reviewStatus]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="运输方式">
                <CarOutlined style={{ marginRight: 4 }} />
                {detailExhibition.transportMethod || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="布展负责人">
                <TeamOutlined style={{ marginRight: 4 }} />
                {detailExhibition.setupManager || '-'}
              </Descriptions.Item>
              {detailExhibition.reviewStatus === 'rejected' && detailExhibition.rejectionReason && (
                <Descriptions.Item label="驳回原因" span={2}>
                  <span style={{ color: '#ff4d4f' }}>{detailExhibition.rejectionReason}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
            <Divider />
            <div>
              <div style={{ fontWeight: 500, marginBottom: 12 }}>
                拟展作品清单（共 {detailExhibition.artworkDetails?.length || 0} 件）
              </div>
              <List
                size="small"
                bordered
                dataSource={detailExhibition.artworkDetails || []}
                renderItem={(artwork) => (
                  <List.Item>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                      <span style={{ fontWeight: 500 }}>{artwork.title}</span>
                      <Tag color="blue">{artwork.category}</Tag>
                      <Tag>{ARTWORK_STATUS_MAP[artwork.status]}</Tag>
                      <span style={{ color: '#999', fontSize: 12 }}>作者：{artwork.author}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <Divider />
            <div>
              <div style={{ fontWeight: 500, marginBottom: 12 }}>
                <CarOutlined style={{ marginRight: 6 }} />
                关联运输批次与理赔状态（共 {detailExhibition.transportBatches?.length || 0} 个批次）
              </div>
              {detailExhibition.transportBatches && detailExhibition.transportBatches.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={detailExhibition.transportBatches}
                  renderItem={(batch) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <Tag color={TRANSPORT_STATUS_COLOR[batch.transportStatus]}>
                            {TRANSPORT_STATUS_MAP[batch.transportStatus]}
                          </Tag>
                          <Tag color="blue" icon={<CarOutlined />}>{batch.carrierMethod}</Tag>
                          <Tag>{batch.carrierContact} {batch.carrierPhone}</Tag>
                          {batch.claimCount > 0 ? (
                            <Tag color={batch.claimStatus === 'pending' ? 'orange' : 'green'}>
                              理赔 {batch.claimCount} 条（{batch.claimStatus === 'pending' ? '处理中' : '已结案'}）
                            </Tag>
                          ) : (
                            <Tag>无理赔</Tag>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          计划出库 {batch.plannedOutboundTime ? dayjs(batch.plannedOutboundTime).format('MM-DD HH:mm') : '-'}
                          {' · 计划送达 '}{batch.plannedArrivalTime ? dayjs(batch.plannedArrivalTime).format('MM-DD HH:mm') : '-'}
                          {batch.actualOutboundTime && ` · 实际出库 ${dayjs(batch.actualOutboundTime).format('MM-DD HH:mm')}`}
                          {batch.actualArrivalTime && ` · 实际送达 ${dayjs(batch.actualArrivalTime).format('MM-DD HH:mm')}`}
                        </div>
                        {batch.siteReceiver && (
                          <div style={{ fontSize: 12, color: '#999' }}>
                            签收人：{batch.siteReceiver} · 保单号：{batch.policyNo || '-'} · 保额：{batch.insuranceAmount} 元
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ color: '#999', padding: '12px 0', textAlign: 'center' }}>
                  暂无关联运输批次
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="驳回预约"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Form form={rejectForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="rejectionReason"
            label="驳回原因"
            rules={[{ required: true, message: '请输入驳回原因' }]}
          >
            <TextArea rows={4} placeholder="请输入驳回原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TouringExhibitionsPage;
