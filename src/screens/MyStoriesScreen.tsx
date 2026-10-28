import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { ChipRow } from '../components/Chip';
import { StoryCard } from '../components/StoryCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';

const TABS = ['Unlocked', 'Bookmarked'];

/** Stories unlocked by (demo) orders and stories bookmarked by the user. */
export default function MyStoriesScreen() {
  const navigation = useRootNav();
  const { data, toggleBookmark } = useApp();
  const stories = useStories();
  const [tab, setTab] = useState('Unlocked');

  const list = useMemo(
    () =>
      stories.data.filter((s) =>
        tab === 'Unlocked' ? data.unlockedStories.includes(s.id) : data.bookmarks.includes(s.id),
      ),
    [stories.data, tab, data.unlockedStories, data.bookmarks],
  );

  return (
    <Screen padBottom>
      <ScreenHeader title="My Stories" showBack />
      <View style={{ marginBottom: 12 }}>
        <ChipRow options={TABS} value={tab} onChange={setTab} />
      </View>
      {stories.loading ? (
        <LoadingState />
      ) : stories.error ? (
        <ErrorState message={stories.error} onRetry={stories.reload} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
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
              icon={tab === 'Unlocked' ? 'gift-outline' : 'bookmark-outline'}
              title={tab === 'Unlocked' ? 'No unlocked stories yet' : 'No bookmarks yet'}
              message={
                tab === 'Unlocked'
                  ? 'Place a demo order in the shop to unlock a story.'
                  : 'Bookmark a story to find it here.'
              }
              actionLabel={tab === 'Unlocked' ? 'Browse the shop' : 'Browse stories'}
              onAction={() => navigation.navigate('Main', { screen: tab === 'Unlocked' ? 'Shop' : 'Stories' })}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 } });
