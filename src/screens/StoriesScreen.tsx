import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { SmartImage } from '../components/SmartImage';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';
import type { TabParamList } from '../navigation/types';
import type { Story } from '../types';

/**
 * Screen 5: Stories.
 * Layout (dp), measured from the design reference:
 *  title 26 / subtitle 14 · chips 34 high · first card 280 high, then 168 high · radius 14
 */
const SIDE = 20;
const FEATURED_H = 280;
const COMPACT_H = 168;
const INK = colors.darkBrown;
const FILTERS = ['All', 'Culture', 'Traditions', 'Heritage', 'Crafts', 'Places', 'Food', 'Saved'];

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <AppText style={[styles.chipText, selected && { color: colors.cream }]}>{label}</AppText>
    </Pressable>
  );
}

function StoryPoster({
  story,
  featured,
  bookmarked,
  onToggleBookmark,
  onPress,
}: {
  story: Story;
  featured: boolean;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open story: ${story.title}`}
      style={[styles.card, { height: featured ? FEATURED_H : COMPACT_H }]}
    >
      <SmartImage imageKey={story.image} uri={story.imageUrl} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(43,33,27,0)', 'rgba(43,33,27,0.2)', 'rgba(43,33,27,0.86)']}
          locations={[0, featured ? 0.35 : 0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        {featured && (
          <LinearGradient
            colors={['rgba(43,33,27,0.55)', 'rgba(43,33,27,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.7, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </SmartImage>

      <Pressable
        onPress={onToggleBookmark}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
        style={styles.bookmark}
      >
        <Ionicons
          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={17}
          color={bookmarked ? colors.ochre : colors.cream}
        />
      </Pressable>

      <View style={styles.cardText}>
        <AppText style={featured ? styles.titleBig : styles.titleSmall} numberOfLines={2}>
          {story.title}
        </AppText>
        <AppText style={featured ? styles.subBig : styles.subSmall} numberOfLines={2}>
          {story.summary}
        </AppText>
        {featured && (
          <View style={styles.readBtn}>
            <AppText style={styles.readText}>Read more</AppText>
            <Ionicons name="arrow-forward" size={13} color={colors.cream} style={{ marginLeft: 6 }} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function StoriesScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<TabParamList, 'Stories'>>();
  const { data, toggleBookmark } = useApp();
  const stories = useStories();
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState('All');

  // Search text passed from other screens
  useEffect(() => {
    if (route.params?.query !== undefined) {
      setQuery(route.params.query);
      setShowSearch(!!route.params.query);
    }
  }, [route.params?.query]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stories.data.filter((s) => {
      if (filter === 'Saved' && !data.bookmarks.includes(s.id)) return false;
      if (filter !== 'All' && filter !== 'Saved' && s.category !== filter) return false;
      if (!q) return true;
      return [s.title, s.summary, s.subtitle, s.category, ...s.tags].some((t) => t.toLowerCase().includes(q));
    });
  }, [stories.data, query, filter, data.bookmarks]);

  const toggleSearch = () => {
    if (showSearch) setQuery('');
    setShowSearch((v) => !v);
  };

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top + 8 }}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <AppText style={styles.title}>Stories</AppText>
          <Pressable
            onPress={toggleSearch}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={showSearch ? 'Close search' : 'Search stories'}
          >
            <Ionicons name={showSearch ? 'close' : 'search'} size={24} color={INK} />
          </Pressable>
        </View>
        <AppText style={styles.subtitle}>Real people. Rich culture. Timeless stories.</AppText>

        {showSearch && (
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={INK} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search stories…"
              placeholderTextColor="#6F6054"
              autoFocus
              returnKeyType="search"
              style={styles.searchInput}
              accessibilityLabel="Search stories"
            />
          </View>
        )}

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipScroll}
        >
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>

      {stories.loading ? (
        <LoadingState />
      ) : stories.error ? (
        <ErrorState message={stories.error} onRetry={stories.reload} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <StoryPoster
              story={item}
              featured={index === 0}
              bookmarked={data.bookmarks.includes(item.id)}
              onToggleBookmark={() => toggleBookmark(item.id)}
              onPress={() => navigation.navigate('StoryDetails', { storyId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={filter === 'Saved' ? 'bookmark-outline' : 'search-outline'}
              title={filter === 'Saved' ? 'No saved stories yet' : 'No stories found'}
              message={
                filter === 'Saved' ? 'Tap the bookmark on a story to keep it here.' : 'Try another search or category.'
              }
              actionLabel="Show all stories"
              onAction={() => {
                setFilter('All');
                setQuery('');
                setShowSearch(false);
              }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },

  // Title 26dp bold, subtitle 14dp
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 26, lineHeight: 34, color: INK },
  subtitle: {
    paddingHorizontal: SIDE,
    marginTop: 4,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#5E4E42',
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginHorizontal: SIDE,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.28)',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 0,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: INK,
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },

  // Chips: 34dp high pills, 11dp gap
  chipScroll: { flexGrow: 0, marginTop: 16, marginBottom: 15 },
  chips: { paddingHorizontal: SIDE, gap: 11, paddingVertical: 4 },
  chip: {
    height: 34,
    paddingHorizontal: 20,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.3)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  chipOn: {
    backgroundColor: colors.chocolate,
    borderColor: colors.chocolate,
    shadowColor: '#2B211B',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 17, color: INK },

  // Cards
  list: { paddingHorizontal: SIDE, paddingBottom: 20, flexGrow: 1 },
  card: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.sandstone,
    shadowColor: '#2B211B',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  bookmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(43,33,27,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  titleBig: { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, lineHeight: 28, color: colors.white },
  subBig: {
    marginTop: 10,
    maxWidth: 230,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.93)',
  },
  titleSmall: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, lineHeight: 26, color: colors.white },
  subSmall: {
    marginTop: 4,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.92)',
  },
  readBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 112,
    height: 31,
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(231,200,160,0.75)',
    backgroundColor: 'rgba(110,70,44,0.72)',
  },
  readText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 17, color: colors.cream },
});