import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <AppText variant="caption" color={selected ? colors.cream : colors.chocolate} style={styles.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

interface RowProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

/** Horizontally scrollable row of filter chips. */
export function ChipRow({ options, value, onChange }: RowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((o) => (
        <Chip key={o} label={o} selected={o === value} onPress={() => onChange(o)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 20, gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.chocolate, borderColor: colors.chocolate },
  text: { fontFamily: 'Manrope_700Bold' },
});
