import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import {
  getRevenues,
  getRevenueSummary,
  createRevenue,
  updateRevenue,
  deleteRevenue
} from '../api/revenue';
import type { RevenueRecord, RevenueStatus } from '../types/revenue';
import { REVENUE_STATUS_MAP } from '../types/revenue';
import type { RevenueSummary } from '../api/revenue';

const { Option } = Select;
const { TextArea } = Input;

function RevenuesPage() {
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RevenueRecord | null>(null);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<RevenueStatus | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, sumData] = await Promise.all([
        getRevenues({ status: statusFilter }),
        getRevenueSummary()
      ]);
      setRecords(data);
      setSummary(sumData);
    } catch (err: any) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ authorRatio: 70, status: 'pending' });
    setModalVisible(true);
  };

  const handleEdit = (record: RevenueRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      dealDate: record.dealDate ? record.dealDate.split('T')[0] : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRevenue(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleDistribute = async (record: RevenueRecord) => {
    try {
      await updateRevenue(record.id, { status: 'distributed' });
      message.success('收益已发放');
      fetchData();
    } catch {
      message.error('发放失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        dealDate: values.dealDate ? values.dealDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]
      };
      if (editingRecord) {
        await updateRevenue(editingRecord.id, data);
        message.success('更新成功');
      } else {
        await createRevenue(data);
        message.success('登记成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || '操作失败';
      message.error(errorMsg);
    }
  };

  const getStatusTag = (status: RevenueStatus) => {
    const colorMap: Record<RevenueStatus, string> = {
      pending: 'orange',
      distributed: 'green'
    };
    return <Tag color={colorMap[status]}>{REVENUE_STATUS_MAP[status]}</Tag>;
  };

  const columns = [
    {
      title: '作品ID',
      dataIndex: 'artworkId',
      key: 'artworkId',
      width: 110
    },
    {
      title: '认购ID',
      dataIndex: 'subscriptionId',
      key: 'subscriptionId',
      width: 110
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100
    },
    {
      title: '成交金额(元)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (val: number) => <strong style={{ color: '#1890ff' }}>¥{val.toFixed(2)}</strong>
    },
    {
      title: '作者分成',
      dataIndex: 'authorShare',
      key: 'authorShare',
      width: 120,
      render: (val: number, rec: RevenueRecord) => (
        <span>¥{val.toFixed(2)} <Tag color="blue">{rec.authorRatio}%</Tag></span>
      )
    },
    {
      title: '平台分成',
      dataIndex: 'platformShare',
      key: 'platformShare',
      width: 110,
      render: (val: number) => <span>¥{val.toFixed(2)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: RevenueStatus) => getStatusTag(status)
    },
    {
      title: '成交日期',
      dataIndex: 'dealDate',
      key: 'dealDate',
      width: 110,
      render: (val: string) => val ? val.split('T')[0] : '-'
    },
    {
      title: '发放日期',
      dataIndex: 'distributeDate',
      key: 'distributeDate',
      width: 110,
      render: (val: string | null) => val ? val.split('T')[0] : '-'
    },
    {
      title: '经办人',
      dataIndex: 'operator',
      key: 'operator',
      width: 90
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: RevenueRecord) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleDistribute(record)}
              style={{ color: '#52c41a' }}
            >
              发放
            </Button>
          )}
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
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
      <h1 className="page-title">收益分配</h1>

      {summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总成交金额"
                value={summary.totalRevenue}
                precision={2}
                prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
                suffix="元"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="作者应得分成"
                value={summary.totalAuthorShare}
                precision={2}
                suffix="元"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平台收益"
                value={summary.totalPlatformShare}
                precision={2}
                suffix="元"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待发放 / 已发放"
                value={summary.pendingCount}
                suffix={` / ${summary.distributedCount}`}
                valueStyle={{ color: summary.pendingCount > 0 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {summary && Object.keys(summary.authorStats).length > 0 && (
        <Card title="作者收益汇总" style={{ marginBottom: 16 }} size="small">
          <Row gutter={[16, 8]}>
            {Object.entries(summary.authorStats).map(([author, stats]) => (
              <Col span={8} key={author}>
                <div style={{
                  padding: '10px 14px',
                  background: '#f0f5ff',
                  borderRadius: 6,
                  borderLeft: '3px solid #1890ff'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{author}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    作品 {stats.totalWorks} 件 · 总成交 ¥{stats.totalRevenue.toFixed(2)} · 实得 ¥{stats.totalShare.toFixed(2)}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <div className="page-card">
        <div className="filter-section">
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="pending">待发放</Option>
            <Option value="distributed">已发放</Option>
          </Select>
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            登记收益
          </Button>
        </div>
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1300 }}
          />
        </div>
      </div>

      <Modal
        title={editingRecord ? '编辑收益记录' : '登记收益'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="artworkId"
              label="作品ID"
              rules={[{ required: true, message: '请输入作品ID' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入作品ID" />
            </Form.Item>
            <Form.Item
              name="subscriptionId"
              label="认购ID"
              rules={[{ required: true, message: '请输入认购ID' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入认购ID" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="author"
              label="作者"
              rules={[{ required: true, message: '请输入作者姓名' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入作者姓名" />
            </Form.Item>
            <Form.Item
              name="dealDate"
              label="成交日期"
              rules={[{ required: true, message: '请选择成交日期' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </div>
          <Divider style={{ margin: '4px 0 12px' }} />
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="totalAmount"
              label="成交金额(元)"
              rules={[{ required: true, message: '请输入成交金额' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                step={10}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入金额"
              />
            </Form.Item>
            <Form.Item
              name="authorRatio"
              label="作者分成比例(%)"
              rules={[{ required: true, message: '请输入分成比例' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={100}
                precision={0}
                style={{ width: '100%' }}
                placeholder="例如：70"
                addonAfter="%"
              />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择状态">
                <Option value="pending">待发放</Option>
                <Option value="distributed">已发放</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="operator"
              label="经办人"
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入经办人，默认系统" />
            </Form.Item>
          </div>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default RevenuesPage;
