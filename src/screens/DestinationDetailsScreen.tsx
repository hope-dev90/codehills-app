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
import { useDestinations } from '../hooks/useResource';
import type { RootStackParamList } from '../navigation/types';

/** Destination details reached from the map. */
export default function DestinationDetailsScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'DestinationDetails'>>();
  const { data, toggleSavedPlace } = useApp();
  const destinations = useDestinations();

  if (destinations.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  const d = destinations.data.find((x) => x.id === params.destinationId);
  if (!d) {
    return (
      <Screen>
        <EmptyState
          icon="location-outline"
          title="Place not found"
          message="This destination is not available."
          actionLabel="Back to map"
          onAction={() => navigation.navigate('Main', { screen: 'Map' })}
        />
      </Screen>
    );
  }
  const saved = data.savedPlaces.includes(d.id);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SmartImage imageKey={d.image} uri={d.imageUrl} style={styles.cover}>
          <LinearGradient colors={['rgba(43,33,27,0.4)', 'rgba(43,33,27,0)', 'rgba(43,33,27,0.85)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.actions, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
            <IconButton
              name={saved ? 'heart' : 'heart-outline'}
              label={saved ? 'Remove from saved places' : 'Save place'}
              tint={saved ? colors.caramel : colors.chocolate}
              onPress={() => toggleSavedPlace(d.id)}
            />
          </View>
          <View style={styles.titleWrap}>
            <AppText variant="display" color={colors.white}>
              {d.name}
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.9)">
              {d.category}
            </AppText>
          </View>
        </SmartImage>
        <View style={styles.body}>
          <AppText variant="body">{d.description}</AppText>
          <View style={styles.coords}>
            <AppText variant="caption" color={colors.muted}>
              Approximate location: {d.latitude.toFixed(2)}, {d.longitude.toFixed(2)}
            </AppText>
          </View>
          {d.isDemo && (
            <DemoNotice>Demo entry. Description and position are placeholders, and no distances or opening times are shown.</DemoNotice>
          )}
          <Button
            title="Back to map"
            icon="map-outline"
            variant="secondary"
            onPress={() => navigation.navigate('Main', { screen: 'Map' })}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  cover: { height: 340 },
  actions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  titleWrap: { position: 'absolute', left: 20, right: 20, bottom: 24 },
  body: { padding: 20, marginTop: -20, backgroundColor: colors.cream, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  coords: { marginVertical: 14 },
});
