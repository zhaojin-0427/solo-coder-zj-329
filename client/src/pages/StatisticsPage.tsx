import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Progress, Spin } from 'antd';
import {
  PictureOutlined,
  CalendarOutlined,
  TeamOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { getStatistics } from '../api/statistics';
import type { StatisticsData } from '../types/statistics';

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
  total: { artworks: 8, exhibitions: 2, subscriptions: 5, pickupRecords: 3 }
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

  return (
    <div>
      <h1 className="page-title">统计分析</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <div className="stat-card">
            <PictureOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <div className="stat-number">{data.total.artworks}</div>
            <div className="stat-label">作品总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <div className="stat-card">
            <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#52c41a' }}>{data.total.subscriptions}</div>
            <div className="stat-label">认购数量</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <div className="stat-card">
            <CalendarOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#faad14' }}>{data.total.exhibitions}</div>
            <div className="stat-label">展期总数</div>
          </div>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <div className="stat-card">
            <InboxOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div className="stat-number" style={{ color: '#722ed1' }}>{data.total.pickupRecords}</div>
            <div className="stat-label">取件数量</div>
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

        <Col xs={24} md={12}>
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
