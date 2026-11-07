import { Badge } from '../components/Badge';
import type { Story } from '../api/types';
import { formatDate, formatNumber } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<Story> = {
  collection: 'stories',
  itemLabel: 'Story',
  publishKey: 'isPublished',
  publishLabels: { on: 'Published', off: 'Draft' },
  columns: [
    { key: 'title', header: 'Title' },
    { key: 'subtitle', header: 'Subtitle' },
    { key: 'category', header: 'Category' },
    {
      key: 'tags',
      header: 'Tags',
      render: (row) => (row.tags.length ? row.tags.join(', ') : '-'),
    },
    {
      key: 'xpReward',
      header: 'XP',
      align: 'right',
      render: (row) => formatNumber(row.xpReward),
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
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'summary', label: 'Summary', type: 'textarea' },
    { key: 'body', label: 'Body', type: 'stringlist', hint: 'One paragraph per line' },
    { key: 'tags', label: 'Tags', type: 'stringlist', hint: 'One tag per line' },
    { key: 'imageKey', label: 'Image key', type: 'text' },
    { key: 'imageUrl', label: 'Image URL', type: 'text' },
    { key: 'xpReward', label: 'XP reward', type: 'number' },
    { key: 'isPublished', label: 'Published', type: 'boolean' },
  ],
};

export default function Stories() {
  return <CollectionPage config={config} />;
}
