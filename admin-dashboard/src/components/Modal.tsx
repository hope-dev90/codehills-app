import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'center' | 'drawer';
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  variant = 'center',
}: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`modal-overlay modal-overlay--${variant}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-panel modal-panel--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
