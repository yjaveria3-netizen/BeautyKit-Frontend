import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import { apiFetch } from '../utils/api';

export default function AuthPage({ mode, setMode, setUser }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/signin';
      const body = isSignup ? { name, email, password } : { email, password };
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      localStorage.setItem('bk_token', data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <Ambient />

      <div className="auth-page-inner">
        {/* Brand Header */}
        <div className="auth-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="auth-brand-logo">✦</span>
          <span className="auth-brand-name">Beauty Kit</span>
        </div>

        <div className="auth-card">
          {/* Card Header */}
          <div className="auth-card-header">
            <h1 className="auth-title">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="auth-subtitle">
              {isSignup
                ? 'Join to save your beauty profiles & personalized looks'
                : 'Sign in to access your saved beauty profiles'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${!isSignup ? 'active' : ''}`}
              onClick={() => { setMode('signin'); setError(''); }}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${isSignup ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="auth-name"
                    className="auth-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={isSignup}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-pass">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="auth-pass"
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder={isSignup ? 'Create a password' : 'Your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span className="auth-error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn-primary full auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  {isSignup ? 'Creating account…' : 'Signing in…'}
                </span>
              ) : (
                isSignup ? 'Create Account →' : 'Sign In →'
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-card-footer">
            <span className="auth-footer-text">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              className="auth-switch-btn"
              onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(''); }}
              type="button"
            >
              {isSignup ? 'Sign in instead' : 'Create one free'}
            </button>
          </div>

          {/* Skip option */}
          <div className="auth-skip-row">
            <button
              className="auth-skip-btn"
              onClick={() => navigate('/scan')}
              type="button"
            >
              Skip for now — try without account
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="auth-trust">
          <div className="auth-trust-item">🔒 Secure JWT auth</div>
          <div className="auth-trust-sep">·</div>
          <div className="auth-trust-item">💾 Save unlimited profiles</div>
          <div className="auth-trust-sep">·</div>
          <div className="auth-trust-item">✦ Always free</div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem 1.25rem;
          box-sizing: border-box;
        }

        .auth-page-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
        }

        .auth-brand-logo {
          font-size: 1.4rem;
          color: var(--gold, #c4a84a);
        }

        .auth-brand-name {
          font-family: var(--serif, Georgia, serif);
          font-size: 1.6rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: var(--gold-light, #e8d080);
          text-shadow: 0 0 30px rgba(200, 170, 80, 0.3);
        }

        .auth-card {
          width: 100%;
          background: linear-gradient(145deg, rgba(19,19,42,0.96), rgba(9,9,26,0.98));
          border: 1px solid rgba(65,105,225,0.2);
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          box-shadow:
            0 40px 80px rgba(0,0,0,0.7),
            0 0 0 1px rgba(65,105,225,0.1),
            inset 0 1px 0 rgba(255,255,255,0.06);
          box-sizing: border-box;
        }

        .auth-card-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .auth-title {
          font-family: var(--serif, Georgia, serif);
          font-size: 2rem;
          font-weight: 400;
          margin: 0 0 0.5rem;
          background: linear-gradient(135deg, var(--gold-light, #e8d080), var(--rose-light, #e8a0c0));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .auth-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted, #888);
          line-height: 1.5;
          margin: 0;
          padding: 0 0.5rem;
        }

        .auth-tabs {
          display: flex;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(65,105,225,0.15);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 1.75rem;
          gap: 4px;
        }

        .auth-tab {
          flex: 1;
          padding: 0.6rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-family: var(--sans, system-ui, sans-serif);
          font-size: 0.82rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: var(--text-muted, #888);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .auth-tab.active {
          background: linear-gradient(135deg, rgba(65,105,225,0.25), rgba(65,105,225,0.1));
          color: var(--gold-light, #e8d080);
          border: 1px solid rgba(65,105,225,0.3);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .auth-label {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted, #888);
        }

        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 1rem;
          font-size: 0.85rem;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        .auth-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.6rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(65,105,225,0.2);
          border-radius: 10px;
          font-family: var(--sans, system-ui, sans-serif);
          font-size: 0.9rem;
          color: var(--text, #fff);
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .auth-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .auth-input:focus {
          border-color: rgba(65,105,225,0.5);
          background: rgba(65,105,225,0.06);
          box-shadow: 0 0 0 3px rgba(65,105,225,0.1);
        }

        .auth-pass-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          opacity: 0.5;
          transition: opacity 0.2s;
          padding: 0.25rem;
          line-height: 1;
        }

        .auth-pass-toggle:hover { opacity: 1; }

        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(200, 50, 50, 0.12);
          border: 1px solid rgba(200, 50, 50, 0.3);
          border-radius: 10px;
          font-size: 0.82rem;
          color: #ff9090;
          line-height: 1.4;
        }

        .auth-error-icon { flex-shrink: 0; margin-top: 1px; }

        .auth-submit {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, var(--gold, #c4a84a), #a8863a);
          border: none;
          border-radius: 12px;
          font-family: var(--sans, system-ui, sans-serif);
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: #0a0a14;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(200, 160, 50, 0.3);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }

        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(10,10,20,0.3);
          border-top-color: #0a0a14;
          border-radius: 50%;
          animation: auth-spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes auth-spin { to { transform: rotate(360deg); } }

        .auth-card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(65,105,225,0.1);
          flex-wrap: wrap;
        }

        .auth-footer-text {
          font-size: 0.8rem;
          color: var(--text-dim, #666);
        }

        .auth-switch-btn {
          background: none;
          border: none;
          font-family: var(--sans, system-ui, sans-serif);
          font-size: 0.8rem;
          color: var(--gold, #c4a84a);
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }

        .auth-switch-btn:hover { color: var(--gold-light, #e8d080); }

        .auth-skip-row {
          text-align: center;
          margin-top: 1rem;
        }

        .auth-skip-btn {
          background: none;
          border: none;
          font-family: var(--sans, system-ui, sans-serif);
          font-size: 0.75rem;
          color: var(--text-dim, #555);
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .auth-skip-btn:hover { color: var(--text-muted, #888); }

        .auth-trust {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .auth-trust-item {
          font-size: 0.72rem;
          color: var(--text-dim, #555);
          letter-spacing: 0.05em;
        }

        .auth-trust-sep {
          color: rgba(255,255,255,0.15);
          font-size: 0.8rem;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .auth-title { font-size: 1.7rem; }

          .auth-trust { display: none; }
        }
      `}</style>
    </div>
  );
}