import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { IconButton } from '../components/ScreenHeader';
import { DemoNotice } from '../components/DemoBadge';
import { colors, radius } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';

type IconName = keyof typeof Ionicons.glyphMap;

const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'cube-outline', title: 'Access to materials', text: 'Find local materials for your craft.' },
  { icon: 'school-outline', title: 'Business learning', text: 'Learn the basics of running a small business.' },
  { icon: 'megaphone-outline', title: 'Product promotion', text: 'Showcase your products to CodeHills customers.' },
  { icon: 'people-outline', title: 'A growing community', text: 'Share your story with people who value it.' },
];

/** Screen 13: artisan photo, planned benefits and Create Your Business. */
export default function StartBusinessScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { data } = useApp();
  const hasBusiness = !!data.business;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SmartImage imageKey="artisan" style={styles.cover}>
          <LinearGradient colors={['rgba(43,33,27,0.45)', 'rgba(43,33,27,0)', 'rgba(43,33,27,0.9)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.actions, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
          </View>
          <View style={styles.titleWrap}>
            <AppText variant="display" color={colors.white}>
              Start Your Business
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
              Turn your passion into a sustainable business with CodeHills.
            </AppText>
          </View>
        </SmartImage>

        <View style={styles.body}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefit}>
              <View style={styles.icon}>
                <Ionicons name={b.icon} size={20} color={colors.cream} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="subheading">{b.title}</AppText>
                <AppText variant="small" color={colors.muted}>
                  {b.text}
                </AppText>
              </View>
            </View>
          ))}
          <DemoNotice>Planned program benefits, shown as sample copy. The final program details will come from CodeHills.</DemoNotice>

          {hasBusiness ? (
            <>
              <Button title="Open My Dashboard" icon="speedometer-outline" onPress={() => navigation.navigate('BusinessDashboard')} style={styles.cta} />
            </>
          ) : (
            <Button title="Create Your Business" icon="storefront-outline" onPress={() => navigation.navigate('CreateBusiness')} style={styles.cta} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  cover: { height: 340 },
  actions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  titleWrap: { position: 'absolute', left: 20, right: 20, bottom: 26 },
  body: { padding: 20, marginTop: -20, backgroundColor: colors.cream, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  benefit: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 14, borderRadius: radius.lg, marginBottom: 10 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.chocolate, alignItems: 'center', justifyContent: 'center' },
  cta: { marginTop: 22 },
});
