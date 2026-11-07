import { Badge } from '../components/Badge';
import type { LearningResource } from '../api/types';
import { formatDate, formatNumber } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<LearningResource> = {
  collection: 'learning',
  itemLabel: 'Learning resource',
  publishKey: 'isPublished',
  publishLabels: { on: 'Published', off: 'Draft' },
  columns: [
    { key: 'title', header: 'Title' },
    {
      key: 'sortOrder',
      header: 'Sort order',
      align: 'right',
      render: (row) => formatNumber(row.sortOrder),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (row) => <Badge value={row.isPublished ? 'Published' : 'Draft'} />,
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ],
  fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'summary', label: 'Summary', type: 'textarea' },
    { key: 'body', label: 'Body', type: 'stringlist', hint: 'One paragraph per line' },
    { key: 'sortOrder', label: 'Sort order', type: 'number' },
    { key: 'isPublished', label: 'Published', type: 'boolean' },
  ],
};

export default function Learning() {
  return <CollectionPage config={config} />;
}
