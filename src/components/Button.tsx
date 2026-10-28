import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, shadow } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const palette = {
    primary: { bg: colors.chocolate, fg: colors.cream, border: colors.chocolate },
    secondary: { bg: 'transparent', fg: colors.chocolate, border: colors.caramel },
    ghost: { bg: 'transparent', fg: colors.chocolate, border: 'transparent' },
    onDark: { bg: 'rgba(74,46,28,0.92)', fg: colors.cream, border: colors.ochre },
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        variant === 'primary' && shadow,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        inactive && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={18} color={palette.fg} style={styles.iconL} />}
          <AppText variant="button" color={palette.fg}>
            {title}
          </AppText>
          {iconRight && <Ionicons name={iconRight} size={18} color={palette.fg} style={styles.iconR} />}
        </View>
      )}
    </Pressable>
  );
}

export const PrimaryButton = (p: Omit<Props, 'variant'>) => <Button {...p} variant="primary" />;
export const SecondaryButton = (p: Omit<Props, 'variant'>) => <Button {...p} variant="secondary" />;

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconL: { marginRight: 8 },
  iconR: { marginLeft: 8 },
});
