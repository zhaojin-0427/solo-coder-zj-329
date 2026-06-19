import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Tabs
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  getPickupRecords,
  createPickupRecord
} from '../api/pickup';
import type { PickupRecord, PickupType } from '../types/pickup';
import { PICKUP_TYPE_MAP } from '../types/pickup';

const { Option } = Select;
const { TextArea } = Input;

const mockRecords: PickupRecord[] = [
  { id: 'pick-001', artworkId: 'art-003', subscriptionId: 'sub-003', type: 'sale', recipientName: '张叔叔', recipientPhone: '13800138003', pickupDate: '2024-02-25', operator: '李老师', remarks: '已签收，很满意' },
  { id: 'pick-002', artworkId: 'art-001', subscriptionId: null, type: 'return', recipientName: '', recipientPhone: '', pickupDate: '2024-03-16', operator: '王老师', remarks: '展期结束归还入库' },
  { id: 'pick-003', artworkId: 'art-002', subscriptionId: null, type: 'return', recipientName: '', recipientPhone: '', pickupDate: '2024-03-20', operator: '赵老师', remarks: '展览结束入库' },
  { id: 'pick-004', artworkId: 'art-005', subscriptionId: 'sub-005', type: 'sale', recipientName: '刘大爷', recipientPhone: '13800138005', pickupDate: '2024-03-15', operator: '张老师', remarks: '现场取件，老人很开心' }
];

function PickupsPage() {
  const [records, setRecords] = useState<PickupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPickupRecords();
      setRecords(data);
    } catch {
      setRecords(mockRecords);
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        pickupDate: values.pickupDate.format('YYYY-MM-DD'),
        subscriptionId: values.subscriptionId || null
      };
      await createPickupRecord(data);
      message.success('登记成功');
      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || '登记失败，请检查填写内容';
      message.error(errorMsg);
    }
  };

  const getTypeTag = (type: PickupType) => {
    const colorMap: Record<PickupType, string> = {
      sale: 'green',
      return: 'orange'
    };
    return <Tag color={colorMap[type]}>{PICKUP_TYPE_MAP[type]}</Tag>;
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: PickupType) => getTypeTag(type)
    },
    {
      title: '作品ID',
      dataIndex: 'artworkId',
      key: 'artworkId',
      width: 120
    },
    {
      title: '认购ID',
      dataIndex: 'subscriptionId',
      key: 'subscriptionId',
      width: 120,
      render: (id: string | null) => id || '-'
    },
    {
      title: '领取人',
      dataIndex: 'recipientName',
      key: 'recipientName',
      width: 120,
      render: (name: string) => name || '-'
    },
    {
      title: '联系电话',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
      width: 140,
      render: (phone: string) => phone || '-'
    },
    {
      title: '取件日期',
      dataIndex: 'pickupDate',
      key: 'pickupDate',
      width: 120
    },
    {
      title: '经办人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true
    }
  ];

  const saleRecords = records.filter(r => r.type === 'sale');
  const returnRecords = records.filter(r => r.type === 'return');

  const tabItems = [
    {
      key: 'all',
      label: '全部记录',
      children: (
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      )
    },
    {
      key: 'sale',
      label: '销售取件',
      children: (
        <Table
          columns={columns}
          dataSource={saleRecords}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      )
    },
    {
      key: 'return',
      label: '作品返还',
      children: (
        <Table
          columns={columns}
          dataSource={returnRecords}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      )
    }
  ];

  return (
    <div>
      <h1 className="page-title">取件流转</h1>
      <div className="page-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增记录
          </Button>
        </div>
        <Tabs defaultActiveKey="all" items={tabItems} />
      </div>

      <Modal
        title="新增取件/返还记录"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="type"
            label="记录类型"
            rules={[{ required: true, message: '请选择记录类型' }]}
          >
            <Select placeholder="请选择记录类型">
              <Option value="sale">销售取件</Option>
              <Option value="return">作品返还</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="artworkId"
            label="作品ID"
            rules={[{ required: true, message: '请输入作品ID' }]}
          >
            <Input placeholder="请输入作品ID" />
          </Form.Item>
          <Form.Item
            name="subscriptionId"
            label="认购ID"
          >
            <Input placeholder="请输入认购ID（销售取件时填写）" allowClear />
          </Form.Item>
          <Form.Item
            name="pickupDate"
            label="取件日期"
            rules={[{ required: true, message: '请选择取件日期' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="recipientName"
              label="领取人姓名"
              rules={[{ required: true, message: '请输入领取人姓名' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入领取人姓名" />
            </Form.Item>
            <Form.Item
              name="recipientPhone"
              label="领取人电话"
              rules={[
                { required: true, message: '请输入领取人电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入11位手机号" />
            </Form.Item>
          </div>
          <Form.Item
            name="operator"
            label="经办人"
            rules={[{ required: true, message: '请输入经办人' }]}
          >
            <Input placeholder="请输入经办人姓名" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PickupsPage;
