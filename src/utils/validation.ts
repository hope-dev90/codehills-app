const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{8,15}$/;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
export const isPhone = (v: string) => PHONE_RE.test(v.trim());

export function validateContact(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Enter your email or phone number';
  if (!isEmail(v) && !isPhone(v)) return 'Enter a valid email or phone number';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Enter your password';
  if (value.length < 6) return 'Use at least 6 characters';
  return undefined;
}

export function validateRequired(value: string, label: string, min = 1): string | undefined {
  const v = value.trim();
  if (!v) return `Enter ${label}`;
  if (v.length < min) return `${label[0].toUpperCase()}${label.slice(1)} is too short`;
  return undefined;
}

export function validatePositiveNumber(value: string, label: string): string | undefined {
  const n = Number(value.replace(/[,\s]/g, ''));
  if (!value.trim()) return `Enter ${label}`;
  if (!Number.isFinite(n) || n <= 0) return `Enter a valid ${label}`;
  return undefined;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export const hasErrors = (errors: Record<string, string | undefined>) =>
  Object.values(errors).some(Boolean);
