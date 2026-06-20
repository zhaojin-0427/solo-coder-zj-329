import { useState, useEffect } from 'react';
import {
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
  Tooltip,
  Alert,
  InputNumber,
  List,
  Empty
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CarOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  getTransportBatches,
  getTransportBatch,
  createTransportBatch,
  recordOutbound,
  recordArrival,
  recordReceive,
  cancelTransportBatch,
  updateClaim
} from '../api/transportDelivery';
import { getTouringExhibitions } from '../api/touringExhibition';
import type {
  TransportBatch,
  TransportStatus,
  TransportCheckStatus,
  TransportReceiveConclusion,
  ClaimStatus,
  OutboundCheckItem,
  ReceiveCheckItem,
  InsuranceClaim
} from '../types/transportDelivery';
import {
  TRANSPORT_STATUS_MAP,
  TRANSPORT_STATUS_COLOR,
  TRANSPORT_CHECK_STATUS_MAP,
  TRANSPORT_CHECK_STATUS_COLOR,
  TRANSPORT_RECEIVE_CONCLUSION_MAP,
  TRANSPORT_RECEIVE_CONCLUSION_COLOR,
  CLAIM_STATUS_MAP,
  CLAIM_STATUS_COLOR,
  BATCH_CLAIM_STATUS_MAP,
  CARRIER_METHOD_OPTIONS
} from '../types/transportDelivery';
import type { TouringExhibition } from '../types/touringExhibition';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CLAIM_FILTER_OPTIONS = [
  { value: 'has_claim', label: '存在理赔' },
  { value: 'no_claim', label: '无理赔' },
  { value: 'pending', label: '理赔处理中' },
  { value: 'settled', label: '理赔已结案' }
];

interface OutboundCheckForm {
  artworkId: string;
  outboundCheckStatus: TransportCheckStatus;
  packagingCondition: string;
  artworkTitle?: string;
}

interface ReceiveCheckForm {
  artworkId: string;
  arrivalCheckStatus: TransportCheckStatus;
  packagingCondition: string;
  damageDescription: string;
  receiveConclusion: TransportReceiveConclusion;
  artworkTitle?: string;
}

function TransportDeliveriesPage() {
  const [batches, setBatches] = useState<TransportBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvedExhibitions, setApprovedExhibitions] = useState<TouringExhibition[]>([]);

  const [filterTouringId, setFilterTouringId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<TransportStatus | 'all' | undefined>();
  const [filterClaim, setFilterClaim] = useState<string | undefined>();
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [outboundModalVisible, setOutboundModalVisible] = useState(false);
  const [arriveModalVisible, setArriveModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);

  const [currentBatch, setCurrentBatch] = useState<TransportBatch | null>(null);
  const [detailBatch, setDetailBatch] = useState<TransportBatch | null>(null);
  const [currentClaim, setCurrentClaim] = useState<InsuranceClaim | null>(null);

  const [createForm] = Form.useForm();
  const [claimForm] = Form.useForm();
  const [arriveTime, setArriveTime] = useState<Dayjs | null>(null);

  const [outboundTime, setOutboundTime] = useState<Dayjs | null>(null);
  const [outboundOperator, setOutboundOperator] = useState('');
  const [outboundTrackingNo, setOutboundTrackingNo] = useState('');
  const [outboundChecks, setOutboundChecks] = useState<OutboundCheckForm[]>([]);

  const [receiveReceiver, setReceiveReceiver] = useState('');
  const [receiveChecks, setReceiveChecks] = useState<ReceiveCheckForm[]>([]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filterTouringId) params.touringExhibitionId = filterTouringId;
      if (filterStatus) params.transportStatus = filterStatus;
      if (filterClaim) params.claimStatus = filterClaim;
      if (filterDateRange && filterDateRange[0]) params.startDate = filterDateRange[0].format('YYYY-MM-DD');
      if (filterDateRange && filterDateRange[1]) params.endDate = filterDateRange[1].format('YYYY-MM-DD');
      if (filterKeyword) params.keyword = filterKeyword;
      const data = await getTransportBatches(params);
      setBatches(data);
    } catch (e) {
      console.error(e);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedExhibitions = async () => {
    try {
      const data = await getTouringExhibitions({ reviewStatus: 'approved' });
      setApprovedExhibitions(data);
    } catch (e) {
      console.error(e);
      setApprovedExhibitions([]);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [filterTouringId, filterStatus, filterClaim, filterDateRange, filterKeyword]);

  useEffect(() => {
    fetchApprovedExhibitions();
  }, []);

  const handleCreate = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const data = {
        touringExhibitionId: values.touringExhibitionId,
        carrierMethod: values.carrierMethod,
        carrierContact: values.carrierContact,
        carrierPhone: values.carrierPhone,
        plannedOutboundTime: values.plannedOutboundTime.toISOString(),
        plannedArrivalTime: values.plannedArrivalTime.toISOString(),
        outboundOperator: values.outboundOperator || '',
        trackingNo: values.trackingNo || '',
        insuranceAmount: values.insuranceAmount || 0,
        policyNo: values.policyNo || '',
        remarks: values.remarks || ''
      };
      await createTransportBatch(data);
      message.success('运输批次创建成功');
      setCreateModalVisible(false);
      fetchBatches();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '创建失败');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const data = await getTransportBatch(id);
      setDetailBatch(data);
      setDetailModalVisible(true);
    } catch (e) {
      message.error('获取详情失败');
    }
  };

  const openOutboundModal = (batch: TransportBatch) => {
    setCurrentBatch(batch);
    setOutboundTime(dayjs());
    setOutboundOperator(batch.outboundOperator || '');
    setOutboundTrackingNo(batch.trackingNo || '');
    setOutboundChecks(
      batch.artworkChecks.map(c => ({
        artworkId: c.artworkId,
        artworkTitle: c.artworkTitle,
        outboundCheckStatus: c.outboundCheckStatus === 'pending' ? 'normal' : c.outboundCheckStatus,
        packagingCondition: c.packagingCondition || ''
      }))
    );
    setOutboundModalVisible(true);
  };

  const handleOutboundSubmit = async () => {
    if (!currentBatch) return;
    if (!outboundTime || !outboundOperator.trim()) {
      message.error('实际出库时间、出库经办人为必填项');
      return;
    }
    const checks: OutboundCheckItem[] = outboundChecks.map(c => ({
      artworkId: c.artworkId,
      outboundCheckStatus: c.outboundCheckStatus,
      packagingCondition: c.packagingCondition
    }));
    try {
      await recordOutbound(currentBatch.id, {
        actualOutboundTime: outboundTime.toISOString(),
        outboundOperator: outboundOperator.trim(),
        trackingNo: outboundTrackingNo.trim(),
        outboundChecks: checks
      });
      message.success('出库登记成功');
      setOutboundModalVisible(false);
      fetchBatches();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '出库登记失败');
    }
  };

  const openArriveModal = (batch: TransportBatch) => {
    setCurrentBatch(batch);
    setArriveTime(dayjs());
    setArriveModalVisible(true);
  };

  const handleArriveSubmit = async () => {
    if (!currentBatch) return;
    if (!arriveTime) {
      message.error('请选择实际送达时间');
      return;
    }
    try {
      await recordArrival(currentBatch.id, arriveTime.toISOString());
      message.success('送达登记成功');
      setArriveModalVisible(false);
      fetchBatches();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '送达登记失败');
    }
  };

  const openReceiveModal = (batch: TransportBatch) => {
    setCurrentBatch(batch);
    setReceiveReceiver(batch.siteReceiver || '');
    setReceiveChecks(
      batch.artworkChecks.map(c => ({
        artworkId: c.artworkId,
        artworkTitle: c.artworkTitle,
        arrivalCheckStatus: c.arrivalCheckStatus === 'pending' ? 'normal' : c.arrivalCheckStatus,
        packagingCondition: c.packagingCondition || '',
        damageDescription: c.damageDescription || '',
        receiveConclusion: c.receiveConclusion === 'pending' ? 'accepted' : c.receiveConclusion
      }))
    );
    setReceiveModalVisible(true);
  };

  const handleReceiveSubmit = async () => {
    if (!currentBatch) return;
    if (!receiveReceiver.trim()) {
      message.error('请填写场地签收人');
      return;
    }
    const checks: ReceiveCheckItem[] = receiveChecks.map(c => ({
      artworkId: c.artworkId,
      arrivalCheckStatus: c.arrivalCheckStatus,
      packagingCondition: c.packagingCondition,
      damageDescription: c.damageDescription,
      receiveConclusion: c.receiveConclusion
    }));
    try {
      const result = await recordReceive(currentBatch.id, {
        siteReceiver: receiveReceiver.trim(),
        receiveChecks: checks
      });
      const newClaimCount = result.newlyCreatedClaimIds?.length || 0;
      if (newClaimCount > 0) {
        message.success(`签收检查已录入，检测到 ${newClaimCount} 件作品破损/缺件，已自动生成理赔记录`);
      } else {
        message.success('签收检查已录入');
      }
      setReceiveModalVisible(false);
      fetchBatches();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '签收录入失败');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelTransportBatch(id);
      message.success('已取消运输批次');
      fetchBatches();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '取消失败');
    }
  };

  const openClaimModal = (claim: InsuranceClaim) => {
    setCurrentClaim(claim);
    claimForm.setFieldsValue({
      responsibleParty: claim.responsibleParty,
      claimAmount: claim.claimAmount,
      claimStatus: claim.claimStatus,
      handler: claim.handler,
      handlingDescription: claim.handlingDescription
    });
    setClaimModalVisible(true);
  };

  const handleClaimSubmit = async () => {
    if (!currentClaim) return;
    try {
      const values = await claimForm.validateFields();
      await updateClaim(currentClaim.id, {
        responsibleParty: values.responsibleParty,
        claimAmount: Number(values.claimAmount) || 0,
        claimStatus: values.claimStatus,
        handler: values.handler || '',
        handlingDescription: values.handlingDescription || ''
      });
      message.success('理赔处理已保存');
      setClaimModalVisible(false);
      if (currentBatch) {
        const refreshed = await getTransportBatch(currentBatch.id);
        setDetailBatch(refreshed);
      }
      fetchBatches();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '理赔处理失败');
    }
  };

  const selectedCreateExhibition = approvedExhibitions.find(
    e => e.id === createForm.getFieldValue('touringExhibitionId')
  );

  const columns: TableColumnsType<TransportBatch> = [
    {
      title: '巡展预约',
      key: 'touring',
      width: 200,
      render: (_: unknown, record: TransportBatch) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.touringExhibition?.bookingUnit || '-'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {record.touringExhibition?.venueName || '-'}
          </div>
        </div>
      )
    },
    {
      title: '承运方式',
      dataIndex: 'carrierMethod',
      key: 'carrierMethod',
      width: 130,
      render: (method: string) => (
        <Tag icon={<CarOutlined />} color="blue">{method || '-'}</Tag>
      )
    },
    {
      title: '承运联系人',
      key: 'carrier',
      width: 150,
      render: (_: unknown, record: TransportBatch) => (
        <div>
          <div><UserOutlined style={{ marginRight: 4 }} />{record.carrierContact}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />{record.carrierPhone}
          </div>
        </div>
      )
    },
    {
      title: '计划时间',
      key: 'planned',
      width: 220,
      render: (_: unknown, record: TransportBatch) => (
        <div style={{ fontSize: 12 }}>
          <div>出库：{record.plannedOutboundTime ? dayjs(record.plannedOutboundTime).format('MM-DD HH:mm') : '-'}</div>
          <div>送达：{record.plannedArrivalTime ? dayjs(record.plannedArrivalTime).format('MM-DD HH:mm') : '-'}</div>
        </div>
      )
    },
    {
      title: '实际时间',
      key: 'actual',
      width: 220,
      render: (_: unknown, record: TransportBatch) => (
        <div style={{ fontSize: 12 }}>
          <div>出库：{record.actualOutboundTime ? dayjs(record.actualOutboundTime).format('MM-DD HH:mm') : '-'}</div>
          <div>送达：{record.actualArrivalTime ? dayjs(record.actualArrivalTime).format('MM-DD HH:mm') : '-'}</div>
        </div>
      )
    },
    {
      title: '运输状态',
      dataIndex: 'transportStatus',
      key: 'transportStatus',
      width: 100,
      render: (status: TransportStatus) => (
        <Tag color={TRANSPORT_STATUS_COLOR[status]}>{TRANSPORT_STATUS_MAP[status]}</Tag>
      )
    },
    {
      title: '理赔状态',
      key: 'claim',
      width: 130,
      render: (_: unknown, record: TransportBatch) => {
        const summary = record.claimSummary;
        if (!summary || !summary.hasClaim) {
          return <Tag>无理赔</Tag>;
        }
        return (
          <Tooltip title={`共 ${summary.total} 条，待处理 ${summary.pending} 条`}>
            <Tag color={summary.pending > 0 ? 'orange' : 'green'} icon={<SafetyCertificateOutlined />}>
              {summary.pending > 0 ? '理赔处理中' : '理赔已结案'}
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '状态标记',
      key: 'flags',
      width: 160,
      render: (_: unknown, record: TransportBatch) => (
        <Space size={4} wrap>
          {record.isOverdue && (
            <Tag color="red" icon={<WarningOutlined />}>逾期未送达</Tag>
          )}
          {record.pendingReceipt && (
            <Tag color="gold" icon={<ClockCircleOutlined />}>待签收</Tag>
          )}
          {record.claimSummary?.hasClaim && (
            <Tag color="orange" icon={<SafetyCertificateOutlined />}>存在理赔</Tag>
          )}
          {record.onTime && (
            <Tag color="green" icon={<CheckCircleOutlined />}>准时送达</Tag>
          )}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: unknown, record: TransportBatch) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          {record.transportStatus === 'pending' && (
            <Button type="link" icon={<CarOutlined />} onClick={() => openOutboundModal(record)}>
              出库
            </Button>
          )}
          {record.transportStatus === 'in_transit' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => openArriveModal(record)}>
              送达
            </Button>
          )}
          {record.transportStatus === 'delivered' && record.pendingReceipt && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => openReceiveModal(record)}>
              签收
            </Button>
          )}
          {record.transportStatus !== 'canceled' && record.transportStatus !== 'delivered' && (
            <Popconfirm
              title="确定要取消这个运输批次吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>取消</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const rowClassName = (record: TransportBatch) => {
    if (record.transportStatus === 'canceled') return 'transport-row-canceled';
    if (record.isOverdue) return 'transport-row-overdue';
    if (record.claimSummary?.hasClaim && record.claimSummary.pending > 0) return 'transport-row-claim';
    if (record.pendingReceipt) return 'transport-row-pending';
    return '';
  };

  return (
    <div>
      <h1 className="page-title">运输交付与保险理赔</h1>
      <div className="page-card">
        <div className="filter-section">
          <Select
            placeholder="选择巡展预约"
            allowClear
            style={{ width: 200 }}
            value={filterTouringId}
            onChange={setFilterTouringId}
          >
            {approvedExhibitions.map(e => (
              <Option key={e.id} value={e.id}>
                {e.bookingUnit}（{e.venueName || '-'}）
              </Option>
            ))}
          </Select>
          <Select
            placeholder="运输状态"
            allowClear
            style={{ width: 130 }}
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as TransportStatus | 'all' | undefined)}
          >
            <Option value="all">全部状态</Option>
            {Object.entries(TRANSPORT_STATUS_MAP).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
          <Select
            placeholder="理赔状态"
            allowClear
            style={{ width: 150 }}
            value={filterClaim}
            onChange={setFilterClaim}
          >
            {CLAIM_FILTER_OPTIONS.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            value={filterDateRange}
            onChange={(dates) => setFilterDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
            allowClear
          />
          <Input
            placeholder="搜索承运人/单号/作品/预约单位"
            prefix={<SearchOutlined />}
            style={{ width: 260 }}
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            allowClear
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建运输批次
          </Button>
        </div>
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={batches}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1600 }}
            rowClassName={rowClassName}
          />
        </div>
      </div>

      <Modal
        title="新建运输批次"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setCreateModalVisible(false)}
        okText="创建"
        cancelText="取消"
        width={760}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="touringExhibitionId"
            label="巡展预约"
            rules={[{ required: true, message: '请选择已审核通过的巡展预约' }]}
            tooltip="仅可选择已审核通过的巡展预约，且同一预约不可重复创建未取消的运输批次"
          >
            <Select placeholder="请选择巡展预约" showSearch optionFilterProp="children">
              {approvedExhibitions.map(e => (
                <Option key={e.id} value={e.id}>
                  {e.bookingUnit} · {e.venueName}（{e.startDate} ~ {e.endDate}）
                </Option>
              ))}
            </Select>
          </Form.Item>
          {selectedCreateExhibition && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={`关联作品 ${selectedCreateExhibition.artworkIds.length} 件，运输批次将自动关联这些作品的检查清单`}
              description={selectedCreateExhibition.artworkDetails?.map(a => a.title).join('、')}
            />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carrierMethod"
                label="承运方式"
                rules={[{ required: true, message: '请选择承运方式' }]}
              >
                <Select placeholder="请选择承运方式">
                  {CARRIER_METHOD_OPTIONS.map(opt => (
                    <Option key={opt} value={opt}>{opt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="carrierContact"
                label="承运联系人"
                rules={[{ required: true, message: '请输入承运联系人' }]}
              >
                <Input placeholder="请输入承运联系人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carrierPhone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号' }
                ]}
              >
                <Input placeholder="请输入11位手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trackingNo" label="车辆/物流单号">
                <Input placeholder="请输入车辆或物流单号（可选）" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plannedOutboundTime"
                label="计划出库时间"
                rules={[{ required: true, message: '请选择计划出库时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="plannedArrivalTime"
                label="计划送达时间"
                rules={[{ required: true, message: '请选择计划送达时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="outboundOperator" label="出库经办人">
                <Input placeholder="出库经办人（可选）" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="insuranceAmount" label="保险金额（元）">
                <InputNumber placeholder="保险金额" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="policyNo" label="保单号">
                <Input placeholder="保单号（可选）" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="登记出库"
        open={outboundModalVisible}
        onOk={handleOutboundSubmit}
        onCancel={() => setOutboundModalVisible(false)}
        okText="确认出库"
        cancelText="取消"
        width={820}
        destroyOnClose
      >
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="实际出库时间" required>
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  value={outboundTime}
                  onChange={(v) => setOutboundTime(v as Dayjs | null)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="出库经办人" required>
                <Input
                  placeholder="请输入出库经办人"
                  value={outboundOperator}
                  onChange={(e) => setOutboundOperator(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="车辆/物流单号">
                <Input
                  placeholder="请输入单号"
                  value={outboundTrackingNo}
                  onChange={(e) => setOutboundTrackingNo(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider>作品出库检查</Divider>
          {outboundChecks.map((check, idx) => (
            <Row key={check.artworkId} gutter={16} style={{ marginBottom: 12 }} align="middle">
              <Col span={6}>
                <span style={{ fontWeight: 500 }}>{check.artworkTitle || check.artworkId}</span>
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  value={check.outboundCheckStatus}
                  onChange={(v) => {
                    const next = [...outboundChecks];
                    next[idx] = { ...check, outboundCheckStatus: v };
                    setOutboundChecks(next);
                  }}
                >
                  {Object.entries(TRANSPORT_CHECK_STATUS_MAP).filter(([k]) => k !== 'pending').map(([value, label]) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <Input
                  placeholder="包装情况说明"
                  value={check.packagingCondition}
                  onChange={(e) => {
                    const next = [...outboundChecks];
                    next[idx] = { ...check, packagingCondition: e.target.value };
                    setOutboundChecks(next);
                  }}
                />
              </Col>
            </Row>
          ))}
        </Form>
      </Modal>

      <Modal
        title="登记送达"
        open={arriveModalVisible}
        onOk={handleArriveSubmit}
        onCancel={() => setArriveModalVisible(false)}
        okText="确认送达"
        cancelText="取消"
        width={480}
        destroyOnClose
      >
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="实际送达时间" required>
            <DatePicker
              showTime
              style={{ width: '100%' }}
              value={arriveTime}
              onChange={(v) => setArriveTime(v as Dayjs | null)}
            />
          </Form.Item>
          {currentBatch?.actualOutboundTime && (
            <Alert
              type="info"
              showIcon
              message={`实际出库时间为 ${dayjs(currentBatch.actualOutboundTime).format('YYYY-MM-DD HH:mm')}，送达时间不得早于出库时间`}
            />
          )}
        </Form>
      </Modal>

      <Modal
        title="录入签收检查"
        open={receiveModalVisible}
        onOk={handleReceiveSubmit}
        onCancel={() => setReceiveModalVisible(false)}
        okText="确认签收"
        cancelText="取消"
        width={900}
        destroyOnClose
      >
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="若作品到场检查存在破损或缺件，系统将自动生成理赔记录"
          />
          <Form.Item label="场地签收人" required>
            <Input
              placeholder="请输入场地签收人"
              value={receiveReceiver}
              onChange={(e) => setReceiveReceiver(e.target.value)}
            />
          </Form.Item>
          <Divider>作品到场检查</Divider>
          {receiveChecks.map((check, idx) => (
            <div key={check.artworkId} style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 4 }}>
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <span style={{ fontWeight: 500 }}>{check.artworkTitle || check.artworkId}</span>
                </Col>
                <Col span={8}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="到场检查状态"
                    value={check.arrivalCheckStatus}
                    onChange={(v) => {
                      const next = [...receiveChecks];
                      next[idx] = { ...check, arrivalCheckStatus: v };
                      setReceiveChecks(next);
                    }}
                  >
                    {Object.entries(TRANSPORT_CHECK_STATUS_MAP).filter(([k]) => k !== 'pending').map(([value, label]) => (
                      <Option key={value} value={value}>{label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="签收结论"
                    value={check.receiveConclusion}
                    onChange={(v) => {
                      const next = [...receiveChecks];
                      next[idx] = { ...check, receiveConclusion: v };
                      setReceiveChecks(next);
                    }}
                  >
                    {Object.entries(TRANSPORT_RECEIVE_CONCLUSION_MAP).filter(([k]) => k !== 'pending').map(([value, label]) => (
                      <Option key={value} value={value}>{label}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={10}>
                  <Input
                    placeholder="包装情况"
                    value={check.packagingCondition}
                    onChange={(e) => {
                      const next = [...receiveChecks];
                      next[idx] = { ...check, packagingCondition: e.target.value };
                      setReceiveChecks(next);
                    }}
                  />
                </Col>
                <Col span={14}>
                  <Input
                    placeholder="破损/缺件说明（如有破损或缺件将触发理赔）"
                    value={check.damageDescription}
                    onChange={(e) => {
                      const next = [...receiveChecks];
                      next[idx] = { ...check, damageDescription: e.target.value };
                      setReceiveChecks(next);
                    }}
                  />
                </Col>
              </Row>
              {(check.arrivalCheckStatus === 'damaged' || check.arrivalCheckStatus === 'missing') && check.receiveConclusion !== 'rejected' && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginTop: 8 }}
                  message={`将自动生成理赔记录：${TRANSPORT_CHECK_STATUS_MAP[check.arrivalCheckStatus]}`}
                />
              )}
            </div>
          ))}
        </Form>
      </Modal>

      <Modal
        title="运输批次详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>
        ]}
        width={960}
        destroyOnClose
      >
        {detailBatch && (
          <div>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="巡展预约" span={2}>
                {detailBatch.touringExhibition?.bookingUnit || '-'}
                <span style={{ color: '#999', marginLeft: 8 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {detailBatch.touringExhibition?.venueName}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="承运方式">
                <Tag color="blue">{detailBatch.carrierMethod}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="运输状态">
                <Tag color={TRANSPORT_STATUS_COLOR[detailBatch.transportStatus]}>
                  {TRANSPORT_STATUS_MAP[detailBatch.transportStatus]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="承运联系人">
                <UserOutlined style={{ marginRight: 4 }} />{detailBatch.carrierContact}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <PhoneOutlined style={{ marginRight: 4 }} />{detailBatch.carrierPhone}
              </Descriptions.Item>
              <Descriptions.Item label="计划出库时间">
                <CalendarOutlined style={{ marginRight: 4 }} />{detailBatch.plannedOutboundTime ? dayjs(detailBatch.plannedOutboundTime).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="计划送达时间">
                <CalendarOutlined style={{ marginRight: 4 }} />{detailBatch.plannedArrivalTime ? dayjs(detailBatch.plannedArrivalTime).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际出库时间">
                <ClockCircleOutlined style={{ marginRight: 4 }} />{detailBatch.actualOutboundTime ? dayjs(detailBatch.actualOutboundTime).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际送达时间">
                <ClockCircleOutlined style={{ marginRight: 4 }} />{detailBatch.actualArrivalTime ? dayjs(detailBatch.actualArrivalTime).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="出库经办人">{detailBatch.outboundOperator || '-'}</Descriptions.Item>
              <Descriptions.Item label="场地签收人">{detailBatch.siteReceiver || '-'}</Descriptions.Item>
              <Descriptions.Item label="车辆/物流单号">{detailBatch.trackingNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="保险金额">{detailBatch.insuranceAmount > 0 ? `${detailBatch.insuranceAmount} 元` : '-'}</Descriptions.Item>
              <Descriptions.Item label="保单号">{detailBatch.policyNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="理赔状态" span={2}>
                {detailBatch.claimSummary?.hasClaim ? (
                  <Tag color={detailBatch.claimSummary.pending > 0 ? 'orange' : 'green'}>
                    {BATCH_CLAIM_STATUS_MAP[detailBatch.claimSummary.claimStatus]}（共 {detailBatch.claimSummary.total} 条）
                  </Tag>
                ) : <Tag>无理赔</Tag>}
              </Descriptions.Item>
              {detailBatch.remarks && (
                <Descriptions.Item label="备注" span={2}>{detailBatch.remarks}</Descriptions.Item>
              )}
            </Descriptions>

            <Divider>作品检查清单</Divider>
            <Table
              size="small"
              rowKey="artworkId"
              dataSource={detailBatch.artworkChecks}
              pagination={false}
              scroll={{ x: 900 }}
              columns={[
                { title: '作品', dataIndex: 'artworkTitle', key: 'artworkTitle', width: 160 },
                {
                  title: '出库检查',
                  dataIndex: 'outboundCheckStatus',
                  key: 'outboundCheckStatus',
                  width: 100,
                  render: (s: TransportCheckStatus) => <Tag color={TRANSPORT_CHECK_STATUS_COLOR[s]}>{TRANSPORT_CHECK_STATUS_MAP[s]}</Tag>
                },
                {
                  title: '到场检查',
                  dataIndex: 'arrivalCheckStatus',
                  key: 'arrivalCheckStatus',
                  width: 100,
                  render: (s: TransportCheckStatus) => <Tag color={TRANSPORT_CHECK_STATUS_COLOR[s]}>{TRANSPORT_CHECK_STATUS_MAP[s]}</Tag>
                },
                { title: '包装情况', dataIndex: 'packagingCondition', key: 'packagingCondition', ellipsis: true },
                { title: '破损/缺件说明', dataIndex: 'damageDescription', key: 'damageDescription', ellipsis: true },
                {
                  title: '签收结论',
                  dataIndex: 'receiveConclusion',
                  key: 'receiveConclusion',
                  width: 100,
                  render: (c: TransportReceiveConclusion) => <Tag color={TRANSPORT_RECEIVE_CONCLUSION_COLOR[c]}>{TRANSPORT_RECEIVE_CONCLUSION_MAP[c]}</Tag>
                },
                {
                  title: '触发理赔',
                  dataIndex: 'triggerClaim',
                  key: 'triggerClaim',
                  width: 90,
                  render: (v: boolean) => v ? <Tag color="orange">是</Tag> : <Tag>否</Tag>
                }
              ]}
            />

            <Divider>理赔记录</Divider>
            {detailBatch.claims && detailBatch.claims.length > 0 ? (
              <List
                dataSource={detailBatch.claims}
                renderItem={(claim) => (
                  <List.Item
                    actions={[
                      <Button
                        key="handle"
                        type="link"
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => openClaimModal(claim)}
                        disabled={claim.claimStatus === 'settled' || claim.claimStatus === 'rejected'}
                      >
                        处理理赔
                      </Button>
                    ]}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 500 }}>{claim.artworkTitle}</span>
                        <Tag color={CLAIM_STATUS_COLOR[claim.claimStatus]}>{CLAIM_STATUS_MAP[claim.claimStatus]}</Tag>
                        <Tag>责任方：{claim.responsibleParty || '-'}</Tag>
                        <Tag>理赔金额：{claim.claimAmount} 元</Tag>
                        {claim.settleTime && <Tag>结案时间：{dayjs(claim.settleTime).format('YYYY-MM-DD HH:mm')}</Tag>}
                      </div>
                      {claim.handlingDescription && (
                        <div style={{ color: '#666', fontSize: 13 }}>处理说明：{claim.handlingDescription}</div>
                      )}
                      <div style={{ fontSize: 12, color: '#999' }}>
                        处理人：{claim.handler || '-'} · 创建于 {dayjs(claim.createdAt).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无理赔记录" />
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="处理理赔"
        open={claimModalVisible}
        onOk={handleClaimSubmit}
        onCancel={() => setClaimModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        {currentClaim && (
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue">{currentClaim.artworkTitle}</Tag>
            <span style={{ color: '#999', marginLeft: 8 }}>当前状态：{CLAIM_STATUS_MAP[currentClaim.claimStatus]}</span>
          </div>
        )}
        <Form form={claimForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="responsibleParty" label="责任方" rules={[{ required: true, message: '请输入责任方' }]}>
                <Input placeholder="如：承运方、场地、学校" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="claimAmount" label="理赔金额（元）" rules={[{ required: true, message: '请输入理赔金额' }]}>
                <InputNumber placeholder="理赔金额" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="claimStatus" label="理赔状态" rules={[{ required: true, message: '请选择理赔状态' }]}>
                <Select placeholder="请选择理赔状态">
                  {Object.entries(CLAIM_STATUS_MAP).map(([value, label]) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="handler" label="处理人">
                <Input placeholder="请输入处理人" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="handlingDescription" label="处理说明">
            <TextArea rows={3} placeholder="请输入处理说明，结案后将自动记录结案时间" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TransportDeliveriesPage;
