import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SmartImage } from './SmartImage';
import { AppText } from './AppText';
import { Button } from './Button';
import { DemoBadge } from './DemoBadge';
import { colors, radius, shadow } from '../theme';
import type { EventItem } from '../types';

interface Props {
  event: EventItem;
  onPress: () => void;
}

export function EventCard({ event, onPress }: Props) {
  return (
    <View style={styles.card}>
      <SmartImage imageKey={event.image} uri={event.imageUrl} style={styles.image}>
        <LinearGradient
          colors={['rgba(43,33,27,0.0)', 'rgba(43,33,27,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        {event.isDemo && (
          <View style={styles.badge}>
            <DemoBadge label="Demo event" />
          </View>
        )}
      </SmartImage>
      <View style={styles.body}>
        <AppText variant="heading" numberOfLines={2}>
          {event.title}
        </AppText>
        <AppText variant="small" color={colors.muted} style={styles.meta}>
          {event.location} · {event.dateLabel}
        </AppText>
        <Button title="View Details" onPress={onPress} variant="secondary" style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadow,
  },
  image: { height: 150 },
  badge: { position: 'absolute', top: 10, left: 10 },
  body: { padding: 14 },
  meta: { marginTop: 4 },
  btn: { marginTop: 12, minHeight: 44 },
});
