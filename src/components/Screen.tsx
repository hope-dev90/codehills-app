import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Apply bottom inset (use on screens without the tab bar). */
  padBottom?: boolean;
  padTop?: boolean;
}

/** Cream screen background that respects the device safe areas. */
export function Screen({ children, style, padBottom = false, padTop = true }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { paddingTop: padTop ? insets.top : 0, paddingBottom: padBottom ? insets.bottom : 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
});
