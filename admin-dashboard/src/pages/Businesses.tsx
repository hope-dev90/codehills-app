import type { Business } from '../api/types';
import { formatDate, formatNumber } from '../utils/format';
import { CollectionPage } from './collections/CollectionPage';
import type { CollectionConfig } from './collections/CollectionPage';

const config: CollectionConfig<Business> = {
  collection: 'businesses',
  itemLabel: 'Business',
  columns: [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'ownerName', header: 'Owner' },
    { key: 'ownerContact', header: 'Owner contact' },
    {
      key: 'productCount',
      header: 'Products',
      align: 'right',
      render: (row) => formatNumber(row.productCount),
    },
    {
      key: 'orderCount',
      header: 'Orders',
      align: 'right',
      render: (row) => formatNumber(row.orderCount),
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'imageUrl', label: 'Image URL', type: 'text' },
  ],
};

export default function Businesses() {
  return <CollectionPage config={config} />;
}
