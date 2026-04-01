import React from 'react';

export default function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      {/* Primary gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
      
      {/* Particle field */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 5}`} />
        ))}
      </div>
      
      {/* Animated mesh grid */}
      <div className="mesh-grid" />
      
      {/* Floating geometric shapes */}
      <div className="geo-shapes">
        <div className="geo-shape geo-circle" />
        <div className="geo-shape geo-ring" />
        <div className="geo-shape geo-triangle" />
        <div className="geo-shape geo-square" />
      </div>
      
      {/* Aurora effect */}
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
    </div>
  );
}
