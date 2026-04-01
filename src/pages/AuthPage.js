import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import { apiFetch, setToken } from '../utils/api';
import { calculatePasswordStrength } from '../utils/helpers';

export default function AuthPage({ authMode, setAuthMode, setUser, loadProfiles }) {
  const navigate = useNavigate();
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [rememberMe, setRememberMe] = useState(true); // Default to checked

  useEffect(() => {
    if (authMode === 'signup') {
      setPasswordStrength(calculatePasswordStrength(authForm.password));
    }
  }, [authForm.password, authMode]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const ep = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
      const body = authMode === 'signup' 
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password };
      const data = await apiFetch(ep, { method: 'POST', body: JSON.stringify(body) });
      setToken(data.token, rememberMe);
      setUser(data.user);
      await loadProfiles();
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message);
    }
    setAuthLoading(false);
  }

  return (
    <div className="app">
      <Ambient />
      <div className="auth-page">
        <div className="auth-card">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <div className="auth-brand">Beauty Kit</div>
          <h2 className="auth-title">{authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="auth-sub">{authMode === 'signup' ? 'Start your beauty intelligence journey' : 'Sign in to your beauty profiles'}</p>
          {authError && <div className="error-box">{authError}</div>}
          <form onSubmit={handleAuth} className="auth-form">
            {authMode === 'signup' && (
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} required />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  {showPassword
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
              {authMode === 'signup' && authForm.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`strength-bar ${i <= passwordStrength.score ? 'active' : ''}`} style={{ backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '' }} />)}
                  </div>
                  {passwordStrength.label && <div className="strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</div>}
                </div>
              )}
            </div>
            <div className="field remember-me-field">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)} 
                />
                <span className="checkmark"></span>
                Remember me for 30 days
              </label>
            </div>
            <button type="submit" className="btn-primary full" disabled={authLoading}>{authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}</button>
          </form>
          <p className="auth-switch">
            {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setAuthError(''); setShowPassword(false); setPasswordStrength({ score: 0, label: '', color: '' }); }}>
              {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
