import type { ReactNode } from 'react';

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="spinner-wrap">
      <span className="spinner" aria-hidden="true" />
      {label ? <span className="spinner-label">{label}</span> : null}
    </span>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="full-page-center">
      <Spinner label={label} />
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="state-block">
      <p className="state-message">{message}</p>
      {action ? <div className="state-action">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-block state-block--error">
      <p className="state-message">{message}</p>
      {onRetry ? (
        <div className="state-action">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
