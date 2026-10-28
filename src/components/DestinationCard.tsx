import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from './SmartImage';
import { AppText } from './AppText';
import { DemoBadge } from './DemoBadge';
import { colors, radius, shadow } from '../theme';
import type { Destination } from '../types';

interface Props {
  destination: Destination;
  selected?: boolean;
  saved: boolean;
  onToggleSaved: () => void;
  onPress: () => void;
}

export function DestinationCard({ destination, selected = false, saved, onToggleSaved, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open destination: ${destination.name}`}
      style={[styles.card, selected && styles.selected]}
    >
      <SmartImage imageKey={destination.image} uri={destination.imageUrl} style={styles.image} />
      <View style={styles.body}>
        <AppText variant="subheading" numberOfLines={1}>
          {destination.name}
        </AppText>
        <AppText variant="caption" color={colors.caramel} style={styles.cat}>
          {destination.category}
        </AppText>
        <AppText variant="small" color={colors.muted} numberOfLines={2}>
          {destination.summary}
        </AppText>
        {destination.isDemo && (
          <View style={styles.badge}>
            <DemoBadge />
          </View>
        )}
      </View>
      <Pressable
        onPress={onToggleSaved}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Remove from saved places' : 'Save place'}
        style={styles.save}
      >
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={colors.caramel} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow,
  },
  selected: { borderColor: colors.ochre },
  image: { width: 104, minHeight: 112 },
  body: { flex: 1, padding: 12, paddingRight: 40 },
  cat: { marginBottom: 3, fontFamily: 'Manrope_700Bold' },
  badge: { marginTop: 6 },
  save: { position: 'absolute', top: 10, right: 10 },
});
