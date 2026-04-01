import React, { useState, useRef, useEffect } from 'react';
import { SKIN_TONES } from '../data/constants';

export default function ColorPicker({ imageSrc, onColorSelect, onCancel }) {
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions to fit canvas while maintaining aspect ratio
      const maxWidth = 600;
      const maxHeight = 500;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale factor between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Get click position relative to canvas
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(x, canvas.width - 1));
    const clampedY = Math.max(0, Math.min(y, canvas.height - 1));
    
    setCursorPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
    
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(Math.floor(clampedX), Math.floor(clampedY), 1, 1).data;
    
    // Ensure we got valid pixel data (not transparent)
    if (pixel[3] === 0) {
      console.log('Clicked on transparent area, ignoring');
      return;
    }
    
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).padStart(6, '0').slice(1)}`;
    
    setSelectedColor({
      hex,
      rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
    });
    setIsPicking(true);
  };

  const findClosestSkinTone = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    let closest = SKIN_TONES[0];
    let minDistance = Infinity;
    
    SKIN_TONES.forEach(tone => {
      const tr = parseInt(tone.hex.slice(1, 3), 16);
      const tg = parseInt(tone.hex.slice(3, 5), 16);
      const tb = parseInt(tone.hex.slice(5, 7), 16);
      
      const distance = Math.sqrt(
        Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = tone;
      }
    });
    
    return closest;
  };

  const handleConfirm = () => {
    if (selectedColor) {
      const skinTone = findClosestSkinTone(selectedColor.hex);
      onColorSelect({
        color: selectedColor,
        skinTone
      });
    }
  };

  return (
    <div className="color-picker-modal">
      <div className="color-picker-content">
        <h3 className="color-picker-title">Pick Your Skin Tone</h3>
        <p className="color-picker-sub">Click anywhere on your photo to select the most accurate skin color</p>
        
        <div className="color-picker-canvas-wrap">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="color-picker-canvas"
          />
          {isPicking && (
            <div 
              className="color-cursor"
              style={{ 
                left: `${cursorPos.x}%`, 
                top: `${cursorPos.y}%`,
                backgroundColor: selectedColor?.hex 
              }}
            />
          )}
        </div>

        {selectedColor && (
          <div className="color-preview">
            <div className="color-swatch-large" style={{ backgroundColor: selectedColor.hex }} />
            <div className="color-info">
              <p className="color-hex">{selectedColor.hex}</p>
              <p className="color-rgb">{selectedColor.rgb}</p>
              {(() => {
                const tone = findClosestSkinTone(selectedColor.hex);
                return (
                  <div className="detected-tone">
                    <span className="tone-label">Closest Match:</span>
                    <span className="tone-name">{tone.name}</span>
                    <span className="tone-undertone">{tone.undertone}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <div className="color-picker-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={handleConfirm}
            disabled={!selectedColor}
          >
            Confirm & Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
