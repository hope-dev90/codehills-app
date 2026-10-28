import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState, LoadingState } from '../components/StateViews';
import { useRootNav } from '../hooks/useRootNav';
import { useLearningResources } from '../hooks/useResource';
import type { RootStackParamList } from '../navigation/types';

/** Business-learning lesson opened from the dashboard. */
export default function LearningResourceScreen() {
  const navigation = useRootNav();
  const { params } = useRoute<RouteProp<RootStackParamList, 'LearningResource'>>();
  const resources = useLearningResources();
  const item = resources.data.find((r) => r.id === params.resourceId);

  return (
    <Screen padBottom>
      <ScreenHeader title={item?.title ?? 'Lesson'} showBack />
      {resources.loading ? (
        <LoadingState />
      ) : !item ? (
        <EmptyState icon="school-outline" title="Lesson not found" actionLabel="Go back" onAction={() => navigation.goBack()} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {item.body.map((p, i) => (
            <AppText key={i} variant="body" style={{ marginBottom: 14 }}>
              {p}
            </AppText>
          ))}
          {item.isDemo && <DemoNotice>Sample lesson text. Real learning content will be provided by CodeHills.</DemoNotice>}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ scroll: { paddingHorizontal: 20, paddingBottom: 24 } });
