type BadgeVariant = 'olive' | 'ochre' | 'danger' | 'muted';

const OLIVE = new Set(['delivered', 'paid', 'active', 'published', 'completed', 'true']);
const OCHRE = new Set(['placed', 'new', 'pending']);
const DANGER = new Set(['cancelled', 'canceled', 'failed', 'false']);

export function badgeVariant(value: string): BadgeVariant {
  const key = String(value).trim().toLowerCase();
  if (OLIVE.has(key)) return 'olive';
  if (OCHRE.has(key)) return 'ochre';
  if (DANGER.has(key)) return 'danger';
  return 'muted';
}

export function Badge({ value }: { value: string }) {
  const variant = badgeVariant(value);
  return <span className={`badge badge--${variant}`}>{value}</span>;
}
