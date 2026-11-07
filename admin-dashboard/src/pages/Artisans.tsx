import type { Artisan } from '../api/types';
import { formatDate, formatNumber } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<Artisan> = {
  collection: 'artisans',
  itemLabel: 'Artisan',
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'location', header: 'Location' },
    { key: 'bio', header: 'Bio' },
    {
      key: 'productCount',
      header: 'Products',
      align: 'right',
      render: (row) => formatNumber(row.productCount),
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'imageUrl', label: 'Image URL', type: 'text' },
  ],
};

export default function Artisans() {
  return <CollectionPage config={config} />;
}
