import crypto from 'node:crypto';

export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

// Opaque, high-entropy refresh token. Only its SHA-256 hash is stored.
export const generateOpaqueToken = (bytes = 48) => crypto.randomBytes(bytes).toString('base64url');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Detects email vs phone and normalizes. Returns { contact, contactType } or null. */
export function normalizeContact(raw) {
  const value = String(raw ?? '').trim();
  if (EMAIL_RE.test(value)) return { contact: value.toLowerCase(), contactType: 'email' };
  const digits = value.replace(/[\s().-]/g, '');
  if (/^\+?\d{9,15}$/.test(digits)) {
    let n = digits;
    if (n.startsWith('00')) n = '+' + n.slice(2);
    else if (/^07\d{8}$/.test(n)) n = '+250' + n.slice(1); // Rwanda local format
    else if (/^250\d{9}$/.test(n)) n = '+' + n;
    else if (!n.startsWith('+')) n = '+' + n;
    return { contact: n, contactType: 'phone' };
  }
  return null;
}
