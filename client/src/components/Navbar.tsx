import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

const menuItems = [
  { key: '/artworks', label: '作品档案' },
  { key: '/exhibitions', label: '展期管理' },
  { key: '/subscriptions', label: '认购登记' },
  { key: '/pickups', label: '取件流转' },
  { key: '/handovers', label: '交接清单' },
  { key: '/revenues', label: '收益分配' },
  { key: '/statistics', label: '统计分析' }
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Header style={{
      background: '#fff',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
      lineHeight: '70px'
    }}>
      <div style={{
        fontSize: '22px',
        fontWeight: '700',
        color: '#1890ff',
        letterSpacing: '1px'
      }}>
        老年大学作品管理系统
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderBottom: 'none',
          fontSize: '16px',
          minWidth: '500px'
        }}
      />
    </Header>
  );
}

export default Navbar;
