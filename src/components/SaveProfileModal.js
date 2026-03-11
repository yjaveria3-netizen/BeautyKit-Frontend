import React, { useState } from 'react';
import { apiFetch, uploadImage } from '../utils/api';

export default function SaveProfileModal({ onClose, results, capturedImage, loadProfiles }) {
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  async function saveProfile() {
    if (!profileName.trim()) return;
    setSavingProfile(true);
    try {
      let avatarUrl = null;
      
      // Upload image if it exists and is a data URL
      if (capturedImage && capturedImage.startsWith('data:')) {
        // Convert data URL to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        
        // Upload the image
        const uploadResult = await uploadImage(file);
        avatarUrl = uploadResult.imageUrl;
      } else if (capturedImage && !capturedImage.startsWith('data:')) {
        // If it's already a URL, use it as is
        avatarUrl = capturedImage;
      }
      
      await apiFetch('/api/profiles', {
        method: 'POST',
        body: JSON.stringify({
          profileName: profileName.trim(),
          skinTone: results.skinTone,
          recommendations: results.recommendations,
          avatar: avatarUrl
        })
      });
      await loadProfiles();
      onClose();
      setProfileName('');
    } catch (err) {
      alert(err.message);
    }
    setSavingProfile(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Save This Profile</h3>
        <p className="modal-sub">Give this beauty profile a name to save it to your account.</p>
        <input className="modal-input" type="text" placeholder="e.g. Summer Look, Wedding Day..." value={profileName} onChange={e => setProfileName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveProfile()} autoFocus />
        <div className="modal-btns">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </div>
    </div>
  );
}
