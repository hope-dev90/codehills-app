import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from './SmartImage';
import { AppText } from './AppText';
import { DemoBadge } from './DemoBadge';
import { colors, radius, shadow } from '../theme';
import type { Story } from '../types';

interface Props {
  story: Story;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onPress: () => void;
  /** `large` for lists, `compact` for horizontal carousels. */
  variant?: 'large' | 'compact';
  locked?: boolean;
}

export function StoryCard({ story, bookmarked, onToggleBookmark, onPress, variant = 'large', locked }: Props) {
  const compact = variant === 'compact';
  return (
    <View style={compact ? styles.compact : styles.large}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open story: ${story.title}`}
        style={styles.card}
      >
        <SmartImage imageKey={story.image} uri={story.imageUrl} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['rgba(43,33,27,0)', 'rgba(43,33,27,0.88)']}
            locations={[0.25, 1]}
            style={StyleSheet.absoluteFill}
          />
        </SmartImage>

        <View style={styles.top}>{story.isDemo ? <DemoBadge /> : <View />}</View>

        <View style={styles.bottom}>
          <AppText variant={compact ? 'subheading' : 'heading'} color={colors.white} numberOfLines={2}>
            {story.title}
          </AppText>
          {!compact && (
            <AppText variant="small" color="rgba(255,255,255,0.88)" numberOfLines={2} style={styles.summary}>
              {story.summary}
            </AppText>
          )}
          <View style={styles.readPill}>
            <AppText variant="caption" color={colors.cream} style={styles.readText}>
              {locked ? 'Locked' : 'Read'}
            </AppText>
            <Ionicons name={locked ? 'lock-closed' : 'arrow-forward'} size={12} color={colors.cream} />
          </View>
        </View>
      </Pressable>

      {/* Sibling of the card button: a button must not be nested inside another button on web. */}
      <Pressable
        onPress={onToggleBookmark}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
        style={styles.bookmark}
      >
        <Ionicons
          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={bookmarked ? colors.ochre : colors.cream}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sandstone, ...shadow },
  large: { height: 230, marginBottom: 16 },
  compact: { width: 168, height: 190, marginRight: 14 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
  },
  bookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(43,33,27,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  summary: { marginTop: 4 },
  readPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.ochre,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(74,46,28,0.7)',
  },
  readText: { marginRight: 6, fontFamily: 'Manrope_700Bold' },
});
