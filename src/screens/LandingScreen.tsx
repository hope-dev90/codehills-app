import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageSlider } from '../components/ImageSlider';
import { Logo } from '../components/Logo';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';

/** Screen 1: full-screen landscape, logo, tagline, Get Started / Skip. */
export default function LandingScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageSlider images={['heroLanding', 'slide2', 'slide3']} interval={2000} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(43,33,27,0.55)', 'rgba(43,33,27,0.05)', 'rgba(43,33,27,0.92)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}>
        <Logo size={96} showWordmark showSubtitle light />

        <View style={styles.bottom}>
          <AppText
            variant="display"
            color={colors.white}
            accessibilityLabel="Real Stories. Rich Culture. A Greater Rwanda."
            style={styles.tagline}
          >
            {'Real Stories.\nRich Culture.\nA Greater Rwanda.'}
          </AppText>
          <AppText variant="small" color="rgba(255,255,255,0.85)" style={styles.sub}>
            Explore · Shop · Earn · Discover
          </AppText>

          <Button
            title="Get Started"
            iconRight="arrow-forward"
            variant="onDark"
            onPress={() => navigation.navigate('Login')}
            style={styles.btn}
          />
          <Button
            title="Skip"
            variant="ghost"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
            style={styles.skip}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkBrown },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  bottom: { width: '100%' },
  tagline: { fontSize: 34, lineHeight: 40 },
  sub: { marginTop: 12, marginBottom: 22 },
  btn: { width: '100%' },
  skip: { marginTop: 4 },
});
