import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import { apiFetch } from '../utils/api';
import { SKIN_TONES } from '../data/constants';

export default function ScanPage({ user, setAuthMode, analyzeImage, setCapturedImage, setResults }) {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState('upload'); // 'upload' | 'camera' | 'manual'
  const [stream, setStream] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skinPickStep, setSkinPickStep] = useState(null); // null | 'picking' | 'confirm'
  const [pickedColor, setPickedColor] = useState(null);
  const [pickedSkinTone, setPickedSkinTone] = useState(null);
  const [scanError, setScanError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();
  const videoRef = useRef();
  const photoCanvasRef = useRef();
  const pickerCanvasRef = useRef();
  const pickerImgRef = useRef();

  // ── Camera helpers ──
  async function startCamera() {
    setCameraError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
      setStream(s);
      setScanMode('camera');
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permission and try again.');
    }
  }

  function stopCamera() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    setScanMode('upload');
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = photoCanvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setTempImage(dataUrl);
    stopCamera();
    setSkinPickStep('picking');
  }

  // ── File upload helpers ──
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    loadFile(file);
  }

  function loadFile(file) {
    if (!file.type.startsWith('image/')) { setScanError('Please upload an image file.'); return; }
    setScanError('');
    const reader = new FileReader();
    reader.onload = ev => {
      setTempImage(ev.target.result);
      setSkinPickStep('picking');
    };
    reader.readAsDataURL(file);
  }

  // ── Drag & Drop ──
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  // ── Skin tone picker on canvas ──
  const renderPickerCanvas = useCallback(() => {
    if (!tempImage || !pickerCanvasRef.current || !pickerImgRef.current) return;
    const img = pickerImgRef.current;
    const canvas = pickerCanvasRef.current;
    const maxW = Math.min(600, window.innerWidth - 48);
    const ratio = img.naturalHeight / img.naturalWidth;
    canvas.width = maxW;
    canvas.height = maxW * ratio;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [tempImage]);

  useEffect(() => {
    if (skinPickStep === 'picking' && tempImage) {
      setTimeout(renderPickerCanvas, 100);
    }
  }, [skinPickStep, tempImage, renderPickerCanvas]);

  function handleCanvasClick(e) {
    if (!pickerCanvasRef.current) return;
    const canvas = pickerCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    // Sample 7x7 area for average
    const radius = 7;
    const data = ctx.getImageData(Math.max(0, x - radius), Math.max(0, y - radius), radius * 2, radius * 2).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
    r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    const matched = matchSkinTone(r, g, b);
    setPickedColor({ hex, r, g, b });
    setPickedSkinTone(matched);
    setSkinPickStep('confirm');
  }

  function matchSkinTone(r, g, b) {
    let closest = SKIN_TONES[0], minDist = Infinity;
    SKIN_TONES.forEach(t => {
      const tr = parseInt(t.hex.slice(1, 3), 16);
      const tg = parseInt(t.hex.slice(3, 5), 16);
      const tb = parseInt(t.hex.slice(5, 7), 16);
      const dist = (r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2;
      if (dist < minDist) { minDist = dist; closest = t; }
    });
    return closest;
  }

  async function handleConfirmAndAnalyze() {
    if (!pickedColor) return;
    setIsAnalyzing(true);
    setScanError('');

    setCapturedImage(tempImage);

    try {
      const data = await apiFetch('/api/analyze-pixels', {
        method: 'POST',
        body: JSON.stringify({ r: pickedColor.r, g: pickedColor.g, b: pickedColor.b })
      });

      // Enrich with detailed shades from matched skin tone constants
      const matched = pickedSkinTone;
      setResults({
        skinTone: {
          ...data.skinTone,
          hex: pickedColor.hex,
          name: matched?.name || data.skinTone?.name,
          undertone: matched?.undertone || data.skinTone?.undertone,
          depth: matched?.depth || data.skinTone?.depth,
        },
        recommendations: {
          ...data.recommendations,
          lipstick: matched?.lipstick?.length ? matched.lipstick : data.recommendations?.lipstick,
          blush: matched?.blush?.length ? matched.blush : data.recommendations?.blush,
          eyeshadow: matched?.eyeshadow?.length ? matched.eyeshadow : data.recommendations?.eyeshadow,
          hair: {
            ...(data.recommendations?.hair || {}),
            colors: matched?.hair?.length ? matched.hair : (data.recommendations?.hair?.colors || [])
          }
        }
      });
      navigate('/results');
    } catch (err) {
      // Graceful fallback using local skin tone data
      if (pickedSkinTone) {
        setResults({
          skinTone: {
            name: pickedSkinTone.name,
            hex: pickedColor.hex,
            undertone: pickedSkinTone.undertone,
            depth: pickedSkinTone.depth,
          },
          recommendations: buildFallbackRecs(pickedSkinTone)
        });
        navigate('/results');
      } else {
        setScanError('Analysis failed. Please try again or check your connection.');
      }
    }
    setIsAnalyzing(false);
  }

  function buildFallbackRecs(tone) {
    return {
      lipstick: tone.lipstick || [],
      blush: tone.blush || [],
      eyeshadow: tone.eyeshadow || [],
      hair: { colors: tone.hair || [], styles: [], treatments: [], avoid: '' },
      jewelry: { metals: [], styles: [], gemstones: [], avoid: [] },
      clothing: { colors: [], styles: [], fabrics: [], patterns: [], avoid: [] }
    };
  }

  // Camera stream setup
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  // ── Render: Skin pick step ──
  if (skinPickStep === 'picking') {
    return (
      <div className="scan-page">
        <Ambient />
        <div className="scan-inner">
          <div className="scan-page-header">
            <button className="back-btn" onClick={() => { setSkinPickStep(null); setTempImage(null); }}>← Back</button>
            <div>
              <h2 className="scan-step-title">Tap Your Bare Skin</h2>
              <p className="scan-step-sub">Click on your cheek, forehead, or neck — any bare skin area works best. Avoid makeup-heavy zones.</p>
            </div>
          </div>

          <div className="picker-canvas-wrap"
            onClick={handleCanvasClick}
            style={{ cursor: 'crosshair' }}>
            <img
              ref={pickerImgRef}
              src={tempImage}
              alt="Your photo"
              style={{ display: 'none' }}
              onLoad={renderPickerCanvas}
            />
            <canvas ref={pickerCanvasRef} className="picker-canvas" />
            <div className="picker-hint-overlay">
              <div className="picker-crosshair">⊕</div>
              <span>Tap bare skin to detect your tone</span>
            </div>
          </div>

          <div className="picker-tips">
            <div className="tip-item"><span className="tip-icon">✓</span><span>Tap cheek, forehead, or jawline</span></div>
            <div className="tip-item"><span className="tip-icon">✗</span><span>Avoid eyebrows, lips, or shadowed areas</span></div>
            <div className="tip-item"><span className="tip-icon">💡</span><span>Good lighting gives best results</span></div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn-ghost" onClick={() => { setSkinPickStep('confirm'); setPickedColor({ hex: '#c4916c', r: 196, g: 145, b: 108 }); setPickedSkinTone(SKIN_TONES.find(t => t.id === 'natural_beige') || SKIN_TONES[3]); }}>
              Skip — use detected color
            </button>
          </div>
        </div>

        <ScanPageStyles />
      </div>
    );
  }

  // ── Render: Confirm step ──
  if (skinPickStep === 'confirm' && pickedColor) {
    return (
      <div className="scan-page">
        <Ambient />
        <div className="scan-inner">
          <div className="scan-page-header">
            <button className="back-btn" onClick={() => setSkinPickStep('picking')}>← Repick</button>
            <div>
              <h2 className="scan-step-title">Confirm Your Skin Tone</h2>
              <p className="scan-step-sub">We've matched your skin to our database. You can adjust below or continue to your results.</p>
            </div>
          </div>

          {/* Color confirmation card */}
          <div className="tone-confirm-card">
            <div className="tone-confirm-swatch" style={{ background: pickedColor.hex }} />
            <div className="tone-confirm-info">
              <div className="tone-confirm-hex">{pickedColor.hex.toUpperCase()}</div>
              <div className="tone-confirm-rgb">RGB({pickedColor.r}, {pickedColor.g}, {pickedColor.b})</div>
              {pickedSkinTone && (
                <div className="tone-confirm-match">
                  <div className="tone-match-swatch" style={{ background: pickedSkinTone.hex }} />
                  <div>
                    <div className="tone-match-name">→ {pickedSkinTone.name}</div>
                    <div className="tone-match-meta">{pickedSkinTone.undertone} · {pickedSkinTone.depth}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual override: pick from SKIN_TONES list */}
          <div className="tone-override-section">
            <div className="tone-override-label">Not right? Tap to select manually:</div>
            <div className="tone-override-grid">
              {SKIN_TONES.map(t => (
                <div
                  key={t.id}
                  className={`tone-override-item ${pickedSkinTone?.id === t.id ? 'selected' : ''}`}
                  onClick={() => {
                    setPickedSkinTone(t);
                    setPickedColor({ hex: t.hex, r: parseInt(t.hex.slice(1,3),16), g: parseInt(t.hex.slice(3,5),16), b: parseInt(t.hex.slice(5,7),16) });
                  }}
                  title={t.name}
                >
                  <div className="tone-override-swatch" style={{ background: t.hex }} />
                  <div className="tone-override-name">{t.name}</div>
                </div>
              ))}
            </div>
          </div>

          {scanError && (
            <div className="scan-error-msg">⚠ {scanError}</div>
          )}

          <button
            className="btn-primary full scan-analyze-btn"
            onClick={handleConfirmAndAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <span className="scan-loading"><span className="scan-spinner" /> Analyzing your skin…</span>
            ) : (
              'Get My Beauty Recommendations →'
            )}
          </button>
        </div>

        <ScanPageStyles />
      </div>
    );
  }

  // ── Render: Main scan page ──
  return (
    <div className="scan-page">
      <Ambient />

      <div className="scan-inner">
        {/* Header */}
        <div className="scan-top-bar">
          <button className="back-btn" onClick={() => navigate(user ? '/dashboard' : '/')}>
            ← {user ? 'Dashboard' : 'Home'}
          </button>
          <span className="nav-brand">Beauty Kit</span>
          {!user && (
            <button className="btn-outline small" onClick={() => navigate('/auth')}>Sign In</button>
          )}
        </div>

        <div className="scan-hero">
          <span className="section-eyebrow">Step 1 of 2</span>
          <h1 className="scan-title">Scan Your Skin Tone</h1>
          <p className="scan-subtitle">
            Upload a clear photo of your face in natural light, or use your camera. We'll detect your undertone, depth, and give you personalised beauty recommendations.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="scan-mode-tabs">
          <button
            className={`scan-mode-tab ${scanMode !== 'camera' ? 'active' : ''}`}
            onClick={() => { stopCamera(); setScanMode('upload'); }}
          >
            📁 Upload Photo
          </button>
          <button
            className={`scan-mode-tab ${scanMode === 'camera' ? 'active' : ''}`}
            onClick={startCamera}
          >
            📷 Use Camera
          </button>
        </div>

        {cameraError && (
          <div className="scan-error-msg">{cameraError}</div>
        )}

        {scanError && (
          <div className="scan-error-msg">{scanError}</div>
        )}

        {/* Camera mode */}
        {scanMode === 'camera' && (
          <div className="camera-section">
            <div className="camera-frame">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-face-guide">
                <div className="face-oval" />
                <span className="face-guide-text">Align your face here</span>
              </div>
            </div>
            <canvas ref={photoCanvasRef} style={{ display: 'none' }} />
            <div className="camera-controls">
              <button className="btn-ghost" onClick={stopCamera}>Cancel</button>
              <button className="cta-pill" onClick={capturePhoto}>
                <span>📸</span><span>Take Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload mode */}
        {scanMode !== 'camera' && (
          <>
            <div
              className={`scan-dropzone ${isDragging ? 'dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="dropzone-inner">
                <div className="dropzone-icon">🖼</div>
                <div className="dropzone-title">Drop your photo here</div>
                <div className="dropzone-sub">or click to browse · JPG, PNG, WEBP</div>
                <button className="cta-pill" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <span>Upload Photo</span>
                  <span className="cta-arrow">→</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            {/* Tips */}
            <div className="scan-tips-row">
              {[
                { icon: '☀️', tip: 'Natural lighting works best' },
                { icon: '😊', tip: 'Face forward, no heavy makeup' },
                { icon: '🔍', tip: 'Clear, close-up face photo' },
              ].map((t, i) => (
                <div key={i} className="scan-tip-card">
                  <span className="scan-tip-icon">{t.icon}</span>
                  <span className="scan-tip-text">{t.tip}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* How it works */}
        <div className="scan-how-row">
          {[
            { step: '1', label: 'Upload Photo', desc: 'Any clear face photo' },
            { step: '2', label: 'Tap Skin', desc: 'Click on bare skin area' },
            { step: '3', label: 'Get Results', desc: 'Personalised beauty picks' },
          ].map(s => (
            <div key={s.step} className="scan-how-step">
              <div className="scan-how-num">{s.step}</div>
              <div className="scan-how-label">{s.label}</div>
              <div className="scan-how-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="scan-auth-nudge">
            <span>💾 <strong>Sign in</strong> to save your results and beauty profiles</span>
            <button className="btn-ghost small" onClick={() => navigate('/auth')}>Create free account →</button>
          </div>
        )}
      </div>

      <ScanPageStyles />
    </div>
  );
}

function ScanPageStyles() {
  return (
    <style>{`
      .scan-page {
        min-height: 100vh;
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 2rem 1.25rem 4rem;
        box-sizing: border-box;
      }

      .scan-inner {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 680px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .scan-top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .scan-hero {
        text-align: center;
        padding: 0 1rem;
      }

      .scan-title {
        font-family: var(--serif, Georgia, serif);
        font-size: clamp(2rem, 5vw, 2.8rem);
        font-weight: 400;
        margin: 0.5rem 0 0.75rem;
        background: linear-gradient(135deg, var(--gold-light, #e8d080), var(--rose-light, #e8a0c0));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
      }

      .scan-subtitle {
        color: var(--text-muted, #888);
        font-size: 0.9rem;
        line-height: 1.65;
        max-width: 520px;
        margin: 0 auto;
      }

      .scan-mode-tabs {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }

      .scan-mode-tab {
        padding: 0.6rem 1.4rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(65,105,225,0.2);
        border-radius: 100px;
        font-family: var(--sans, system-ui, sans-serif);
        font-size: 0.8rem;
        color: var(--text-muted, #888);
        cursor: pointer;
        transition: all 0.25s ease;
      }

      .scan-mode-tab.active {
        background: rgba(65,105,225,0.15);
        border-color: rgba(65,105,225,0.45);
        color: var(--gold-light, #e8d080);
      }

      .scan-dropzone {
        border: 2px dashed rgba(65,105,225,0.3);
        border-radius: 20px;
        padding: 3rem 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(65,105,225,0.04);
      }

      .scan-dropzone:hover, .scan-dropzone.dragging {
        border-color: rgba(65,105,225,0.6);
        background: rgba(65,105,225,0.08);
      }

      .dropzone-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .dropzone-icon { font-size: 3rem; line-height: 1; }
      .dropzone-title { font-family: var(--serif, Georgia, serif); font-size: 1.25rem; color: var(--text, #fff); }
      .dropzone-sub { font-size: 0.8rem; color: var(--text-dim, #666); }

      .scan-tips-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .scan-tip-card {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 100px;
        font-size: 0.78rem;
        color: var(--text-muted, #888);
      }

      .scan-tip-icon { font-size: 1rem; }

      /* Camera */
      .camera-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      .camera-frame {
        position: relative;
        width: 100%;
        max-width: 480px;
        border-radius: 16px;
        overflow: hidden;
        border: 2px solid rgba(65,105,225,0.3);
      }

      .camera-video { width: 100%; display: block; }

      .camera-face-guide {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .face-oval {
        width: 160px;
        height: 200px;
        border: 2px dashed rgba(200,170,80,0.6);
        border-radius: 50%;
        box-shadow: 0 0 0 3000px rgba(0,0,0,0.25);
      }

      .face-guide-text {
        margin-top: 1rem;
        font-size: 0.75rem;
        color: rgba(200,170,80,0.8);
        text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        letter-spacing: 0.05em;
      }

      .camera-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      /* Picker canvas */
      .scan-page-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
      }

      .scan-step-title {
        font-family: var(--serif, Georgia, serif);
        font-size: 1.5rem;
        font-weight: 400;
        margin: 0 0 0.3rem;
        color: var(--text, #fff);
      }

      .scan-step-sub {
        font-size: 0.82rem;
        color: var(--text-muted, #888);
        line-height: 1.5;
        margin: 0;
      }

      .picker-canvas-wrap {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        border: 2px solid rgba(65,105,225,0.3);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      }

      .picker-canvas { display: block; width: 100%; height: auto; }

      .picker-hint-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        padding: 1.5rem 1rem 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: rgba(255,255,255,0.8);
        pointer-events: none;
      }

      .picker-crosshair { font-size: 1.2rem; color: var(--gold, #c4a84a); }

      .picker-tips {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .tip-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-muted, #888);
      }

      .tip-icon { width: 1.2rem; text-align: center; font-size: 0.85rem; }

      /* Confirm step */
      .tone-confirm-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(65,105,225,0.2);
        border-radius: 16px;
      }

      .tone-confirm-swatch {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,0.15);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        flex-shrink: 0;
      }

      .tone-confirm-hex {
        font-family: monospace;
        font-size: 1.1rem;
        color: var(--gold-light, #e8d080);
        letter-spacing: 1px;
      }

      .tone-confirm-rgb { font-size: 0.78rem; color: var(--text-dim, #666); margin: 0.2rem 0 0.6rem; }

      .tone-confirm-match {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .tone-match-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.15);
      }

      .tone-match-name { font-size: 0.88rem; color: var(--text, #fff); font-weight: 500; }
      .tone-match-meta { font-size: 0.72rem; color: var(--text-muted, #888); }

      .tone-override-section { display: flex; flex-direction: column; gap: 0.75rem; }
      .tone-override-label { font-size: 0.75rem; color: var(--text-dim, #666); letter-spacing: 0.05em; }

      .tone-override-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .tone-override-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
        padding: 0.5rem;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.06);
        cursor: pointer;
        transition: all 0.2s;
        width: calc(25% - 0.4rem);
        min-width: 70px;
        box-sizing: border-box;
      }

      .tone-override-item:hover { border-color: rgba(65,105,225,0.4); background: rgba(65,105,225,0.06); }
      .tone-override-item.selected { border-color: var(--gold, #c4a84a); background: rgba(200,170,80,0.08); }

      .tone-override-swatch {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.12);
      }

      .tone-override-name { font-size: 0.6rem; color: var(--text-muted, #888); text-align: center; line-height: 1.2; }

      .scan-error-msg {
        padding: 0.75rem 1rem;
        background: rgba(200,50,50,0.1);
        border: 1px solid rgba(200,50,50,0.3);
        border-radius: 10px;
        font-size: 0.82rem;
        color: #ff9090;
      }

      .scan-analyze-btn {
        padding: 1rem;
        font-size: 0.9rem;
        border-radius: 14px;
        letter-spacing: 0.05em;
      }

      .scan-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
      }

      .scan-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(10,10,20,0.3);
        border-top-color: #0a0a14;
        border-radius: 50%;
        animation: scan-spin 0.8s linear infinite;
        flex-shrink: 0;
      }

      @keyframes scan-spin { to { transform: rotate(360deg); } }

      .scan-how-row {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .scan-how-step {
        flex: 1;
        text-align: center;
        padding: 1.25rem 0.75rem;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        max-width: 200px;
      }

      .scan-how-num {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid rgba(65,105,225,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: var(--gold, #c4a84a);
        margin: 0 auto 0.5rem;
      }

      .scan-how-label {
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text, #fff);
        margin-bottom: 0.25rem;
      }

      .scan-how-desc { font-size: 0.72rem; color: var(--text-dim, #666); }

      .scan-auth-nudge {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: rgba(65,105,225,0.06);
        border: 1px solid rgba(65,105,225,0.15);
        border-radius: 12px;
        font-size: 0.82rem;
        color: var(--text-muted, #888);
        flex-wrap: wrap;
      }

      @media (max-width: 560px) {
        .scan-tips-row { gap: 0.5rem; }
        .scan-tip-card { font-size: 0.72rem; padding: 0.5rem 0.75rem; }
        .scan-how-row { gap: 0.5rem; }
        .scan-how-step { padding: 1rem 0.5rem; }
        .tone-override-item { width: calc(33.33% - 0.35rem); }
        .scan-page-header { flex-direction: column; }
      }
    `}</style>
  );
}