import React, { useRef, useEffect, useState } from 'react';

export default function RealFaceMakeup({ 
  imageSrc, 
  lipstick = '#C45C75',
  blush = '#E88070',
  eyeshadow = '#8B7355',
  hair = '#3B1F0A'
}) {
  const containerRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(200, 100, 100, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Create gradient for blush
  const createBlushGradient = (color) => {
    if (!color) return 'radial-gradient(circle, rgba(232,128,112,0.4) 0%, rgba(232,128,112,0) 70%)';
    const rgba = hexToRgba(color, 0.5);
    const rgbaFade = hexToRgba(color, 0);
    return `radial-gradient(circle, ${rgba} 0%, ${rgbaFade} 70%)`;
  };

  // Create gradient for eyeshadow
  const createEyeshadowGradient = (color) => {
    if (!color) return 'linear-gradient(180deg, rgba(139,115,85,0.6) 0%, rgba(139,115,85,0) 100%)';
    const rgba = hexToRgba(color, 0.65);
    const rgbaFade = hexToRgba(color, 0.1);
    return `linear-gradient(180deg, ${rgba} 0%, ${rgbaFade} 100%)`;
  };

  if (!imageSrc || imageError) {
    return (
      <div className="real-face-makeup fallback">
        <div className="no-image-message">
          <span>No photo available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="real-face-makeup" ref={containerRef}>
      {/* User's Photo */}
      <div className="face-photo-container">
        <img 
          src={imageSrc} 
          alt="Your photo"
          className="face-photo"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {imageLoaded && (
          <>
            {/* Eyeshadow Overlay - Left Eye */}
            <div 
              className="makeup-overlay eyeshadow-left"
              style={{
                background: createEyeshadowGradient(eyeshadow)
              }}
            />
            
            {/* Eyeshadow Overlay - Right Eye */}
            <div 
              className="makeup-overlay eyeshadow-right"
              style={{
                background: createEyeshadowGradient(eyeshadow)
              }}
            />

            {/* Blush Overlay - Left Cheek */}
            <div 
              className="makeup-overlay blush-left"
              style={{
                background: createBlushGradient(blush)
              }}
            />
            
            {/* Blush Overlay - Right Cheek */}
            <div 
              className="makeup-overlay blush-right"
              style={{
                background: createBlushGradient(blush)
              }}
            />

            {/* Lipstick Overlay */}
            <div 
              className="makeup-overlay lipstick"
              style={{
                backgroundColor: hexToRgba(lipstick, 0.5),
                mixBlendMode: 'multiply'
              }}
            />

            {/* Hair Color Overlay - Top */}
            <div 
              className="makeup-overlay hair-top"
              style={{
                background: `linear-gradient(180deg, ${hexToRgba(hair, 0.4)} 0%, transparent 100%)`
              }}
            />
          </>
        )}
      </div>

      {/* Makeup Legend */}
      <div className="makeup-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: lipstick }} />
          <span>Lips</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: blush }} />
          <span>Blush</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: eyeshadow }} />
          <span>Eyes</span>
        </div>
      </div>
    </div>
  );
}
