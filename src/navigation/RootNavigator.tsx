import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import StoryDetailsScreen from '../screens/StoryDetailsScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import RewardScreen from '../screens/RewardScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import DestinationDetailsScreen from '../screens/DestinationDetailsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import StartBusinessScreen from '../screens/StartBusinessScreen';
import CreateBusinessScreen from '../screens/CreateBusinessScreen';
import BusinessDashboardScreen from '../screens/BusinessDashboardScreen';
import LearningResourceScreen from '../screens/LearningResourceScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import MyStoriesScreen from '../screens/MyStoriesScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';
import LanguageScreen from '../screens/LanguageScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root stack. Authentication and onboarding screens live here (no bottom bar);
 * the five main sections live inside the `Main` tab navigator.
 */
export default function RootNavigator({ signedIn }: { signedIn: boolean }) {
  return (
    <Stack.Navigator
      initialRouteName={signedIn ? 'Main' : 'Landing'}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
      <Stack.Screen name="StoryDetails" component={StoryDetailsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Reward" component={RewardScreen} options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="DestinationDetails" component={DestinationDetailsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="StartBusiness" component={StartBusinessScreen} />
      <Stack.Screen name="CreateBusiness" component={CreateBusinessScreen} />
      <Stack.Screen name="BusinessDashboard" component={BusinessDashboardScreen} />
      <Stack.Screen name="LearningResource" component={LearningResourceScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="MyStories" component={MyStoriesScreen} />
      <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
