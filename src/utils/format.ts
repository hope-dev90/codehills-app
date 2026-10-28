/** Formats an amount in Rwandan francs, e.g. 12000 -> "RWF 12,000". */
export function formatRwf(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `RWF ${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function firstName(fullName?: string | null): string {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
