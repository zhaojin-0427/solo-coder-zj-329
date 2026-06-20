import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Progress, Spin, Tag, Badge } from 'antd';
import {
  PictureOutlined,
  CalendarOutlined,
  TeamOutlined,
  InboxOutlined,
  SwapOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  CarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
  SoundOutlined
} from '@ant-design/icons';
import { getStatistics } from '../api/statistics';
import type { StatisticsData } from '../types/statistics';
import type { HandoverType, HandoverProcessStatus } from '../types/handover';
import { HANDOVER_TYPE_MAP, HANDOVER_PROCESS_STATUS_MAP } from '../types/handover';
import { CLAIM_STATUS_MAP, CLAIM_STATUS_COLOR } from '../types/transportDelivery';
import { DOCENT_ACTIVITY_STATUS_MAP, DOCENT_ACTIVITY_STATUS_COLOR } from '../types/docentActivity';
import dayjs from 'dayjs';

const mockStats: StatisticsData = {
  categoryStats: { '书法': 2, '剪纸': 2, '布艺': 2, '篆刻': 2 },
  exhibitionStats: [
    { id: 'exh-001', name: '2024春季非遗艺术展', status: 'ended', totalArtworks: 2, soldArtworks: 1, dealRate: 50 },
    { id: 'exh-002', name: '传统工艺精品展', status: 'ongoing', totalArtworks: 4, soldArtworks: 2, dealRate: 50 }
  ],
  authorStats: [
    { author: '李锦绣', totalWorks: 2, soldWorks: 1, activityScore: 15 },
    { author: '王艺剪', totalWorks: 2, soldWorks: 0, activityScore: 10 },
    { author: '陈锦绣', totalWorks: 1, soldWorks: 1, activityScore: 12 },
    { author: '赵篆刻', totalWorks: 1, soldWorks: 0, activityScore: 8 }
  ],
  uncollectedStats: {
    totalPending: 3,
    byPickupMethod: { onsite: 2, delivery: 1 },
    byArtworkCategory: { '剪纸': 1, '篆刻': 1, '书法': 1 }
  },
  handoverStats: {
    totalRecords: 6,
    completedRecords: 4,
    completionRate: 67,
    totalExceptions: 3,
    pendingExceptions: [
      {
        id: 'han-006',
        artworkId: 'art-007',
        artworkTitle: '年年有余',
        artworkCategory: '剪纸',
        type: 'entry',
        exceptionDescription: '外包装盒有轻微压痕，不影响作品本身',
        processStatus: 'pending',
        handlerName: '周管理员',
        handoverTime: '2024-06-14T10:00:00.000Z'
      },
      {
        id: 'han-003',
        artworkId: 'art-004',
        artworkTitle: '陋室铭',
        artworkCategory: '书法',
        type: 'return',
        exceptionDescription: '画框边缘有轻微划痕，需确认是否为展期造成',
        processStatus: 'processing',
        handlerName: '王管理员',
        handoverTime: '2024-04-01T10:00:00.000Z'
      }
    ],
    byCategory: { '书法': 1, '剪纸': 1, '布艺': 1 },
    byType: { entry: 1, return: 2 },
    byProcessStatus: { pending: 1, processing: 1, resolved: 4 }
  },
  touringStats: {
    totalBookings: 3,
    approvedBookings: 1,
    approvalRate: 33,
    venueUsage: [
      { venueName: '阳光社区活动中心', count: 1 },
      { venueName: '幸福养老院', count: 1 },
      { venueName: '市图书馆一楼展厅', count: 1 }
    ],
    artworkParticipation: [
      { artworkId: 'art-001', title: '宁静致远', author: '王羲之', count: 2 },
      { artworkId: 'art-002', title: '喜鹊登梅', author: '张爱华', count: 2 },
      { artworkId: 'art-005', title: '龙凤呈祥', author: '陈刻石', count: 1 }
    ],
    upcomingSetupList: [
      {
        id: 'tour-001',
        bookingUnit: '阳光社区居委会',
        venueId: 'venue-001',
        venueName: '阳光社区活动中心',
        venueAddress: '北京市朝阳区阳光路88号',
        startDate: '2024-07-01',
        endDate: '2024-07-07',
        artworkCount: 3,
        setupManager: '王管理员',
        transportMethod: '学校专车运输',
        artworks: [
          { id: 'art-001', title: '宁静致远', author: '王羲之' },
          { id: 'art-002', title: '喜鹊登梅', author: '张爱华' }
        ]
      }
    ],
    conflictCount: 0
  },
  transportDeliveryStats: {
    totalBatches: 1,
    deliveredCount: 1,
    onTimeRate: 100,
    onTimeCount: 1,
    pendingReceiptCount: 0,
    overdueCount: 0,
    totalClaims: 1,
    unsettledClaimsCount: 1,
    carrierExceptionRate: [
      { method: '学校专车运输', total: 1, abnormal: 1, exceptionRate: 100 }
    ],
    upcomingOutboundList: [],
    unsettledClaims: [
      {
        id: 'clm-001',
        artworkId: 'art-002',
        artworkTitle: '喜鹊登梅',
        artworkAuthor: '张爱华',
        transportBatchId: 'tp-001',
        bookingUnit: '阳光社区居委会',
        responsibleParty: '承运方',
        claimAmount: 1500,
        claimStatus: 'processing',
        handler: '王管理员',
        handlingDescription: '已联系承运方确认责任，正在协商赔偿金额',
        createdAt: '2024-07-01T10:30:00.000Z'
      }
    ],
    byStatus: { delivered: 1 },
    byClaimStatus: { processing: 1 }
  },
  docentActivityStats: {
    totalActivities: 3,
    completedCount: 1,
    completionRate: 33,
    byStatus: { completed: 1, ongoing: 1, scheduled: 1 },
    volunteerServiceRanking: [
      { volunteerId: 'vol-001', name: '李讲解', expertiseCategory: '书法', organization: '老年大学', count: 2 },
      { volunteerId: 'vol-002', name: '王助理', expertiseCategory: '剪纸', organization: '社区志愿者协会', count: 1 }
    ],
    venueDistribution: [
      { venueName: '阳光社区活动中心', count: 3 }
    ],
    artworkDocentRanking: [
      { artworkId: 'art-001', title: '宁静致远', author: '王羲之', count: 2 },
      { artworkId: 'art-002', title: '喜鹊登梅', author: '张爱华', count: 2 }
    ],
    upcomingDocentList: [
      {
        id: 'da-003',
        theme: '书法艺术赏析讲解',
        bookingUnit: '阳光社区居委会',
        venueName: '阳光社区活动中心',
        docentDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
        startTime: '14:00',
        endTime: '16:00',
        manager: '李讲解',
        expectedAttendees: 30,
        artworkCount: 3,
        volunteers: [{ id: 'vol-001', name: '李讲解', role: '主讲' }]
      }
    ],
    conflictCount: 0,
    conflictDetails: []
  },
  total: {
    artworks: 8,
    exhibitions: 2,
    subscriptions: 5,
    pickupRecords: 3,
    handoverRecords: 6,
    touringVenues: 3,
    touringExhibitions: 3,
    transportBatches: 1,
    insuranceClaims: 1,
    docentVolunteers: 5,
    docentActivities: 3
  }
};

function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getStatistics();
      setData(result);
    } catch {
      setData(mockStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const categoryList = Object.entries(data.categoryStats).map(([category, count]) => ({
    category,
    count
  }));
  const maxCategoryCount = Math.max(...categoryList.map(c => c.count), 1);

  const uncollectedCategoryList = Object.entries(data.uncollectedStats.byArtworkCategory).map(([category, count]) => ({
    category,
    count
  }));
  const maxUncollectedCount = Math.max(...uncollectedCategoryList.map(c => c.count), 1);

  const handoverExceptionCategoryList = Object.entries(data.handoverStats.byCategory).map(([category, count]) => ({
    category,
    count
  }));
  const maxHandoverExceptionCount = Math.max(...handoverExceptionCategoryList.map(c => c.count), 1);

  const getHandoverTypeTag = (type: HandoverType) => {
    const colorMap: Record<HandoverType, string> = {
      entry: 'blue',
      sale: 'green',
      return: 'orange'
    };
    return <Tag color={colorMap[type]}>{HANDOVER_TYPE_MAP[type]}</Tag>;
  };

  const getProcessStatusTag = (status: HandoverProcessStatus) => {
    const colorMap: Record<HandoverProcessStatus, string> = {
      pending: 'red',
      processing: 'gold',
      resolved: 'green'
    };
    return <Tag color={colorMap[status]}>{HANDOVER_PROCESS_STATUS_MAP[status]}</Tag>;
  };

  return (
    <div>
      <h1 className="page-title">统计分析</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <PictureOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <div className="stat-number">{data.total.artworks}</div>
            <div className="stat-label">作品总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#52c41a' }}>{data.total.subscriptions}</div>
            <div className="stat-label">认购数量</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <CalendarOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#faad14' }}>{data.total.exhibitions}</div>
            <div className="stat-label">展期总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <InboxOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#722ed1' }}>{data.total.pickupRecords}</div>
            <div className="stat-label">取件数量</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <SwapOutlined style={{ fontSize: 32, color: '#13c2c2', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#13c2c2' }}>{data.total.handoverRecords}</div>
            <div className="stat-label">交接总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <WarningOutlined style={{ fontSize: 32, color: '#f5222d', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#f5222d' }}>{data.handoverStats.totalExceptions}</div>
            <div className="stat-label">交接异常数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <EnvironmentOutlined style={{ fontSize: 32, color: '#eb2f96', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#eb2f96' }}>{data.total.touringVenues}</div>
            <div className="stat-label">巡展场地数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <CarOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#fa8c16' }}>{data.touringStats.totalBookings}</div>
            <div className="stat-label">巡展预约总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <TrophyOutlined style={{ fontSize: 32, color: '#a0d911', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#a0d911' }}>{data.touringStats.approvalRate}%</div>
            <div className="stat-label">审核通过率</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <FireOutlined style={{ fontSize: 32, color: '#f5222d', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#f5222d' }}>{data.touringStats.conflictCount}</div>
            <div className="stat-label">冲突预约数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <CarOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#fa8c16' }}>{data.transportDeliveryStats.totalBatches}</div>
            <div className="stat-label">运输批次数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#52c41a' }}>{data.transportDeliveryStats.onTimeRate}%</div>
            <div className="stat-label">准时送达率</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#faad14' }}>{data.transportDeliveryStats.pendingReceiptCount}</div>
            <div className="stat-label">待签收数量</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <SafetyCertificateOutlined style={{ fontSize: 32, color: '#f5222d', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#f5222d' }}>{data.transportDeliveryStats.totalClaims}</div>
            <div className="stat-label">理赔总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <TeamOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#722ed1' }}>{data.total.docentVolunteers}</div>
            <div className="stat-label">志愿者人数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <div className="stat-card">
            <SoundOutlined style={{ fontSize: 32, color: '#13c2c2', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#13c2c2' }}>{data.total.docentActivities}</div>
            <div className="stat-label">讲解活动数</div>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>各类别作品数量</h3>
            <div className="bar-chart">
              {categoryList.map(item => (
                <div key={item.category} className="bar-item">
                  <div className="bar-value">{item.count}</div>
                  <div
                    className="bar"
                    style={{ height: `${(item.count / maxCategoryCount) * 100}%` }}
                  />
                  <div className="bar-label">{item.category}</div>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              交接完成率
              <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 400, color: '#666' }}>
                已完成 {data.handoverStats.completedRecords} / {data.handoverStats.totalRecords}
              </span>
            </h3>
            <div style={{ padding: '20px 0' }}>
              <Progress
                type="circle"
                percent={data.handoverStats.completionRate}
                size={180}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068'
                }}
                format={(percent) => `${percent}%`}
              />
            </div>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a', marginBottom: 4 }} />
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>已解决</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>
                    {data.handoverStats.byProcessStatus.resolved || 0}
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Badge color="gold" />
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>处理中</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#faad14' }}>
                    {data.handoverStats.byProcessStatus.processing || 0}
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Badge color="red" />
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>待处理</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#f5222d' }}>
                    {data.handoverStats.byProcessStatus.pending || 0}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>各类别交接异常分布</h3>
            {handoverExceptionCategoryList.length > 0 ? (
              <List
                dataSource={handoverExceptionCategoryList}
                renderItem={item => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{item.category}</span>
                        <span style={{ fontWeight: 600, color: '#f5222d' }}>{item.count} 件</span>
                      </div>
                      <Progress
                        percent={(item.count / maxHandoverExceptionCount) * 100}
                        size="small"
                        showInfo={false}
                        strokeColor="#f5222d"
                        trailColor="#ffebe6"
                      />
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无交接异常记录
              </div>
            )}
            <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>按交接类型分布</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Tag color="blue" style={{ margin: 0 }}>入展交接</Tag>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>
                    {data.handoverStats.byType.entry || 0} 件
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Tag color="orange" style={{ margin: 0 }}>返还交接</Tag>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>
                    {data.handoverStats.byType.return || 0} 件
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Tag color="green" style={{ margin: 0 }}>成交交接</Tag>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>
                    {data.handoverStats.byType.sale || 0} 件
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>展期成交率</h3>
            <List
              dataSource={data.exhibitionStats}
              renderItem={item => (
                <List.Item style={{ padding: '12px 0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 4, fontWeight: 500 }}>{item.name}</div>
                    <Progress
                      percent={item.dealRate}
                      size="small"
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068'
                      }}
                      format={(percent) => `${percent?.toFixed(1)}% 成交`}
                    />
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {item.soldArtworks}/{item.totalArtworks} 件
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <WarningOutlined style={{ color: '#f5222d', marginRight: 8 }} />
              待处理异常列表
            </h3>
            {data.handoverStats.pendingExceptions && data.handoverStats.pendingExceptions.length > 0 ? (
              <List
                dataSource={data.handoverStats.pendingExceptions}
                renderItem={item => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <span style={{ fontWeight: 500, marginRight: 8 }}>{item.artworkTitle}</span>
                          <Tag color="#999" style={{ marginRight: 6 }}>{item.artworkCategory}</Tag>
                          {getHandoverTypeTag(item.type)}
                          {getProcessStatusTag(item.processStatus)}
                        </div>
                      </div>
                      <div style={{
                        background: '#fff7e6',
                        border: '1px solid #ffd591',
                        borderRadius: 4,
                        padding: '8px 12px',
                        color: '#d46b08',
                        marginBottom: 8
                      }}>
                        <WarningOutlined style={{ marginRight: 6 }} />
                        {item.exceptionDescription}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        交接人：{item.handlerName} · {dayjs(item.handoverTime).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 12 }} />
                <div>所有异常已处理完毕</div>
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>作者参与活跃度</h3>
            <List
              dataSource={data.authorStats}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: index < 3 ? '#faad14' : '#d9d9d9',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      marginRight: 12,
                      fontSize: 14
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.author}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        作品 {item.totalWorks} 件 · 成交 {item.soldWorks} 件 · 活跃度 {item.activityScore}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={24}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>待取件统计</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>待取件总数</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: '#f5222d' }}>
                  {data.uncollectedStats.totalPending} 件
                </span>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>现场取件</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>
                      {data.uncollectedStats.byPickupMethod.onsite} 件
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>快递配送</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>
                      {data.uncollectedStats.byPickupMethod.delivery} 件
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>按类别分布</h4>
            {uncollectedCategoryList.length > 0 ? (
              <List
                dataSource={uncollectedCategoryList}
                renderItem={item => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{item.category}</span>
                        <span style={{ fontWeight: 600, color: '#f5222d' }}>{item.count} 件</span>
                      </div>
                      <Progress
                        percent={(item.count / maxUncollectedCount) * 100}
                        size="small"
                        showInfo={false}
                        strokeColor="#f5222d"
                        trailColor="#ffebe6"
                      />
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                暂无待取件记录
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <EnvironmentOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
              各场地使用次数
            </h3>
            {data.touringStats.venueUsage && data.touringStats.venueUsage.length > 0 ? (
              <List
                dataSource={data.touringStats.venueUsage}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index < 3 ? '#eb2f96' : '#d9d9d9',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        marginRight: 12,
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.venueName}</div>
                      </div>
                      <Tag color="magenta" style={{ margin: 0 }}>{item.count} 次</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无场地使用记录
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
              作品巡展参与次数
            </h3>
            {data.touringStats.artworkParticipation && data.touringStats.artworkParticipation.length > 0 ? (
              <List
                dataSource={data.touringStats.artworkParticipation}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index < 3 ? '#faad14' : '#d9d9d9',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        marginRight: 12,
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>作者：{item.author}</div>
                      </div>
                      <Tag color="gold" style={{ margin: 0 }}>{item.count} 次</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无作品参与记录
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              未来七天待布展
            </h3>
            {data.touringStats.upcomingSetupList && data.touringStats.upcomingSetupList.length > 0 ? (
              <List
                dataSource={data.touringStats.upcomingSetupList}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 500 }}>{item.bookingUnit}</span>
                        <Tag color="blue">{item.artworkCount} 件作品</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {item.venueName}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {item.startDate} ~ {item.endDate}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        <TeamOutlined style={{ marginRight: 4 }} />
                        负责人：{item.setupManager || '未指定'}
                        {item.transportMethod ? ` · ${item.transportMethod}` : ''}
                      </div>
                      {item.artworks && item.artworks.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {item.artworks.slice(0, 3).map(a => (
                            <Tag key={a.id} style={{ marginBottom: 4 }}>{a.title}</Tag>
                          ))}
                          {item.artworks.length > 3 && (
                            <Tag>等 {item.artworks.length} 件</Tag>
                          )}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 12 }} />
                <div>未来七天暂无布展任务</div>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <WarningOutlined style={{ color: '#f5222d', marginRight: 8 }} />
              各承运方式异常率
            </h3>
            {data.transportDeliveryStats.carrierExceptionRate && data.transportDeliveryStats.carrierExceptionRate.length > 0 ? (
              <List
                dataSource={data.transportDeliveryStats.carrierExceptionRate}
                renderItem={(item) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 500 }}>{item.method}</span>
                        <Tag color={item.exceptionRate > 0 ? 'red' : 'green'}>{item.exceptionRate}%</Tag>
                      </div>
                      <Progress
                        percent={item.exceptionRate}
                        size="small"
                        showInfo={false}
                        strokeColor="#f5222d"
                        trailColor="#ffebe6"
                      />
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        异常 {item.abnormal} / 共 {item.total} 批
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无承运数据
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <CarOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
              未来七天待出库清单
            </h3>
            {data.transportDeliveryStats.upcomingOutboundList && data.transportDeliveryStats.upcomingOutboundList.length > 0 ? (
              <List
                dataSource={data.transportDeliveryStats.upcomingOutboundList}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 500 }}>{item.bookingUnit}</span>
                        <Tag color="blue">{item.artworkCount} 件作品</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {item.venueName}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        计划出库：{dayjs(item.plannedOutboundTime).format('MM-DD HH:mm')}
                        {' · 送达 '}{dayjs(item.plannedArrivalTime).format('MM-DD HH:mm')}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        <CarOutlined style={{ marginRight: 4 }} />
                        {item.carrierMethod} · {item.carrierContact} {item.carrierPhone}
                        {item.insuranceAmount > 0 ? ` · 保额 ${item.insuranceAmount} 元` : ''}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 12 }} />
                <div>未来七天暂无待出库批次</div>
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <SafetyCertificateOutlined style={{ color: '#f5222d', marginRight: 8 }} />
              未结案理赔列表
            </h3>
            {data.transportDeliveryStats.unsettledClaims && data.transportDeliveryStats.unsettledClaims.length > 0 ? (
              <List
                dataSource={data.transportDeliveryStats.unsettledClaims}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 500 }}>{item.artworkTitle}</span>
                        <Tag color={CLAIM_STATUS_COLOR[item.claimStatus]}>
                          {CLAIM_STATUS_MAP[item.claimStatus]}
                        </Tag>
                        <Tag color="orange">理赔 {item.claimAmount} 元</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        预约单位：{item.bookingUnit} · 责任方：{item.responsibleParty || '-'}
                      </div>
                      {item.handlingDescription && (
                        <div style={{
                          background: '#fff7e6',
                          border: '1px solid #ffd591',
                          borderRadius: 4,
                          padding: '6px 10px',
                          color: '#d46b08',
                          fontSize: 12,
                          marginBottom: 4
                        }}>
                          {item.handlingDescription}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#999' }}>
                        处理人：{item.handler || '-'} · {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 12 }} />
                <div>暂无未结案理赔</div>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <SoundOutlined style={{ color: '#13c2c2', marginRight: 8 }} />
              讲解活动完成率
              <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 400, color: '#666' }}>
                已结束 {data.docentActivityStats.completedCount} / {data.docentActivityStats.totalActivities}
              </span>
            </h3>
            <div style={{ padding: '12px 0', textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={data.docentActivityStats.completionRate}
                size={150}
                strokeColor={{
                  '0%': '#13c2c2',
                  '100%': '#52c41a'
                }}
                format={(percent) => `${percent}%`}
              />
            </div>
            <Row gutter={8} style={{ marginTop: 16 }}>
              {Object.entries(DOCENT_ACTIVITY_STATUS_MAP).map(([key, label]) => (
                <Col span={6} key={key}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Tag color={DOCENT_ACTIVITY_STATUS_COLOR[key as keyof typeof DOCENT_ACTIVITY_STATUS_COLOR]} style={{ margin: 0 }}>
                      {label}
                    </Tag>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
                      {data.docentActivityStats.byStatus[key] || 0}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
              志愿者服务次数排行
            </h3>
            {data.docentActivityStats.volunteerServiceRanking && data.docentActivityStats.volunteerServiceRanking.length > 0 ? (
              <List
                dataSource={data.docentActivityStats.volunteerServiceRanking.slice(0, 10)}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index < 3 ? '#faad14' : '#d9d9d9',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        marginRight: 12,
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {item.expertiseCategory || '-'} · {item.organization || '-'}
                        </div>
                      </div>
                      <Tag color="gold" style={{ margin: 0 }}>{item.count} 次</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无志愿者服务记录
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <EnvironmentOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
              各场地讲解活动分布
            </h3>
            {data.docentActivityStats.venueDistribution && data.docentActivityStats.venueDistribution.length > 0 ? (
              <List
                dataSource={data.docentActivityStats.venueDistribution}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index < 3 ? '#eb2f96' : '#d9d9d9',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        marginRight: 12,
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.venueName}</div>
                      </div>
                      <Tag color="magenta" style={{ margin: 0 }}>{item.count} 场</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无场地讲解记录
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
              作品被讲解次数排行
            </h3>
            {data.docentActivityStats.artworkDocentRanking && data.docentActivityStats.artworkDocentRanking.length > 0 ? (
              <List
                dataSource={data.docentActivityStats.artworkDocentRanking.slice(0, 10)}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index < 3 ? '#faad14' : '#d9d9d9',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        marginRight: 12,
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>作者：{item.author}</div>
                      </div>
                      <Tag color="gold" style={{ margin: 0 }}>{item.count} 次</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无作品讲解记录
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="page-card">
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              未来七天待讲解清单
            </h3>
            {data.docentActivityStats.upcomingDocentList && data.docentActivityStats.upcomingDocentList.length > 0 ? (
              <List
                dataSource={data.docentActivityStats.upcomingDocentList}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 500 }}>{item.theme}</span>
                        <Tag color="blue">{item.artworkCount} 件作品</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {item.venueName} · {item.bookingUnit}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {item.docentDate} {item.startTime}-{item.endTime}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: item.volunteers?.length ? 4 : 0 }}>
                        <TeamOutlined style={{ marginRight: 4 }} />
                        负责人：{item.manager || '-'} · 预计 {item.expectedAttendees} 人
                      </div>
                      {item.volunteers && item.volunteers.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {item.volunteers.map(v => (
                            <Tag key={v.id} style={{ marginBottom: 4 }}>{v.name}（{v.role}）</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 12 }} />
                <div>未来七天暂无讲解任务</div>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {data.docentActivityStats.conflictCount > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={24}>
            <div className="page-card">
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                <WarningOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                排班冲突明细
                <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 400, color: '#f5222d' }}>
                  共 {data.docentActivityStats.conflictCount} 处冲突
                </span>
              </h3>
              {data.docentActivityStats.conflictDetails && data.docentActivityStats.conflictDetails.length > 0 ? (
                <List
                  grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
                  dataSource={data.docentActivityStats.conflictDetails}
                  renderItem={(item) => (
                    <List.Item>
                      <Card size="small" style={{ borderColor: '#ffccc7' }}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>
                          <TeamOutlined style={{ marginRight: 6, color: '#f5222d' }} />
                          {item.volunteerName}
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                          <SoundOutlined style={{ marginRight: 4 }} />
                          {item.theme}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {item.docentDate} {item.startTime}-{item.endTime}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                  暂无冲突详情
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default StatisticsPage;
