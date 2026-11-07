import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { collectionsApi } from '../../api/endpoints';
import type { Paginated } from '../../api/types';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { CheckboxField, SelectField, TextField } from '../../components/TextField';

export type FieldType = 'text' | 'number' | 'textarea' | 'stringlist' | 'boolean' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  nullable?: boolean;
  hint?: string;
}

export interface CollectionConfig<T> {
  /** Path segment, e.g. "stories". */
  collection: string;
  /** Singular human label, e.g. "Story". */
  itemLabel: string;
  columns: Column<T>[];
  fields: FieldDef[];
  /** When set, rows expose a publish/active toggle that PATCHes this boolean field. */
  publishKey?: 'isPublished' | 'isActive';
  publishLabels?: { on: string; off: string };
}

const PAGE_SIZE = 20;

function defaultFor(field: FieldDef): unknown {
  switch (field.type) {
    case 'number':
      return '';
    case 'boolean':
      return false;
    case 'select':
      return field.options && field.options.length > 0 ? field.options[0] : '';
    default:
      return '';
  }
}

function emptyDraft(fields: FieldDef[]): Record<string, unknown> {
  const draft: Record<string, unknown> = {};
  for (const field of fields) draft[field.key] = defaultFor(field);
  return draft;
}

function rowToDraft<T>(fields: FieldDef[], row: T): Record<string, unknown> {
  const source = row as Record<string, unknown>;
  const draft: Record<string, unknown> = {};
  for (const field of fields) {
    const value = source[field.key];
    if (field.type === 'stringlist') {
      draft[field.key] = Array.isArray(value) ? value.join('\n') : '';
    } else if (field.type === 'boolean') {
      draft[field.key] = Boolean(value);
    } else if (field.type === 'number') {
      draft[field.key] = typeof value === 'number' ? value : value == null ? '' : String(value);
    } else {
      draft[field.key] = value == null ? '' : String(value);
    }
  }
  return draft;
}

function buildPayload(fields: FieldDef[], draft: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = draft[field.key];
    switch (field.type) {
      case 'number': {
        if (raw === '' || raw === null || raw === undefined) {
          payload[field.key] = field.nullable ? null : 0;
        } else {
          const parsed = Number(raw);
          payload[field.key] = Number.isNaN(parsed) ? (field.nullable ? null : 0) : parsed;
        }
        break;
      }
      case 'boolean': {
        payload[field.key] = Boolean(raw);
        break;
      }
      case 'stringlist': {
        payload[field.key] = String(raw ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        break;
      }
      default: {
        const text = String(raw ?? '');
        payload[field.key] = field.nullable && text.trim() === '' ? null : text;
      }
    }
  }
  return payload;
}

export function CollectionPage<T extends { id: string }>({
  config,
}: {
  config: CollectionConfig<T>;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [published, setPublished] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  const supportsPublished = Boolean(config.publishKey);

  const { data, loading, error, reload } = useAsync<Paginated<T>>(
    () =>
      collectionsApi.list<T>(config.collection, {
        q: query,
        page,
        pageSize: PAGE_SIZE,
        published: supportsPublished && published !== '' ? published : undefined,
      }),
    [config.collection, query, page, published, supportsPublished],
  );

  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const isCreating = draft !== null && editingId === null;
  const isEditing = draft !== null && editingId !== null;
  const drawerOpen = draft !== null;

  const closeDrawer = useCallback(() => {
    setDraft(null);
    setEditingId(null);
    setFormError(null);
  }, []);

  const openCreate = () => {
    setDraft(emptyDraft(config.fields));
    setEditingId(null);
    setFormError(null);
  };

  const openEdit = (row: T) => {
    setDraft(rowToDraft(config.fields, row));
    setEditingId(row.id);
    setFormError(null);
  };

  const setField = (key: string, value: unknown) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload = buildPayload(config.fields, draft);
      if (editingId) {
        await collectionsApi.update(config.collection, editingId, payload);
      } else {
        await collectionsApi.create(config.collection, payload);
      }
      closeDrawer();
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    setRowError(null);
    try {
      await collectionsApi.remove(config.collection, deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Could not delete the item.');
    } finally {
      setDeletingBusy(false);
    }
  };

  const togglePublish = async (row: T) => {
    if (!config.publishKey) return;
    const source = row as Record<string, unknown>;
    setBusyId(row.id);
    setRowError(null);
    try {
      await collectionsApi.update(config.collection, row.id, {
        [config.publishKey]: !source[config.publishKey],
      });
      reload();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Could not update the item.');
    } finally {
      setBusyId(null);
    }
  };

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const renderRowActions = (row: T): ReactNode => {
    const source = row as Record<string, unknown>;
    const publishedValue = Boolean(source[config.publishKey ?? '']);
    const labels = config.publishLabels ?? { on: 'Published', off: 'Draft' };
    return (
      <div className="row-actions">
        <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
          Edit
        </Button>
        {config.publishKey ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={busyId === row.id}
            onClick={() => togglePublish(row)}
          >
            {publishedValue ? labels.on : labels.off}
          </Button>
        ) : null}
        <Button variant="danger" size="sm" onClick={() => setDeleting(row)}>
          Delete
        </Button>
      </div>
    );
  };

  return (
    <div className="page">
      <Card>
        <div className="toolbar">
          <div className="toolbar-left">
            <TextField
              value={search}
              onChange={setSearch}
              type="search"
              placeholder={`Search ${config.collection}`}
            />
            {supportsPublished ? (
              <SelectField
                value={published}
                onChange={(value) => {
                  setPublished(value);
                  setPage(1);
                }}
                options={['', 'true', 'false']}
              />
            ) : null}
          </div>
          <Button onClick={openCreate}>New {config.itemLabel}</Button>
        </div>

        {rowError ? <p className="alert alert--error">{rowError}</p> : null}

        <DataTable
          columns={config.columns}
          rows={rows}
          rowKey={(row) => row.id}
          renderActions={renderRowActions}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyMessage={`No ${config.collection} found.`}
        />

        {!loading && !error ? (
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        ) : null}
      </Card>

      <Modal
        open={drawerOpen}
        variant="drawer"
        title={
          isCreating
            ? `New ${config.itemLabel}`
            : isEditing
              ? `Edit ${config.itemLabel}`
              : config.itemLabel
        }
        onClose={closeDrawer}
        footer={
          <div className="modal-footer-actions">
            <Button variant="secondary" onClick={closeDrawer} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        {formError ? <p className="alert alert--error">{formError}</p> : null}
        {draft
          ? config.fields.map((field) => {
              const value = draft[field.key];
              if (field.type === 'boolean') {
                return (
                  <CheckboxField
                    key={field.key}
                    label={field.label}
                    checked={Boolean(value)}
                    onChange={(checked) => setField(field.key, checked)}
                  />
                );
              }
              if (field.type === 'select') {
                return (
                  <SelectField
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    options={field.options ?? []}
                    value={String(value ?? '')}
                    onChange={(next) => setField(field.key, next)}
                  />
                );
              }
              if (field.type === 'textarea' || field.type === 'stringlist') {
                return (
                  <TextField
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    multiline
                    rows={field.type === 'stringlist' ? 5 : 4}
                    value={String(value ?? '')}
                    onChange={(next) => setField(field.key, next)}
                  />
                );
              }
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={String(value ?? '')}
                  onChange={(next) => setField(field.key, next)}
                />
              );
            })
          : null}
      </Modal>

      <Modal
        open={deleting !== null}
        title={`Delete ${config.itemLabel}`}
        onClose={() => setDeleting(null)}
        footer={
          <div className="modal-footer-actions">
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={deletingBusy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deletingBusy}>
              {deletingBusy ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="confirm-text">
          Are you sure you want to delete this {config.itemLabel.toLowerCase()}? This action cannot
          be undone.
        </p>
      </Modal>
    </div>
  );
}
