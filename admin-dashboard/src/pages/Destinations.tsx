import { Badge } from '../components/Badge';
import type { Destination } from '../api/types';
import { formatDate } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<Destination> = {
  collection: 'destinations',
  itemLabel: 'Destination',
  publishKey: 'isPublished',
  publishLabels: { on: 'Published', off: 'Draft' },
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'summary', header: 'Summary' },
    {
      key: 'latitude',
      header: 'Latitude',
      align: 'right',
      render: (row) => String(row.latitude),
    },
    {
      key: 'longitude',
      header: 'Longitude',
      align: 'right',
      render: (row) => String(row.longitude),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (row) => <Badge value={row.isPublished ? 'Published' : 'Draft'} />,
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: ['Nature', 'Lakes', 'Culture', 'City'],
    },
    { key: 'summary', label: 'Summary', type: 'textarea' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'latitude', label: 'Latitude', type: 'number' },
    { key: 'longitude', label: 'Longitude', type: 'number' },
    { key: 'imageKey', label: 'Image key', type: 'text' },
    { key: 'imageUrl', label: 'Image URL', type: 'text' },
    { key: 'isPublished', label: 'Published', type: 'boolean' },
  ],
};

export default function Destinations() {
  return <CollectionPage config={config} />;
}
