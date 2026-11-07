import type { EventItem } from '../types';

/**
 * Sample event listings for layout and discovery. Not real dated programmes.
 */
export const mockEvents: EventItem[] = [
  {
    id: 'e-festival',
    title: 'Cultural Festival (sample)',
    category: 'Festival',
    location: 'Location to be announced',
    dateLabel: 'Sample event, no date',
    summary: 'Placeholder for a celebration of music, dance and crafts.',
    description:
      'Sample event used to show the layout. Real festivals, with verified dates and venues, will be published by CodeHills organisers.',
    image: 'festival',
    isDemo: true,
  },
  {
    id: 'e-coffee',
    title: 'Coffee Harvest Experience (sample)',
    category: 'Coffee',
    location: 'Location to be announced',
    dateLabel: 'Sample event, no date',
    summary: 'Placeholder for a farm visit and tasting.',
    description:
      'Sample event used to show the layout. Real coffee experiences will be added by partner farms.',
    image: 'coffeeHarvest',
    isDemo: true,
  },
  {
    id: 'e-crafts',
    title: 'Craft Workshop (sample)',
    category: 'Culture',
    location: 'Location to be announced',
    dateLabel: 'Sample event, no date',
    summary: 'Placeholder for a hands-on session with local artisans.',
    description: 'Sample event used to show the layout. Real workshops will be added by artisans and organisers.',
    image: 'artisan',
    isDemo: true,
  },
];

export const getEventById = (id: string): EventItem | undefined => mockEvents.find((e) => e.id === id);
