import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { Logo } from '../components/Logo';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';

/** Screen 18: final onboarding after sign-up. */
export default function OnboardingScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const enter = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SmartImage imageKey="heroOnboarding" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(43,33,27,0.5)', 'rgba(43,33,27,0.1)', 'rgba(43,33,27,0.92)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </SmartImage>
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <Logo size={92} showWordmark light />
        <View style={styles.bottom}>
          <AppText
            variant="display"
            color={colors.white}
            accessibilityLabel="Explore Rwanda. Support Local. Keep the Stories Alive."
            style={styles.title}
          >
            {'Explore Rwanda.\nSupport Local.\nKeep the Stories Alive.'}
          </AppText>
          <Button title="Get Started" iconRight="arrow-forward" variant="onDark" onPress={enter} style={styles.btn} />
          <Button title="Skip" variant="ghost" onPress={enter} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkBrown },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  bottom: { width: '100%' },
  title: { fontSize: 32, lineHeight: 39, marginBottom: 24 },
  btn: { width: '100%' },
});
