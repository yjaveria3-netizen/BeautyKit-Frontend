import React from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import HeroIllustration from '../components/HeroIllustration';

export default function DashboardPage({ user, logout, profiles, loadProfile, deleteProfile }) {
  const navigate = useNavigate();
  
  return (
    <div className="app">
      <Ambient />
      <nav className="nav">
        <span className="nav-brand">Beauty Kit</span>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">✦ {user.name}</span>
              <button className="btn-ghost small" onClick={logout}>Sign Out</button>
            </>
          ) : (
            <button className="btn-primary small" onClick={() => navigate('/auth')}>Sign In</button>
          )}
        </div>
      </nav>
      <div className="dashboard">
        <div className="dash-header">
          <div>
            <h2 className="dash-title">{user ? 'Your Beauty Profiles' : 'Beauty Profiles'}</h2>
            <p className="dash-sub">
              {user 
                ? 'Save multiple skin analysis results for different people or occasions.' 
                : 'Sign in to save and manage your beauty profiles across devices.'
              }
            </p>
          </div>
          <button className="btn-primary" onClick={() => user ? navigate('/scan') : navigate('/auth')}>
            {user ? '+ New Scan' : 'Sign In to Start'}
          </button>
        </div>
        
        {!profiles || profiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <h3>{user ? 'No profiles yet' : 'Sign in to manage profiles'}</h3>
            <p>
              {user 
                ? 'Scan your skin tone to create your first beauty profile.' 
                : 'Create an account to start building your personalized beauty profile collection.'
              }
            </p>
            <button className="btn-primary" onClick={() => user ? navigate('/scan') : navigate('/auth')}>
              {user ? 'Start Your First Scan' : 'Create Account'}
            </button>
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles.map(p => (
              <div key={p.id || p._id} className="profile-card" onClick={() => loadProfile(p)}>
                <div className="profile-avatar-sm">
                  {p.avatar ? (
                    <img src={`http://localhost:5000${p.avatar}`} alt={p.profileName} className="profile-image" />
                  ) : (
                    <HeroIllustration colors={{
                      skin: p.skinTone?.hex || '#f4c2a1',
                      hair: p.recommendations?.hair?.colors?.[0]?.hex || '#3B1F0A',
                      top: p.recommendations?.clothing?.colors?.[0]?.hex || '#9b7fe8',
                      lipstick: p.recommendations?.lipstick?.[0]?.hex || '#C45C75',
                      blush: p.recommendations?.blush?.[0]?.hex || '#E88070',
                      eyeshadow: p.recommendations?.eyeshadow?.[0]?.hex || '#8B7355',
                      jewelry: p.recommendations?.jewelry?.metals?.[0]?.hex || '#FFD700'
                    }} />
                  )}
                </div>
                <div className="profile-name">{p.profileName}</div>
                <div className="profile-tone">{p.skinTone?.name || 'Unknown'}</div>
                <div className="profile-badges">
                  <span className="mini-badge">{p.skinTone?.undertone || 'N/A'}</span>
                  <span className="mini-badge">{p.skinTone?.depth || 'N/A'}</span>
                </div>
                <div className="profile-swatch" style={{ background: p.skinTone?.hex || '#f4c2a1' }} />
                <button className="profile-delete" onClick={e => { e.stopPropagation(); deleteProfile(p.id || p._id); }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
