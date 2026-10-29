import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const CREAM = '#F7F0E5';

/** Button that stays readable on the dark photo background (text is always light). */
function OnDarkButton({
  title,
  onPress,
  filled = false,
}: {
  title: string;
  onPress: () => void;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.darkBtn,
        filled ? styles.darkBtnFilled : styles.darkBtnOutline,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.darkBtnText, filled && { color: colors.darkBrown }]}>{title}</Text>
    </Pressable>
  );
}

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
        {/* Multi-stop scrim: light enough to feel like a photo, dark enough for text everywhere. */}
        <LinearGradient
          colors={['rgba(43,33,27,0.78)', 'rgba(43,33,27,0.88)', 'rgba(43,33,27,0.96)', 'rgba(43,33,27,0.98)']}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </SmartImage>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}
      >
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
          <AppText variant="body" color="rgba(255,255,255,0.95)" style={styles.sub}>
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
              <AppText variant="small" color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
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
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Stories unlocked</Text>
            <Text style={styles.progressValue}>
              {unlocked} of {total}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, (unlocked / total) * 100)}%` }]} />
          </View>
        </View>

        <DemoNotice>
          Demo reward. No payment was taken, so this is not a verified transaction. Verified rewards need a real,
          confirmed order.
        </DemoNotice>

        <View style={{ marginTop: 18 }}>
          <OnDarkButton
            title="View order summary"
            onPress={() => navigation.navigate('OrderConfirmation', { orderId: order.id })}
          />
          <OnDarkButton
            title="Continue exploring"
            filled
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          />
        </View>
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
  title: {
    marginTop: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  sub: { marginTop: 6, textAlign: 'center' },
  card: {
    marginTop: 26,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.ochre,
    backgroundColor: 'rgba(43,33,27,0.85)',
  },
  cover: { height: 170 },
  cardBody: { padding: 16 },

  progress: { marginVertical: 22 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  progressValue: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: colors.ochre },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.28)', marginTop: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.ochre },

  darkBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  darkBtnOutline: {
    backgroundColor: 'rgba(247,240,229,0.14)',
    borderWidth: 1.5,
    borderColor: colors.ochre,
  },
  darkBtnFilled: { backgroundColor: CREAM },
  darkBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: CREAM },
});