import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { colors } from '../theme';
import { useApp } from '../hooks/AppContext';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  Home: { label: 'Home', icon: 'home-outline', active: 'home' },
  Shop: { label: 'Shop', icon: 'bag-handle-outline', active: 'bag-handle' },
  Map: { label: 'Map', icon: 'location-outline', active: 'location' },
  Stories: { label: 'Stories', icon: 'book-outline', active: 'book' },
  Profile: { label: 'Profile', icon: 'person-outline', active: 'person' },
};

/** The shared bottom navigation bar. Routes not listed in TABS (e.g. Events) stay hidden. */
export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useApp();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            style={styles.item}
          >
            <View>
              <Ionicons name={focused ? tab.active : tab.icon} size={22} color={focused ? colors.chocolate : '#9C8B7A'} />
              {route.name === 'Shop' && cartCount > 0 ? (
                <View style={styles.badge}>
                  <AppText variant="caption" color={colors.white} style={styles.badgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText
              variant="caption"
              color={focused ? colors.chocolate : '#9C8B7A'}
              style={focused ? styles.activeLabel : undefined}
            >
              {tab.label}
            </AppText>
            {focused && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  activeLabel: { fontFamily: 'Manrope_800ExtraBold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.caramel },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.caramel,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, lineHeight: 11 },
});
