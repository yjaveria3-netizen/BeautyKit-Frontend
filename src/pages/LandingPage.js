import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Ambient from '../components/Ambient';
import HeroIllustration from '../components/HeroIllustration';
import { SKIN_TONES } from '../data/constants';


export default function LandingPage({ setAuthMode, user, logout }) {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const itemsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateCarouselStyles = useCallback(() => {
    const items = itemsRef.current;
    const totalItems = items.length;
    if (!items || totalItems === 0) return;

    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;

    let spacing1 = 320, spacing2 = 480, spacing3 = 600;
    if (isMobile) {
      spacing1 = 220; spacing2 = 340; spacing3 = 440;
    } else if (isTablet) {
      spacing1 = 280; spacing2 = 420; spacing3 = 520;
    }

    items.forEach((item, index) => {
      let offset = index - currentIndex;
      if (offset > totalItems / 2) offset -= totalItems;
      if (offset < -totalItems / 2) offset += totalItems;
      const absOffset = Math.abs(offset);
      const sign = offset < 0 ? -1 : 1;

      item.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';

      if (absOffset === 0) {
        item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
        item.style.opacity = '1';
        item.style.zIndex = '10';
      } else if (absOffset === 1) {
        const translateX = sign * spacing1;
        const rotation = isMobile ? 25 : 30;
        const scale = isMobile ? 0.88 : 0.85;
        item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
        item.style.opacity = '0.85';
        item.style.zIndex = '5';
      } else if (absOffset === 2) {
        const translateX = sign * spacing2;
        const rotation = isMobile ? 35 : 40;
        const scale = isMobile ? 0.75 : 0.7;
        item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
        item.style.opacity = '0.5';
        item.style.zIndex = '3';
      } else if (absOffset === 3) {
        const translateX = sign * spacing3;
        const rotation = isMobile ? 40 : 45;
        const scale = isMobile ? 0.65 : 0.6;
        item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${-sign * rotation}deg) scale(${scale})`;
        item.style.opacity = '0.3';
        item.style.zIndex = '2';
      } else {
        item.style.transform = 'translate(-50%, -50%) translateZ(-500px) scale(0.5)';
        item.style.opacity = '0';
        item.style.zIndex = '1';
      }
    });
  }, [currentIndex]);

  useEffect(() => {
    updateCarouselStyles();
    let resizeTimer = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCarouselStyles, 120);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [updateCarouselStyles]);

  useEffect(() => {
    updateCarouselStyles();
  }, [currentIndex, updateCarouselStyles]);

  const goToSlide = (index) => {
    setCurrentIndex(((index % SKIN_TONES.length) + SKIN_TONES.length) % SKIN_TONES.length);
  };

  return (
    <div className="app landing-app">
      <Ambient />
      <nav className="nav">
        <span className="nav-brand">Beauty Kit</span>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">✦ {user.name}</span>
              <button className="btn-ghost" onClick={logout}>Sign Out</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => { setAuthMode('signin'); navigate('/auth'); }}>Sign In</button>
              <button className="btn-primary" onClick={() => { setAuthMode('signup'); navigate('/auth'); }}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow"><span className="eyebrow-dot" />AI-Powered Beauty Intelligence</div>
            <h1 className="hero-headline">Discover the<br />Colors That<br /><em>Were Made</em><br />For You.</h1>
            <p className="hero-body">Beauty Kit reads your skin's unique undertone and depth, then builds a complete beauty profile — from metals that make you glow to the lip shade that turns heads.</p>
            <div className="hero-cta-row">
              <button className="cta-pill" onClick={() => user ? navigate('/scan') : (() => { setAuthMode('signup'); navigate('/auth'); })}>
                {user ? 'Start New Analysis' : 'Begin Your Analysis'}<span className="cta-arrow">→</span>
              </button>
              {!user && <button className="cta-ghost" onClick={() => navigate('/scan')}>Try without account</button>}
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">6</span><span className="stat-label">Beauty Categories</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Color Recommendations</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">12</span><span className="stat-label">Skin Tones</span></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-avatar-frame">
              <div className="frame-ring frame-ring-1" /><div className="frame-ring frame-ring-2" />
              <div className="frame-corner fc-tl" /><div className="frame-corner fc-tr" />
              <div className="frame-corner fc-bl" /><div className="frame-corner fc-br" />
              <div className="hero-illus-inner"><HeroIllustration /></div>
              <div className="avatar-card avatar-card-1"><div className="avc-dot" style={{ background: '#FFD700' }} /><span>Gold Jewellery</span></div>
              <div className="avatar-card avatar-card-2"><div className="avc-dot" style={{ background: '#b83055' }} /><span>Berry Lip</span></div>
              <div className="avatar-card avatar-card-3"><div className="avc-dot" style={{ background: '#7b5ea7' }} /><span>Smoky Eyeshadow</span></div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint"><div className="scroll-line" /><span>Discover More</span><div className="scroll-line" /></div>
      </section>

      <section className="features-section">
        <div className="features-inner">
          <div className="section-eyebrow">What Beauty Kit Gives You</div>
          <h2 className="section-headline">A Complete Beauty<br /><em>Transformation</em> — In Seconds.</h2>
          <p className="section-body">Six expertly curated categories, each with recommendations tailored precisely to your skin across 12 shade profiles.</p>
          <div className="feat-grid">
            {[
              { icon: '💎', title: 'Jewellery', sub: 'Metals, Styles & Gemstones', desc: 'Know exactly which metals make your skin radiate — gold, silver, rose gold — and which statement styles suit your aesthetic.' },
              { icon: '👗', title: 'Clothes', sub: 'Color Wheel · 16 Colors · 8 Styles', desc: 'A skin-matched interactive color wheel, full palette, style directions, fabrics and patterns.' },
              { icon: '💄', title: 'Lipstick', sub: '8 Shades with Finish & Vibe', desc: 'From bold velvet berries to peachy gloss nudes — each shade rated for finish and occasion vibe.' },
              { icon: '🌸', title: 'Blush', sub: 'Natural Airbrushed Blending', desc: 'Swept-cheekbone blush previews, not circles — the exact flush tones that make your cheekbones pop.' },
              { icon: '✨', title: 'Eyeshadow', sub: '8-Pan Custom Palette', desc: 'A complete eyeshadow palette built specifically for your undertone to create depth and dimension.' },
              { icon: '💇', title: 'Hair', sub: '9 Shades · Styles · Treatments', desc: 'Hair colors that frame your face beautifully, plus style suggestions and salon treatment recommendations.' },
            ].map((f, i) => (
              <div key={i} className="feat-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-sub">{f.sub}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="how-inner">
          <div className="section-eyebrow">Simple Process</div>
          <h2 className="section-headline">Three Steps to Your<br /><em>Perfect Palette.</em></h2>
          <div className="steps-row">
            {[
              { num: '01', title: 'Upload or Capture', desc: 'Take a photo in natural daylight or upload an existing image from your gallery.' },
              { num: '02', title: 'AI Analysis', desc: 'Our engine samples thousands of pixels, detecting undertone and depth via dermatology-standard color science.' },
              { num: '03', title: 'Explore & Save', desc: 'Browse 6 categories, preview colors on your real photo, save profiles anytime.' },
            ].map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.num}</div><div className="step-line" />
                <div className="step-title">{s.title}</div><div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="skin-tone-carousel-section">
            <div className="section-eyebrow" style={{ marginBottom: '2.5rem', justifyContent: 'center' }}>
              <span style={{ marginRight: '0.75rem' }}>12 Skin Tone Profiles</span>
            </div>
            <h2 className="section-headline" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              Find Your Perfect<br /><em>Match.</em>
            </h2>
            <div className="skin-tone-carousel skin-tone-carousel-celebrity" ref={carouselRef}>
              {SKIN_TONES.map((tone, index) => {
                const celebNames = tone.celebrities.split(', ');
                const celebImage = tone.celebrityImages?.[0];
                return (
                  <div
                    key={tone.id}
                    className="skin-tone-carousel-item skin-tone-carousel-celebrity-item"
                    ref={(el) => (itemsRef.current[index] = el)}
                  >
                    <div className="skin-tone-card-carousel skin-tone-card-carousel-celebrity">
                      <div className="skin-tone-celebrity-wrap" onClick={() => goToSlide(index)}>
                        <img 
                          src={celebImage || ''} 
                          alt={celebNames[0]}
                          className="skin-tone-celebrity-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentNode.querySelector('.skin-tone-celebrity-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            e.target.style.display = 'block';
                            const fallback = e.target.parentNode.querySelector('.skin-tone-celebrity-fallback');
                            if (fallback) fallback.style.display = 'none';
                          }}
                        />
                        <div 
                          className="skin-tone-celebrity-fallback"
                          style={{ 
                            display: 'none',
                            position: 'absolute',
                            inset: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${tone.hex}, ${tone.swatches?.[0] || tone.hex})`
                          }}
                        >
                          <HeroIllustration 
                            id={`carousel-${tone.id}`}
                            colors={{
                              skin: tone.hex,
                              hair: tone.swatches[0],
                              top: index % 3 === 0 ? '#283593' : index % 3 === 1 ? '#006d6f' : '#6a1a5a',
                              lipstick: tone.undertone === 'Warm' ? '#C65D3C' : tone.undertone === 'Cool' ? '#B83055' : '#C4728A',
                              blush: tone.undertone === 'Warm' ? 'rgba(255,130,100,0.35)' : tone.undertone === 'Cool' ? 'rgba(200,100,130,0.35)' : 'rgba(196,114,138,0.35)',
                              eyeshadow: tone.undertone === 'Warm' ? '#8B4513' : tone.undertone === 'Cool' ? '#7B5EA7' : '#6A5EA7',
                              jewelry: tone.undertone === 'Warm' ? '#FFD700' : tone.undertone === 'Cool' ? '#C0C0C0' : '#B76E79'
                            }} 
                          />
                        </div>
                        <div className="skin-tone-celebrity-overlay">
                          <div className="skin-tone-celebrity-name-display">{celebNames[0]}</div>
                        </div>
                      </div>
                      <div className="skin-tone-info">
                        <div className="skin-tone-name-carousel">{tone.name}</div>
                        <div className="skin-tone-meta">
                          <span className="skin-tone-undertone">{tone.undertone}</span>
                          <span className="skin-tone-depth">{tone.depth}</span>
                        </div>
                        <div className="skin-tone-celebs">{tone.celebrities}</div>
                        <div className="skin-tone-swatches-carousel">
                          {tone.swatches.map((s, j) => (
                            <div key={j} className="st-swatch-mini" style={{ background: s }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="carousel-indicators">
              {SKIN_TONES.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="avatar-feature-section">
        <div className="avatar-feature-inner">
          <div className="af-left">
            <div className="section-eyebrow">Live Preview</div>
            <h2 className="section-headline">Watch Your Look<br />Come to Life.</h2>
            <p className="section-body">Your scanned photo becomes the canvas. Blush sweeps naturally across your real cheekbones, lip color tints your actual lips, and our color wheel surfaces the clothing shades tuned to your exact skin tone.</p>
            <ul className="af-bullets">
              {['Real photo display with natural makeup overlays', 'Blush blends as a swept airbrushed cheekbone flush', 'Skin-matched clothing color wheel with 22 hues', '12 skin tone profiles with metals, lips, eyes & more'].map((b, i) => (
                <li key={i} className="af-bullet"><span className="bullet-check">✦</span>{b}</li>
              ))}
            </ul>
          </div>
          <div className="af-right">
            <div className="af-avatar-wrap">
              <div className="af-avatar-bg" />
              <HeroIllustration colors={{ skin: '#B08060', hair: '#1C1C1C', top: '#283593', lipstick: '#8B008B', blush: 'rgba(200,140,180,0.45)', eyeshadow: '#36454F', jewelry: '#C0C0C0', showNecklace: true, showEarrings: true, showRing: true }} />
              <div className="af-label">Cool undertone — Silver jewellery, Navy outfit, Berry lip</div>
            </div>
            <div className="af-avatar-wrap" style={{ marginTop: '1.5rem' }}>
              <div className="af-avatar-bg warm" />
              <HeroIllustration colors={{ skin: '#C8956C', hair: '#C4922A', top: '#808000', lipstick: '#FF6B5B', blush: 'rgba(255,160,100,0.4)', eyeshadow: '#CD7F32', jewelry: '#FFD700', showNecklace: true, showEarrings: true, showRing: true }} />
              <div className="af-label">Warm undertone — Gold jewellery, Olive outfit, Coral lip</div>
            </div>
          </div>
        </div>
      </section>

      <section className="social-proof-section">
        <div className="social-proof-inner">
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-icon">⭐</span>
              <span className="trust-text"><strong>4.9/5</strong> from 10,000+ users</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span className="trust-text">Dermatologist-tested</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-badge">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Privacy-first</span>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-inner">
          <div className="section-eyebrow">Common Questions</div>
          <h2 className="section-headline">Everything You Need to<br /><em>Know.</em></h2>
          <div className="faq-list">
            {[
              { q: 'Is my photo data secure?', a: 'Absolutely. All image processing happens locally in your browser. We never store or upload your photos to any server.' },
              { q: 'How accurate is the analysis?', a: 'Our AI is trained on dermatology color science standards with 95%+ accuracy. It analyzes thousands of pixels to determine your exact undertone and depth.' },
              { q: 'Can I use it without an account?', a: 'Yes! You can try the skin tone scan instantly without signing up. Create an account only when you want to save your profiles.' },
              { q: 'What devices are supported?', a: 'BeauKit works on all modern smartphones, tablets, and computers. For best results, use natural daylight when taking photos.' },
              { q: 'How many profiles can I save?', a: 'You can create unlimited profiles with a free account — perfect for trying different looks or managing family members.' }
            ].map((item, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q">{item.q}</div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta-section">
        <div className="final-cta-inner">
          <div className="final-ornament">✦</div>
          <h2 className="final-headline">Your Most Flattering<br /><em>Colors Are Waiting.</em></h2>
          <p className="final-body">
            {user 
              ? 'Continue your beauty journey with personalized analysis and recommendations tailored just for you.' 
              : 'Join Beauty Kit and build a beauty profile that\'s uniquely, scientifically yours. Free to start. No guesswork required.'
            }
          </p>
          <div className="final-btns">
            <button className="cta-pill large" onClick={() => user ? navigate('/scan') : (() => { setAuthMode('signup'); navigate('/auth'); })}>
              {user ? 'Start New Analysis' : 'Create Your Free Account'}<span className="cta-arrow">→</span>
            </button>
            {!user && <button className="cta-ghost" onClick={() => navigate('/scan')}>Scan Without Signing Up</button>}
          </div>
        </div>
        <footer className="site-footer">
          <span className="footer-brand">Beauty Kit</span>
          <span className="footer-copy">© 2026 BeauKit. All rights reserved. Beauty intelligence, powered by science.</span>
        </footer>
      </section>
    </div>
  );
}
