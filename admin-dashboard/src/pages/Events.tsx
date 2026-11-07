import { Badge } from '../components/Badge';
import type { CustEvent } from '../api/types';
import { formatDate } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<CustEvent> = {
  collection: 'events',
  itemLabel: 'Event',
  publishKey: 'isPublished',
  publishLabels: { on: 'Published', off: 'Draft' },
  columns: [
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category' },
    { key: 'location', header: 'Location' },
    { key: 'dateLabel', header: 'Date' },
    {
      key: 'isPublished',
      header: 'Status',
      render: (row) => <Badge value={row.isPublished ? 'Published' : 'Draft'} />,
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ],
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: ['Festival', 'Coffee', 'Culture'],
    },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'dateLabel', label: 'Date label', type: 'text' },
    { key: 'summary', label: 'Summary', type: 'textarea' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'imageKey', label: 'Image key', type: 'text' },
    { key: 'imageUrl', label: 'Image URL', type: 'text' },
    { key: 'isPublished', label: 'Published', type: 'boolean' },
  ],
};

export default function Events() {
  return <CollectionPage config={config} />;
}
