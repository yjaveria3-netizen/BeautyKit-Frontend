import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ResultsPage from './pages/ResultsPage';
import { getToken, removeToken, apiFetch } from './utils/api';
import { extractSkinPixels } from './utils/imageProcessing';

export default function App() {
  const [authMode, setAuthMode] = useState('signin');
  const [user, setUser] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [results, setResults] = useState(null);
  const [scanError, setScanError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef();

  useEffect(() => {
    const token = getToken();
    
    if (token) {
      // Validate token by calling /api/auth/me
      apiFetch('/api/auth/me')
        .then(u => {
          setUser(u);
          loadProfiles();
        })
        .catch(err => {
          console.error('Token validation failed:', err);
          removeToken();
          setUser(null);
          setProfiles([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  async function loadProfiles() {
    try {
      const p = await apiFetch('/api/profiles');
      setProfiles(p || []);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setProfiles([]);
    }
  }

  function logout() {
    removeToken();
    setUser(null);
    setProfiles([]);
    setResults(null);
    setCapturedImage(null);
    window.location.href = '/';
  }

  async function analyzeImage(imageSrc, navigate) {
    navigate('/analyzing');
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
      navigate('/results');
    } catch (err) {
      setScanError('Analysis failed. Please try again.');
      navigate('/scan');
    }
  }

  function loadProfile(profile, navigate) {
    setResults({
      skinTone: profile.skinTone,
      recommendations: profile.recommendations
    });
    setCapturedImage(profile.avatar);
    navigate('/results');
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
    <Router>
      <div className="app-wrapper">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {isLoading ? (
          <div className="loading-screen">
            <div className="loading-spinner">✦</div>
            <div className="loading-text">Beauty Kit</div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage {...sharedProps} />} />
            <Route path="/auth" element={<AuthPage {...sharedProps} authMode={authMode} setAuthMode={setAuthMode} setUser={setUser} />} />
            <Route 
              path="/dashboard" 
              element={<DashboardPage {...sharedProps} />} 
            />
            <Route 
              path="/scan" 
              element={user ? <ScanPage {...sharedProps} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/analyzing" 
              element={user ? <AnalyzingPage capturedImage={capturedImage} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/results" 
              element={user ? <ResultsPage {...sharedProps} /> : <Navigate to="/auth" />} 
            />
          </Routes>
        )}
      </div>
    </Router>
  );
}