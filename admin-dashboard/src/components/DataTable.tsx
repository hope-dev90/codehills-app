import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
import { EmptyState, ErrorState, Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  renderActions?: (row: T) => ReactNode;
  renderExpanded?: (row: T) => ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  renderActions,
  renderExpanded,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const columnCount = columns.length + (renderActions ? 1 : 0) + (renderExpanded ? 1 : 0);

  const toggle = (id: string) => {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {renderExpanded ? <th className="col-expander" aria-label="Expand" /> : null}
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.align ? { textAlign: column.align } : undefined}
              >
                {column.header}
              </th>
            ))}
            {renderActions ? <th className="col-actions">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="table-message" colSpan={columnCount}>
                <Spinner label="Loading" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td className="table-message" colSpan={columnCount}>
                <ErrorState message={error} onRetry={onRetry} />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="table-message" colSpan={columnCount}>
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = rowKey(row);
              const isOpen = Boolean(expanded[id]);
              return (
                <Fragment key={id}>
                  <tr>
                    {renderExpanded ? (
                      <td className="col-expander">
                        <button
                          type="button"
                          className="expander-btn"
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                          onClick={() => toggle(id)}
                        >
                          {isOpen ? '\u2212' : '+'}
                        </button>
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        style={column.align ? { textAlign: column.align } : undefined}
                      >
                        {column.render
                          ? column.render(row)
                          : formatCell((row as Record<string, unknown>)[column.key])}
                      </td>
                    ))}
                    {renderActions ? <td className="col-actions">{renderActions(row)}</td> : null}
                  </tr>
                  {renderExpanded && isOpen ? (
                    <tr className="expanded-row">
                      <td colSpan={columnCount}>{renderExpanded(row)}</td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
