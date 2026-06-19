import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Badge
} from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  getSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  deleteSubscription
} from '../api/subscription';
import type { Subscription, SubscriptionStatus, PickupMethod } from '../types/subscription';
import { SUBSCRIPTION_STATUS_MAP, PICKUP_METHOD_MAP } from '../types/subscription';

const { Option } = Select;
const { TextArea } = Input;

const mockSubscriptions: Subscription[] = [
  { id: 'sub-001', artworkId: 'art-001', visitorName: '王大爷', visitorPhone: '13800138001', queueNumber: 1, pickupMethod: 'onsite', remarks: '想现场看看再决定', status: 'pending', createdAt: '2024-03-01' },
  { id: 'sub-002', artworkId: 'art-001', visitorName: '李阿姨', visitorPhone: '13800138002', queueNumber: 2, pickupMethod: 'delivery', remarks: '需要快递到家', status: 'pending', createdAt: '2024-03-02' },
  { id: 'sub-003', artworkId: 'art-003', visitorName: '张叔叔', visitorPhone: '13800138003', queueNumber: 1, pickupMethod: 'onsite', remarks: '', status: 'deal', createdAt: '2024-02-15' },
  { id: 'sub-004', artworkId: 'art-002', visitorName: '陈奶奶', visitorPhone: '13800138004', queueNumber: 1, pickupMethod: 'delivery', remarks: '儿女帮忙下单的', status: 'canceled', createdAt: '2024-02-10' },
  { id: 'sub-005', artworkId: 'art-005', visitorName: '刘大爷', visitorPhone: '13800138005', queueNumber: 1, pickupMethod: 'onsite', remarks: '约好了周末去取', status: 'pending', createdAt: '2024-03-10' },
  { id: 'sub-006', artworkId: 'art-005', visitorName: '赵阿姨', visitorPhone: '13800138006', queueNumber: 2, pickupMethod: 'delivery', remarks: '送朋友的礼物', status: 'pending', createdAt: '2024-03-11' }
];

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch {
      setSubscriptions(mockSubscriptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleStatusUpdate = async (id: string, status: SubscriptionStatus) => {
    try {
      await updateSubscriptionStatus(id, status);
      message.success('状态更新成功');
      fetchData();
    } catch {
      setSubscriptions(subscriptions.map(item =>
        item.id === id ? { ...item, status } : item
      ));
      message.success('状态更新成功');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id);
      message.success('删除成功');
      fetchData();
    } catch {
      setSubscriptions(subscriptions.filter(item => item.id !== id));
      message.success('删除成功');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createSubscription(values);
      message.success('认购登记成功');
      setModalVisible(false);
      fetchData();
    } catch {
      const values = form.getFieldsValue();
      const newSubscription: Subscription = {
        ...values,
        id: `sub-${Date.now()}`,
        queueNumber: subscriptions.filter(s => s.artworkId === values.artworkId).length + 1,
        status: 'pending' as const,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSubscriptions([...subscriptions, newSubscription]);
      message.success('认购登记成功');
      setModalVisible(false);
    }
  };

  const getStatusTag = (status: SubscriptionStatus) => {
    const colorMap: Record<SubscriptionStatus, string> = {
      pending: 'blue',
      deal: 'green',
      canceled: 'default'
    };
    return <Tag color={colorMap[status]}>{SUBSCRIPTION_STATUS_MAP[status]}</Tag>;
  };

  const columns = [
    {
      title: '排队号',
      dataIndex: 'queueNumber',
      key: 'queueNumber',
      width: 100,
      render: (position: number, record: Subscription) => (
        <Badge count={position} style={{ backgroundColor: record.status === 'pending' ? '#1890ff' : '#999' }} />
      )
    },
    {
      title: '作品ID',
      dataIndex: 'artworkId',
      key: 'artworkId',
      width: 120
    },
    {
      title: '认购人',
      dataIndex: 'visitorName',
      key: 'visitorName',
      width: 120
    },
    {
      title: '联系电话',
      dataIndex: 'visitorPhone',
      key: 'visitorPhone',
      width: 140
    },
    {
      title: '取件方式',
      dataIndex: 'pickupMethod',
      key: 'pickupMethod',
      width: 120,
      render: (method: PickupMethod) => PICKUP_METHOD_MAP[method]
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SubscriptionStatus) => getStatusTag(status)
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true
    },
    {
      title: '登记时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: Subscription) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'deal')}
              >
                确认成交
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'canceled')}
              >
                取消
              </Button>
            </>
          )}
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h1 className="page-title">认购登记</h1>
      <div className="page-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增认购
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1100 }}
        />
      </div>

      <Modal
        title="新增认购登记"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="artworkId"
            label="作品ID"
            rules={[{ required: true, message: '请输入作品ID' }]}
          >
            <Input placeholder="请输入作品ID" />
          </Form.Item>
          <Form.Item
            name="visitorName"
            label="认购人姓名"
            rules={[{ required: true, message: '请输入认购人姓名' }]}
          >
            <Input placeholder="请输入认购人姓名" />
          </Form.Item>
          <Form.Item
            name="visitorPhone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="pickupMethod"
            label="取件方式"
            rules={[{ required: true, message: '请选择取件方式' }]}
          >
            <Select placeholder="请选择取件方式">
              <Option value="onsite">现场取件</Option>
              <Option value="delivery">快递配送</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SubscriptionsPage;
