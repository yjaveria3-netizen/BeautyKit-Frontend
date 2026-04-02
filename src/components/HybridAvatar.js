import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export default function HybridAvatar({
  imageSrc,
  colors = {},
  onFaceDetected
}) {
  const {
    skin = '#e8b896',
    hair = '#4a2010',
    top = '#b08de8',
    lipstick = '#b83055',
    blush = 'rgba(255,130,100,0.22)',
    eyeshadow = '#7b5ea7',
    jewelry = '#f0d060',
  } = colors;

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [status, setStatus] = useState('Loading AI face scanner...');

  // Initialize TensorFlow
  useEffect(() => {
    const initModel = async () => {
      try {
        setStatus('Loading AI face scanner...');
        await tf.setBackend('webgl');
        await tf.ready();
        const detector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            refineLandmarks: true,
            maxFaces: 1
          }
        );
        setModel(detector);
        setIsLoading(false);
        setStatus('');
      } catch (err) {
        console.error('Failed to load face detection model:', err);
        setError('ml_failed');
        setIsLoading(false);
      }
    };
    initModel();
  }, []);

  const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(180,130,100,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Apply makeup overlays on the real face using ML keypoints
  const applyMakeup = useCallback((ctx, face, scaleX, scaleY, offsetX, offsetY) => {
    const keypoints = face.keypoints;
    if (!keypoints) return;

    const sk = (kp) => ({
      x: kp.x * scaleX + offsetX,
      y: kp.y * scaleY + offsetY
    });

    // ── EYESHADOW ──
    if (eyeshadow) {
      const leftUpperLid = [33, 246, 161, 160, 159, 158, 157, 173, 133];
      const rightUpperLid = [362, 398, 384, 385, 386, 387, 388, 466, 263];

      [leftUpperLid, rightUpperLid].forEach(indices => {
        const pts = indices.map(i => keypoints[i]).filter(Boolean).map(sk);
        if (pts.length < 3) return;

        ctx.save();
        ctx.filter = 'blur(6px)';
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = eyeshadow;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y - 18);
        pts.forEach(p => ctx.lineTo(p.x, p.y - 18));
        // expand shadow area upward
        for (let i = pts.length - 1; i >= 0; i--) {
          ctx.lineTo(pts[i].x, pts[i].y - 30);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    }

    // ── BLUSH ──
    if (blush) {
      const leftCheek = keypoints[205] || keypoints[50];
      const rightCheek = keypoints[425] || keypoints[280];

      [leftCheek, rightCheek].forEach(kp => {
        if (!kp) return;
        const p = sk(kp);
        ctx.save();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 45);
        gradient.addColorStop(0, hexToRgba(blush.startsWith('#') ? blush : '#e87060', 0.55));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.filter = 'blur(12px)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 45, 28, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // ── LIPSTICK ──
    if (lipstick) {
      const upperLipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
      const lowerLipIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

      ctx.save();
      ctx.filter = 'blur(1.5px)';
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = lipstick;

      [upperLipIndices, lowerLipIndices].forEach(indices => {
        const pts = indices.map(i => keypoints[i]).filter(Boolean).map(sk);
        if (pts.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      // Lip highlight
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = 'white';
      ctx.filter = 'blur(3px)';
      const lipCenter = keypoints[13] ? sk(keypoints[13]) : null;
      if (lipCenter) {
        ctx.beginPath();
        ctx.ellipse(lipCenter.x, lipCenter.y - 3, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ── SUBTLE SKIN GLOW / FOUNDATION ──
    const noseTip = keypoints[4];
    if (noseTip && skin && skin !== '#e8b896') {
      const p = sk(noseTip);
      ctx.save();
      const grad = ctx.createRadialGradient(p.x, p.y - 30, 0, p.x, p.y - 30, 80);
      grad.addColorStop(0, hexToRgba(skin, 0.08));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.filter = 'blur(20px)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 30, 80, 90, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

  }, [eyeshadow, blush, lipstick, skin]);

  // Draw SVG accessories via canvas
  const drawSVGAccessories = useCallback((ctx, face, canvasW, canvasH, scaleX, scaleY, offsetX, offsetY) => {
    const keypoints = face.keypoints;
    if (!keypoints) return;

    const sk = (kp) => ({
      x: kp.x * scaleX + offsetX,
      y: kp.y * scaleY + offsetY
    });

    // ── HAIR (drawn as SVG-style arc around head) ──
    const topHead = keypoints[10];
    const leftSide = keypoints[234];
    const rightSide = keypoints[454];
    const chin = keypoints[152];
    const box = face.box;

    if (topHead && leftSide && rightSide) {
      const top_p = sk(topHead);
      const left_p = sk(leftSide);
      const right_p = sk(rightSide);
      const chin_p = chin ? sk(chin) : { x: top_p.x, y: top_p.y + 200 * scaleY };

      const centerX = (left_p.x + right_p.x) / 2;
      const headW = Math.abs(right_p.x - left_p.x);
      const headH = Math.abs(chin_p.y - top_p.y);

      const hairColor = hair;
      const grad = ctx.createLinearGradient(centerX, top_p.y - 30, centerX, chin_p.y);
      grad.addColorStop(0, hairColor);
      grad.addColorStop(0.6, hairColor + 'cc');
      grad.addColorStop(1, hairColor + '55');

      // Back hair layer (behind face)
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = grad;
      ctx.beginPath();
      // Left side hair
      ctx.moveTo(left_p.x + headW * 0.05, top_p.y + headH * 0.15);
      ctx.quadraticCurveTo(left_p.x - headW * 0.12, top_p.y + headH * 0.4, left_p.x - headW * 0.1, chin_p.y + headH * 0.25);
      ctx.lineTo(left_p.x + headW * 0.02, chin_p.y + headH * 0.2);
      ctx.quadraticCurveTo(left_p.x - headW * 0.03, top_p.y + headH * 0.5, left_p.x + headW * 0.1, top_p.y + headH * 0.2);
      ctx.closePath();
      ctx.fill();

      // Right side hair
      ctx.beginPath();
      ctx.moveTo(right_p.x - headW * 0.05, top_p.y + headH * 0.15);
      ctx.quadraticCurveTo(right_p.x + headW * 0.12, top_p.y + headH * 0.4, right_p.x + headW * 0.1, chin_p.y + headH * 0.25);
      ctx.lineTo(right_p.x - headW * 0.02, chin_p.y + headH * 0.2);
      ctx.quadraticCurveTo(right_p.x + headW * 0.03, top_p.y + headH * 0.5, right_p.x - headW * 0.1, top_p.y + headH * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Top hair cap (drawn after face for layering)
      ctx.save();
      ctx.globalAlpha = 0.92;
      const topGrad = ctx.createLinearGradient(centerX, top_p.y - 40, centerX, top_p.y + headH * 0.25);
      topGrad.addColorStop(0, hairColor);
      topGrad.addColorStop(1, hairColor + '88');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(left_p.x + headW * 0.05, top_p.y + headH * 0.18);
      ctx.quadraticCurveTo(left_p.x + headW * 0.1, top_p.y - headH * 0.1, centerX, top_p.y - headH * 0.12);
      ctx.quadraticCurveTo(right_p.x - headW * 0.1, top_p.y - headH * 0.1, right_p.x - headW * 0.05, top_p.y + headH * 0.18);
      ctx.quadraticCurveTo(centerX, top_p.y + headH * 0.08, left_p.x + headW * 0.05, top_p.y + headH * 0.18);
      ctx.fill();
      ctx.restore();
    }

    // ── EARRINGS ──
    const leftEar = keypoints[234];
    const rightEar = keypoints[454];
    const lobe_left = keypoints[132];
    const lobe_right = keypoints[361];

    [[leftEar, lobe_left, -1], [rightEar, lobe_right, 1]].forEach(([ear, lobe, dir]) => {
      if (!ear) return;
      const earP = sk(ear);
      const lobeP = lobe ? sk(lobe) : { x: earP.x, y: earP.y + 15 };

      ctx.save();
      // Stud
      ctx.fillStyle = jewelry;
      ctx.shadowColor = jewelry;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(lobeP.x + dir * 8, lobeP.y + 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Dangling drop
      ctx.strokeStyle = jewelry;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(lobeP.x + dir * 8, lobeP.y + 10);
      ctx.lineTo(lobeP.x + dir * 8, lobeP.y + 22);
      ctx.stroke();

      ctx.fillStyle = jewelry;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(lobeP.x + dir * 8, lobeP.y + 26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // ── TOP / CLOTHING ──
    // Draw clothing below the chin/neck area
    if (chin) {
      const chin_p = sk(chin);
      const leftSide_p = leftSide ? sk(leftSide) : { x: chin_p.x - 80, y: chin_p.y };
      const rightSide_p = rightSide ? sk(rightSide) : { x: chin_p.x + 80, y: chin_p.y };
      const headW = Math.abs((rightSide_p.x - leftSide_p.x));
      const neckBase = chin_p.y + headW * 0.15;
      const shoulderY = chin_p.y + headW * 0.45;
      const centerX = (leftSide_p.x + rightSide_p.x) / 2;

      ctx.save();
      const clothGrad = ctx.createLinearGradient(centerX, neckBase, centerX, canvasH);
      clothGrad.addColorStop(0, top + 'dd');
      clothGrad.addColorStop(0.3, top + 'bb');
      clothGrad.addColorStop(1, top + '55');
      ctx.fillStyle = clothGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - headW * 0.15, neckBase);
      ctx.quadraticCurveTo(centerX - headW * 0.2, neckBase + headW * 0.1, centerX - headW * 0.55, shoulderY);
      ctx.lineTo(leftSide_p.x - headW * 0.6, canvasH);
      ctx.lineTo(rightSide_p.x + headW * 0.6, canvasH);
      ctx.lineTo(centerX + headW * 0.55, shoulderY);
      ctx.quadraticCurveTo(centerX + headW * 0.2, neckBase + headW * 0.1, centerX + headW * 0.15, neckBase);
      // Neckline V
      ctx.quadraticCurveTo(centerX, neckBase + headW * 0.18, centerX - headW * 0.15, neckBase);
      ctx.fill();
      ctx.restore();

      // Necklace
      ctx.save();
      ctx.strokeStyle = jewelry;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(centerX - headW * 0.12, neckBase + 5);
      ctx.quadraticCurveTo(centerX, neckBase + headW * 0.12, centerX + headW * 0.12, neckBase + 5);
      ctx.stroke();
      // Pendant
      ctx.fillStyle = jewelry;
      ctx.shadowColor = jewelry;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(centerX, neckBase + headW * 0.13, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

  }, [hair, jewelry, top]);

  // Detect face and draw
  const detectAndDraw = useCallback(async () => {
    if (!model || !imageRef.current || !canvasRef.current) return;

    try {
      setStatus('Scanning face features...');
      const faces = await model.estimateFaces(imageRef.current);

      if (faces.length > 0) {
        const face = faces[0];
        setFaceData(face);
        drawComposite(face);
        onFaceDetected && onFaceDetected(face);
        setStatus('');
      } else {
        setError('no_face');
        setStatus('');
      }
    } catch (err) {
      console.error('Face detection error:', err);
      setError('detect_failed');
      setStatus('');
    }
  }, [model, colors, onFaceDetected]);

  const drawComposite = useCallback((face) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = 400;
    canvas.height = 520;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background glow
    const bgGrad = ctx.createRadialGradient(200, 300, 0, 200, 300, 260);
    bgGrad.addColorStop(0, 'rgba(100, 70, 180, 0.25)');
    bgGrad.addColorStop(1, 'rgba(6, 6, 14, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const box = face.box;
    const faceW = box.xMax - box.xMin;
    const faceH = box.yMax - box.yMin;

    // We want to fit the face into the upper center of canvas
    // Target face center at (200, 185) in canvas, face taking ~55% of width
    const targetW = canvas.width * 0.56;
    const scale = targetW / faceW;
    const scaledH = faceH * scale;

    const faceCenterX = (box.xMin + box.xMax) / 2;
    const faceCenterY = (box.yMin + box.yMax) / 2;

    // Canvas position for face center
    const canvasFaceCX = 200;
    const canvasFaceCY = 185;

    const offsetX = canvasFaceCX - faceCenterX * scale;
    const offsetY = canvasFaceCY - faceCenterY * scale;

    // --- Step 1: Draw back-hair layer (behind face) ---
    drawSVGAccessories(ctx, face, canvas.width, canvas.height, scale, scale, offsetX, offsetY);

    // --- Step 2: Draw the real face clipped to ellipse ---
    const ellipseRX = faceW * scale * 0.5 + 5;
    const ellipseRY = faceH * scale * 0.5 + 5;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(canvasFaceCX, canvasFaceCY, ellipseRX, ellipseRY, 0, 0, Math.PI * 2);
    ctx.clip();

    // Draw face photo
    ctx.drawImage(
      img,
      box.xMin - faceW * 0.08, box.yMin - faceH * 0.08,
      faceW * 1.16, faceH * 1.16,
      canvasFaceCX - ellipseRX, canvasFaceCY - ellipseRY,
      ellipseRX * 2, ellipseRY * 2
    );

    // --- Step 3: Apply makeup overlays ON the real face ---
    applyMakeup(ctx, face, scale, scale, offsetX, offsetY);

    ctx.restore();

    // Subtle face edge shadow
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 3;
    ctx.filter = 'blur(6px)';
    ctx.beginPath();
    ctx.ellipse(canvasFaceCX, canvasFaceCY, ellipseRX - 2, ellipseRY - 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Re-draw top hair layer (over face) and accessories
    // The drawSVGAccessories already draws earrings & clothing after hair, 
    // but we need top-hair AFTER face clip is restored
    // Draw top hair cap over face
    const keypoints = face.keypoints;
    if (keypoints) {
      const sk = (kp) => ({ x: kp.x * scale + offsetX, y: kp.y * scale + offsetY });
      const topHead = keypoints[10];
      const leftSide = keypoints[234];
      const rightSide = keypoints[454];
      const chin = keypoints[152];

      if (topHead && leftSide && rightSide) {
        const top_p = sk(topHead);
        const left_p = sk(leftSide);
        const right_p = sk(rightSide);
        const chin_p = chin ? sk(chin) : { x: top_p.x, y: top_p.y + 200 };
        const centerX = (left_p.x + right_p.x) / 2;
        const headW = Math.abs(right_p.x - left_p.x);
        const headH = Math.abs(chin_p.y - top_p.y);

        // Top hair cap drawn OVER face
        ctx.save();
        ctx.globalAlpha = 0.92;
        const topGrad = ctx.createLinearGradient(centerX, top_p.y - 40, centerX, top_p.y + headH * 0.25);
        topGrad.addColorStop(0, hair);
        topGrad.addColorStop(1, hair + '88');
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(left_p.x + headW * 0.05, top_p.y + headH * 0.18);
        ctx.quadraticCurveTo(left_p.x + headW * 0.1, top_p.y - headH * 0.1, centerX, top_p.y - headH * 0.12);
        ctx.quadraticCurveTo(right_p.x - headW * 0.1, top_p.y - headH * 0.1, right_p.x - headW * 0.05, top_p.y + headH * 0.18);
        ctx.quadraticCurveTo(centerX, top_p.y + headH * 0.08, left_p.x + headW * 0.05, top_p.y + headH * 0.18);
        ctx.fill();
        ctx.restore();
      }
    }

  }, [colors, applyMakeup, drawSVGAccessories, hair]);

  // Re-draw when colors change
  useEffect(() => {
    if (faceData) {
      drawComposite(faceData);
    }
  }, [colors, faceData, drawComposite]);

  // Handle image load
  const handleImageLoad = () => {
    if (model) {
      detectAndDraw();
    }
  };

  // Retry when model loads
  useEffect(() => {
    if (model && imageRef.current && imageRef.current.complete) {
      detectAndDraw();
    }
  }, [model]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 380, gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(100,149,237,0.3)', borderTop: '3px solid #c4a84a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted, #aaa)', fontSize: '0.78rem', letterSpacing: '0.08em' }}>Loading AI face scanner…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error === 'ml_failed' || error === 'detect_failed' || error === 'no_face') {
    // Fallback: draw face photo without ML makeup
    return (
      <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        <FallbackPhotoAvatar imageSrc={imageSrc} colors={colors} error={error} />
      </div>
    );
  }

  return (
    <div className="hybrid-avatar" ref={containerRef} style={{ position: 'relative' }}>
      {status && (
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: 'var(--gold, #c4a84a)', letterSpacing: '0.1em', zIndex: 2 }}>
          {status}
        </div>
      )}
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Source"
        style={{ display: 'none' }}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="hybrid-canvas"
        width={400}
        height={520}
        style={{ width: '100%', height: 'auto', borderRadius: 16 }}
      />
    </div>
  );
}

// Fallback when ML fails: show photo with CSS makeup overlays + SVG hair/earrings/clothing
function FallbackPhotoAvatar({ imageSrc, colors, error }) {
  const { hair = '#4a2010', top = '#b08de8', lipstick = '#b83055', blush = '#e87060', eyeshadow = '#7b5ea7', jewelry = '#f0d060' } = colors;

  const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(180,130,100,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--gold-light, #e8d080)', textAlign: 'center', marginBottom: 8, letterSpacing: '0.08em', opacity: 0.7 }}>
        {error === 'no_face' ? '⚠ No face detected — showing makeup preview' : '⚠ AI unavailable — CSS makeup preview'}
      </div>
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#1a1a35' }}>
        {imageSrc && <img src={imageSrc} alt="Your photo" style={{ width: '100%', display: 'block' }} />}

        {/* CSS Makeup overlays at fixed percentages */}
        {/* Eyeshadow Left */}
        <div style={{ position: 'absolute', top: '24%', left: '22%', width: '20%', height: '8%', background: `radial-gradient(ellipse, ${hexToRgba(eyeshadow, 0.65)} 0%, transparent 100%)`, filter: 'blur(4px)', mixBlendMode: 'multiply' }} />
        {/* Eyeshadow Right */}
        <div style={{ position: 'absolute', top: '24%', right: '22%', width: '20%', height: '8%', background: `radial-gradient(ellipse, ${hexToRgba(eyeshadow, 0.65)} 0%, transparent 100%)`, filter: 'blur(4px)', mixBlendMode: 'multiply' }} />
        {/* Blush Left */}
        <div style={{ position: 'absolute', top: '38%', left: '14%', width: '22%', height: '10%', background: `radial-gradient(ellipse, ${hexToRgba(blush, 0.45)} 0%, transparent 100%)`, filter: 'blur(8px)' }} />
        {/* Blush Right */}
        <div style={{ position: 'absolute', top: '38%', right: '14%', width: '22%', height: '10%', background: `radial-gradient(ellipse, ${hexToRgba(blush, 0.45)} 0%, transparent 100%)`, filter: 'blur(8px)' }} />
        {/* Lips */}
        <div style={{ position: 'absolute', top: '57%', left: '37%', width: '26%', height: '6%', background: hexToRgba(lipstick, 0.55), borderRadius: '50%', filter: 'blur(2px)', mixBlendMode: 'multiply' }} />
      </div>
    </div>
  );
}