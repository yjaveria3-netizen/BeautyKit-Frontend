import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ResultsPage from './pages/ResultsPage';
import { getToken, setToken, removeToken, apiFetch } from './utils/api';
import { extractSkinPixels } from './utils/imageProcessing';

export default function App() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('signin');
  const [user, setUser] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [results, setResults] = useState(null);
  const [scanError, setScanError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const canvasRef = useRef();

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiFetch('/api/auth/me')
        .then(u => {
          setUser(u);
          loadProfiles();
        })
        .catch(() => removeToken());
    }
  }, []);

  async function loadProfiles() {
    try {
      const p = await apiFetch('/api/profiles');
      setProfiles(p);
    } catch { }
  }

  function logout() {
    removeToken();
    setUser(null);
    setProfiles([]);
    setResults(null);
    setCapturedImage(null);
    setPage('landing');
  }

  async function analyzeImage(imageSrc) {
    setPage('analyzing');
    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      const { r, g, b } = extractSkinPixels(canvas, ctx, img);
      const data = await apiFetch('/api/analyze-pixels', {
        method: 'POST',
        body: JSON.stringify({ r, g, b })
      });
      setResults(data);
      setPage('results');
    } catch (err) {
      setScanError('Analysis failed. Please try again.');
      setPage('scan');
    }
  }

  function loadProfile(profile) {
    setResults({
      skinTone: profile.skinTone,
      recommendations: profile.recommendations
    });
    setCapturedImage(profile.avatar);
    setPage('results');
  }

  async function deleteProfile(id) {
    if (!window.confirm('Delete this profile?')) return;
    try {
      await apiFetch(`/api/profiles/${id}`, { method: 'DELETE' });
      await loadProfiles();
    } catch { }
  }

  const sharedProps = {
    user,
    setPage,
    setAuthMode,
    logout,
    profiles,
    loadProfile,
    deleteProfile,
    loadProfiles,
    capturedImage,
    setCapturedImage,
    results,
    setResults,
    analyzeImage,
    scanError,
    setScanError,
    canvasRef
  };

  return (
    <div className="app-wrapper">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {page === 'landing' && <LandingPage {...sharedProps} />}
      {page === 'auth' && <AuthPage {...sharedProps} authMode={authMode} setAuthMode={setAuthMode} setUser={setUser} />}
      {page === 'dashboard' && <DashboardPage {...sharedProps} />}
      {page === 'scan' && <ScanPage {...sharedProps} />}
      {page === 'analyzing' && <AnalyzingPage capturedImage={capturedImage} />}
      {page === 'results' && <ResultsPage {...sharedProps} />}
    </div>
  );
}