import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { EventCard } from '../components/EventCard';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useRootNav } from '../hooks/useRootNav';
import { useEvents } from '../hooks/useResource';

/** Screen 12: cultural events, festivals and coffee experiences. All entries are demo data. */
export default function EventsScreen() {
  const navigation = useRootNav();
  const events = useEvents();

  return (
    <Screen>
      <ScreenHeader
        title="Upcoming Events"
        subtitle="Culture, festivals and coffee experiences"
        showBack
        onBack={() => navigation.navigate('Main', { screen: 'Home' })}
      />
      {events.loading ? (
        <LoadingState />
      ) : events.error ? (
        <ErrorState message={events.error} onRetry={events.reload} />
      ) : (
        <FlatList
          data={events.data}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <DemoNotice>These are sample events for demonstration. Real events and dates will come from the CodeHills backend.</DemoNotice>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => navigation.navigate('EventDetails', { eventId: item.id })} />
          )}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No events yet" message="Check back soon." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
});
