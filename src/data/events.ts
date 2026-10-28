import type { EventItem } from '../types';

/**
 * DEMONSTRATION EVENTS.
 * These are NOT real listings and carry no real dates. Real events must come from the backend.
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
      'This is a sample event used to show the layout. Real festivals, with verified dates and venues, will be loaded from the CodeHills backend.',
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
      'This is a sample event used to show the layout. Real coffee experiences will be added by partner farms through the backend.',
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
    description:
      'This is a sample event used to show the layout. Real workshops will be added by artisans and organisers.',
    image: 'artisan',
    isDemo: true,
  },
];

export const getEventById = (id: string): EventItem | undefined => mockEvents.find((e) => e.id === id);
