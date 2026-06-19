import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getExhibitions,
  createExhibition,
  updateExhibition,
  deleteExhibition
} from '../api/exhibition';
import type { Exhibition, ExhibitionStatus } from '../types/exhibition';
import { EXHIBITION_STATUS_MAP } from '../types/exhibition';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const mockExhibitions: Exhibition[] = [
  {
    id: 'exh-001',
    name: '2024春季非遗艺术展',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'ended',
    description: '春季非遗艺术作品展览，展示书法、剪纸、布艺、篆刻等多种非遗艺术形式'
  },
  {
    id: 'exh-002',
    name: '传统工艺精品展',
    startDate: '2024-04-10',
    endDate: '2024-04-30',
    status: 'ongoing',
    description: '精选传统工艺作品，展现非遗文化魅力'
  },
  {
    id: 'exh-003',
    name: '暑期非遗特展',
    startDate: '2024-07-01',
    endDate: '2024-07-20',
    status: 'upcoming',
    description: '暑期特别展览，汇集多位非遗大师作品'
  }
];

function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Exhibition | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getExhibitions();
      setExhibitions(data);
    } catch {
      setExhibitions(mockExhibitions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Exhibition) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)]
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExhibition(id);
      message.success('删除成功');
      fetchData();
    } catch {
      setExhibitions(exhibitions.filter(item => item.id !== id));
      message.success('删除成功');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { dateRange, ...rest } = values;
      const data = {
        ...rest,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      };

      if (editingRecord) {
        await updateExhibition(editingRecord.id, data);
        message.success('更新成功');
      } else {
        await createExhibition(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch {
      const values = form.getFieldsValue();
      const { dateRange, ...rest } = values;

      if (editingRecord) {
        setExhibitions(exhibitions.map(item =>
          item.id === editingRecord.id
            ? {
                ...item,
                ...rest,
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD')
              }
            : item
        ));
        message.success('更新成功');
      } else {
        const newExhibition: Exhibition = {
          ...rest,
          id: `exh-${Date.now()}`,
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
          status: 'upcoming'
        };
        setExhibitions([...exhibitions, newExhibition]);
        message.success('创建成功');
      }
      setModalVisible(false);
    }
  };

  const getStatusTag = (status: ExhibitionStatus) => {
    const colorMap: Record<ExhibitionStatus, string> = {
      upcoming: 'gold',
      ongoing: 'green',
      ended: 'default'
    };
    return <Tag color={colorMap[status]}>{EXHIBITION_STATUS_MAP[status]}</Tag>;
  };

  const columns = [
    {
      title: '展期名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 130
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 130
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ExhibitionStatus) => getStatusTag(status)
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: Exhibition) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个展期吗？"
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
      <h1 className="page-title">展期管理</h1>
      <div className="page-card">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增展期
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={exhibitions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      </div>

      <Modal
        title={editingRecord ? '编辑展期' : '新增展期'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="展期名称"
            rules={[{ required: true, message: '请输入展期名称' }]}
          >
            <Input placeholder="请输入展期名称" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="展期时间"
            rules={[{ required: true, message: '请选择展期时间' }]}
          >
            <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="请输入展期描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ExhibitionsPage;
