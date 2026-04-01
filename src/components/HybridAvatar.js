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

  // Initialize TensorFlow
  useEffect(() => {
    const initModel = async () => {
      try {
        await tf.setBackend('webgl');
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
      } catch (err) {
        console.error('Failed to load face detection model:', err);
        setError('Failed to load ML model');
        setIsLoading(false);
      }
    };
    initModel();
  }, []);

  // Detect face and draw
  const detectAndDraw = useCallback(async () => {
    if (!model || !imageRef.current || !canvasRef.current) return;

    try {
      const faces = await model.estimateFaces(imageRef.current);
      
      if (faces.length > 0) {
        const face = faces[0];
        setFaceData(face);
        drawHybridAvatar(face);
        onFaceDetected && onFaceDetected(face);
      } else {
        setError('No face detected');
      }
    } catch (err) {
      console.error('Face detection error:', err);
      setError('Face detection failed');
    }
  }, [model, colors, onFaceDetected]);

  // Draw hybrid avatar - real face + SVG body
  const drawHybridAvatar = useCallback((face) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas size (SVG viewBox is 400x520)
    canvas.width = 400;
    canvas.height = 520;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get face bounding box
    const box = face.box;
    const faceWidth = box.xMax - box.xMin;
    const faceHeight = box.yMax - box.yMin;

    // Calculate scale to fit face into avatar face area (roughly 160x184)
    const targetFaceWidth = 160;
    const targetFaceHeight = 184;
    const scale = Math.min(targetFaceWidth / faceWidth, targetFaceHeight / faceHeight);

    // Calculate position to center face in avatar face area
    // Avatar face center is at (200, 200)
    const faceCenterX = (box.xMin + box.xMax) / 2;
    const faceCenterY = (box.yMin + box.yMax) / 2;

    // Draw background glow
    const bgGradient = ctx.createRadialGradient(200, 300, 0, 200, 300, 260);
    bgGradient.addColorStop(0, 'rgba(124, 92, 191, 0.35)');
    bgGradient.addColorStop(1, 'rgba(6, 6, 14, 0)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.ellipse(200, 300, 200, 260, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw hair (back layer) - behind face
    drawHairBack(ctx, hair);

    // Draw the real face (clipped to face shape)
    ctx.save();
    
    // Create face shape clip
    ctx.beginPath();
    ctx.ellipse(200, 200, 80, 92, 0, 0, Math.PI * 2);
    ctx.clip();

    // Draw the face image
    const drawWidth = faceWidth * scale * 1.2;
    const drawHeight = faceHeight * scale * 1.2;
    const drawX = 200 - (faceCenterX - box.xMin) * scale * 1.2 - drawWidth / 2 + (faceCenterX - img.naturalWidth / 2) * scale * 1.2;
    const drawY = 200 - (faceCenterY - box.yMin) * scale * 1.2 - drawHeight / 2 + (faceCenterY - img.naturalHeight / 2) * scale * 1.2;

    ctx.drawImage(img, 
      box.xMin - faceWidth * 0.1, box.yMin - faceHeight * 0.1, 
      faceWidth * 1.2, faceHeight * 1.2,
      200 - drawWidth / 2, 200 - drawHeight / 2 + 10,
      drawWidth, drawHeight
    );

    // Apply makeup overlays on top of real face
    applyMakeup(ctx, face, scale, eyeshadow, blush, lipstick);

    ctx.restore();

    // Draw face shadow/outline
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.filter = 'blur(8px)';
    ctx.beginPath();
    ctx.ellipse(200, 208, 74, 82, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw hair (front/top layer)
    drawHairFront(ctx, hair);

    // Draw dress
    drawDress(ctx, top);

    // Draw necklace
    drawNecklace(ctx, jewelry);

    // Draw earrings
    drawEarrings(ctx, jewelry);

  }, [colors]);

  // Apply makeup on real face
  const applyMakeup = (ctx, face, scale, eyeshadowColor, blushColor, lipstickColor) => {
    const keypoints = face.keypoints;
    
    // Scale keypoints to canvas
    const box = face.box;
    const faceWidth = box.xMax - box.xMin;
    const faceHeight = box.yMax - box.yMin;
    const targetFaceWidth = 160;
    const targetFaceHeight = 184;
    const s = Math.min(targetFaceWidth / faceWidth, targetFaceHeight / faceHeight);

    const scalePoint = (kp) => {
      const offsetX = 200 - (faceWidth * s) / 2;
      const offsetY = 200 - (faceHeight * s) / 2 + 10;
      return {
        x: (kp.x - box.xMin) * s + offsetX,
        y: (kp.y - box.yMin) * s + offsetY
      };
    };

    // Apply eyeshadow
    if (eyeshadowColor) {
      const leftEye = [33, 246, 161, 160, 159, 158, 157, 173].map(i => scalePoint(keypoints[i])).filter(Boolean);
      const rightEye = [362, 398, 384, 385, 386, 387, 388, 466].map(i => scalePoint(keypoints[i])).filter(Boolean);
      
      ctx.save();
      ctx.fillStyle = hexToRgba(eyeshadowColor, 0.7);
      ctx.filter = 'blur(4px)';
      
      if (leftEye.length > 3) {
        ctx.beginPath();
        ctx.moveTo(leftEye[0].x, leftEye[0].y - 15);
        leftEye.forEach(p => ctx.lineTo(p.x, p.y - 15));
        ctx.closePath();
        ctx.fill();
      }
      
      if (rightEye.length > 3) {
        ctx.beginPath();
        ctx.moveTo(rightEye[0].x, rightEye[0].y - 15);
        rightEye.forEach(p => ctx.lineTo(p.x, p.y - 15));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Apply blush
    if (blushColor) {
      const leftCheek = scalePoint(keypoints[205] || keypoints[50]);
      const rightCheek = scalePoint(keypoints[425] || keypoints[280]);
      
      ctx.save();
      const gradient = ctx.createRadialGradient(leftCheek.x, leftCheek.y, 0, leftCheek.x, leftCheek.y, 35);
      gradient.addColorStop(0, hexToRgba(blushColor, 0.6));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.filter = 'blur(10px)';
      ctx.beginPath();
      ctx.arc(leftCheek.x, leftCheek.y, 35, 0, Math.PI * 2);
      ctx.fill();

      const gradient2 = ctx.createRadialGradient(rightCheek.x, rightCheek.y, 0, rightCheek.x, rightCheek.y, 35);
      gradient2.addColorStop(0, hexToRgba(blushColor, 0.6));
      gradient2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient2;
      ctx.beginPath();
      ctx.arc(rightCheek.x, rightCheek.y, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Apply lipstick
    if (lipstickColor) {
      const upperLip = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409].map(i => scalePoint(keypoints[i])).filter(Boolean);
      const lowerLip = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375].map(i => scalePoint(keypoints[i])).filter(Boolean);
      
      ctx.save();
      ctx.fillStyle = hexToRgba(lipstickColor, 0.6);
      ctx.filter = 'blur(2px)';
      
      if (upperLip.length > 3) {
        ctx.beginPath();
        ctx.moveTo(upperLip[0].x, upperLip[0].y);
        upperLip.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
      }
      
      if (lowerLip.length > 3) {
        ctx.beginPath();
        ctx.moveTo(lowerLip[0].x, lowerLip[0].y);
        lowerLip.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // Draw hair back layer
  const drawHairBack = (ctx, color) => {
    const grad = ctx.createLinearGradient(0, 0, 400, 520);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '99');
    ctx.fillStyle = grad;

    // Main back hair
    ctx.beginPath();
    ctx.moveTo(118, 155);
    ctx.quadraticCurveTo(110, 180, 105, 220);
    ctx.quadraticCurveTo(98, 270, 95, 320);
    ctx.quadraticCurveTo(90, 380, 92, 440);
    ctx.quadraticCurveTo(94, 480, 98, 520);
    ctx.lineTo(302, 520);
    ctx.quadraticCurveTo(306, 480, 308, 440);
    ctx.quadraticCurveTo(310, 380, 305, 320);
    ctx.quadraticCurveTo(302, 270, 295, 220);
    ctx.quadraticCurveTo(290, 180, 282, 155);
    ctx.quadraticCurveTo(260, 130, 200, 125);
    ctx.quadraticCurveTo(140, 130, 118, 155);
    ctx.fill();

    // Left side hair
    ctx.beginPath();
    ctx.moveTo(118, 155);
    ctx.quadraticCurveTo(100, 190, 90, 240);
    ctx.quadraticCurveTo(80, 300, 78, 360);
    ctx.quadraticCurveTo(76, 420, 80, 520);
    ctx.lineTo(108, 520);
    ctx.quadraticCurveTo(100, 440, 102, 380);
    ctx.quadraticCurveTo(104, 320, 108, 270);
    ctx.quadraticCurveTo(112, 220, 118, 180);
    ctx.fill();

    // Right side hair
    ctx.beginPath();
    ctx.moveTo(282, 155);
    ctx.quadraticCurveTo(300, 190, 310, 240);
    ctx.quadraticCurveTo(320, 300, 322, 360);
    ctx.quadraticCurveTo(324, 420, 320, 520);
    ctx.lineTo(292, 520);
    ctx.quadraticCurveTo(300, 440, 298, 380);
    ctx.quadraticCurveTo(296, 320, 292, 270);
    ctx.quadraticCurveTo(288, 220, 282, 180);
    ctx.fill();
  };

  // Draw hair front/top
  const drawHairFront = (ctx, color) => {
    const grad = ctx.createLinearGradient(0, 0, 400, 200);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '99');
    ctx.fillStyle = grad;

    // Top of head
    ctx.beginPath();
    ctx.ellipse(200, 148, 84, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hairline swoosh
    ctx.beginPath();
    ctx.moveTo(126, 165);
    ctx.quadraticCurveTo(148, 108, 200, 102);
    ctx.quadraticCurveTo(252, 108, 274, 165);
    ctx.quadraticCurveTo(258, 140, 238, 133);
    ctx.quadraticCurveTo(220, 127, 200, 126);
    ctx.quadraticCurveTo(180, 127, 162, 133);
    ctx.quadraticCurveTo(142, 140, 126, 165);
    ctx.fill();
  };

  // Draw dress
  const drawDress = (ctx, color) => {
    const grad = ctx.createRadialGradient(200, 200, 0, 200, 400, 300);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + 'bb');
    ctx.fillStyle = grad;
    ctx.filter = 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))';

    ctx.beginPath();
    ctx.moveTo(120, 320);
    ctx.quadraticCurveTo(110, 360, 90, 400);
    ctx.quadraticCurveTo(70, 450, 60, 520);
    ctx.lineTo(340, 520);
    ctx.quadraticCurveTo(330, 450, 310, 400);
    ctx.quadraticCurveTo(290, 360, 280, 320);
    ctx.quadraticCurveTo(260, 310, 200, 308);
    ctx.quadraticCurveTo(140, 310, 120, 320);
    ctx.fill();
    ctx.filter = 'none';
  };

  // Draw necklace
  const drawNecklace = (ctx, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(170, 308);
    ctx.quadraticCurveTo(185, 320, 200, 324);
    ctx.quadraticCurveTo(215, 320, 230, 308);
    ctx.stroke();

    // Pendant
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(200, 326, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f8e8a0';
    ctx.beginPath();
    ctx.arc(200, 326, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Small gems
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(178, 312, 2.5, 0, Math.PI * 2);
    ctx.arc(222, 312, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw earrings
  const drawEarrings = (ctx, color) => {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Left earring
    ctx.beginPath();
    ctx.arc(122, 220, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(122, 227);
    ctx.lineTo(122, 242);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(122, 246, 5, 0, Math.PI * 2);
    ctx.fill();

    // Right earring
    ctx.beginPath();
    ctx.arc(278, 220, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(278, 227);
    ctx.lineTo(278, 242);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(278, 246, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  };

  // Helper: Convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(200, 100, 100, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Redraw when colors change
  useEffect(() => {
    if (faceData) {
      drawHybridAvatar(faceData);
    }
  }, [colors, faceData, drawHybridAvatar]);

  // Handle image load
  const handleImageLoad = () => {
    if (model) {
      detectAndDraw();
    }
  };

  if (isLoading) {
    return (
      <div className="hybrid-avatar loading">
        <div className="loading-spinner"></div>
        <p>Loading AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hybrid-avatar error">
        <p>Using avatar mode</p>
      </div>
    );
  }

  return (
    <div className="hybrid-avatar" ref={containerRef}>
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
      />
    </div>
  );
}
