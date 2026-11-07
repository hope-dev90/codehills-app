import type { ReactNode } from 'react';

export interface CardProps {
  title?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, actions, className = '', children }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {title || actions ? (
        <header className="card-header">
          {title ? <h2 className="card-title">{title}</h2> : <span />}
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="card-body">{children}</div>
    </section>
  );
}
