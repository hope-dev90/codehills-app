import { Badge } from '../components/Badge';
import type { Product } from '../api/types';
import { formatDate, formatRwf } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<Product> = {
  collection: 'products',
  itemLabel: 'Product',
  publishKey: 'isActive',
  publishLabels: { on: 'Active', off: 'Inactive' },
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'category', header: 'Category' },
    { key: 'sellerName', header: 'Seller' },
    {
      key: 'priceRwf',
      header: 'Price',
      align: 'right',
      render: (row) => formatRwf(row.priceRwf),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <Badge value={row.isActive ? 'Active' : 'Inactive'} />,
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'slug', label: 'Slug', type: 'text' },
    { key: 'shortDescription', label: 'Short description', type: 'textarea' },
    { key: 'description', label: 'Description', type: 'textarea' },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: ['Handicrafts', 'Food & Drinks', 'Art'],
    },
    { key: 'categoryId', label: 'Category ID', type: 'text' },
    { key: 'priceRwf', label: 'Price (RWF)', type: 'number' },
    { key: 'craftsmanship', label: 'Craftsmanship', type: 'text' },
    { key: 'sellerName', label: 'Seller name', type: 'text' },
    { key: 'imageKey', label: 'Image key', type: 'text' },
    { key: 'imageUrl', label: 'Image URL', type: 'text' },
    { key: 'tags', label: 'Tags', type: 'stringlist', hint: 'One tag per line' },
    { key: 'artisanId', label: 'Artisan ID', type: 'text', nullable: true, hint: 'Leave empty for none' },
    { key: 'isActive', label: 'Active', type: 'boolean' },
  ],
};

export default function Products() {
  return <CollectionPage config={config} />;
}
