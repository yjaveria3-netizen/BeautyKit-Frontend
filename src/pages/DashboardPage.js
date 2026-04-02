import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import { apiFetch } from '../utils/api';

export default function DashboardPage({ user, setUser, loadProfiles, profiles = [] }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchProfiles();
  }, [user]);

  async function fetchProfiles() {
    setLoading(true);
    try { await loadProfiles(); } catch (e) { /* silent */ }
    setLoading(false);
  }

  async function deleteProfile(id) {
    setDeleting(id);
    try {
      await apiFetch(`/api/profiles/${id}`, { method: 'DELETE' });
      await loadProfiles();
    } catch (e) { alert('Failed to delete profile.'); }
    setDeleting(null);
  }

  function signOut() {
    localStorage.removeItem('bk_token');
    setUser(null);
    navigate('/');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  }

  return (
    <div className="dashboard-page">
      <Ambient />

      <div className="dashboard-inner">
        {/* Top Nav */}
        <nav className="dashboard-nav">
          <div className="dashboard-nav-left">
            <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
            <span className="nav-brand">Beauty Kit</span>
          </div>
          <div className="dashboard-nav-right">
            <span className="dashboard-username">✦ {user?.name || user?.email}</span>
            <button className="btn-ghost small" onClick={signOut}>Sign Out</button>
          </div>
        </nav>

        {/* Hero header */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-left">
            <span className="section-eyebrow">My Beauty Dashboard</span>
            <h1 className="dashboard-title">Your Saved Profiles</h1>
            <p className="dashboard-subtitle">
              Each profile captures your skin tone analysis and personalised beauty recommendations. Create multiple profiles for different looks or occasions.
            </p>
          </div>
          <button className="cta-pill" onClick={() => navigate('/scan')}>
            <span>✦ New Scan</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>

        {/* Stats bar */}
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <div className="dashboard-stat-num">{profiles.length}</div>
            <div className="dashboard-stat-label">Saved Profiles</div>
          </div>
          <div className="dashboard-stat-divider" />
          <div className="dashboard-stat">
            <div className="dashboard-stat-num">12</div>
            <div className="dashboard-stat-label">Skin Tones Library</div>
          </div>
          <div className="dashboard-stat-divider" />
          <div className="dashboard-stat">
            <div className="dashboard-stat-num">50+</div>
            <div className="dashboard-stat-label">Recommendations per Profile</div>
          </div>
        </div>

        {/* Profiles grid */}
        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner" />
            <p>Loading your profiles…</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">✦</div>
            <h3 className="empty-title">No profiles yet</h3>
            <p className="empty-sub">Scan your face to get personalised beauty recommendations, then save them here.</p>
            <button className="cta-pill" onClick={() => navigate('/scan')}>
              <span>Start Your First Scan</span>
              <span className="cta-arrow">→</span>
            </button>
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles.map(profile => (
              <div key={profile.id} className="profile-card">
                {/* Card top: avatar / skin swatch */}
                <div className="profile-card-top">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.profileName}
                      className="profile-avatar-img"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div
                      className="profile-avatar-swatch"
                      style={{ background: profile.skinTone?.hex || '#c4916c' }}
                    >
                      <span className="profile-avatar-initial">
                        {profile.profileName?.[0]?.toUpperCase() || '✦'}
                      </span>
                    </div>
                  )}

                  {/* Skin tone badge */}
                  <div className="profile-tone-badge">
                    <div className="profile-tone-dot" style={{ background: profile.skinTone?.hex || '#c4916c' }} />
                    <span>{profile.skinTone?.name || 'Unknown'}</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="profile-card-body">
                  <div className="profile-name">{profile.profileName}</div>
                  <div className="profile-meta">
                    {profile.skinTone?.undertone && (
                      <span className="profile-badge">{profile.skinTone.undertone}</span>
                    )}
                    {profile.skinTone?.depth && (
                      <span className="profile-badge">{profile.skinTone.depth}</span>
                    )}
                  </div>
                  {profile.createdAt && (
                    <div className="profile-date">Saved {formatDate(profile.createdAt)}</div>
                  )}

                  {/* Quick rec preview */}
                  {profile.recommendations?.lipstick?.length > 0 && (
                    <div className="profile-swatches">
                      <span className="profile-swatches-label">Lips</span>
                      <div className="profile-swatch-row">
                        {profile.recommendations.lipstick.slice(0, 5).map((l, i) => (
                          <div key={i} className="profile-swatch-dot" style={{ background: l.hex }} title={l.name} />
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.recommendations?.eyeshadow?.length > 0 && (
                    <div className="profile-swatches">
                      <span className="profile-swatches-label">Eyes</span>
                      <div className="profile-swatch-row">
                        {profile.recommendations.eyeshadow.slice(0, 5).map((e, i) => (
                          <div key={i} className="profile-swatch-dot" style={{ background: e.hex }} title={e.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="profile-card-actions">
                  <button
                    className="btn-primary small"
                    onClick={() => {
                      setViewProfile(profile);
                    }}
                  >
                    View Results
                  </button>
                  <button
                    className="btn-ghost small delete-btn"
                    onClick={() => deleteProfile(profile.id)}
                    disabled={deleting === profile.id}
                  >
                    {deleting === profile.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <div className="profile-card new-card" onClick={() => navigate('/scan')}>
              <div className="new-card-inner">
                <div className="new-card-icon">+</div>
                <div className="new-card-label">New Scan</div>
                <div className="new-card-sub">Analyse a new look</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile detail modal */}
      {viewProfile && (
        <div className="profile-modal-overlay" onClick={() => setViewProfile(null)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div>
                <h3 className="profile-modal-title">{viewProfile.profileName}</h3>
                <div className="profile-modal-meta">
                  <div className="profile-tone-dot" style={{ background: viewProfile.skinTone?.hex || '#c4916c' }} />
                  <span>{viewProfile.skinTone?.name}</span>
                  {viewProfile.skinTone?.undertone && <span className="profile-badge">{viewProfile.skinTone.undertone}</span>}
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setViewProfile(null)}>✕</button>
            </div>
            <div className="profile-modal-body">
              {viewProfile.recommendations?.lipstick?.length > 0 && (
                <div className="modal-rec-section">
                  <div className="modal-rec-title">💄 Lipstick</div>
                  <div className="modal-rec-swatches">
                    {viewProfile.recommendations.lipstick.map((l, i) => (
                      <div key={i} className="modal-swatch-item">
                        <div className="modal-swatch-dot" style={{ background: l.hex }} />
                        <div className="modal-swatch-name">{l.name}</div>
                        {l.finish && <div className="modal-swatch-finish">{l.finish}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewProfile.recommendations?.blush?.length > 0 && (
                <div className="modal-rec-section">
                  <div className="modal-rec-title">🌸 Blush</div>
                  <div className="modal-rec-swatches">
                    {viewProfile.recommendations.blush.map((b, i) => (
                      <div key={i} className="modal-swatch-item">
                        <div className="modal-swatch-dot" style={{ background: b.hex }} />
                        <div className="modal-swatch-name">{b.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewProfile.recommendations?.eyeshadow?.length > 0 && (
                <div className="modal-rec-section">
                  <div className="modal-rec-title">✨ Eyeshadow</div>
                  <div className="modal-rec-swatches">
                    {viewProfile.recommendations.eyeshadow.map((e, i) => (
                      <div key={i} className="modal-swatch-item">
                        <div className="modal-swatch-dot" style={{ background: e.hex }} />
                        <div className="modal-swatch-name">{e.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewProfile.recommendations?.clothing?.colors?.length > 0 && (
                <div className="modal-rec-section">
                  <div className="modal-rec-title">👗 Clothing Colors</div>
                  <div className="modal-rec-swatches">
                    {viewProfile.recommendations.clothing.colors.slice(0,8).map((c, i) => (
                      <div key={i} className="modal-swatch-item">
                        <div className="modal-swatch-dot" style={{ background: c.hex }} />
                        <div className="modal-swatch-name">{c.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="profile-modal-footer">
              <button className="btn-ghost" onClick={() => setViewProfile(null)}>Close</button>
              <button className="cta-pill" onClick={() => navigate('/scan')}>
                <span>New Scan</span><span className="cta-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          position: relative;
        }

        .dashboard-inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2rem 5rem;
          box-sizing: border-box;
        }

        .dashboard-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .dashboard-nav-left, .dashboard-nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dashboard-username {
          font-size: 0.78rem;
          color: var(--gold, #c4a84a);
          letter-spacing: 0.05em;
        }

        .dashboard-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .dashboard-hero-left { flex: 1; min-width: 0; }

        .dashboard-title {
          font-family: var(--serif, Georgia, serif);
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 400;
          margin: 0.5rem 0 0.6rem;
          background: linear-gradient(135deg, var(--gold-light, #e8d080), var(--rose-light, #e8a0c0));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .dashboard-subtitle {
          color: var(--text-muted, #888);
          font-size: 0.88rem;
          line-height: 1.6;
          margin: 0;
          max-width: 500px;
        }

        .dashboard-stats {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 1.25rem 1.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-stat { text-align: center; flex: 1; }
        .dashboard-stat-num {
          font-family: var(--serif, Georgia, serif);
          font-size: 1.8rem;
          font-weight: 400;
          color: var(--gold-light, #e8d080);
          line-height: 1;
        }
        .dashboard-stat-label { font-size: 0.72rem; color: var(--text-dim, #666); margin-top: 0.3rem; letter-spacing: 0.05em; }
        .dashboard-stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.08); flex-shrink: 0; }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem;
          color: var(--text-muted, #888);
          font-size: 0.85rem;
        }

        .dashboard-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(65,105,225,0.2);
          border-top-color: var(--gold, #c4a84a);
          border-radius: 50%;
          animation: db-spin 1s linear infinite;
        }

        @keyframes db-spin { to { transform: rotate(360deg); } }

        .dashboard-empty {
          text-align: center;
          padding: 5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--gold-dim, #856830);
          margin-bottom: 0.5rem;
        }

        .empty-title {
          font-family: var(--serif, Georgia, serif);
          font-size: 1.6rem;
          font-weight: 400;
          margin: 0;
          color: var(--text, #fff);
        }

        .empty-sub {
          color: var(--text-muted, #888);
          font-size: 0.88rem;
          max-width: 380px;
          line-height: 1.6;
          margin: 0;
        }

        /* Profiles grid */
        .profiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .profile-card {
          background: linear-gradient(145deg, rgba(19,19,42,0.95), rgba(9,9,26,0.98));
          border: 1px solid rgba(65,105,225,0.18);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .profile-card:hover {
          border-color: rgba(65,105,225,0.35);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(65,105,225,0.08);
          transform: translateY(-4px);
        }

        .profile-card-top {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        .profile-avatar-swatch {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-avatar-initial {
          font-family: var(--serif, Georgia, serif);
          font-size: 3rem;
          color: rgba(255,255,255,0.5);
        }

        .profile-tone-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .profile-tone-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .profile-card-body {
          padding: 1rem 1.1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .profile-name {
          font-family: var(--serif, Georgia, serif);
          font-size: 1.1rem;
          color: var(--text, #fff);
          font-weight: 400;
        }

        .profile-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; }

        .profile-badge {
          padding: 2px 8px;
          background: rgba(65,105,225,0.12);
          border: 1px solid rgba(65,105,225,0.25);
          border-radius: 20px;
          font-size: 0.65rem;
          color: var(--gold-light, #e8d080);
          letter-spacing: 0.05em;
        }

        .profile-date { font-size: 0.68rem; color: var(--text-dim, #555); }

        .profile-swatches {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .profile-swatches-label {
          font-size: 0.65rem;
          color: var(--text-dim, #555);
          width: 28px;
          flex-shrink: 0;
        }

        .profile-swatch-row { display: flex; gap: 4px; }

        .profile-swatch-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: transform 0.15s;
        }

        .profile-swatch-dot:hover { transform: scale(1.3); }

        .profile-card-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1.1rem 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .delete-btn { color: rgba(255,100,100,0.6); border-color: rgba(255,100,100,0.2); }
        .delete-btn:hover { color: #ff6060; border-color: rgba(255,100,100,0.4); }

        /* New card */
        .new-card {
          cursor: pointer;
          border-style: dashed;
          border-color: rgba(65,105,225,0.2);
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .new-card:hover {
          border-color: rgba(65,105,225,0.4);
          background: rgba(65,105,225,0.05);
        }

        .new-card-inner { text-align: center; }
        .new-card-icon { font-size: 2.5rem; color: var(--gold-dim, #856830); margin-bottom: 0.5rem; }
        .new-card-label { font-family: var(--serif, Georgia, serif); font-size: 1.1rem; color: var(--text-muted, #888); }
        .new-card-sub { font-size: 0.72rem; color: var(--text-dim, #555); margin-top: 0.25rem; }

        /* Modal */
        .profile-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .profile-modal {
          background: linear-gradient(145deg, rgba(19,19,42,0.98), rgba(9,9,26,0.99));
          border: 1px solid rgba(65,105,225,0.2);
          border-radius: 24px;
          width: 100%;
          max-width: 560px;
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8);
        }

        .profile-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 1rem;
        }

        .profile-modal-title {
          font-family: var(--serif, Georgia, serif);
          font-size: 1.4rem;
          font-weight: 400;
          margin: 0 0 0.4rem;
          color: var(--text, #fff);
        }

        .profile-modal-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--text-dim, #666);
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.25rem;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .modal-close-btn:hover { color: var(--text, #fff); }

        .profile-modal-body {
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .modal-rec-section { display: flex; flex-direction: column; gap: 0.6rem; }

        .modal-rec-title {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #888);
        }

        .modal-rec-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .modal-swatch-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          cursor: default;
        }

        .modal-swatch-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        }

        .modal-swatch-name { font-size: 0.6rem; color: var(--text-dim, #555); text-align: center; max-width: 52px; line-height: 1.2; }
        .modal-swatch-finish { font-size: 0.58rem; color: var(--text-dim, #444); text-align: center; }

        .profile-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        @media (max-width: 768px) {
          .dashboard-inner { padding: 1.25rem 1.25rem 4rem; }
          .dashboard-hero { flex-direction: column; }
          .dashboard-stats { justify-content: space-around; }
          .dashboard-stat-divider { display: none; }
          .profiles-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .profile-card-top { height: 120px; }
        }

        @media (max-width: 480px) {
          .profiles-grid { grid-template-columns: 1fr; }
          .dashboard-stats { flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>
    </div>
  );
}