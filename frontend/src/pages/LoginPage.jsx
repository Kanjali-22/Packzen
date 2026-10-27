import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Box,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

export default function LoginPage({ initialMode = 'login' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, logout, isAuthenticated } = useAuth();

  const [mode, setMode] = useState(
    location.pathname === '/signup' || initialMode === 'signup'
      ? 'signup'
      : location.pathname === '/forgot-password' || initialMode === 'forgot'
      ? 'forgot'
      : 'login'
  );

  useEffect(() => {
    if (location.pathname === '/signup') setMode('signup');
    else if (location.pathname === '/forgot-password') setMode('forgot');
    else if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetDetails, setResetDetails] = useState(null);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const res = await authService.forgotPassword(formData.email);
        setSuccess(res.message || 'Password reset link sent to your email.');
        setResetDetails({
          resetUrl: res.resetUrl,
          previewUrl: res.previewUrl,
          isRealEmail: res.isRealEmail
        });
      } else if (mode === 'login') {
        const res = await login(formData.email, formData.password);
        setSuccess(res.message || 'Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/mockups');
        }, 800);
      } else {
        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company
        });
        setSuccess(res.message || 'Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/mockups');
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setSuccess('');
    setFormData((prev) => ({
      ...prev,
      email: 'alex@packzen.com',
      password: 'packzen2026'
    }));
    setLoading(true);

    try {
      const res = await login('alex@packzen.com', 'packzen2026');
      setSuccess('Demo account loaded! Redirecting to studio...');
      setTimeout(() => {
        navigate('/mockups');
      }, 700);
    } catch (err) {
      setError(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Column: Visual Showcase */}
      <aside className="auth-showcase">
        <div className="auth-showcase__ambient" />

        <div className="auth-showcase__header">
          <Link className="brand" to="/" style={{ color: '#fff' }}>
            <span>◒</span>PackZen
          </Link>
          <div className="auth-showcase__badge">
            <span className="pulse-dot" />
            <span>Studio Engine v2.4</span>
          </div>
        </div>

        <div className="auth-showcase__center">
          <h2 className="auth-showcase__title">
            Where luxury packaging meets <em>mathematical perfection</em>.
          </h2>
          <p className="auth-showcase__desc">
            Access your studio dielines, 3D parametric boxes, and real-time AI rendering in one unified workspace.
          </p>

          <div className="auth-box-card">
            <div className="auth-box-card__head">
              <div className="auth-box-card__brand">
                <Box size={18} color="#b99bfd" />
                <span>PACKZEN LUXE · NO. 07</span>
              </div>
              <span className="auth-box-card__chip">Active Session</span>
            </div>

            <div className="auth-box-card__features">
              <div className="auth-feature-pill">
                <span>Dieline Precision</span>
                <strong>0.01 mm</strong>
              </div>
              <div className="auth-feature-pill">
                <span>3D Renderer</span>
                <strong>WebGL 2.0 PBR</strong>
              </div>
              <div className="auth-feature-pill">
                <span>Export Formats</span>
                <strong>PDF · AI · OBJ</strong>
              </div>
            </div>

            <div className="auth-compass-badge">
              <ShieldCheck size={18} />
              <div>
                <strong>Enterprise Studio Security</strong>
                <div>End-to-end encrypted workspace for all proprietary packaging files.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-showcase__footer">
          <p className="auth-showcase__quote">
            “PackZen has accelerated our structural packaging design workflow from weeks to hours.”
          </p>
          <span className="auth-showcase__author">— Aster Labs, Structural Engineering Team</span>
        </div>
      </aside>

      {/* Right Column: Auth Form */}
      <main className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-card__brand">
            <span>◒</span>PackZen
          </div>

          {isAuthenticated && user ? (
            <div className="auth-logged-in-card">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                alt={user.name}
                className="auth-logged-avatar"
              />
              <h2>Welcome back, {user.name}!</h2>
              <p>You are currently signed in as <strong>{user.email}</strong> ({user.company || 'Studio'}).</p>

              <div className="auth-logged-actions">
                <Link to="/mockups" className="button button--purple button--wide">
                  Go to Mockup Studio <ArrowRight size={15} />
                </Link>
                <Link to="/dieline" className="button button--dark button--wide">
                  Open Dieline Templates
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="button button--sm"
                  style={{ marginTop: '8px', border: '1px solid #d9d7dc' }}
                >
                  Log out of this account
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-card__header">
                {mode === 'forgot' ? (
                  <>
                    <h1>Forgot your password?</h1>
                    <p>Enter the email associated with your account and we will send you a secure password reset link.</p>
                  </>
                ) : (
                  <>
                    <h1>{mode === 'login' ? 'Sign in to PackZen' : 'Create your studio account'}</h1>
                    <p>
                      {mode === 'login'
                        ? 'Enter your credentials to access your packaging workspace.'
                        : 'Get started with real-time dielines and AI packaging mockups.'}
                    </p>
                  </>
                )}
              </div>

              {/* Mode Switcher Tabs (only for login & signup) */}
              {mode !== 'forgot' ? (
                <div className="auth-tabs" role="tablist">
                  <button
                    type="button"
                    className={`auth-tab-btn ${mode === 'login' ? 'is-active' : ''}`}
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn ${mode === 'signup' ? 'is-active' : ''}`}
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Create account
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                    setResetDetails(null);
                  }}
                  style={{
                    background: 'none',
                    border: 0,
                    color: '#7652f6',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '18px',
                    padding: 0
                  }}
                >
                  ← Back to Sign in
                </button>
              )}

              {/* Quick Demo Login Pill (only on login mode) */}
              {mode === 'login' && (
                <div className="auth-demo-banner">
                  <div className="auth-demo-banner__info">
                    <div className="auth-demo-banner__icon">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p><strong>Quick Demo Access</strong></p>
                      <p>Pre-configured with seeded user</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleQuickDemo} disabled={loading}>
                    {loading ? 'Logging in...' : '1-Click Demo'}
                  </button>
                </div>
              )}

              {/* Alerts */}
              {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              {success && !resetDetails && (
                <div className="auth-alert auth-alert--success" role="alert">
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{success}</span>
                </div>
              )}

              {/* If in forgot mode and link was dispatched */}
              {mode === 'forgot' && resetDetails ? (
                <div style={{ background: '#fbf9ff', border: '1.5px solid #d5caee', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee9ff', color: '#7652f6', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                    <Mail size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                    Check your inbox
                  </h3>
                  <p style={{ color: '#595564', fontSize: '13px', lineHeight: 1.5, margin: '0 0 20px' }}>
                    An email with your password reset link has been dispatched to <strong>{formData.email}</strong>. Please check your inbox and Spam folder to create a new password.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setSuccess('');
                      setResetDetails(null);
                    }}
                    className="button button--dark button--wide button--sm"
                  >
                    Return to Sign in
                  </button>
                </div>
              ) : (
                /* Auth & Forgot Form */
                <form className="auth-form" onSubmit={handleSubmit}>
                  {mode === 'signup' && (
                    <>
                      <div className="auth-field">
                        <label htmlFor="auth-name">Full name</label>
                        <div className="auth-input-container">
                          <span className="auth-input-icon"><User size={16} /></span>
                          <input
                            id="auth-name"
                            name="name"
                            type="text"
                            required
                            placeholder="Elena Vance"
                            value={formData.name}
                            onChange={handleChange}
                            className="auth-input"
                            autoComplete="name"
                          />
                        </div>
                      </div>

                      <div className="auth-field">
                        <label htmlFor="auth-company">Studio or Brand name</label>
                        <div className="auth-input-container">
                          <span className="auth-input-icon"><Building size={16} /></span>
                          <input
                            id="auth-company"
                            name="company"
                            type="text"
                            placeholder="Luxe Packaging Co."
                            value={formData.company}
                            onChange={handleChange}
                            className="auth-input"
                            autoComplete="organization"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="auth-field">
                    <label htmlFor="auth-email">Work email</label>
                    <div className="auth-input-container">
                      <span className="auth-input-icon"><Mail size={16} /></span>
                      <input
                        id="auth-email"
                        name="email"
                        type="email"
                        required
                        placeholder="alex@packzen.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="auth-input"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div className="auth-field">
                      <label htmlFor="auth-password">Password</label>
                      <div className="auth-input-container">
                        <span className="auth-input-icon"><Lock size={16} /></span>
                        <input
                          id="auth-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className="auth-input"
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          minLength={6}
                        />
                        <button
                          type="button"
                          aria-label="Toggle password visibility"
                          className="auth-toggle-pwd"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="auth-subrow">
                      <label className="auth-checkbox">
                        <input type="checkbox" defaultChecked />
                        <span>Remember workstation</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setSuccess('');
                          setResetDetails(null);
                        }}
                        className="auth-forgot-link"
                        style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit-btn"
                  >
                    {loading ? (
                      <>
                        <span className="auth-spinner" />
                        <span>
                          {mode === 'forgot'
                            ? 'Sending reset link...'
                            : mode === 'login'
                            ? 'Authenticating...'
                            : 'Creating studio account...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === 'forgot'
                            ? 'Send Password Reset Link'
                            : mode === 'login'
                            ? 'Sign in to PackZen'
                            : 'Create Studio Account'}
                        </span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {mode !== 'forgot' && (
                <>
                  <div className="auth-divider">
                    <span>Or continue with</span>
                  </div>

                  <div className="auth-social-row">
                    <button
                      type="button"
                      className="auth-social-btn"
                      onClick={() => handleQuickDemo()}
                    >
                      <svg viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      className="auth-social-btn"
                      onClick={() => handleQuickDemo()}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>GitHub</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
