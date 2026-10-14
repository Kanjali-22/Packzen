import { Routes, Route } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import TemplateGallery from './pages/TemplateGallery';
import DetailPage from './pages/DetailPage';
import PricingPage from './pages/PricingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import DielineTemplatesPage from './pages/DielineTemplatesPage';

function Shell({ children }) {
  return <PageLayout>{children}</PageLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell><HomePage /></Shell>} />
      <Route path="/mockups" element={<Shell><TemplateGallery /></Shell>} />
      <Route path="/mockups/:category" element={<Shell><TemplateGallery /></Shell>} />
      <Route path="/mockups/item/:slug" element={<Shell><DetailPage /></Shell>} />
      <Route path="/dieline" element={<Shell><DielineTemplatesPage /></Shell>} />
      <Route path="/pricing" element={<Shell><PricingPage /></Shell>} />
      <Route path="/editor" element={<PlaceholderPage />} />
      <Route path="/editor/:templateId" element={<PlaceholderPage />} />
      {[
        ['/ai-creation', 'AI creation'],
        ['/packaging-lab', 'Packaging lab'],
        ['/login', 'Welcome back'],
        ['/signup', 'Create your PackZen account']
      ].map(([p, k]) => (
        <Route key={p} path={p} element={<Shell><PlaceholderPage kind={k} /></Shell>} />
      ))}
      <Route path="*" element={<Shell><PlaceholderPage kind="Page not found" /></Shell>} />
    </Routes>
  );
}
