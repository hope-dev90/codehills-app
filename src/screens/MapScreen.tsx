import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { ChipRow } from '../components/Chip';
import { RwandaMap } from '../components/RwandaMap';
import { DestinationCard } from '../components/DestinationCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { colors } from '../theme';
import { AppText } from '../components/AppText';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useDestinations } from '../hooks/useResource';

const FILTERS = ['All', 'Nature', 'Lakes', 'Culture', 'City'];

/** Screen 11: map of Rwanda with markers, category filters and destination cards. */
export default function MapScreen() {
  const navigation = useRootNav();
  const { data, toggleSavedPlace } = useApp();
  const destinations = useDestinations();
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const visible = useMemo(
    () => destinations.data.filter((d) => filter === 'All' || d.category === filter),
    [destinations.data, filter],
  );

  return (
    <Screen>
      <ScreenHeader title="Explore Rwanda" subtitle="Places to discover. Approximate marker positions." showBack />
      <View style={styles.chips}>
        <ChipRow options={FILTERS} value={filter} onChange={(f) => { setFilter(f); setSelectedId(undefined); }} />
      </View>

      {destinations.loading ? (
        <LoadingState />
      ) : destinations.error ? (
        <ErrorState message={destinations.error} onRetry={destinations.reload} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <RwandaMap
            destinations={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height={270}
          />
          <AppText variant="caption" color={colors.muted} style={styles.note}>
            Sample places. Distances are not shown until a real location service is connected.
          </AppText>

          <View style={{ marginTop: 14 }}>
            {visible.length === 0 ? (
              <EmptyState icon="location-outline" title="No places in this category" message="Try another category." actionLabel="Show all" onAction={() => setFilter('All')} />
            ) : (
              visible.map((d) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  selected={d.id === selectedId}
                  saved={data.savedPlaces.includes(d.id)}
                  onToggleSaved={() => toggleSavedPlace(d.id)}
                  onPress={() => {
                    setSelectedId(d.id);
                    navigation.navigate('DestinationDetails', { destinationId: d.id });
                  }}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { marginBottom: 12 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  note: { marginTop: 8, marginLeft: 4 },
});
