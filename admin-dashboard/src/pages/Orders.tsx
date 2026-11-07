import { useEffect, useState } from 'react';
import { ordersApi } from '../api/endpoints';
import type { OrderRow, OrderStatus, Paginated, PaymentStatus } from '../api/types';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../api/types';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { TextField } from '../components/TextField';
import { useAsync } from '../hooks/useAsync';
import { formatDateTime, formatNumber, formatRwf, titleCase } from '../utils/format';

const PAGE_SIZE = 20;

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}...` : id;
}

export default function Orders() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  const { data, loading, error, reload } = useAsync<Paginated<OrderRow>>(
    () => ordersApi.list({ status, q: query, page, pageSize: PAGE_SIZE }),
    [status, query, page],
  );

  const changeField = async (
    row: OrderRow,
    body: { status?: OrderStatus; paymentStatus?: PaymentStatus },
  ) => {
    setBusyId(row.id);
    setActionError(null);
    try {
      await ordersApi.update(row.id, body);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the order.');
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<OrderRow>[] = [
    { key: 'id', header: 'Order', render: (row) => <span className="mono">{shortId(row.id)}</span> },
    { key: 'createdAt', header: 'Placed', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'customerName',
      header: 'Customer',
      render: (row) => (
        <span className="cell-stack">
          <span>{row.customerName}</span>
          <span className="cell-sub">{row.customerContact}</span>
        </span>
      ),
    },
    { key: 'deliveryCity', header: 'City' },
    {
      key: 'itemCount',
      header: 'Items',
      align: 'right',
      render: (row) => formatNumber(row.itemCount),
    },
    {
      key: 'totalRwf',
      header: 'Total',
      align: 'right',
      render: (row) => formatRwf(row.totalRwf),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <select
          className="select select--inline"
          value={row.status}
          disabled={busyId === row.id}
          aria-label="Order status"
          onChange={(event) => changeField(row, { status: event.target.value as OrderStatus })}
        >
          {ORDER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => (
        <select
          className="select select--inline"
          value={row.paymentStatus}
          disabled={busyId === row.id}
          aria-label="Payment status"
          onChange={(event) =>
            changeField(row, { paymentStatus: event.target.value as PaymentStatus })
          }
        >
          {PAYMENT_STATUSES.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (row) => row.paymentMethod || '-',
    },
  ];

  const renderExpanded = (row: OrderRow) => (
    <div className="order-lines">
      <div className="order-lines-head">
        <span>Product</span>
        <span>Qty</span>
        <span>Unit price</span>
        <span>Subtotal</span>
      </div>
      {row.lines.length === 0 ? (
        <p className="order-lines-empty">No line items recorded for this order.</p>
      ) : (
        row.lines.map((line, index) => (
          <div className="order-lines-row" key={`${row.id}-${index}`}>
            <span>{line.productName}</span>
            <span>{formatNumber(line.quantity)}</span>
            <span>{formatRwf(line.priceRwf)}</span>
            <span>{formatRwf(line.priceRwf * line.quantity)}</span>
          </div>
        ))
      )}
      <div className="order-lines-meta">
        <Badge value={row.status} />
        <Badge value={row.paymentStatus} />
        <span className="cell-sub">
          {row.currency} &middot; {formatRwf(row.totalRwf)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Card>
        <div className="toolbar">
          <div className="toolbar-left">
            <TextField
              value={search}
              onChange={setSearch}
              type="search"
              placeholder="Search customer or order id"
            />
          </div>
        </div>

        <div className="chip-row">
          <button
            type="button"
            className={`filter-chip${status === '' ? ' filter-chip--active' : ''}`}
            onClick={() => {
              setStatus('');
              setPage(1);
            }}
          >
            All
          </button>
          {ORDER_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-chip${status === option ? ' filter-chip--active' : ''}`}
              onClick={() => {
                setStatus(option);
                setPage(1);
              }}
            >
              {titleCase(option)}
            </button>
          ))}
        </div>

        {actionError ? <p className="alert alert--error">{actionError}</p> : null}

        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(row) => row.id}
          renderExpanded={renderExpanded}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyMessage="No orders found."
        />

        {!loading && !error ? (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        ) : null}
      </Card>
    </div>
  );
}
