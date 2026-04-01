import React from 'react';
import Ambient from '../components/Ambient';

export default function AnalyzingPage({ capturedImage }) {
  return (
    <div className="app">
      <Ambient />
      <div className="analyzing-page">
        {capturedImage && (
          <div className="scan-preview-wrap">
            <img src={capturedImage} alt="Scanning" className="scan-preview" />
            <div className="scan-line-wrap">
              <div className="scan-line" />
            </div>
          </div>
        )}
        <div className="spinner" />
        <h2 className="analyzing-title">Analyzing Your Skin</h2>
        <p className="analyzing-sub">Detecting undertones · Measuring depth · Building your palette</p>
        <div className="dots"><span /><span /><span /></div>
      </div>
    </div>
  );
}
