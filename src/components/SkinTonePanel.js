import React, { useState, useEffect, useCallback } from 'react';
import { SKIN_TONES } from '../data/constants';

export default function SkinTonePanel({ detectedHex, onSelect }) {
  const [activeTone, setActiveTone] = useState(null);

  // Use useCallback to prevent infinite re-renders
  const handleSelect = useCallback((tone) => {
    setActiveTone(tone);
    onSelect && onSelect(tone);
  }, [onSelect]);

  useEffect(() => {
    if (!detectedHex || detectedHex.length < 7) return;
    const r1 = parseInt(detectedHex.slice(1, 3), 16), g1 = parseInt(detectedHex.slice(3, 5), 16), b1 = parseInt(detectedHex.slice(5, 7), 16);
    let closest = SKIN_TONES[0], minDist = Infinity;
    SKIN_TONES.forEach(t => {
      const r2 = parseInt(t.hex.slice(1, 3), 16), g2 = parseInt(t.hex.slice(3, 5), 16), b2 = parseInt(t.hex.slice(5, 7), 16);
      const d = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
      if (d < minDist) { minDist = d; closest = t; }
    });
    setActiveTone(closest);
    handleSelect(closest);
  }, [detectedHex, handleSelect]);

  function select(tone) {
    setActiveTone(tone);
    handleSelect(tone);
  }

  return (
    <div className="skin-tone-panel">
      <div className="skin-tone-panel-header"><span className="skin-tone-panel-title">✦ 12 Skin Tones — Tap to explore</span></div>
      <div className="skin-tone-scroll">
        {SKIN_TONES.map(tone => (
          <div key={tone.id} className={`skin-tone-row ${activeTone?.id === tone.id ? 'active-tone' : ''}`} onClick={() => select(tone)}>
            <div className="st-circle" style={{ background: tone.hex }} />
            <div className="st-info"><div className="st-name">{tone.name}</div><div className="st-undertone">{tone.undertone}</div></div>
            <span className="st-depth-tag">{tone.depth}</span>
          </div>
        ))}
      </div>
      {activeTone && (
        <div className="skin-tone-detail">
          <div className="std-header">
            <div className="std-swatch" style={{ background: activeTone.hex }} />
            <div><div className="std-name">{activeTone.name}</div><div className="std-undertone">{activeTone.undertone} · {activeTone.depth}</div></div>
          </div>
          <div className="std-rows">
            {[['Metals', activeTone.bestMetals], ['Lips', activeTone.bestLips], ['Blush', activeTone.bestBlush],
              ['Eyes', activeTone.bestEyes], ['Avoid', activeTone.avoidColors], ['Stars', activeTone.celebrities]].map(([k, v]) => (
              <div key={k} className="std-row"><span className="std-k">{k}</span><span className="std-v">{v}</span></div>
            ))}
          </div>
          <div className="std-swatches">{activeTone.swatches.map((s, i) => <div key={i} className="std-mini-swatch" style={{ background: s }} />)}</div>
        </div>
      )}
    </div>
  );
}
