import React from 'react';

export default function HeroIllustration({ colors = {}, id = 'default' }) {
  const {
    skin = '#e8b896',
    hair = '#4a2010',
    top = '#b08de8',
    lipstick = '#b83055',
    blush = 'rgba(255,130,100,0.22)',
    eyeshadow = '#7b5ea7',
    jewelry = '#f0d060',
  } = colors;

  // Helper to darken color
  const darkenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };
  
  const skinGradientEnd = darkenColor(skin, 30);

  // Derive darker shade for gradient bottom stop
  const topDark = top + 'bb';
  
  // Convert hex blush to rgba for proper opacity control
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const blushBase = blush.startsWith('rgba')
    ? blush.replace(/[\d.]+\)$/, '1)')
    : blush.startsWith('#') ? hexToRgba(blush, 1) : blush;

  // Unique IDs for this instance
  const uid = `hi-${id}`;

  return (
    <svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg" className="hero-illustration">
      <defs>
        <radialGradient id={`${uid}-bgGlow`} cx="50%" cy="60%" r="55%"><stop offset="0%" stopColor="#7c5cbf" stopOpacity="0.35" /><stop offset="100%" stopColor="#06060e" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${uid}-skinGrad`} cx="50%" cy="35%" r="65%"><stop offset="0%" stopColor={skin} /><stop offset="100%" stopColor={skinGradientEnd} /></radialGradient>
        <radialGradient id={`${uid}-dressGrad`} cx="50%" cy="20%" r="80%"><stop offset="0%" stopColor={top} /><stop offset="100%" stopColor={topDark} /></radialGradient>
        <linearGradient id={`${uid}-hairGrad`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={hair} /><stop offset="100%" stopColor={hair + '99'} /></linearGradient>
        <linearGradient id={`${uid}-goldGrad`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={jewelry} /><stop offset="100%" stopColor={jewelry + '99'} /></linearGradient>
        <filter id={`${uid}-glow`}><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id={`${uid}-softShadow`}><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.5" /></filter>
      </defs>
      <ellipse cx="200" cy="300" rx="200" ry="260" fill={`url(#${uid}-bgGlow)`} />
      {/* Hair */}
      {/* Hair - Long Open Behind Face */}

{/* Main back hair - full length behind everything */}
<path d="M118 155 Q110 180 105 220 Q98 270 95 320 Q90 380 92 440 Q94 480 98 520 L302 520 Q306 480 308 440 Q310 380 305 320 Q302 270 295 220 Q290 180 282 155 Q260 130 200 125 Q140 130 118 155Z" fill={`url(#${uid}-hairGrad)`} />

{/* Left side hair flowing down */}
<path d="M118 155 Q100 190 90 240 Q80 300 78 360 Q76 420 80 520 L108 520 Q100 440 102 380 Q104 320 108 270 Q112 220 118 180Z" fill={`url(#${uid}-hairGrad)`} />

{/* Right side hair flowing down */}
<path d="M282 155 Q300 190 310 240 Q320 300 322 360 Q324 420 320 520 L292 520 Q300 440 298 380 Q296 320 292 270 Q288 220 282 180Z" fill={`url(#${uid}-hairGrad)`} />

{/* Top of head */}
<ellipse cx="200" cy="148" rx="84" ry="68" fill={`url(#${uid}-hairGrad)`} />

{/* FACE - sits on top of hair */}
<ellipse cx="200" cy="208" rx="74" ry="82" fill={`url(#${uid}-skinGrad)`} filter={`url(#${uid}-softShadow)`} />

{/* Hairline swoosh - top only, no overlap on face */}
<path d="M126 165 Q148 108 200 102 Q252 108 274 165 Q258 140 238 133 Q220 127 200 126 Q180 127 162 133 Q142 140 126 165Z" fill={`url(#${uid}-hairGrad)`} />

      {/* Dress */}
      <path d="M120 320 Q110 360 90 400 Q70 450 60 520 L340 520 Q330 450 310 400 Q290 360 280 320 Q260 310 200 308 Q140 310 120 320Z" fill={`url(#${uid}-dressGrad)`} filter={`url(#${uid}-softShadow)`} />

      {/* Necklace */}
      <path d="M170 308 Q185 320 200 324 Q215 320 230 308" fill="none" stroke={jewelry} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="200" cy="326" r="7" fill={jewelry} filter={`url(#${uid}-glow)`} /><circle cx="200" cy="326" r="3.5" fill="#f8e8a0" />
      <circle cx="178" cy="312" r="2.5" fill={jewelry} /><circle cx="222" cy="312" r="2.5" fill={jewelry} />

      {/* Neck */}
      <rect x="184" y="272" width="32" height="52" rx="14" fill={`url(#${uid}-skinGrad)`} />
      

      {/* Face */}
      <ellipse cx="200" cy="200" rx="80" ry="92" fill={`url(#${uid}-skinGrad)`} filter={`url(#${uid}-softShadow)`} />

   

      {/* Earrings */}
      <circle cx="122" cy="220" r="7" fill={jewelry} filter={`url(#${uid}-glow)`} />
      <line x1="122" y1="227" x2="122" y2="242" stroke={jewelry} strokeWidth="2.5" />
      <circle cx="122" cy="246" r="5" fill={jewelry} />
      <circle cx="278" cy="220" r="7" fill={jewelry} filter={`url(#${uid}-glow)`} />
      <line x1="278" y1="227" x2="278" y2="242" stroke={jewelry} strokeWidth="2.5" />
      <circle cx="278" cy="246" r="5" fill={jewelry} />

      

      {/* Eyebrows */}
      <path d="M154 162 Q168 154 182 158" stroke="#2a1205" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M218 158 Q232 154 246 162" stroke="#2a1205" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Eyes white */}
      <ellipse cx="168" cy="180" rx="15" ry="10" fill="white" /><ellipse cx="232" cy="180" rx="15" ry="10" fill="white" />

      {/* Eyeshadow */}
      <ellipse cx="168" cy="174" rx="17" ry="8" fill={eyeshadow} opacity="0.75" />
      <ellipse cx="232" cy="174" rx="17" ry="8" fill={eyeshadow} opacity="0.75" />

      {/* Pupils */}
      <circle cx="168" cy="180" r="9" fill="#3d2010" /><circle cx="232" cy="180" r="9" fill="#3d2010" />
      <circle cx="168" cy="180" r="5.5" fill="#1a0d06" /><circle cx="232" cy="180" r="5.5" fill="#1a0d06" />
      <circle cx="171" cy="177" r="2.5" fill="white" opacity="0.85" /><circle cx="235" cy="177" r="2.5" fill="white" opacity="0.85" />

      {/* Lashes */}
      <path d="M154 172 Q168 165 182 172" stroke="#1a0d06" strokeWidth="2.5" fill="none" />
      <path d="M218 172 Q232 165 246 172" stroke="#1a0d06" strokeWidth="2.5" fill="none" />

      {/* Blush */}
   <radialGradient id={`${uid}-hiBlushL`} cx="50%" cy="50%" r="50%">
  <stop offset="0%"   stopColor={blushBase} stopOpacity="0.65" />
  <stop offset="50%"  stopColor={blushBase} stopOpacity="0.25" />
  <stop offset="100%" stopColor={blushBase} stopOpacity="0" />
</radialGradient>
<radialGradient id={`${uid}-hiBlushR`} cx="50%" cy="50%" r="50%">
  <stop offset="0%"   stopColor={blushBase} stopOpacity="0.65" />
  <stop offset="50%"  stopColor={blushBase} stopOpacity="0.25" />
  <stop offset="100%" stopColor={blushBase} stopOpacity="0" />
</radialGradient>
<filter id={`${uid}-hiBlushBlur`} x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="10" />
</filter>
<ellipse cx="148" cy="216" rx="38" ry="18" fill={`url(#${uid}-hiBlushL)`} filter={`url(#${uid}-hiBlushBlur)`} />
<ellipse cx="252" cy="216" rx="38" ry="18" fill={`url(#${uid}-hiBlushR)`} filter={`url(#${uid}-hiBlushBlur)`} />

      {/* Lips */}
      <path d="M175 238 Q188 228 200 232 Q212 228 225 238 Q215 240 200 238 Q185 240 175 238Z" fill={lipstick} />
      <path d="M175 238 Q185 254 200 256 Q215 254 225 238 Q215 240 200 238 Q185 240 175 238Z" fill={lipstick} />
      <ellipse cx="200" cy="245" rx="10" ry="4" fill="rgba(255,255,255,0.2)" />

      {/* Ambient sparkles */}
      <circle cx="88" cy="145" r="3" fill="#c4a84a" opacity="0.7" filter="url(#glow)">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="312" cy="160" r="2" fill="#c4728a" opacity="0.6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}