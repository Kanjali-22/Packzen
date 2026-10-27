import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Database
} from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError('No reset token was provided in the URL.');
        setVerifying(false);
        return;
      }

      try {
        const res = await authService.verifyResetToken(token);
        if (res.success) {
          setUserEmail(res.email);
          setUserName(res.name || '');
        } else {
          setTokenError(res.message || 'Reset link is invalid or expired.');
        }
      } catch (err) {
        setTokenError(err.message || 'This password reset link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
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
            <span>Security Shield</span>
          </div>
        </div>

        <div className="auth-showcase__center">
          <h2 className="auth-showcase__title">
            Secure Account <em>Authentication</em>.
          </h2>
          <p className="auth-showcase__desc">
            Your PackZen credentials protect your proprietary dieline blueprints, 3D assets, and custom packaging exports.
          </p>

          <div className="auth-box-card">
            <div className="auth-box-card__head">
              <div className="auth-box-card__brand">
                <ShieldCheck size={18} color="#34d399" />
                <span>Bcrypt Salt Protection</span>
              </div>
              <span className="auth-box-card__chip">Encrypted</span>
            </div>

            <div className="auth-box-card__features">
              <div className="auth-feature-pill">
                <span>Encryption</span>
                <strong>Bcrypt 10 Rounds</strong>
              </div>
              <div className="auth-feature-pill">
                <span>Token Life</span>
                <strong>60 Minutes</strong>
              </div>
              <div className="auth-feature-pill">
                <span>Security</span>
                <strong>Single-Use SHA-256</strong>
              </div>
            </div>

            <div className="auth-compass-badge">
              <ShieldCheck size={18} />
              <div>
                <strong>Enterprise Account Protection</strong>
                <div>Cryptographic token authentication with instant invalidation.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-showcase__footer">
          <p className="auth-showcase__quote">
            “Single-use cryptographic reset tokens guarantee enterprise-grade security for your brand assets.”
          </p>
          <span className="auth-showcase__author">— PackZen Platform Security</span>
        </div>
      </aside>

      {/* Right Column: Reset Form */}
      <main className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-card__brand">
            <span>◒</span>PackZen
          </div>

          {verifying ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="auth-spinner" style={{ margin: '0 auto 16px', borderColor: '#7652f6', borderTopColor: 'transparent', width: '28px', height: '28px' }} />
              <p style={{ color: '#666', fontSize: '13px' }}>Verifying your secure reset link...</p>
            </div>
          ) : tokenError ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fdf2f2', color: '#e02424', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <AlertCircle size={28} />
              </div>
              <h2 style={{ fontSize: '22px', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Link Expired or Invalid</h2>
              <p style={{ color: '#666', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.5 }}>
                {tokenError}
              </p>
              <Link to="/login" className="button button--dark button--wide">
                Request a new reset link
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#edfcf2', color: '#057a55', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={30} />
              </div>
              <h2 style={{ fontSize: '22px', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Password Updated!</h2>
              <p style={{ color: '#666', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.5 }}>
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Link to="/login" className="button button--purple button--wide">
                Sign in to your account <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-card__header">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7652f6', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                  <KeyRound size={15} />
                  <span>Choose New Password</span>
                </div>
                <h1>Reset your password</h1>
                <p>
                  Resetting password for <strong>{userEmail}</strong>. Please enter a strong password with at least 6 characters.
                </p>
              </div>

              {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="reset-new-password">New password</label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon"><Lock size={16} /></span>
                    <input
                      id="reset-new-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => { setError(''); setPassword(e.target.value); }}
                      className="auth-input"
                      minLength={6}
                      autoComplete="new-password"
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

                <div className="auth-field">
                  <label htmlFor="reset-confirm-password">Confirm new password</label>
                  <div className="auth-input-container">
                    <span className="auth-input-icon"><Lock size={16} /></span>
                    <input
                      id="reset-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type your new password"
                      value={confirmPassword}
                      onChange={(e) => { setError(''); setConfirmPassword(e.target.value); }}
                      className="auth-input"
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: '#7652f6', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                  ← Return to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
