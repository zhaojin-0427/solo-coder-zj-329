import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import ArtworksPage from './pages/ArtworksPage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import TouringExhibitionsPage from './pages/TouringExhibitionsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import PickupsPage from './pages/PickupsPage';
import HandoversPage from './pages/HandoversPage';
import RevenuesPage from './pages/RevenuesPage';
import StatisticsPage from './pages/StatisticsPage';

const { Content } = Layout;

function App() {
  return (
    <Layout className="app-container">
      <Navbar />
      <Content className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/artworks" replace />} />
          <Route path="/artworks" element={<ArtworksPage />} />
          <Route path="/exhibitions" element={<ExhibitionsPage />} />
          <Route path="/touring" element={<TouringExhibitionsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/pickups" element={<PickupsPage />} />
          <Route path="/handovers" element={<HandoversPage />} />
          <Route path="/revenues" element={<RevenuesPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
