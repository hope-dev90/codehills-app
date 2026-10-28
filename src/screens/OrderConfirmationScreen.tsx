import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { SmartImage } from '../components/SmartImage';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState, LoadingState } from '../components/StateViews';
import { colors, radius, shadow } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useStories } from '../hooks/useResource';
import { formatDate, formatRwf } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

const STEPS = ['Order placed', 'Preparing', 'On the way', 'Delivered'];

/** Screen 16: demo order summary, illustrative delivery progress and the linked story reward. */
export default function OrderConfirmationScreen() {
  const navigation = useRootNav();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderConfirmation'>>();
  const { data } = useApp();
  const stories = useStories();
  const order = data.orders.find((o) => o.id === params.orderId);

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

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
        <EmptyState icon="receipt-outline" title="Order not found" message="We could not find this order." actionLabel="Go home" onAction={goHome} />
      </Screen>
    );
  }
  const story = stories.data.find((s) => s.id === order.rewardStoryId);

  return (
    <Screen padBottom>
      <ScreenHeader title="Demo Order Placed" subtitle={`Order ${order.id} · ${formatDate(order.createdAt)}`} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.status}>
          <Ionicons name="information-circle" size={22} color={colors.chocolate} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText variant="subheading">Demo order, no payment taken</AppText>
            <AppText variant="small" color={colors.muted}>
              This order exists only on this device. Nothing was charged or shipped.
            </AppText>
          </View>
        </View>

        <AppText variant="heading" style={styles.h}>
          Summary
        </AppText>
        <View style={styles.card}>
          {order.lines.map((l) => (
            <View key={l.productId} style={styles.line}>
              <SmartImage imageKey={l.image} uri={l.imageUrl} style={styles.thumb} />
              <AppText variant="small" style={{ flex: 1, marginHorizontal: 10 }} numberOfLines={1}>
                {l.quantity} × {l.name}
              </AppText>
              <AppText variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
                {formatRwf(l.priceRwf * l.quantity)}
              </AppText>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={formatRwf(order.subtotalRwf)} />
          <Row label="Shipping (demo estimate)" value={formatRwf(order.shippingRwf)} />
          <Row label="Total" value={formatRwf(order.totalRwf)} strong />
        </View>

        <AppText variant="heading" style={styles.h}>
          Delivery progress (illustration)
        </AppText>
        <View style={styles.card}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.dot, i === 0 && styles.dotOn]}>
                  {i === 0 && <Ionicons name="checkmark" size={12} color={colors.cream} />}
                </View>
                {i < STEPS.length - 1 && <View style={styles.rule} />}
              </View>
              <AppText variant="small" color={i === 0 ? colors.darkBrown : colors.muted} style={i === 0 ? { fontFamily: 'Manrope_700Bold' } : undefined}>
                {s}
              </AppText>
            </View>
          ))}
          <AppText variant="caption" color={colors.muted} style={{ marginTop: 6 }}>
            Illustrative only. Real tracking needs the delivery backend.
          </AppText>
        </View>

        <AppText variant="heading" style={styles.h}>
          Story reward
        </AppText>
        {story ? (
          <View style={styles.reward}>
            <SmartImage imageKey={story.image} uri={story.imageUrl} style={styles.rewardImg} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="subheading" numberOfLines={2}>
                {story.title}
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                Demo reward
              </AppText>
              <Button title="View Story" variant="secondary" onPress={() => navigation.navigate('StoryDetails', { storyId: story.id })} style={styles.viewBtn} />
            </View>
          </View>
        ) : (
          <AppText variant="small" color={colors.muted}>
            No new story was unlocked by this order.
          </AppText>
        )}

        <View style={{ marginTop: 16 }}>
          <DemoNotice>Rewards from demo orders are not verified transactions.</DemoNotice>
        </View>
        <Button title="Continue exploring" onPress={goHome} style={{ marginTop: 20 }} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText variant={strong ? 'subheading' : 'small'} color={strong ? colors.darkBrown : colors.muted}>
        {label}
      </AppText>
      <AppText variant={strong ? 'heading' : 'small'}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  status: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.sandstone, borderRadius: radius.lg, padding: 14 },
  h: { marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow },
  line: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  thumb: { width: 40, height: 40, borderRadius: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  step: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 34 },
  rail: { width: 26, alignItems: 'center', marginRight: 10 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  dotOn: { backgroundColor: colors.chocolate, borderColor: colors.chocolate },
  rule: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2, minHeight: 14 },
  reward: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, ...shadow },
  rewardImg: { width: 92, height: 92, borderRadius: radius.md },
  viewBtn: { minHeight: 38, marginTop: 8, paddingHorizontal: 14 },
});
