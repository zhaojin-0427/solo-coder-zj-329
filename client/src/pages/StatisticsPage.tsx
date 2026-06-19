import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Progress, Spin, Tag, Badge } from 'antd';
import {
  PictureOutlined,
  CalendarOutlined,
  TeamOutlined,
  InboxOutlined,
  SwapOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { getStatistics } from '../api/statistics';
import type { StatisticsData } from '../types/statistics';
import type { HandoverType, HandoverProcessStatus } from '../types/handover';
import { HANDOVER_TYPE_MAP, HANDOVER_PROCESS_STATUS_MAP } from '../types/handover';
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
  total: { artworks: 8, exhibitions: 2, subscriptions: 5, pickupRecords: 3, handoverRecords: 6 }
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
    </div>
  );
}

export default StatisticsPage;
