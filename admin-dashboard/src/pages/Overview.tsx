import { statsApi } from '../api/endpoints';
import type { OrderStatus, PaymentStatus } from '../api/types';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { ErrorState, Spinner } from '../components/Spinner';
import { useAsync } from '../hooks/useAsync';
import type { RecentOrder, RecentUser } from '../api/types';
import { formatDate, formatNumber, formatRwf, titleCase } from '../utils/format';
import { Button } from '../components/Button';

const userColumns: Column<RecentUser>[] = [
  { key: 'fullName', header: 'Name' },
  { key: 'contact', header: 'Contact' },
  { key: 'role', header: 'Role', render: (row) => <Badge value={row.role} /> },
  { key: 'authProvider', header: 'Provider' },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) => <Badge value={row.isActive ? 'Active' : 'Inactive'} />,
  },
  { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
];

const orderColumns: Column<RecentOrder>[] = [
  { key: 'customerName', header: 'Customer' },
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
  { key: 'status', header: 'Status', render: (row) => <Badge value={row.status} /> },
  {
    key: 'paymentStatus',
    header: 'Payment',
    render: (row) => <Badge value={row.paymentStatus} />,
  },
  { key: 'createdAt', header: 'Placed', render: (row) => formatDate(row.createdAt) },
];

export default function Overview() {
  const { data, loading, error, reload } = useAsync(() => statsApi.get(), []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-loading">
          <Spinner label="Loading overview" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <Card>
          <ErrorState message={error ?? 'Unable to load overview.'} onRetry={reload} />
        </Card>
      </div>
    );
  }

  const contentEntries: { label: string; value: number }[] = [
    { label: 'Stories', value: data.content.stories },
    { label: 'Destinations', value: data.content.destinations },
    { label: 'Events', value: data.content.events },
    { label: 'Products', value: data.content.products },
    { label: 'Artisans', value: data.content.artisans },
    { label: 'Businesses', value: data.content.businesses },
    { label: 'Learning', value: data.content.learning },
  ];

  const statusEntries = Object.entries(data.orders.byStatus) as [OrderStatus, number][];
  const paymentEntries = Object.entries(data.orders.byPayment) as [PaymentStatus, number][];

  return (
    <div className="page">
      <div className="toolbar">
        <p className="page-intro">Snapshot of platform activity across users, orders and content.</p>
        <Button variant="secondary" size="sm" onClick={reload}>
          Refresh
        </Button>
      </div>

      <h2 className="section-heading">Key metrics</h2>
      <div className="kpi-grid">
        <KpiCard label="Total users" value={formatNumber(data.users.total)} />
        <KpiCard label="Active users" value={formatNumber(data.users.active)} />
        <KpiCard label="New this week" value={formatNumber(data.users.newThisWeek)} />
        <KpiCard label="Google accounts" value={formatNumber(data.users.googleAccounts)} />
        <KpiCard label="Total orders" value={formatNumber(data.orders.total)} />
        <KpiCard label="Revenue" value={formatRwf(data.orders.revenueRwf)} />
      </div>

      <h2 className="section-heading">Orders by status</h2>
      <div className="kpi-grid">
        {statusEntries.map(([status, count]) => (
          <KpiCard key={status} label={titleCase(status)} value={formatNumber(count)} />
        ))}
      </div>

      <h2 className="section-heading">Orders by payment</h2>
      <div className="kpi-grid">
        {paymentEntries.map(([status, count]) => (
          <KpiCard key={status} label={titleCase(status)} value={formatNumber(count)} />
        ))}
      </div>

      <h2 className="section-heading">Content</h2>
      <div className="kpi-grid">
        {contentEntries.map((entry) => (
          <KpiCard key={entry.label} label={entry.label} value={formatNumber(entry.value)} />
        ))}
      </div>

      <Card title="Recent users">
        <DataTable
          columns={userColumns}
          rows={data.recentUsers}
          rowKey={(row) => row.id}
          emptyMessage="No recent users."
        />
      </Card>

      <Card title="Recent orders">
        <DataTable
          columns={orderColumns}
          rows={data.recentOrders}
          rowKey={(row) => row.id}
          emptyMessage="No recent orders."
        />
      </Card>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi-card card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  );
}
