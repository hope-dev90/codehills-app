import { useNavigation } from '@react-navigation/native';
import type { RootNav } from '../navigation/types';

/**
 * Navigation helper usable from both stack screens and tab screens.
 * Navigating to a root stack screen from a tab bubbles up to the root navigator.
 */
export function useRootNav(): RootNav {
  return useNavigation<RootNav>();
}
