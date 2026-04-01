export function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', color: '#ff6b6b' };
  if (score <= 4) return { score, label: 'Fair', color: '#feca57' };
  if (score <= 5) return { score, label: 'Good', color: '#48dbfb' };
  return { score, label: 'Strong', color: '#1dd1a1' };
}
