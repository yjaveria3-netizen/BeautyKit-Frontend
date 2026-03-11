const API = 'http://localhost:5000';

export function getToken() {
  try {
    // First try localStorage
    let token = localStorage.getItem('bk_token');
    
    // If not in localStorage, try cookie
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'bk_token') {
          token = value;
          // Restore to localStorage for consistency
          localStorage.setItem('bk_token', token);
          break;
        }
      }
    }
    
    return token;
  } catch (err) {
    console.error('localStorage access failed:', err);
    return null;
  }
}

export function setToken(t, rememberMe = true) {
  try {
    if (t) {
      localStorage.setItem('bk_token', t);
      // Set cookie with appropriate expiration based on remember me
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
      document.cookie = `bk_token=${t}; max-age=${maxAge}; path=/; secure; samesite=strict`;
    } else {
      localStorage.removeItem('bk_token');
      document.cookie = 'bk_token=; max-age=0; path=/;';
    }
  } catch (err) {
    console.error('localStorage set failed:', err);
  }
}

export function removeToken() {
  try {
    localStorage.removeItem('bk_token');
    document.cookie = 'bk_token=; max-age=0; path=/;';
  } catch (err) {
    console.error('localStorage remove failed:', err);
  }
}

export async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {})
  };
  
  try {
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    const data = await res.json();
    
    if (!res.ok) {
      // If we get a 401 Unauthorized, clear the token
      if (res.status === 401) {
        removeToken();
      }
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (err) {
    // If network error or other issue, don't clear token unless it's 401
    if (err.message && err.message.includes('401')) {
      removeToken();
    }
    throw err;
  }
}

export async function uploadImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  
  try {
    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      if (res.status === 401) {
        removeToken();
      }
      throw new Error(data.error || 'Upload failed');
    }
    
    return data;
  } catch (err) {
    if (err.message && err.message.includes('401')) {
      removeToken();
    }
    throw err;
  }
}
