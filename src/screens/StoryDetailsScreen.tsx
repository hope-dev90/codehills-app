import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { IconButton } from '../components/ScreenHeader';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors, radius } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';
import type { RootStackParamList } from '../navigation/types';

/** Screen 6: story with cover, narrative, tags, gallery, bookmark and Read Next. */
export default function StoryDetailsScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'StoryDetails'>>();
  const { data, toggleBookmark } = useApp();
  const stories = useStories();

  if (stories.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  const index = stories.data.findIndex((s) => s.id === params.storyId);
  const story = index >= 0 ? stories.data[index] : undefined;

  if (!story) {
    return (
      <Screen>
        <EmptyState
          icon="book-outline"
          title="Story not found"
          message="This story is not available."
          actionLabel="Back to stories"
          onAction={() => navigation.navigate('Main', { screen: 'Stories' })}
        />
      </Screen>
    );
  }

  const bookmarked = data.bookmarks.includes(story.id);
  const next = stories.data[(index + 1) % stories.data.length];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SmartImage imageKey={story.image} uri={story.imageUrl} style={styles.cover}>
          <LinearGradient
            colors={['rgba(43,33,27,0.45)', 'rgba(43,33,27,0)', 'rgba(43,33,27,0.9)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.actions, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
            <IconButton
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              label={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
              onPress={() => toggleBookmark(story.id)}
              tint={bookmarked ? colors.caramel : colors.chocolate}
            />
          </View>
          <View style={styles.titleWrap}>
            <AppText variant="display" color={colors.white}>
              {story.title}
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
              {story.subtitle}
            </AppText>
          </View>
        </SmartImage>

        <View style={styles.body}>
          <View style={styles.tags}>
            {[story.category, ...story.tags.filter((t) => t !== story.category)].map((t) => (
              <View key={t} style={styles.tag}>
                <AppText variant="caption" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {t}
                </AppText>
              </View>
            ))}
          </View>

          {story.body.map((p, i) => (
            <AppText key={i} variant="body" style={styles.para}>
              {p}
            </AppText>
          ))}

          {story.isDemo && (
            <DemoNotice>
              This is sample text, not verified heritage content. Verified stories will come from the CodeHills
              content library.
            </DemoNotice>
          )}

          {story.gallery.length > 0 && (
            <>
              <AppText variant="heading" style={styles.gh}>
                Related images
              </AppText>
              <View style={styles.gallery}>
                {story.gallery.map((g) => (
                  <SmartImage key={g} imageKey={g} style={styles.thumb} />
                ))}
              </View>
            </>
          )}

          {next && next.id !== story.id && (
            <Button
              title="Read next"
              iconRight="arrow-forward"
              onPress={() => navigation.push('StoryDetails', { storyId: next.id })}
              style={styles.next}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  cover: { height: 420, justifyContent: 'space-between' },
  actions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  titleWrap: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  body: { padding: 20, backgroundColor: colors.cream, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: colors.sandstone, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  para: { marginBottom: 14 },
  gh: { marginTop: 22, marginBottom: 10 },
  gallery: { flexDirection: 'row', gap: 10 },
  thumb: { flex: 1, height: 90, borderRadius: radius.md },
  next: { marginTop: 24 },
});
