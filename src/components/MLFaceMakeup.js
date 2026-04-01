import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Emoji components for hair, clothes, and accessories
const HAIR_EMOJIS = {
  blonde: '👱‍♀️',
  brown: '👩',
  black: '👩🏻',
  red: '👩‍🦰',
  gray: '👩‍🦳',
  default: '👩'
};

const CLOTHES_EMOJIS = ['👗', '👚', '👕', '🧥', '👘', '🥻'];
const EARRING_EMOJIS = ['💎', '✨', '🌟', '💫', '⭐'];

export default function MLFaceMakeup({ 
  imageSrc, 
  lipstick = '#C45C75',
  blush = '#E88070',
  eyeshadow = '#8B7355',
  hair = '#3B1F0A',
  top = '#9b7fe8',
  jewelry = '#FFD700',
  onFaceDetected
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceBounds, setFaceBounds] = useState(null);

  // Initialize TensorFlow and load model
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

  // Detect faces when image loads
  const detectFaces = useCallback(async () => {
    if (!model || !imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const faces = await model.estimateFaces(imageRef.current);
      
      if (faces.length > 0) {
        const face = faces[0];
        setFaceData(face);
        
        // Calculate face bounds for cropping
        const box = face.box;
        setFaceBounds(box);
        
        drawMakeup(face, box);
        onFaceDetected && onFaceDetected(face);
      } else {
        setError('No face detected in photo');
      }
    } catch (err) {
      console.error('Face detection error:', err);
      setError('Face detection failed');
    }
    setIsProcessing(false);
  }, [model, lipstick, blush, eyeshadow, hair, onFaceDetected]);

  // Draw makeup on canvas
  const drawMakeup = useCallback((face, box) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Calculate crop region - focus on face with some padding
    const padding = Math.min(box.width, box.height) * 0.3;
    const cropX = Math.max(0, box.xMin - padding);
    const cropY = Math.max(0, box.yMin - padding * 0.5);
    const cropWidth = Math.min(img.naturalWidth - cropX, box.width + padding * 2);
    const cropHeight = Math.min(img.naturalHeight - cropY, box.height + padding * 1.5);

    // Set canvas size to square crop of face
    const size = Math.max(cropWidth, cropHeight);
    canvas.width = 400;
    canvas.height = 500;

    // Clear canvas
    ctx.fillStyle = '#1a1a35';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cropped face
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, canvas.width, canvas.height
    );

    if (!face?.keypoints) return;

    // Scale keypoints to canvas coordinates
    const scaleX = canvas.width / cropWidth;
    const scaleY = canvas.height / cropHeight;
    const offsetX = -cropX * scaleX;
    const offsetY = -cropY * scaleY;

    const scaledKeypoints = face.keypoints.map(kp => ({
      ...kp,
      x: kp.x * scaleX + offsetX,
      y: kp.y * scaleY + offsetY
    }));

    // Apply makeup with stronger opacity
    applyEyeshadow(ctx, scaledKeypoints, eyeshadow);
    applyBlush(ctx, scaledKeypoints, blush);
    applyLipstick(ctx, scaledKeypoints, lipstick);

    // Draw emoji accessories
    drawEmojiAccessories(ctx, scaledKeypoints, canvas.width, canvas.height);

  }, [lipstick, blush, eyeshadow, hair, top, jewelry]);

  // Apply eyeshadow based on eye landmarks - MORE VISIBLE
  const applyEyeshadow = (ctx, keypoints, color) => {
    if (!color) return;

    // Upper eyelid indices (for shadow placement)
    const leftUpperLid = [33, 246, 161, 160, 159, 158, 157, 173];
    const rightUpperLid = [362, 398, 384, 385, 386, 387, 388, 466];

    const rgba = hexToRgba(color, 0.85);

    // Draw left eyeshadow with stronger effect
    drawEyeshadowRegion(ctx, keypoints, leftUpperLid, rgba, -20);
    
    // Draw right eyeshadow with stronger effect
    drawEyeshadowRegion(ctx, keypoints, rightUpperLid, rgba, -20);
  };

  // Draw eyeshadow region - STRONGER
  const drawEyeshadowRegion = (ctx, keypoints, indices, color, offsetY) => {
    const points = indices.map(i => keypoints[i]).filter(Boolean);
    if (points.length < 3) return;

    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = color;
    ctx.filter = 'blur(5px)';

    // Draw main shadow area
    ctx.beginPath();
    const first = points[0];
    ctx.moveTo(first.x, first.y + offsetY);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y + offsetY);
    }
    ctx.closePath();
    ctx.fill();

    // Draw second layer for intensity
    ctx.globalAlpha = 0.5;
    ctx.filter = 'blur(10px)';
    ctx.beginPath();
    ctx.moveTo(first.x, first.y + offsetY - 10);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y + offsetY - 10);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Apply blush on cheeks - MORE VISIBLE
  const applyBlush = (ctx, keypoints, color) => {
    if (!color) return;

    // Cheek landmark indices
    const leftCheek = [123, 50, 205, 206, 177, 147];
    const rightCheek = [352, 280, 425, 426, 401, 376];

    const rgba = hexToRgba(color, 0.7);

    // Draw twice for stronger effect
    drawBlushRegion(ctx, keypoints, leftCheek, rgba, 1.2);
    drawBlushRegion(ctx, keypoints, leftCheek, rgba, 0.8);
    
    drawBlushRegion(ctx, keypoints, rightCheek, rgba, 1.2);
    drawBlushRegion(ctx, keypoints, rightCheek, rgba, 0.8);
  };

  // Draw blush region - STRONGER
  const drawBlushRegion = (ctx, keypoints, indices, color, radiusMultiplier = 1) => {
    const points = indices.map(i => keypoints[i]).filter(Boolean);
    if (points.length < 3) return;

    // Calculate center and radius
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const radius = Math.max(
      ...points.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2))
    ) * 1.8 * radiusMultiplier;

    ctx.save();
    ctx.globalAlpha = 0.7;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, color.replace(/[\d.]+\)$/, '0.3)'));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.filter = 'blur(12px)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Apply lipstick
  const applyLipstick = (ctx, keypoints, color) => {
    if (!color) return;

    // Lip landmark indices
    const upperLip = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409];
    const lowerLip = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375];

    const rgba = hexToRgba(color, 0.7);

    drawLipRegion(ctx, keypoints, upperLip, rgba);
    drawLipRegion(ctx, keypoints, lowerLip, rgba);
  };

  // Draw lip region
  const drawLipRegion = (ctx, keypoints, indices, color) => {
    const points = indices.map(i => keypoints[i]).filter(Boolean);
    if (points.length < 3) return;

    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = color;
    ctx.filter = 'blur(3px)';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Draw emoji accessories (hair, clothes, earrings)
  const drawEmojiAccessories = (ctx, keypoints, width, height) => {
    // Get key facial points
    const topOfHead = keypoints[10];
    const leftEar = keypoints[234];
    const rightEar = keypoints[454];
    const chin = keypoints[152];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];

    if (!topOfHead || !chin) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw Hair Emoji at top
    const hairEmoji = HAIR_EMOJIS.default;
    const hairSize = Math.min(width, height) * 0.35;
    ctx.font = `${hairSize}px serif`;
    ctx.fillText(hairEmoji, width / 2, topOfHead.y - hairSize * 0.3);

    // Draw Clothes Emoji at bottom
    const clothesEmoji = CLOTHES_EMOJIS[0];
    const clothesSize = Math.min(width, height) * 0.4;
    ctx.font = `${clothesSize}px serif`;
    ctx.fillText(clothesEmoji, width / 2, chin.y + clothesSize * 0.6);

    // Draw Earring Emojis
    const earringEmoji = EARRING_EMOJIS[0];
    const earringSize = Math.min(width, height) * 0.12;
    ctx.font = `${earringSize}px serif`;
    
    if (leftEar) {
      ctx.fillText(earringEmoji, leftEar.x - earringSize * 0.5, leftEar.y + earringSize * 0.5);
    }
    if (rightEar) {
      ctx.fillText(earringEmoji, rightEar.x + earringSize * 0.5, rightEar.y + earringSize * 0.5);
    }

    ctx.restore();
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
    if (faceData && faceBounds) {
      drawMakeup(faceData, faceBounds);
    }
  }, [lipstick, blush, eyeshadow, hair, top, jewelry, faceData, faceBounds, drawMakeup]);

  // Handle image load
  const handleImageLoad = () => {
    if (model) {
      detectFaces();
    }
  };

  if (isLoading) {
    return (
      <div className="ml-face-makeup loading">
        <div className="loading-spinner"></div>
        <p>Loading AI model...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-face-makeup error">
        <p>{error}</p>
        <p>Using fallback mode...</p>
      </div>
    );
  }

  return (
    <div className="ml-face-makeup" ref={containerRef}>
      <div className="face-canvas-container">
        {/* Hidden image for processing */}
        <img 
          ref={imageRef}
          src={imageSrc}
          alt="Source"
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
        
        {/* Canvas with makeup applied */}
        <canvas 
          ref={canvasRef}
          className="face-canvas"
        />
        
        {isProcessing && (
          <div className="processing-overlay">
            <div className="loading-spinner"></div>
            <p>Analyzing face...</p>
          </div>
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
