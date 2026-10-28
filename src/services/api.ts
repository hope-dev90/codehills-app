import { config } from './config';
import { mockStories } from '../data/stories';
import { mockProducts } from '../data/products';
import { mockDestinations } from '../data/destinations';
import { mockEvents } from '../data/events';
import { mockLearningResources } from '../data/business';
import { ContentService, NotConfiguredError } from './interfaces';

/** Local mock implementation: what the app uses today. */
const mockContentService: ContentService = {
  getStories: async () => mockStories,
  getProducts: async () => mockProducts,
  getDestinations: async () => mockDestinations,
  getEvents: async () => mockEvents,
  getLearningResources: async () => mockLearningResources,
};

/**
 * Placeholder for the real backend. Every method throws until the real API contract exists.
 * No endpoint paths are invented here on purpose.
 *
 * TODO(backend): implement using `fetch(`${config.apiBaseUrl}/...`)` and map the responses
 * onto the types in src/types.
 */
const httpContentService: ContentService = {
  getStories: async () => {
    throw new NotConfiguredError('The stories API');
  },
  getProducts: async () => {
    throw new NotConfiguredError('The product catalogue API');
  },
  getDestinations: async () => {
    throw new NotConfiguredError('The destinations API');
  },
  getEvents: async () => {
    throw new NotConfiguredError('The events API');
  },
  getLearningResources: async () => {
    throw new NotConfiguredError('The business-learning API');
  },
};

export const contentService: ContentService = config.useMockData
  ? mockContentService
  : httpContentService;
