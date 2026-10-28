import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TabParamList = {
  Home: undefined;
  Shop: undefined;
  Map: undefined;
  Stories: { query?: string } | undefined;
  Profile: undefined;
  /** Reachable from Home, hidden from the bottom bar. */
  Events: undefined;
};

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  StoryDetails: { storyId: string };
  ProductDetails: { productId: string };
  Cart: undefined;
  Reward: { orderId: string };
  OrderConfirmation: { orderId: string };
  DestinationDetails: { destinationId: string };
  EventDetails: { eventId: string };
  StartBusiness: undefined;
  CreateBusiness: { mode?: 'create' | 'edit' } | undefined;
  BusinessDashboard: undefined;
  MyOrders: undefined;
  MyStories: undefined;
  SavedPlaces: undefined;
  Language: undefined;
  Help: undefined;
  About: undefined;
  LearningResource: { resourceId: string };
};

export type RootNav = NativeStackNavigationProp<RootStackParamList>;
