import type { Destination, DestinationCategory } from '../types';

/**
 * DEMONSTRATION DESTINATIONS.
 * Coordinates are approximate and used only to place markers. No distances or travel times are
 * stored on purpose: they must come from a real maps/location service.
 * Descriptions are short placeholders to be replaced by verified content.
 */
export const destinationCategories: DestinationCategory[] = ['Nature', 'Lakes', 'Culture', 'City'];

export const mockDestinations: Destination[] = [
  {
    id: 'volcanoes',
    name: 'Volcanoes National Park',
    category: 'Nature',
    summary: 'Volcanic mountains in northern Rwanda.',
    description:
      'Placeholder description. Volcanoes National Park lies in the north-west of Rwanda. Verified visitor information will be added from official sources.',
    latitude: -1.465,
    longitude: 29.535,
    image: 'volcanoes',
    isDemo: true,
  },
  {
    id: 'lake-kivu',
    name: 'Lake Kivu',
    category: 'Lakes',
    summary: 'The lake along the western border.',
    description:
      'Placeholder description. Lake Kivu runs along Rwanda\'s western border, with several lakeside towns. Verified details will be added later.',
    latitude: -1.703,
    longitude: 29.256,
    image: 'lakeKivu',
    isDemo: true,
  },
  {
    id: 'kigali',
    name: 'Kigali',
    category: 'City',
    summary: 'The capital city, set across several hills.',
    description:
      'Placeholder description. Kigali is the capital of Rwanda. Neighbourhood, museum and market information will be added from verified sources.',
    latitude: -1.9441,
    longitude: 30.0619,
    image: 'kigali',
    isDemo: true,
  },
  {
    id: 'nyungwe',
    name: 'Nyungwe Forest',
    category: 'Nature',
    summary: 'A forest area in south-western Rwanda.',
    description:
      'Placeholder description. Nyungwe is a forested area in the south-west. Verified visitor information will be added from official sources.',
    latitude: -2.475,
    longitude: 29.2,
    image: 'hills',
    isDemo: true,
  },
  {
    id: 'akagera',
    name: 'Akagera National Park',
    category: 'Nature',
    summary: 'A national park in eastern Rwanda.',
    description:
      'Placeholder description. Akagera is in the east of Rwanda, along the border. Verified visitor information will be added from official sources.',
    latitude: -1.83,
    longitude: 30.72,
    image: 'tea',
    isDemo: true,
  },
  {
    id: 'cultural-village',
    name: 'Cultural Experience (sample)',
    category: 'Culture',
    summary: 'A placeholder for community-led cultural visits.',
    description:
      'Placeholder entry for cultural experiences such as dance, crafts and storytelling. Real partner locations will be added when the CodeHills team provides them.',
    latitude: -1.52,
    longitude: 29.6,
    image: 'dance',
    isDemo: true,
  },
];

export const getDestinationById = (id: string): Destination | undefined =>
  mockDestinations.find((d) => d.id === id);
