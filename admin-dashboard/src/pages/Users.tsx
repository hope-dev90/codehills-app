import { useEffect, useState } from 'react';
import { usersApi } from '../api/endpoints';
import type { Paginated, Role, UserRow } from '../api/types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { SelectField, TextField } from '../components/TextField';
import { useAsync } from '../hooks/useAsync';
import { formatDate, formatNumber } from '../utils/format';

const PAGE_SIZE = 20;

const columns: Column<UserRow>[] = [
  { key: 'fullName', header: 'Name' },
  {
    key: 'contact',
    header: 'Contact',
    render: (row) => (
      <span className="cell-stack">
        <span>{row.contact}</span>
        <span className="cell-sub">{row.contactType}</span>
      </span>
    ),
  },
  { key: 'role', header: 'Role', render: (row) => <Badge value={row.role} /> },
  { key: 'authProvider', header: 'Provider' },
  { key: 'language', header: 'Language' },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) => <Badge value={row.isActive ? 'Active' : 'Inactive'} />,
  },
  {
    key: 'orderCount',
    header: 'Orders',
    align: 'right',
    render: (row) => formatNumber(row.orderCount),
  },
  { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
];

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  const { data, loading, error, reload } = useAsync<Paginated<UserRow>>(
    () => usersApi.list({ q: query, role, active, page, pageSize: PAGE_SIZE }),
    [query, role, active, page],
  );

  const updateUser = async (row: UserRow, body: { isActive?: boolean; role?: Role }) => {
    setBusyId(row.id);
    setActionError(null);
    try {
      await usersApi.update(row.id, body);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the user.');
    } finally {
      setBusyId(null);
    }
  };

  const renderActions = (row: UserRow) => (
    <div className="row-actions">
      <Button
        variant="secondary"
        size="sm"
        disabled={busyId === row.id}
        onClick={() => updateUser(row, { isActive: !row.isActive })}
      >
        {row.isActive ? 'Deactivate' : 'Activate'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={busyId === row.id}
        onClick={() => updateUser(row, { role: row.role === 'admin' ? 'user' : 'admin' })}
      >
        {row.role === 'admin' ? 'Make user' : 'Make admin'}
      </Button>
    </div>
  );

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="page">
      <Card>
        <div className="toolbar">
          <div className="toolbar-left">
            <TextField
              value={search}
              onChange={setSearch}
              type="search"
              placeholder="Search name or contact"
            />
            <SelectField
              value={role}
              onChange={(value) => {
                setRole(value);
                setPage(1);
              }}
              options={['', 'user', 'admin']}
            />
            <SelectField
              value={active}
              onChange={(value) => {
                setActive(value);
                setPage(1);
              }}
              options={['', 'true', 'false']}
            />
          </div>
        </div>

        {actionError ? <p className="alert alert--error">{actionError}</p> : null}

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          renderActions={renderActions}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyMessage="No users found."
        />

        {!loading && !error ? (
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        ) : null}
      </Card>
    </div>
  );
}
