import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { DestinationCard } from '../components/DestinationCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useDestinations } from '../hooks/useResource';

/** Places the user saved from the map. */
export default function SavedPlacesScreen() {
  const navigation = useRootNav();
  const { data, toggleSavedPlace } = useApp();
  const destinations = useDestinations();
  const saved = destinations.data.filter((d) => data.savedPlaces.includes(d.id));

  return (
    <Screen padBottom>
      <ScreenHeader title="Saved Places" showBack />
      {destinations.loading ? (
        <LoadingState />
      ) : destinations.error ? (
        <ErrorState message={destinations.error} onRetry={destinations.reload} />
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              saved
              onToggleSaved={() => toggleSavedPlace(item.id)}
              onPress={() => navigation.navigate('DestinationDetails', { destinationId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="No saved places"
              message="Tap the heart on a destination to save it."
              actionLabel="Explore the map"
              onAction={() => navigation.navigate('Main', { screen: 'Map' })}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 } });
