import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { IconButton } from '../components/ScreenHeader';
import { colors, radius } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';
import type { RootStackParamList } from '../navigation/types';

/** Screen 10: story reward unlocked by a (demo) order. */
export default function RewardScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Reward'>>();
  const { data } = useApp();
  const stories = useStories();

  const order = data.orders.find((o) => o.id === params.orderId);

  if (stories.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (!order) {
    return (
      <Screen>
        <EmptyState
          icon="gift-outline"
          title="Order not found"
          message="We could not find this order."
          actionLabel="Go home"
          onAction={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        />
      </Screen>
    );
  }

  const story = stories.data.find((s) => s.id === order.rewardStoryId);
  const unlocked = data.unlockedStories.length;
  const total = stories.data.length || 1;

  return (
    <View style={styles.root}>
      <SmartImage imageKey="heroOnboarding" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['rgba(43,33,27,0.7)', 'rgba(43,33,27,0.95)']} style={StyleSheet.absoluteFill} />
      </SmartImage>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.backRow}>
          <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.center}>
          <View style={styles.medal}>
            <Ionicons name="gift" size={32} color={colors.chocolate} />
          </View>
          <AppText variant="display" color={colors.white} style={styles.title}>
            You{'\u2019'}ve Been Rewarded!
          </AppText>
          <AppText variant="body" color="rgba(255,255,255,0.88)" style={styles.sub}>
            {story ? 'Your demo order unlocked a new story.' : 'You have already unlocked every sample story.'}
          </AppText>
        </View>

        {story && (
          <View style={styles.card}>
            <SmartImage imageKey={story.image} uri={story.imageUrl} style={styles.cover} />
            <View style={styles.cardBody}>
              <AppText variant="heading" color={colors.white}>
                {story.title}
              </AppText>
              <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>
                {story.summary}
              </AppText>
              <Button
                title="View Story"
                variant="onDark"
                iconRight="arrow-forward"
                onPress={() => navigation.replace('StoryDetails', { storyId: story.id })}
                style={{ marginTop: 14 }}
              />
            </View>
          </View>
        )}

        <View style={styles.progress}>
          <AppText variant="small" color="rgba(255,255,255,0.88)">
            Stories unlocked: {unlocked} of {total}
          </AppText>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, (unlocked / total) * 100)}%` }]} />
          </View>
        </View>

        <DemoNotice>
          Demo reward. No payment was taken, so this is not a verified transaction. Verified rewards need a real,
          confirmed order.
        </DemoNotice>

        <Button
          title="View order summary"
          variant="secondary"
          onPress={() => navigation.navigate('OrderConfirmation', { orderId: order.id })}
          style={styles.second}
        />
        <Button
          title="Continue exploring"
          variant="ghost"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkBrown },
  scroll: { paddingHorizontal: 22 },
  backRow: { alignSelf: 'flex-start', marginBottom: 8 },
  center: { alignItems: 'center' },
  medal: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.ochre, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 18, textAlign: 'center' },
  sub: { marginTop: 6, textAlign: 'center' },
  card: { marginTop: 26, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.ochre, backgroundColor: 'rgba(43,33,27,0.6)' },
  cover: { height: 170 },
  cardBody: { padding: 16 },
  progress: { marginVertical: 22 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.ochre },
  second: { marginTop: 16, backgroundColor: 'rgba(247,240,229,0.12)', borderColor: colors.ochre },
});
