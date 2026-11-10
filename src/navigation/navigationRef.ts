import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Global navigation handle so non-screen code (e.g. session expiry) can route. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
