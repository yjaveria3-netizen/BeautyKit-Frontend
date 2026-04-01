import React, { useState, useEffect, useRef } from 'react';
import { SKIN_TONES } from '../data/constants';

export default function CelebritySlider({ 
  currentIndex = 0, 
  onIndexChange,
  showControls = true,
  autoPlay = false,
  autoPlayInterval = 5000 
}) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [imageLoaded, setImageLoaded] = useState({});
  const [imageError, setImageError] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % SKIN_TONES.length);
      }, autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval]);

  useEffect(() => {
    onIndexChange && onIndexChange(activeIndex);
  }, [activeIndex, onIndexChange]);

  const currentTone = SKIN_TONES[activeIndex];
  const celebrities = currentTone?.celebrities?.split(', ') || [];
  const celebrityImages = currentTone?.celebrityImages || [];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SKIN_TONES.length) % SKIN_TONES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SKIN_TONES.length);
  };

  const handleImageLoad = (index) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }));
  };

  const handleImageError = (index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="celebrity-slider">
      <div className="celebrity-slider-container">
        {/* Main Display */}
        <div className="celebrity-display">
          {celebrityImages.map((imgUrl, idx) => (
            <div 
              key={idx}
              className={`celebrity-image-wrapper ${imageLoaded[idx] ? 'loaded' : ''}`}
              style={{ display: idx === 0 ? 'block' : 'none' }}
            >
              {!imageError[idx] ? (
                <img
                  src={imgUrl}
                  alt={celebrities[idx] || 'Celebrity'}
                  className="celebrity-image"
                  onLoad={() => handleImageLoad(idx)}
                  onError={() => handleImageError(idx)}
                />
              ) : (
                <div className="celebrity-fallback">
                  <div 
                    className="celebrity-avatar-fallback"
                    style={{ backgroundColor: currentTone?.hex || '#e8b896' }}
                  >
                    <span>{celebrities[idx]?.charAt(0) || '?'}</span>
                  </div>
                </div>
              )}
              <div className="celebrity-name">{celebrities[idx]}</div>
            </div>
          ))}
          
          {/* Skin Tone Info Overlay */}
          <div className="celebrity-info-overlay">
            <div className="celebrity-skin-tone">{currentTone?.name}</div>
            <div className="celebrity-undertone">
              {currentTone?.undertone} · {currentTone?.depth}
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {showControls && (
          <div className="celebrity-thumbnails">
            {SKIN_TONES.map((tone, idx) => (
              <button
                key={tone.id}
                className={`celebrity-thumb ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                title={`${tone.name} - ${tone.celebrities}`}
              >
                <div 
                  className="celebrity-thumb-image"
                  style={{ 
                    backgroundColor: tone.hex,
                    backgroundImage: tone.celebrityImages?.[0] ? `url(${tone.celebrityImages[0]})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="celebrity-thumb-name">{tone.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {showControls && (
          <>
            <button className="celebrity-nav-btn prev" onClick={handlePrev} aria-label="Previous">
              ‹
            </button>
            <button className="celebrity-nav-btn next" onClick={handleNext} aria-label="Next">
              ›
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showControls && (
          <div className="celebrity-dots">
            {SKIN_TONES.map((_, idx) => (
              <button
                key={idx}
                className={`celebrity-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to skin tone ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
