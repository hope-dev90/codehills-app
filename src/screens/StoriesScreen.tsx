import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchBar } from '../components/SearchBar';
import { ChipRow } from '../components/Chip';
import { StoryCard } from '../components/StoryCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';
import type { TabParamList } from '../navigation/types';

const FILTERS = ['All', 'Saved', 'Culture', 'Traditions', 'Heritage', 'Crafts', 'Places', 'Food'];

/** Screen 5: story cards with search, category filters and bookmarks. */
export default function StoriesScreen() {
  const navigation = useRootNav();
  const route = useRoute<RouteProp<TabParamList, 'Stories'>>();
  const { data, toggleBookmark } = useApp();
  const stories = useStories();
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [filter, setFilter] = useState('All');

  // Adjust search text when the Home screen navigates here with a new query.
  const routeQuery = route.params?.query;
  const [prevRouteQuery, setPrevRouteQuery] = useState(routeQuery);
  if (routeQuery !== prevRouteQuery) {
    setPrevRouteQuery(routeQuery);
    setQuery(routeQuery ?? '');
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stories.data.filter((s) => {
      if (filter === 'Saved' && !data.bookmarks.includes(s.id)) return false;
      if (filter !== 'All' && filter !== 'Saved' && s.category !== filter) return false;
      if (!q) return true;
      return [s.title, s.summary, s.subtitle, s.category, ...s.tags].some((t) => t.toLowerCase().includes(q));
    });
  }, [stories.data, query, filter, data.bookmarks]);

  return (
    <Screen>
      <ScreenHeader title="Stories" subtitle="Real people. Rich culture. Timeless stories." showBack />
      <View style={styles.search}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search stories…" />
      </View>
      <View style={styles.chips}>
        <ChipRow options={FILTERS} value={filter} onChange={setFilter} />
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
          renderItem={({ item }) => (
            <StoryCard
              story={item}
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
                filter === 'Saved'
                  ? 'Tap the bookmark on a story to keep it here.'
                  : 'Try another search or category.'
              }
              actionLabel="Show all stories"
              onAction={() => {
                setFilter('All');
                setQuery('');
              }}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: 20, marginBottom: 12 },
  chips: { marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
});
