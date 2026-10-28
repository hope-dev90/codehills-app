import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { IconButton } from '../components/ScreenHeader';
import { colors, radius } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { hasErrors, validateContact, validatePassword, validateRequired } from '../utils/validation';

/** Screen 3: sign up with validation. */
export default function SignupScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { signUp } = useApp();
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next = {
      fullName: validateRequired(fullName, 'your full name', 2),
      contact: validateContact(contact),
      password: validatePassword(password),
      confirm: !confirm ? 'Confirm your password' : confirm !== password ? 'Passwords do not match' : undefined,
    };
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      await signUp(fullName, contact, password);
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } catch {
      Alert.alert('Could not create account', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <SmartImage imageKey="hills" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['rgba(43,33,27,0.35)', 'rgba(43,33,27,0.85)']} style={StyleSheet.absoluteFill} />
      </SmartImage>

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
        <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
        <AppText variant="title" color={colors.white} style={styles.h}>
          Create Your Account
        </AppText>
        <AppText variant="small" color="rgba(255,255,255,0.9)" style={styles.sub}>
          Join CodeHills and explore Rwanda like never before.
        </AppText>
      </View>

      <KeyboardAvoidingView style={styles.sheetWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={{ padding: 22, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextField icon="person-outline" placeholder="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" error={errors.fullName} />
          <TextField
            icon="mail-outline"
            placeholder="Email or phone number"
            value={contact}
            onChangeText={setContact}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.contact}
          />
          <TextField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} password autoCapitalize="none" error={errors.password} />
          <TextField icon="lock-closed-outline" placeholder="Confirm password" value={confirm} onChangeText={setConfirm} password autoCapitalize="none" error={errors.confirm} />

          <Button title="Sign Up" onPress={submit} loading={busy} style={styles.btn} />

          <View style={styles.footer}>
            <AppText variant="small" color={colors.muted}>
              Already have an account?{' '}
            </AppText>
            <Pressable onPress={() => navigation.replace('Login')} accessibilityRole="link">
              <AppText variant="small" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                Login
              </AppText>
            </Pressable>
          </View>
          <AppText variant="caption" color={colors.muted} style={styles.demo}>
            Demo sign-up: no real account is created or verified.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkBrown },
  h: { marginTop: 24 },
  sub: { marginTop: 4, marginBottom: 20 },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    flexGrow: 0,
    maxHeight: '78%',
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  btn: { marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  demo: { textAlign: 'center', marginTop: 12 },
});
