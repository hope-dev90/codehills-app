import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

/** Small pill marking sample content so it is never mistaken for verified information. */
export function DemoBadge({ label = 'Demo content' }: { label?: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name="information-circle" size={12} color={colors.chocolate} />
      <AppText variant="caption" color={colors.chocolate} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

/** Wider notice used on detail screens. */
export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.notice}>
      <Ionicons name="information-circle-outline" size={20} color={colors.caramel} />
      <AppText variant="small" color={colors.chocolate} style={styles.noticeText}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(247,240,229,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  text: { marginLeft: 4, fontFamily: 'Manrope_700Bold' },
  notice: {
    flexDirection: 'row',
    backgroundColor: colors.sandstone,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'flex-start',
  },
  noticeText: { flex: 1, marginLeft: 10 },
});
