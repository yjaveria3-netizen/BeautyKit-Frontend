import React, { useState, useRef, useEffect, useMemo } from 'react';
import { COLOR_WHEEL_SEGMENTS } from '../data/constants';

export default function ColorWheel({ skinUndertone = 'neutral', skinHex = '#C8956C', onColorSelect }) {
  const canvasRef = useRef();
  const [hovered, setHovered] = useState(null);
  const undertone = (skinUndertone || 'neutral').toLowerCase();
  const recommendedIds = useMemo(() => new Set(
    COLOR_WHEEL_SEGMENTS.filter(s => s.bestFor.some(b => undertone.includes(b))).map(s => s.id)
  ), [undertone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const outerR = cx - 4, innerR = cx * 0.3;
    const total = COLOR_WHEEL_SEGMENTS.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    COLOR_WHEEL_SEGMENTS.forEach((seg, i) => {
      const sa = (i / total) * Math.PI * 2 - Math.PI / 2, ea = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
      const isRec = recommendedIds.has(seg.id);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, sa, ea);
      ctx.closePath();
      const r = parseInt(seg.hex.slice(1, 3), 16), g = parseInt(seg.hex.slice(3, 5), 16), b = parseInt(seg.hex.slice(5, 7), 16);
      ctx.fillStyle = isRec ? seg.hex : `rgba(${r},${g},${b},0.3)`;
      ctx.fill();
      ctx.strokeStyle = isRec ? 'rgba(196,168,74,0.7)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = isRec ? 1.5 : 0.5;
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#0e0e20';
    ctx.fill();
    ctx.strokeStyle = 'rgba(196,168,74,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [undertone, recommendedIds]);

  function getSegAt(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const dx = px - cx, dy = py - cy, dist = Math.sqrt(dx * dx + dy * dy);
    const innerR = cx * 0.3, outerR = cx - 4;
    if (dist < innerR || dist > outerR) return null;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    const idx = Math.floor((angle / (Math.PI * 2)) * COLOR_WHEEL_SEGMENTS.length);
    return COLOR_WHEEL_SEGMENTS[Math.min(idx, COLOR_WHEEL_SEGMENTS.length - 1)];
  }

  const topRec = COLOR_WHEEL_SEGMENTS.filter(s => recommendedIds.has(s.id)).slice(0, 6);

  return (
    <div className="color-wheel-section">
      <div className="color-wheel-title">Skin-Matched Color Wheel</div>
      <div className="color-wheel-outer">
        <div className="color-wheel-container" style={{ position: 'relative' }}>
          {hovered && <div className="cw-tooltip">{hovered.label}{recommendedIds.has(hovered.id) ? ' ✦' : ''}</div>}
          <canvas ref={canvasRef} width={180} height={180} className="color-wheel-canvas"
            style={{ cursor: 'crosshair', borderRadius: '50%', display: 'block' }}
            onMouseMove={e => { const s = getSegAt(e); setHovered(s || null); }}
            onMouseLeave={() => setHovered(null)}
            onClick={e => { const s = getSegAt(e); if (s && onColorSelect) onColorSelect(s.hex, s.label); }}
          />
          <div className="cw-center-disc" style={{ background: skinHex }} />
          <div className="cw-center-label">Your<br />Tone</div>
        </div>
        <div className="cw-legend">
          {topRec.map(seg => (
            <div key={seg.id} className="cw-legend-row cw-rec" onClick={() => onColorSelect && onColorSelect(seg.hex, seg.label)}>
              <div className="cw-legend-dot" style={{ background: seg.hex }} />
              <span className="cw-legend-name">{seg.label}</span>
              <span className="cw-legend-badge">✦ Best</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
