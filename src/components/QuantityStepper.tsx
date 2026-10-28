import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, compact = false }: Props) {
  const size = compact ? 28 : 36;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityLabel="Decrease quantity"
        style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }, value <= min && styles.off]}
      >
        <Ionicons name="remove" size={16} color={colors.chocolate} />
      </Pressable>
      <AppText variant="subheading" style={[styles.value, { minWidth: compact ? 26 : 34 }]}>
        {value}
      </AppText>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityLabel="Increase quantity"
        style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }, value >= max && styles.off]}
      >
        <Ionicons name="add" size={16} color={colors.chocolate} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  off: { opacity: 0.4 },
  value: { textAlign: 'center' },
});
