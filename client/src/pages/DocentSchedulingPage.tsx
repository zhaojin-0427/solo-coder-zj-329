import { useState, useEffect, useMemo } from 'react';
import {
  Tabs,
  Table,
  Button,
  Space,
  Select,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Descriptions,
  Divider,
  Empty,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  StopOutlined,
  MinusCircleOutlined,
  CheckOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SoundOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getDocentActivities,
  getDocentActivity,
  createDocentActivity,
  updateDocentActivity,
  startDocentActivity,
  completeDocentActivity,
  cancelDocentActivity,
  registerDocentAttendance
} from '../api/docentActivity';
import { getTouringExhibitions } from '../api/touringExhibition';
import { getTouringVenues } from '../api/touringExhibition';
import type {
  Volunteer,
  DocentActivity,
  DocentActivityStatus,
  VolunteerAssignment,
  CreateDocentActivityPayload
} from '../types/docentActivity';
import {
  DOCENT_ACTIVITY_STATUS_MAP,
  DOCENT_ACTIVITY_STATUS_COLOR,
  VOLUNTEER_ROLE_OPTIONS
} from '../types/docentActivity';
import type { TouringExhibition, TouringVenue } from '../types/touringExhibition';
import { ARTWORK_STATUS_MAP, ARTWORK_STATUS_COLOR, ARTWORK_CATEGORIES } from '../types/artwork';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface TourArtworkOption {
  id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  disabled: boolean;
}

function DocentSchedulingPage() {
  const [activeTab, setActiveTab] = useState('volunteers');

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [volunteerModalVisible, setVolunteerModalVisible] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [volunteerForm] = Form.useForm();
  const [volunteerKeyword, setVolunteerKeyword] = useState('');
  const [volunteerCategoryFilter, setVolunteerCategoryFilter] = useState<string | undefined>();

  const [activities, setActivities] = useState<DocentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [venues, setVenues] = useState<TouringVenue[]>([]);
  const [approvedTours, setApprovedTours] = useState<TouringExhibition[]>([]);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DocentActivity | null>(null);
  const [activityForm] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailActivity, setDetailActivity] = useState<DocentActivity | null>(null);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [registerActivity, setRegisterActivity] = useState<DocentActivity | null>(null);
  const [registerForm] = Form.useForm();

  const [filterVenueId, setFilterVenueId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<DocentActivityStatus | undefined>();
  const [filterVolunteerId, setFilterVolunteerId] = useState<string | undefined>();
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');

  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
  const [volunteerAssignments, setVolunteerAssignments] = useState<VolunteerAssignment[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');

  const fetchVolunteers = async () => {
    setVolunteersLoading(true);
    try {
      const data = await getVolunteers({
        keyword: volunteerKeyword || undefined,
        expertiseCategory: volunteerCategoryFilter as Volunteer['expertiseCategory'] | undefined
      });
      setVolunteers(data);
    } catch (e) {
      console.error(e);
      setVolunteers([]);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const params: Record<string, string | undefined> = {};
      if (filterVenueId) params.venueId = filterVenueId;
      if (filterStatus) params.status = filterStatus;
      if (filterVolunteerId) params.volunteerId = filterVolunteerId;
      if (filterDateRange && filterDateRange[0]) params.startDate = filterDateRange[0].format('YYYY-MM-DD');
      if (filterDateRange && filterDateRange[1]) params.endDate = filterDateRange[1].format('YYYY-MM-DD');
      if (filterKeyword) params.keyword = filterKeyword;
      const data = await getDocentActivities(params);
      setActivities(data);
    } catch (e) {
      console.error(e);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [venueList, tourList] = await Promise.all([
        getTouringVenues(),
        getTouringExhibitions({ reviewStatus: 'approved' })
      ]);
      setVenues(venueList);
      setApprovedTours(tourList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'volunteers') {
      fetchVolunteers();
    }
  }, [activeTab, volunteerKeyword, volunteerCategoryFilter]);

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
      fetchReferenceData();
    }
  }, [activeTab, filterVenueId, filterStatus, filterVolunteerId, filterDateRange, filterKeyword]);

  const tourArtworkOptions = useMemo<TourArtworkOption[]>(() => {
    const tour = approvedTours.find(t => t.id === selectedTourId);
    if (!tour || !tour.artworkDetails) return [];
    return tour.artworkDetails.map(a => ({
      id: a.id,
      title: a.title,
      author: a.author,
      category: a.category,
      status: a.status,
      disabled: a.status === 'sold' || a.status === 'returned'
    }));
  }, [approvedTours, selectedTourId]);

  const selectedTour = useMemo(() => {
    return approvedTours.find(t => t.id === selectedTourId) || null;
  }, [approvedTours, selectedTourId]);

  const handleAddVolunteer = () => {
    setEditingVolunteer(null);
    volunteerForm.resetFields();
    setVolunteerModalVisible(true);
  };

  const handleEditVolunteer = (record: Volunteer) => {
    setEditingVolunteer(record);
    volunteerForm.setFieldsValue(record);
    setVolunteerModalVisible(true);
  };

  const handleDeleteVolunteer = async (id: string) => {
    try {
      await deleteVolunteer(id);
      message.success('删除成功');
      fetchVolunteers();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '删除失败');
    }
  };

  const handleVolunteerSubmit = async () => {
    try {
      const values = await volunteerForm.validateFields();
      if (editingVolunteer) {
        await updateVolunteer(editingVolunteer.id, values);
        message.success('更新成功');
      } else {
        await createVolunteer(values);
        message.success('创建成功');
      }
      setVolunteerModalVisible(false);
      fetchVolunteers();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    activityForm.resetFields();
    setSelectedArtworkIds([]);
    setVolunteerAssignments([]);
    setSelectedTourId('');
    setActivityModalVisible(true);
  };

  const handleEditActivity = (record: DocentActivity) => {
    setEditingActivity(record);
    getDocentActivity(record.id).then(detail => {
      activityForm.setFieldsValue({
        touringExhibitionId: detail.touringExhibitionId,
        theme: detail.theme,
        docentDate: detail.docentDate ? dayjs(detail.docentDate) : undefined,
        startTime: detail.startTime ? dayjs(detail.startTime, 'HH:mm') : undefined,
        endTime: detail.endTime ? dayjs(detail.endTime, 'HH:mm') : undefined,
        manager: detail.manager,
        expectedAttendees: detail.expectedAttendees
      });
      setSelectedTourId(detail.touringExhibitionId);
      setSelectedArtworkIds(detail.artworkIds || []);
      setVolunteerAssignments(detail.volunteerAssignments || []);
      setActivityModalVisible(true);
    }).catch(() => {
      message.error('获取活动详情失败');
    });
  };

  const handleViewDetail = async (id: string) => {
    try {
      const data = await getDocentActivity(id);
      setDetailActivity(data);
      setDetailModalVisible(true);
    } catch (e) {
      message.error('获取详情失败');
    }
  };

  const handleActivitySubmit = async () => {
    try {
      const values = await activityForm.validateFields();
      if (selectedArtworkIds.length === 0) {
        message.error('请至少选择一件关联作品');
        return;
      }
      if (volunteerAssignments.length === 0) {
        message.error('请至少安排一名志愿者');
        return;
      }
      const payload: CreateDocentActivityPayload = {
        touringExhibitionId: values.touringExhibitionId,
        theme: values.theme,
        docentDate: values.docentDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        manager: values.manager,
        expectedAttendees: Number(values.expectedAttendees) || 0,
        artworkIds: selectedArtworkIds,
        volunteerAssignments
      };
      if (editingActivity) {
        await updateDocentActivity(editingActivity.id, payload);
        message.success('更新成功');
      } else {
        await createDocentActivity(payload);
        message.success('创建成功');
      }
      setActivityModalVisible(false);
      fetchActivities();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startDocentActivity(id);
      message.success('活动已开始');
      fetchActivities();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeDocentActivity(id);
      message.success('活动已结束');
      fetchActivities();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelDocentActivity(id);
      message.success('已取消活动');
      fetchActivities();
    } catch (e: any) {
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleOpenRegister = (record: DocentActivity) => {
    setRegisterActivity(record);
    registerForm.setFieldsValue({
      actualAttendees: record.actualAttendees ?? 0,
      audienceFeedback: record.audienceFeedback || '',
      exceptionRemarks: record.exceptionRemarks || ''
    });
    setRegisterModalVisible(true);
  };

  const handleRegisterSubmit = async () => {
    try {
      const values = await registerForm.validateFields();
      if (!registerActivity) return;
      await registerDocentAttendance(registerActivity.id, {
        actualAttendees: Number(values.actualAttendees) || 0,
        audienceFeedback: values.audienceFeedback || '',
        exceptionRemarks: values.exceptionRemarks || ''
      });
      message.success('登记成功');
      setRegisterModalVisible(false);
      fetchActivities();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '操作失败');
    }
  };

  const addVolunteerAssignment = () => {
    setVolunteerAssignments([...volunteerAssignments, { volunteerId: '', role: '主讲' }]);
  };

  const updateVolunteerAssignment = (index: number, field: keyof VolunteerAssignment, value: string) => {
    const next = [...volunteerAssignments];
    next[index] = { ...next[index], [field]: value };
    setVolunteerAssignments(next);
  };

  const removeVolunteerAssignment = (index: number) => {
    setVolunteerAssignments(volunteerAssignments.filter((_, i) => i !== index));
  };

  const volunteerColumns: TableColumnsType<Volunteer> = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: '擅长类别', dataIndex: 'expertiseCategory', key: 'expertiseCategory', width: 100, render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: '可服务时间段', dataIndex: 'availableTimeSlots', key: 'availableTimeSlots', width: 200 },
    { title: '所属单位', dataIndex: 'organization', key: 'organization', width: 160 },
    {
      title: '服务次数',
      dataIndex: 'serviceCount',
      key: 'serviceCount',
      width: 100,
      render: (count: number) => <Tag color="gold">{count || 0} 次</Tag>
    },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: unknown, record: Volunteer) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditVolunteer(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个志愿者吗？"
            onConfirm={() => handleDeleteVolunteer(record.id)}
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

  const activityColumns: TableColumnsType<DocentActivity> = [
    { title: '活动主题', dataIndex: 'theme', key: 'theme', width: 180 },
    {
      title: '讲解时间',
      key: 'docentTime',
      width: 180,
      render: (_: unknown, record: DocentActivity) => (
        <div>
          <div><CalendarOutlined style={{ marginRight: 4 }} />{record.docentDate}</div>
          <div style={{ fontSize: 12, color: '#999' }}><ClockCircleOutlined style={{ marginRight: 4 }} />{record.startTime} - {record.endTime}</div>
        </div>
      )
    },
    { title: '场地', dataIndex: 'venueName', key: 'venueName', width: 160 },
    { title: '巡展预约', dataIndex: 'bookingUnit', key: 'bookingUnit', width: 160 },
    {
      title: '关联作品',
      key: 'artworks',
      width: 90,
      render: (_: unknown, record: DocentActivity) => `${record.artworkDetails?.length || 0} 件`
    },
    { title: '讲解负责人', dataIndex: 'manager', key: 'manager', width: 110 },
    {
      title: '志愿者',
      key: 'volunteers',
      width: 160,
      render: (_: unknown, record: DocentActivity) => {
        const list = record.volunteerAssignmentDetails || [];
        if (list.length === 0) return <span style={{ color: '#999' }}>未安排</span>;
        return (
          <div>
            {list.map(v => (
              <Tag key={v.volunteerId} style={{ marginBottom: 4 }}>{v.name}（{v.role}）</Tag>
            ))}
          </div>
        );
      }
    },
    {
      title: '预计/签到',
      key: 'attendees',
      width: 110,
      render: (_: unknown, record: DocentActivity) => (
        <div>
          <div>预计 {record.expectedAttendees} 人</div>
          <div style={{ fontSize: 12, color: record.actualAttendees !== null ? '#52c41a' : '#999' }}>
            签到 {record.actualAttendees !== null ? `${record.actualAttendees} 人` : '未登记'}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: DocentActivityStatus) => (
        <Tag color={DOCENT_ACTIVITY_STATUS_COLOR[status]}>
          {DOCENT_ACTIVITY_STATUS_MAP[status]}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: unknown, record: DocentActivity) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          {record.status === 'scheduled' && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditActivity(record)}>
              编辑排班
            </Button>
          )}
          {record.status === 'scheduled' && (
            <Popconfirm
              title="确定开始该讲解活动吗？"
              onConfirm={() => handleStart(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckOutlined />}>开始</Button>
            </Popconfirm>
          )}
          {record.status === 'ongoing' && (
            <Popconfirm
              title="确定结束该讲解活动吗？"
              onConfirm={() => handleComplete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckOutlined />}>结束</Button>
            </Popconfirm>
          )}
          {(record.status === 'ongoing' || record.status === 'completed') && (
            <Button type="link" icon={<FileTextOutlined />} onClick={() => handleOpenRegister(record)}>
              登记签到
            </Button>
          )}
          {(record.status === 'scheduled' || record.status === 'ongoing') && (
            <Popconfirm
              title="确定要取消这个讲解活动吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<StopOutlined />}>取消</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: 'volunteers',
      label: '志愿者列表',
      children: (
        <div>
          <div className="filter-section">
            <Select
              placeholder="擅长类别"
              allowClear
              style={{ width: 140 }}
              value={volunteerCategoryFilter}
              onChange={setVolunteerCategoryFilter}
            >
              {ARTWORK_CATEGORIES.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
            <Input
              placeholder="搜索姓名、电话、单位、时间段"
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
              value={volunteerKeyword}
              onChange={(e) => setVolunteerKeyword(e.target.value)}
              allowClear
            />
            <div style={{ flex: 1 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddVolunteer}>
              新增志愿者
            </Button>
          </div>
          <div className="table-section">
            <Table
              columns={volunteerColumns}
              dataSource={volunteers}
              rowKey="id"
              loading={volunteersLoading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1200 }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'activities',
      label: '讲解活动列表',
      children: (
        <div>
          <div className="filter-section">
            <Select
              placeholder="选择场地"
              allowClear
              style={{ width: 180 }}
              value={filterVenueId}
              onChange={setFilterVenueId}
            >
              {venues.map(v => (
                <Option key={v.id} value={v.id}>{v.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="活动状态"
              allowClear
              style={{ width: 140 }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              {Object.entries(DOCENT_ACTIVITY_STATUS_MAP).map(([value, label]) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
            <Select
              placeholder="志愿者"
              allowClear
              style={{ width: 180 }}
              value={filterVolunteerId}
              onChange={setFilterVolunteerId}
            >
              {volunteers.map(v => (
                <Option key={v.id} value={v.id}>{v.name}</Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={filterDateRange}
              onChange={(dates) => setFilterDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              allowClear
            />
            <Input
              placeholder="搜索活动主题、负责人"
              prefix={<SearchOutlined />}
              style={{ width: 220 }}
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              allowClear
            />
            <div style={{ flex: 1 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddActivity}>
              新增讲解活动
            </Button>
          </div>
          <div className="table-section">
            <Table
              columns={activityColumns}
              dataSource={activities}
              rowKey="id"
              loading={activitiesLoading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1600 }}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div>
      <h1 className="page-title">讲解排班与志愿者管理</h1>
      <div className="page-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>

      <Modal
        title={editingVolunteer ? '编辑志愿者' : '新增志愿者'}
        open={volunteerModalVisible}
        onOk={handleVolunteerSubmit}
        onCancel={() => setVolunteerModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form form={volunteerForm} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expertiseCategory"
                label="擅长类别"
                rules={[{ required: true, message: '请选择擅长类别' }]}
              >
                <Select placeholder="请选择擅长类别">
                  {ARTWORK_CATEGORIES.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="organization" label="所属单位">
                <Input placeholder="请输入所属单位" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="availableTimeSlots" label="可服务时间段">
            <Input placeholder="例如：周一至周五 9:00-17:00" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingActivity ? '编辑讲解排班' : '新增讲解活动'}
        open={activityModalVisible}
        onOk={handleActivitySubmit}
        onCancel={() => setActivityModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={820}
        destroyOnClose
      >
        <Form form={activityForm} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="touringExhibitionId"
                label="关联巡展预约"
                rules={[{ required: true, message: '请选择巡展预约' }]}
                extra={selectedTour ? `展期 ${selectedTour.startDate} ~ ${selectedTour.endDate} · 场地 ${selectedTour.venueName || ''}` : '仅可选择已审核通过的巡展预约'}
              >
                <Select
                  placeholder="请选择已审核通过的巡展预约"
                  onChange={(v) => {
                    setSelectedTourId(v);
                    setSelectedArtworkIds([]);
                  }}
                  disabled={!!editingActivity}
                >
                  {approvedTours.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.bookingUnit}（{t.startDate} ~ {t.endDate} · {t.venueName || ''}）
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="theme"
                label="活动主题"
                rules={[{ required: true, message: '请输入活动主题' }]}
              >
                <Input placeholder="请输入活动主题" prefix={<SoundOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="docentDate"
                label="讲解日期"
                rules={[{ required: true, message: '请选择讲解日期' }]}
                extra={selectedTour ? `需在展期内` : ''}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={5} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={5} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manager"
                label="讲解负责人"
                rules={[{ required: true, message: '请输入讲解负责人' }]}
              >
                <Input placeholder="请输入讲解负责人" prefix={<TeamOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedAttendees"
                label="预计参与人数"
                rules={[{ required: true, message: '请输入预计参与人数' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预计参与人数" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="关联作品清单"
            required
            tooltip="仅可选择属于该巡展预约且未成交、未返还的作品"
          >
            {tourArtworkOptions.length === 0 ? (
              <Alert type="info" showIcon message="请先选择巡展预约" />
            ) : (
              <div>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 8 }}
                  message={`已选择 ${selectedArtworkIds.length} 件作品（可选 ${tourArtworkOptions.filter(a => !a.disabled).length} 件）`}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tourArtworkOptions.map(a => (
                    <Tag
                      key={a.id}
                      color={selectedArtworkIds.includes(a.id) ? 'blue' : 'default'}
                      style={{
                        cursor: a.disabled ? 'not-allowed' : 'pointer',
                        opacity: a.disabled ? 0.5 : 1,
                        padding: '4px 10px'
                      }}
                      onClick={() => {
                        if (a.disabled) return;
                        if (selectedArtworkIds.includes(a.id)) {
                          setSelectedArtworkIds(selectedArtworkIds.filter(id => id !== a.id));
                        } else {
                          setSelectedArtworkIds([...selectedArtworkIds, a.id]);
                        }
                      }}
                    >
                      {a.title}
                      <span style={{ marginLeft: 4, fontSize: 12 }}>{ARTWORK_STATUS_MAP[a.status as keyof typeof ARTWORK_STATUS_MAP] || a.status}</span>
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Form.Item>
          <Form.Item
            label="志愿者排班"
            required
            tooltip="同一志愿者不可在重叠时间段重复排班"
          >
            <div>
              {volunteerAssignments.length === 0 && (
                <Empty description="尚未安排志愿者" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              {volunteerAssignments.map((assignment, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }} align="middle">
                  <Col span={12}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="选择志愿者"
                      value={assignment.volunteerId || undefined}
                      onChange={(v) => updateVolunteerAssignment(index, 'volunteerId', v)}
                      showSearch
                      optionFilterProp="children"
                    >
                      {volunteers.map(v => (
                        <Option key={v.id} value={v.id} disabled={volunteerAssignments.some((a, i) => i !== index && a.volunteerId === v.id)}>
                          {v.name}（{v.expertiseCategory}）· {v.organization}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={10}>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="角色"
                      value={assignment.role || undefined}
                      onChange={(v) => updateVolunteerAssignment(index, 'role', v)}
                    >
                      {VOLUNTEER_ROLE_OPTIONS.map(r => (
                        <Option key={r} value={r}>{r}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={2}>
                    <Button type="link" danger icon={<MinusCircleOutlined />} onClick={() => removeVolunteerAssignment(index)} />
                  </Col>
                </Row>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={addVolunteerAssignment} block>
                添加志愿者
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="讲解活动详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[<Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>]}
        width={760}
        destroyOnClose
      >
        {detailActivity && (
          <div>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="活动主题" span={2}>
                <SoundOutlined style={{ marginRight: 4 }} />
                {detailActivity.theme}
              </Descriptions.Item>
              <Descriptions.Item label="巡展预约">
                {detailActivity.bookingUnit || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="场地">
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {detailActivity.venueName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="讲解日期">
                <CalendarOutlined style={{ marginRight: 4 }} />
                {detailActivity.docentDate}
              </Descriptions.Item>
              <Descriptions.Item label="起止时间">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {detailActivity.startTime} - {detailActivity.endTime}
              </Descriptions.Item>
              <Descriptions.Item label="讲解负责人">
                <TeamOutlined style={{ marginRight: 4 }} />
                {detailActivity.manager}
              </Descriptions.Item>
              <Descriptions.Item label="活动状态">
                <Tag color={DOCENT_ACTIVITY_STATUS_COLOR[detailActivity.status]}>
                  {DOCENT_ACTIVITY_STATUS_MAP[detailActivity.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预计参与人数">
                {detailActivity.expectedAttendees} 人
              </Descriptions.Item>
              <Descriptions.Item label="签到人数">
                {detailActivity.actualAttendees !== null ? `${detailActivity.actualAttendees} 人` : '未登记'}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div style={{ fontWeight: 500, marginBottom: 12 }}>
              关联作品清单（共 {detailActivity.artworkDetails?.length || 0} 件）
            </div>
            {detailActivity.artworkDetails && detailActivity.artworkDetails.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detailActivity.artworkDetails.map(a => (
                  <div key={a.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Tag color="blue">{a.title}（{a.author}）</Tag>
                    <Tag color={ARTWORK_STATUS_COLOR[a.status]} style={{ marginLeft: -4 }}>
                      {ARTWORK_STATUS_MAP[a.status]}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999' }}>暂无关联作品</div>
            )}
            <Divider />
            <div style={{ fontWeight: 500, marginBottom: 12 }}>
              <TeamOutlined style={{ marginRight: 6 }} />
              志愿者排班（共 {detailActivity.volunteerAssignmentDetails?.length || 0} 人）
            </div>
            {detailActivity.volunteerAssignmentDetails && detailActivity.volunteerAssignmentDetails.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detailActivity.volunteerAssignmentDetails.map(v => (
                  <Tag key={v.volunteerId} color="purple">
                    {v.name}（{v.role}）· {v.expertiseCategory || '-'}
                  </Tag>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999' }}>暂无志愿者排班</div>
            )}
            {(detailActivity.audienceFeedback || detailActivity.exceptionRemarks) && (
              <>
                <Divider />
                {detailActivity.audienceFeedback && (
                  <Descriptions title="观众反馈摘要" bordered column={1} size="small">
                    <Descriptions.Item label="反馈">{detailActivity.audienceFeedback}</Descriptions.Item>
                  </Descriptions>
                )}
                {detailActivity.exceptionRemarks && (
                  <Descriptions title="异常备注" bordered column={1} size="small" style={{ marginTop: 12 }}>
                    <Descriptions.Item label="异常">
                      <span style={{ color: '#ff4d4f' }}>{detailActivity.exceptionRemarks}</span>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="登记签到与反馈"
        open={registerModalVisible}
        onOk={handleRegisterSubmit}
        onCancel={() => setRegisterModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        {registerActivity && (
          <div style={{ marginBottom: 12, color: '#666' }}>
            <SoundOutlined style={{ marginRight: 4 }} />
            {registerActivity.theme} · {registerActivity.docentDate} {registerActivity.startTime}-{registerActivity.endTime}
          </div>
        )}
        <Form form={registerForm} layout="vertical">
          <Form.Item
            name="actualAttendees"
            label="签到人数"
            rules={[{ required: true, message: '请输入签到人数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入实际签到人数" />
          </Form.Item>
          <Form.Item name="audienceFeedback" label="观众反馈摘要">
            <TextArea rows={3} placeholder="请输入观众反馈摘要" />
          </Form.Item>
          <Form.Item name="exceptionRemarks" label="异常备注">
            <TextArea rows={2} placeholder="如有异常情况请说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DocentSchedulingPage;
