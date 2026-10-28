import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
import { useEvents } from '../hooks/useResource';
import type { RootStackParamList } from '../navigation/types';

/** Event details reached from the events list. */
export default function EventDetailsScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'EventDetails'>>();
  const events = useEvents();

  if (events.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  const e = events.data.find((x) => x.id === params.eventId);
  if (!e) {
    return (
      <Screen>
        <EmptyState
          icon="calendar-outline"
          title="Event not found"
          message="This event is not available."
          actionLabel="Back to events"
          onAction={() => navigation.navigate('Main', { screen: 'Events' })}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SmartImage imageKey={e.image} uri={e.imageUrl} style={styles.cover}>
          <LinearGradient colors={['rgba(43,33,27,0.4)', 'rgba(43,33,27,0)', 'rgba(43,33,27,0.85)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.actions, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
          </View>
          <View style={styles.titleWrap}>
            <AppText variant="display" color={colors.white}>
              {e.title}
            </AppText>
          </View>
        </SmartImage>
        <View style={styles.body}>
          <Meta icon="calendar-outline" text={e.dateLabel} />
          <Meta icon="location-outline" text={e.location} />
          <Meta icon="pricetag-outline" text={e.category} />
          <AppText variant="body" style={{ marginVertical: 16 }}>
            {e.description}
          </AppText>
          {e.isDemo && <DemoNotice>Demo event. Nothing here is a real listing, and no tickets or bookings are available.</DemoNotice>}
          <Button
            title="Back to events"
            variant="secondary"
            onPress={() => navigation.navigate('Main', { screen: 'Events' })}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={18} color={colors.caramel} />
      <AppText variant="body" style={{ marginLeft: 10 }}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  cover: { height: 320 },
  actions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  titleWrap: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  body: { padding: 20, marginTop: -20, backgroundColor: colors.cream, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});
