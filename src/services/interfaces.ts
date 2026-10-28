import type {
  CartItem,
  DeliveryDetails,
  Destination,
  EventItem,
  LearningResource,
  Order,
  Product,
  Story,
  UserProfile,
} from '../types';

/** Read access to cultural stories, catalogue, destinations, events and learning content. */
export interface ContentService {
  getStories(): Promise<Story[]>;
  getProducts(): Promise<Product[]>;
  getDestinations(): Promise<Destination[]>;
  getEvents(): Promise<EventItem[]>;
  getLearningResources(): Promise<LearningResource[]>;
}

export interface AuthService {
  signIn(contact: string, password: string): Promise<UserProfile>;
  signUp(fullName: string, contact: string, password: string): Promise<UserProfile>;
  signOut(): Promise<void>;
}

export interface CreateOrderInput {
  lines: CartItem[];
  delivery: DeliveryDetails;
  shippingRwf: number;
  /** Stories the user already unlocked, so a new one can be chosen. */
  unlockedStoryIds: string[];
}

export interface OrderService {
  createOrder(input: CreateOrderInput): Promise<Order>;
}

export interface PaymentResult {
  /** `demo_no_payment` means nothing was charged. Only a real provider may return `paid`. */
  status: 'demo_no_payment' | 'paid' | 'failed';
  verified: boolean;
  reference?: string;
}

export interface PaymentService {
  pay(amountRwf: number, orderId: string): Promise<PaymentResult>;
}

export class NotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} is not connected yet. Configure src/services/config.ts and implement the HTTP service.`);
    this.name = 'NotConfiguredError';
  }
}
