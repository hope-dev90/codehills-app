import type { DemoOrder, LearningResource } from '../types';

export const businessCategories = ['Handicrafts', 'Food & Drinks', 'Art', 'Tourism experience', 'Other'];

/** DEMONSTRATION orders shown on the business dashboard. They are not real customers. */
export const demoBusinessOrders: DemoOrder[] = [
  { id: 'demo-1001', customer: 'Sample customer A', item: 'Sample product', totalRwf: 12000, status: 'New' },
  { id: 'demo-1002', customer: 'Sample customer B', item: 'Sample product', totalRwf: 8000, status: 'Preparing' },
  { id: 'demo-1003', customer: 'Sample customer C', item: 'Sample product', totalRwf: 15000, status: 'Delivered' },
];

/** DEMONSTRATION learning resources. Real business-learning content will come from CodeHills. */
export const mockLearningResources: LearningResource[] = [
  {
    id: 'l-start',
    title: 'Getting started',
    summary: 'First steps for a small craft or food business.',
    body: [
      'Sample lesson text. The real business-learning material will be provided by the CodeHills team.',
      'Topics planned for this section could include naming your business, choosing products and setting a fair price.',
    ],
    isDemo: true,
  },
  {
    id: 'l-photos',
    title: 'Showing your products',
    summary: 'Simple ideas for presenting products well.',
    body: [
      'Sample lesson text. Real guidance on product photography and descriptions will be added later.',
    ],
    isDemo: true,
  },
  {
    id: 'l-stories',
    title: 'Telling your story',
    summary: 'Why the story behind a product matters.',
    body: [
      'Sample lesson text. This section will explain how product stories can be linked to cultural stories in the app.',
    ],
    isDemo: true,
  },
];
