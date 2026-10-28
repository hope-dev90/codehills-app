import React from 'react';
import { Linking, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Logo } from '../components/Logo';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DemoNotice } from '../components/DemoBadge';
import { colors } from '../theme';
import { config } from '../services/config';

/** About CodeHills. */
export default function AboutScreen() {
  const openSite = async () => {
    try {
      await Linking.openURL(config.contentWebsite);
    } catch {
      Alert.alert('Could not open the website', config.contentWebsite);
    }
  };

  return (
    <Screen padBottom>
      <ScreenHeader title="About CodeHills" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.center}>
          <Logo size={96} showWordmark showSubtitle />
          <AppText variant="small" color={colors.muted} style={{ marginTop: 6 }}>
            {config.appVersionLabel}
          </AppText>
        </View>
        <AppText variant="body" style={styles.p}>
          CodeHills promotes Rwanda{'\u2019'}s cultural heritage, tourism, traditional products and local entrepreneurs.
        </AppText>
        <AppText variant="body" style={styles.p}>
          Heritage content will be connected to the materials published by the CodeHills team at {config.contentWebsite}.
        </AppText>
        <DemoNotice>
          This build uses sample content and a demo checkout. Backend, authentication, real payments and verified
          content are not connected yet.
        </DemoNotice>
        <Button title="Visit the website" icon="open-outline" variant="secondary" onPress={openSite} style={{ marginTop: 20 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  center: { alignItems: 'center', marginVertical: 18 },
  p: { marginBottom: 14 },
});
