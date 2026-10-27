import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import TemplateGallery from './pages/TemplateGallery';
import DetailPage from './pages/DetailPage';
import PricingPage from './pages/PricingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import DielineTemplatesPage from './pages/DielineTemplatesPage';
import DielineStudio from './pages/DielineStudio';
import DielineConfigurePage from './pages/DielineConfigurePage';

function Shell({ children }) {
  return <PageLayout>{children}</PageLayout>;
}

function AiCreationRedirect() {
  useEffect(() => {
    window.location.replace('https://mockup-studio-ai.vercel.app/');
  }, []);

  return (
    <div style={{ display: 'grid', minHeight: '60vh', placeItems: 'center', textAlign: 'center', padding: '24px' }}>
      <div>
        <p className="eyebrow">PACKZEN AI STUDIO</p>
        <h2 style={{ fontSize: '24px', letterSpacing: '-0.04em', margin: '0 0 12px' }}>
          Redirecting to AI Creation...
        </h2>
        <p style={{ color: '#666', fontSize: '13px', margin: '0 0 20px' }}>
          Taking you to{' '}
          <a
            href="https://mockup-studio-ai.vercel.app/"
            style={{ color: 'var(--purple, #7652f6)', textDecoration: 'underline', fontWeight: 600 }}
          >
            mockup-studio-ai.vercel.app
          </a>
        </p>
        <a
          href="https://mockup-studio-ai.vercel.app/"
          className="button button--dark button--sm"
        >
          Open AI Creation Studio
        </a>
      </div>
    </div>
  );
}

import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell><HomePage /></Shell>} />
      <Route path="/mockups" element={<Shell><TemplateGallery /></Shell>} />
      <Route path="/mockups/:category" element={<Shell><TemplateGallery /></Shell>} />
      <Route path="/mockups/item/:slug" element={<Shell><DetailPage /></Shell>} />
      <Route path="/dieline" element={<Shell><DielineTemplatesPage /></Shell>} />
      <Route path="/dieline/configure" element={<Shell><DielineConfigurePage /></Shell>} />
      <Route path="/dieline/editor" element={<Shell><DielineStudio /></Shell>} />
      <Route path="/pricing" element={<Shell><PricingPage /></Shell>} />
      <Route path="/editor" element={<PlaceholderPage />} />
      <Route path="/editor/:templateId" element={<PlaceholderPage />} />
      <Route path="/ai-creation" element={<Shell><AiCreationRedirect /></Shell>} />
      <Route path="/login" element={<Shell><LoginPage initialMode="login" /></Shell>} />
      <Route path="/signup" element={<Shell><LoginPage initialMode="signup" /></Shell>} />
      <Route path="/forgot-password" element={<Shell><LoginPage initialMode="forgot" /></Shell>} />
      <Route path="/reset-password" element={<Shell><ResetPasswordPage /></Shell>} />
      {[
        ['/packaging-lab', 'Packaging lab']
      ].map(([p, k]) => (
        <Route key={p} path={p} element={<Shell><PlaceholderPage kind={k} /></Shell>} />
      ))}
      <Route path="*" element={<Shell><PlaceholderPage kind="Page not found" /></Shell>} />
    </Routes>
  );
}
