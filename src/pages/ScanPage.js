import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import ColorPicker from '../components/ColorPicker';
import { apiFetch } from '../utils/api';

export default function ScanPage({ user, setAuthMode, scanError, setScanError, analyzeImage, setCapturedImage, canvasRef, setResults }) {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState('upload');
  const [stream, setStream] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef();
  const videoRef = useRef();

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setTempImage(ev.target.result);
      setShowColorPicker(true);
    };
    reader.readAsDataURL(file);
  }

  async function handleColorSelect({ color, skinTone }) {
    setShowColorPicker(false);
    setCapturedImage(tempImage);
    
    // Convert hex to RGB
    const r = parseInt(color.hex.slice(1, 3), 16);
    const g = parseInt(color.hex.slice(3, 5), 16);
    const b = parseInt(color.hex.slice(5, 7), 16);
    
    try {
      // Call backend to get full recommendations
      const data = await apiFetch('/api/analyze-pixels', {
        method: 'POST',
        body: JSON.stringify({ r, g, b })
      });
      
      // Merge backend response with detailed shades from constants
      const detailedRecs = buildRecommendationsFromSkinTone(skinTone, color.hex);
      
      setResults({
        skinTone: {
          ...data.skinTone,
          // Use the selected color hex instead of backend's calculated hex
          hex: color.hex
        },
        recommendations: {
          ...data.recommendations,
          // Override with detailed shades from constants if available
          lipstick: detailedRecs.lipstick,
          blush: detailedRecs.blush,
          eyeshadow: detailedRecs.eyeshadow,
          hair: {
            ...data.recommendations.hair,
            colors: detailedRecs.hair.colors
          }
        }
      });
    } catch (err) {
      // Fallback: build minimal results from skin tone
      setResults({
        skinTone: {
          name: skinTone.name,
          hex: color.hex,
          undertone: skinTone.undertone,
          depth: skinTone.depth
        },
        recommendations: buildRecommendationsFromSkinTone(skinTone, color.hex)
      });
    }
    navigate('/results');
  }

  function buildRecommendationsFromSkinTone(skinTone, hex) {
    const isWarm = skinTone.undertone === 'Warm';
    const isCool = skinTone.undertone === 'Cool';
    
    // Extended lipstick shades (10+)
    const getLipstickShades = () => {
      const baseShades = skinTone.lipstick || [];
      const warmShades = [
        { name: 'Coral', hex: '#FF7F50', finish: 'Satin', vibe: 'Fresh' },
        { name: 'Peach', hex: '#FFDAB9', finish: 'Cream', vibe: 'Natural' },
        { name: 'Terracotta', hex: '#E2725B', finish: 'Matte', vibe: 'Earthy' },
        { name: 'Spice', hex: '#D2691E', finish: 'Cream', vibe: 'Warm' },
        { name: 'Cinnamon', hex: '#D2691E', finish: 'Gloss', vibe: 'Rich' },
        { name: 'Burnt Orange', hex: '#CC5500', finish: 'Matte', vibe: 'Bold' },
        { name: 'Pumpkin', hex: '#FF7518', finish: 'Satin', vibe: 'Vibrant' },
        { name: 'Caramel', hex: '#C68E17', finish: 'Cream', vibe: 'Sweet' },
        { name: 'Rust', hex: '#B7410E', finish: 'Matte', vibe: 'Statement' },
        { name: 'Brick Red', hex: '#B22222', finish: 'Matte', vibe: 'Classic' },
        { name: 'Copper', hex: '#B87333', finish: 'Metallic', vibe: 'Glam' },
        { name: 'Toffee', hex: '#8B4513', finish: 'Cream', vibe: 'Warm' }
      ];
      const coolShades = [
        { name: 'Berry', hex: '#8B0000', finish: 'Satin', vibe: 'Rich' },
        { name: 'Rose', hex: '#C45C75', finish: 'Matte', vibe: 'Elegant' },
        { name: 'Mauve', hex: '#B784A7', finish: 'Cream', vibe: 'Sophisticated' },
        { name: 'Plum', hex: '#8B668B', finish: 'Gloss', vibe: 'Dramatic' },
        { name: 'Fuchsia', hex: '#FF00FF', finish: 'Satin', vibe: 'Bold' },
        { name: 'Raspberry', hex: '#E30B5D', finish: 'Cream', vibe: 'Playful' },
        { name: 'Wine', hex: '#722F37', finish: 'Matte', vibe: 'Sophisticated' },
        { name: 'Burgundy', hex: '#800020', finish: 'Cream', vibe: 'Deep' },
        { name: 'Pink', hex: '#FFC0CB', finish: 'Gloss', vibe: 'Sweet' },
        { name: 'Magenta', hex: '#FF00FF', finish: 'Matte', vibe: 'Vibrant' },
        { name: 'Orchid', hex: '#DA70D6', finish: 'Satin', vibe: 'Elegant' },
        { name: 'Lilac', hex: '#C8A2C8', finish: 'Cream', vibe: 'Soft' }
      ];
      const neutralShades = [
        { name: 'Nude', hex: '#D2B48C', finish: 'Cream', vibe: 'Natural' },
        { name: 'Dusty Rose', hex: '#DCAE96', finish: 'Matte', vibe: 'Subtle' },
        { name: 'Rosewood', hex: '#C08081', finish: 'Satin', vibe: 'Elegant' },
        { name: 'Soft Berry', hex: '#C71585', finish: 'Cream', vibe: 'Romantic' },
        { name: 'Mauve Pink', hex: '#E0B0FF', finish: 'Gloss', vibe: 'Feminine' },
        { name: 'Blush', hex: '#DE5D83', finish: 'Matte', vibe: 'Soft' },
        { name: 'Nude Pink', hex: '#E6C2A6', finish: 'Cream', vibe: 'Everyday' },
        { name: 'Soft Coral', hex: '#F88379', finish: 'Satin', vibe: 'Fresh' },
        { name: 'Warm Pink', hex: '#F4A460', finish: 'Gloss', vibe: 'Friendly' },
        { name: 'Taupe', hex: '#8B8589', finish: 'Matte', vibe: 'Neutral' }
      ];
      
      let extendedShades = isWarm ? warmShades : isCool ? coolShades : neutralShades;
      return [...baseShades, ...extendedShades].slice(0, 14);
    };
    
    // Extended blush shades (10+)
    const getBlushShades = () => {
      const baseShades = skinTone.blush || [];
      const warmBlush = [
        { name: 'Apricot', hex: '#FBCEB1', finish: 'Powder' },
        { name: 'Warm Peach', hex: '#FFDAB9', finish: 'Cream' },
        { name: 'Coral', hex: '#FF7F50', finish: 'Liquid' },
        { name: 'Tangerine', hex: '#FFA07A', finish: 'Powder' },
        { name: 'Bronze', hex: '#CD7F32', finish: 'Cream' },
        { name: 'Copper', hex: '#B87333', finish: 'Liquid' },
        { name: 'Burnt Orange', hex: '#CC5500', finish: 'Powder' },
        { name: 'Mango', hex: '#FF8243', finish: 'Cream' },
        { name: 'Terracotta', hex: '#E2725B', finish: 'Powder' },
        { name: 'Spice', hex: '#D2691E', finish: 'Liquid' },
        { name: 'Golden Peach', hex: '#FFCBA4', finish: 'Cream' },
        { name: 'Warm Sienna', hex: '#A0522D', finish: 'Powder' }
      ];
      const coolBlush = [
        { name: 'Cool Pink', hex: '#FFB6C1', finish: 'Powder' },
        { name: 'Soft Rose', hex: '#F4C2C2', finish: 'Cream' },
        { name: 'Petal Pink', hex: '#F8C8DC', finish: 'Liquid' },
        { name: 'Baby Pink', hex: '#F4C2C2', finish: 'Powder' },
        { name: 'Berry', hex: '#8A2BE2', finish: 'Cream' },
        { name: 'Plum', hex: '#8B668B', finish: 'Liquid' },
        { name: 'Mauve', hex: '#B784A7', finish: 'Powder' },
        { name: 'Orchid', hex: '#DA70D6', finish: 'Cream' },
        { name: 'Lilac', hex: '#C8A2C8', finish: 'Powder' },
        { name: 'Dusty Pink', hex: '#DCAE96', finish: 'Liquid' },
        { name: 'Rose Pink', hex: '#FF66CC', finish: 'Cream' },
        { name: 'Carnation', hex: '#FFA6C9', finish: 'Powder' }
      ];
      const neutralBlush = [
        { name: 'Warm Rose', hex: '#F4A460', finish: 'Powder' },
        { name: 'Soft Coral', hex: '#F88379', finish: 'Cream' },
        { name: 'Peach Pink', hex: '#FFDAB9', finish: 'Liquid' },
        { name: 'Dusty Rose', hex: '#DCAE96', finish: 'Powder' },
        { name: 'Mauve', hex: '#B784A7', finish: 'Cream' },
        { name: 'Nude Pink', hex: '#E6C2A6', finish: 'Powder' },
        { name: 'Soft Berry', hex: '#C71585', finish: 'Liquid' },
        { name: 'Rosewood', hex: '#C08081', finish: 'Cream' },
        { name: 'Natural Flush', hex: '#DE5D83', finish: 'Powder' },
        { name: 'Soft Peach', hex: '#FFE5B4', finish: 'Cream' }
      ];
      
      let extendedShades = isWarm ? warmBlush : isCool ? coolBlush : neutralBlush;
      return [...baseShades, ...extendedShades].slice(0, 14);
    };
    
    // Extended eyeshadow shades (20+)
    const getEyeshadowShades = () => {
      const baseShades = skinTone.eyeshadow || [];
      const warmShadows = [
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Bronze', hex: '#CD7F32' },
        { name: 'Copper', hex: '#B87333' },
        { name: 'Warm Brown', hex: '#8B4513' },
        { name: 'Terracotta', hex: '#E2725B' },
        { name: 'Amber', hex: '#FFBF00' },
        { name: 'Caramel', hex: '#B5651D' },
        { name: 'Honey', hex: '#D4A574' },
        { name: 'Olive', hex: '#808000' },
        { name: 'Burnt Orange', hex: '#CC5500' },
        { name: 'Champagne', hex: '#F7E7CE' },
        { name: 'Topaz', hex: '#FFC87C' },
        { name: 'Sienna', hex: '#A0522D' },
        { name: 'Rust', hex: '#B7410E' },
        { name: 'Mustard', hex: '#FFDB58' },
        { name: 'Cinnamon', hex: '#D2691E' },
        { name: 'Peach', hex: '#FFDAB9' },
        { name: 'Apricot', hex: '#FBCEB1' },
        { name: 'Tan', hex: '#D2B48C' },
        { name: 'Camel', hex: '#C19A6B' },
        { name: 'Mocha', hex: '#967969' },
        { name: 'Espresso', hex: '#3D2314' }
      ];
      const coolShadows = [
        { name: 'Silver', hex: '#C0C0C0' },
        { name: 'Grey', hex: '#808080' },
        { name: 'Taupe', hex: '#B8A090' },
        { name: 'Cool Brown', hex: '#8B7355' },
        { name: 'Plum', hex: '#8B668B' },
        { name: 'Lavender', hex: '#E6E6FA' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Navy', hex: '#000080' },
        { name: 'Teal', hex: '#008080' },
        { name: 'Slate', hex: '#708090' },
        { name: 'Charcoal', hex: '#36454F' },
        { name: 'Amethyst', hex: '#9966CC' },
        { name: 'Periwinkle', hex: '#CCCCFF' },
        { name: 'Blue Grey', hex: '#6699CC' },
        { name: 'Steel Blue', hex: '#4682B4' },
        { name: 'Royal Blue', hex: '#4169E1' },
        { name: 'Indigo', hex: '#4B0082' },
        { name: 'Violet', hex: '#8B00FF' },
        { name: 'Orchid', hex: '#DA70D6' },
        { name: 'Mauve', hex: '#B784A7' },
        { name: 'Dusty Rose', hex: '#DCAE96' },
        { name: 'Cool Champagne', hex: '#F7E7CE' }
      ];
      const neutralShadows = [
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Sand', hex: '#C2B280' },
        { name: 'Stone', hex: '#928E85' },
        { name: 'Greige', hex: '#A89F91' },
        { name: 'Mushroom', hex: '#B8A090' },
        { name: 'Bronze', hex: '#CD7F32' },
        { name: 'Pewter', hex: '#8A8A8A' },
        { name: 'Rose Gold', hex: '#B76E79' },
        { name: 'Champagne', hex: '#F7E7CE' },
        { name: 'Soft Brown', hex: '#A0522D' },
        { name: 'Warm Grey', hex: '#A0A0A0' },
        { name: 'Khaki', hex: '#C3B091' },
        { name: 'Olive', hex: '#808000' },
        { name: 'Sage', hex: '#9DC183' },
        { name: 'Cocoa', hex: '#D2691E' },
        { name: 'Walnut', hex: '#5D4C3A' },
        { name: 'Cream', hex: '#FFFDD0' },
        { name: 'Ivory', hex: '#FFFFF0' },
        { name: 'Soft Gold', hex: '#E6C288' },
        { name: 'Antique Brass', hex: '#CD9575' }
      ];
      
      let extendedShades = isWarm ? warmShadows : isCool ? coolShadows : neutralShadows;
      return [...baseShades, ...extendedShades].slice(0, 24);
    };
    
    // Extended hair colors (15+)
    const getHairColors = () => {
      const baseShades = skinTone.hair || [];
      const allHairColors = [
        { name: 'Platinum Blonde', hex: '#E5E5E5', level: 'Level 10' },
        { name: 'Ash Blonde', hex: '#C4B9AC', level: 'Level 9' },
        { name: 'Golden Blonde', hex: '#E6C288', level: 'Level 9' },
        { name: 'Honey Blonde', hex: '#D4A574', level: 'Level 8' },
        { name: 'Strawberry Blonde', hex: '#D4A574', level: 'Level 8' },
        { name: 'Light Auburn', hex: '#B56557', level: 'Level 7' },
        { name: 'Caramel', hex: '#B5651D', level: 'Level 6' },
        { name: 'Golden Brown', hex: '#996515', level: 'Level 5' },
        { name: 'Chestnut', hex: '#954535', level: 'Level 4' },
        { name: 'Chocolate Brown', hex: '#5D4037', level: 'Level 4' },
        { name: 'Auburn', hex: '#A52A2A', level: 'Level 5' },
        { name: 'Copper', hex: '#B87333', level: 'Level 6' },
        { name: 'Espresso', hex: '#3D2314', level: 'Level 2' },
        { name: 'Dark Brown', hex: '#3D2314', level: 'Level 2' },
        { name: 'Soft Black', hex: '#1C1C1C', level: 'Level 1' },
        { name: 'Jet Black', hex: '#0A0A0A', level: 'Level 1' },
        { name: 'Blue Black', hex: '#0D0D1A', level: 'Level 1' },
        { name: 'Deep Auburn', hex: '#5D1916', level: 'Level 3' },
        { name: 'Mahogany', hex: '#C04000', level: 'Level 4' },
        { name: 'Burgundy', hex: '#800020', level: 'Level 4' }
      ];
      
      return [...baseShades, ...allHairColors].slice(0, 18);
    };
    
    return {
      jewelry: {
        metals: [
          { name: isWarm ? 'Gold' : 'Silver', hex: isWarm ? '#FFD700' : '#C0C0C0', rating: 5, note: 'Best match for your undertone' },
          { name: isWarm ? 'Rose Gold' : 'Platinum', hex: isWarm ? '#B76E79' : '#E5E4E2', rating: 4, note: 'Great alternative' },
          { name: isWarm ? 'Copper' : 'White Gold', hex: isWarm ? '#B87333' : '#F5F5F5', rating: 4, note: 'Stylish choice' },
          { name: 'Mixed Metals', hex: '#C0C0C0', rating: 3, note: 'Versatile option' }
        ],
        styles: ['Classic', 'Elegant', 'Modern', 'Statement'],
        gemstones: skinTone.swatches || ['#FFD700', '#C0C0C0', '#B76E79', '#50C878'],
        avoid: isWarm ? 'Silver tones' : 'Yellow gold'
      },
      clothing: {
        colors: (skinTone.swatches || []).map((c, i) => ({ name: `Color ${i+1}`, hex: c, category: 'Best' })),
        styles: ['Classic', 'Modern', 'Elegant', 'Casual'],
        fabrics: ['Cotton', 'Silk', 'Linen', 'Cashmere'],
        patterns: ['Solid', 'Subtle', 'Minimal', 'Textured'],
        avoid: skinTone.avoidColors ? skinTone.avoidColors.split(', ') : []
      },
      lipstick: getLipstickShades(),
      blush: getBlushShades(),
      eyeshadow: getEyeshadowShades(),
      hair: {
        colors: getHairColors(),
        styles: ['Natural', 'Soft waves', 'Sleek', 'Textured', 'Curly', 'Straight', 'Braided'],
        treatments: ['Moisturizing', 'Color protect', 'Deep conditioning', 'Protein treatment', 'Keratin'],
        avoid: 'Harsh bleaching'
      }
    };
  }

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setScanError('Camera access denied. Please use file upload.');
    }
  }

  function capturePhoto() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imgData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imgData);
    if (stream) stream.getTracks().forEach(t => t.stop());
    analyzeImage(imgData);
  }

  return (
    <div className="app">
      <Ambient />
      <nav className="nav">
        <span className="nav-brand">Beauty Kit</span>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">✦ {user.name}</span>
              <button className="btn-ghost small" onClick={() => navigate('/dashboard')}>Dashboard</button>
            </>
          ) : (
            <button className="btn-ghost small" onClick={() => { setAuthMode('signin'); navigate('/auth'); }}>Sign In</button>
          )}
        </div>
      </nav>
      <div className="scan-page">
        <button className="back-btn" onClick={() => navigate(user ? '/dashboard' : '/')}>← Back</button>
        <h2 className="section-title">Scan Your Skin</h2>
        <p className="section-sub">Best results in natural daylight — aim your camera at your cheek or inner wrist.</p>
        {scanError && <div className="error-box">{scanError}</div>}
        <div className="scan-modes">
          <button className={`mode-btn ${scanMode === 'upload' ? 'active' : ''}`} onClick={() => setScanMode('upload')}>Upload Photo</button>
          <button className={`mode-btn ${scanMode === 'camera' ? 'active' : ''}`} onClick={() => { setScanMode('camera'); startCamera(); }}>Live Camera</button>
        </div>
        {scanMode === 'upload' && (
          <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
            <div className="upload-icon">⊕</div>
            <p className="upload-text">Click to upload your photo</p>
            <p className="upload-hint">JPG · PNG · WEBP  •  Natural light recommended</p>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>
        )}
        {scanMode === 'camera' && (
          <div className="camera-zone">
            <div className="video-wrap">
              <video ref={videoRef} autoPlay playsInline className="camera-feed" />
              <div className="face-guide" />
            </div>
            <button className="capture-btn" onClick={capturePhoto}><span className="capture-inner" /></button>
            <p className="upload-hint">Align your face and tap the button</p>
          </div>
        )}

        {showColorPicker && tempImage && (
          <ColorPicker
            imageSrc={tempImage}
            onColorSelect={handleColorSelect}
            onCancel={() => {
              setShowColorPicker(false);
              setTempImage(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
