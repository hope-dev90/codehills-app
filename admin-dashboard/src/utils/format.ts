export function formatRwf(value: number | null | undefined): string {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `${new Intl.NumberFormat('en-US').format(numeric)} RWF`;
}

export function formatNumber(value: number | null | undefined): string {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-US').format(numeric);
}

function toDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string): string {
  const date = toDate(value);
  if (!date) return value || '';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  const date = toDate(value);
  if (!date) return value || '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function titleCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
