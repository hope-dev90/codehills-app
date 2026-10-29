import React, { useCallback } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { SmartImage } from '../components/SmartImage';
import { EmptyState, LoadingState } from '../components/StateViews';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';
import type { RootStackParamList } from '../navigation/types';

/**
 * Screen 6: Story Details.
 * Full-screen photo with the story anchored to the bottom.
 * Layout (dp), measured from the design reference:
 *  title 24 / body 14 · tags 28 high · gallery 92 high · Read next 50 high
 */
const SIDE = 20;
const INK = colors.darkBrown;
const PILL_BG = 'rgba(110,70,44,0.62)';
const PILL_BORDER = 'rgba(231,200,160,0.7)';

export default function StoryDetailsScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { params } = useRoute<RouteProp<RootStackParamList, 'StoryDetails'>>();
  const { data, toggleBookmark } = useApp();
  const stories = useStories();

  // Light status-bar icons over the photo, restored when leaving the screen.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, []),
  );

  if (stories.loading) {
    return (
      <View style={styles.plain}>
        <LoadingState />
      </View>
    );
  }
  const index = stories.data.findIndex((s) => s.id === params.storyId);
  const story = index >= 0 ? stories.data[index] : undefined;

  if (!story) {
    return (
      <View style={[styles.plain, { paddingTop: insets.top }]}>
        <EmptyState
          icon="book-outline"
          title="Story not found"
          message="This story is not available."
          actionLabel="Back to stories"
          onAction={() => navigation.navigate('Main', { screen: 'Stories' })}
        />
      </View>
    );
  }

  const bookmarked = data.bookmarks.includes(story.id);
  const next = stories.data[(index + 1) % stories.data.length];
  const tags = [story.category, ...story.tags.filter((t) => t !== story.category)].slice(0, 4);

  return (
    <View style={styles.root}>
      {/* Full-screen photo with a dark fade towards the bottom */}
      <SmartImage imageKey={story.image} uri={story.imageUrl} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(43,33,27,0.35)', 'rgba(43,33,27,0)', 'rgba(43,33,27,0.55)', 'rgba(43,33,27,0.93)']}
          locations={[0, 0.25, 0.52, 0.8]}
          style={StyleSheet.absoluteFill}
        />
      </SmartImage>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: height,
          justifyContent: 'flex-end',
          paddingHorizontal: SIDE,
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <AppText style={styles.title}>{story.title}</AppText>

        {story.body.slice(0, 1).map((p, i) => (
          <AppText key={i} style={styles.body}>
            {p}
          </AppText>
        ))}
        {story.body.slice(1).map((p, i) => (
          <AppText key={i} style={[styles.body, { marginTop: 10 }]}>
            {p}
          </AppText>
        ))}
        {story.isDemo && (
          <AppText style={styles.demo}>Demo text, not verified heritage content.</AppText>
        )}

        <View style={styles.tags}>
          {tags.map((t) => (
            <View key={t} style={styles.tag}>
              <AppText style={styles.tagText}>{t}</AppText>
            </View>
          ))}
        </View>

        {story.gallery.length > 0 && (
          <View style={styles.gallery}>
            {story.gallery.slice(0, 3).map((g) => (
              <SmartImage key={g} imageKey={g} style={styles.thumb} />
            ))}
          </View>
        )}

        {next && next.id !== story.id && (
          <Pressable
            onPress={() => navigation.push('StoryDetails', { storyId: next.id })}
            accessibilityRole="button"
            accessibilityLabel="Read next story"
            style={styles.next}
          >
            <AppText style={styles.nextText}>Read next</AppText>
          </Pressable>
        )}
      </ScrollView>

      {/* Top actions */}
      <View style={[styles.actions, { top: insets.top + 10 }]} pointerEvents="box-none">
        <Pressable
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main', { screen: 'Stories' }))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={20} color={INK} />
        </Pressable>
        <Pressable
          onPress={() => toggleBookmark(story.id)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
          style={styles.bookmark}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={bookmarked ? colors.ochre : colors.white}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkBrown },
  plain: { flex: 1, backgroundColor: colors.cream },

  actions: {
    position: 'absolute',
    left: SIDE,
    right: SIDE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,240,229,0.92)',
  },
  bookmark: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Title 24dp bold, body 14dp / 21dp
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, lineHeight: 30, color: colors.white },
  body: {
    marginTop: 14,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.95)',
  },
  demo: {
    marginTop: 8,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.65)',
  },

  // Tags: 28dp pills, 12dp gap
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
  tag: {
    height: 28,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PILL_BORDER,
    backgroundColor: PILL_BG,
  },
  tagText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, lineHeight: 16, color: colors.cream },

  // Gallery: three images, 92dp high
  gallery: { flexDirection: 'row', gap: 10, marginTop: 18 },
  thumb: { flex: 1, height: 92, borderRadius: 12 },

  // Read next: full-width 50dp pill
  next: {
    height: 50,
    marginTop: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231,200,160,0.85)',
    backgroundColor: 'rgba(110,70,44,0.8)',
  },
  nextText: { fontFamily: 'Manrope_700Bold', fontSize: 15, lineHeight: 20, color: colors.cream },
});