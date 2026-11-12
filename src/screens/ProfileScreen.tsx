import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { colors, radius, shadow } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';

type IconName = keyof typeof Ionicons.glyphMap;

const LANGUAGE_NAMES = { en: 'English', rw: 'Kinyarwanda', fr: 'Français' } as const;

/** Screen 17: user details and links to orders, stories, business, places, settings. */
export default function ProfileScreen() {
  const navigation = useRootNav();
  const { data, signOut, deleteAccount } = useApp();
  const toast = useToast();
  const user = data.user;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const doSignOut = async () => {
    setConfirmOpen(false);
    if (user) await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  };

  const doDeleteAccount = async () => {
    setDeleteOpen(false);
    try {
      await deleteAccount();
      toast('Your account has been deleted');
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not delete your account. Please try again.');
    }
  };

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
            {user?.isDemo && (
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
          onPress={() => setConfirmOpen(true)}
          style={{ marginTop: 18 }}
        />

        {user && (
          <Button
            title="Delete account"
            variant="ghost"
            icon="trash-outline"
            onPress={() => setDeleteOpen(true)}
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title={user ? 'Sign out?' : 'Exit to landing?'}
        message={
          user
            ? 'You will need to sign in again to access your account.'
            : 'You will return to the landing screen.'
        }
        confirmText={user ? 'Sign out' : 'Exit'}
        cancelText="Cancel"
        confirmVariant={user ? 'danger' : 'primary'}
        icon="log-out-outline"
        onConfirm={doSignOut}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        visible={deleteOpen}
        title="Delete account?"
        message="This permanently deletes your account, orders, saved items and business. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        icon="trash-outline"
        onConfirm={doDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
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
});
