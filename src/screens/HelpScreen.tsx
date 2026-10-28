import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { colors, radius } from '../theme';
import { useApp } from '../hooks/AppContext';
import { useRootNav } from '../hooks/useRootNav';

const FAQ = [
  { q: 'Is my order real?', a: 'No. Checkout is a demo: no payment is taken and nothing is shipped.' },
  { q: 'Where is my data stored?', a: 'Cart, bookmarks, favorites and your demo business are stored on this device only.' },
  { q: 'Are the stories verified?', a: 'Not yet. Stories, events and places are samples. Verified content will come from the CodeHills content library.' },
];

/** Basic help with a way to reset the local demo data. */
export default function HelpScreen() {
  const { resetDemoData } = useApp();
  const navigation = useRootNav();

  const reset = () =>
    Alert.alert('Reset demo data', 'This clears your cart, orders, bookmarks, favorites and demo business from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetDemoData();
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
        },
      },
    ]);

  return (
    <Screen padBottom>
      <ScreenHeader title="Help" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {FAQ.map((f) => (
          <View key={f.q} style={styles.card}>
            <AppText variant="subheading">{f.q}</AppText>
            <AppText variant="small" color={colors.muted} style={{ marginTop: 4 }}>
              {f.a}
            </AppText>
          </View>
        ))}
        <AppText variant="small" color={colors.muted} style={{ marginVertical: 12 }}>
          A real support contact will be added once CodeHills provides it.
        </AppText>
        <Button title="Reset demo data" variant="secondary" icon="refresh-outline" onPress={reset} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 10 },
});
