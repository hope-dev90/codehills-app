import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { colors, radius, shadow } from '../theme';
import { config } from '../services/config';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';

type IconName = keyof typeof Ionicons.glyphMap;

const LANGUAGE_NAMES = { en: 'English', rw: 'Kinyarwanda', fr: 'Français' } as const;

/** Screen 17: user details and links to orders, stories, business, places, settings. */
export default function ProfileScreen() {
  const navigation = useRootNav();
  const { data, signOut } = useApp();
  const user = data.user;

  const rows: { icon: IconName; label: string; detail?: string; onPress: () => void }[] = [
    { icon: 'receipt-outline', label: 'My Orders', detail: String(data.orders.length), onPress: () => navigation.navigate('MyOrders') },
    { icon: 'book-outline', label: 'My Stories', detail: String(data.unlockedStories.length), onPress: () => navigation.navigate('MyStories') },
    {
      icon: 'storefront-outline',
      label: 'My Business',
      detail: data.business ? data.business.name : undefined,
      onPress: () => navigation.navigate(data.business ? 'BusinessDashboard' : 'StartBusiness'),
    },
    { icon: 'heart-outline', label: 'Saved Places', detail: String(data.savedPlaces.length), onPress: () => navigation.navigate('SavedPlaces') },
    { icon: 'language-outline', label: 'Language', detail: LANGUAGE_NAMES[data.preferences.language], onPress: () => navigation.navigate('Language') },
    { icon: 'help-circle-outline', label: 'Help', onPress: () => navigation.navigate('Help') },
    { icon: 'information-circle-outline', label: 'About CodeHills', onPress: () => navigation.navigate('About') },
  ];

  const confirmSignOut = () =>
    Alert.alert(
      user ? 'Sign out' : 'Exit',
      user ? 'Your demo data stays on this device.' : 'You will return to the landing screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: user ? 'Sign out' : 'Exit',
          style: 'destructive',
          onPress: async () => {
            if (user) await signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
          },
        },
      ],
    );

  return (
    <Screen>
      <ScreenHeader title="Profile" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.cream} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <AppText variant="heading" numberOfLines={1}>
              {user ? user.fullName : 'Guest'}
            </AppText>
            <AppText variant="small" color={colors.muted} numberOfLines={1}>
              {user ? user.contact : 'You are browsing without an account'}
            </AppText>
            {user && (
              <AppText variant="caption" color={colors.caramel} style={{ marginTop: 2 }}>
                Demo account
              </AppText>
            )}
          </View>
        </View>

        {!user && (
          <View style={{ marginBottom: 14 }}>
            <Button title="Login or sign up" icon="log-in-outline" onPress={() => navigation.navigate('Login')} />
          </View>
        )}

        <View style={styles.list}>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              onPress={r.onPress}
              accessibilityRole="button"
              accessibilityLabel={r.label}
              style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
            >
              <Ionicons name={r.icon} size={22} color={colors.caramel} />
              <AppText variant="subheading" style={{ flex: 1, marginLeft: 14 }}>
                {r.label}
              </AppText>
              {r.detail ? (
                <AppText variant="small" color={colors.muted} numberOfLines={1} style={styles.detail}>
                  {r.detail}
                </AppText>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <Button
          title={user ? 'Sign out' : 'Exit to landing'}
          variant="secondary"
          icon="log-out-outline"
          onPress={confirmSignOut}
          style={{ marginTop: 18 }}
        />

        <AppText variant="caption" color={colors.muted} style={styles.version}>
          {config.appVersionLabel}
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 14, ...shadow },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.chocolate, alignItems: 'center', justifyContent: 'center' },
  list: { backgroundColor: colors.white, borderRadius: radius.lg, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detail: { marginRight: 8, maxWidth: 120 },
  version: { textAlign: 'center', marginTop: 20 },
});
