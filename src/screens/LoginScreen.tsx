import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Logo } from '../components/Logo';
import { AppText } from '../components/AppText';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { hasErrors, validateContact, validatePassword } from '../utils/validation';

/** Screen 2: login with email/phone, password, remember me, Google placeholder. */
export default function LoginScreen() {
  const navigation = useRootNav();
  const { signIn, data } = useApp();
  const [contact, setContact] = useState(data.rememberedContact);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ contact?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next = { contact: validateContact(contact), password: validatePassword(password) };
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      await signIn(contact, password, remember);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch {
      Alert.alert('Could not sign in', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padBottom>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backLink}
          >
            <Ionicons name="chevron-back" size={24} color={colors.chocolate} />
          </Pressable>
          <Logo size={72} showWordmark showSubtitle style={styles.logo} />

          <AppText variant="title" style={styles.h}>
            Welcome Back
          </AppText>
          <AppText variant="body" color={colors.muted} style={styles.sub}>
            Sign in to continue your journey
          </AppText>

          <TextField
            icon="person-outline"
            placeholder="Email or phone number"
            value={contact}
            onChangeText={setContact}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="username"
            error={errors.contact}
          />
          <TextField
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            password
            autoCapitalize="none"
            autoComplete="password"
            error={errors.password}
          />

          <View style={styles.row}>
            <Pressable
              onPress={() => setRemember((r) => !r)}
              style={styles.remember}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
            >
              <View style={[styles.box, remember && styles.boxOn]}>
                {remember && <Ionicons name="checkmark" size={14} color={colors.cream} />}
              </View>
              <AppText variant="small">Remember me</AppText>
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Password reset',
                  'Password reset needs the CodeHills account service, which is not connected yet. In this demo, any valid email/phone and a password of 6+ characters will sign you in.',
                )
              }
            >
              <AppText variant="small" color={colors.caramel} style={styles.bold}>
                Forgot password?
              </AppText>
            </Pressable>
          </View>

          <Button title="Login" onPress={submit} loading={busy} style={styles.btn} />

          <View style={styles.or}>
            <View style={styles.line} />
            <AppText variant="caption" color={colors.muted} style={styles.orText}>
              or
            </AppText>
            <View style={styles.line} />
          </View>

          <Button
            title="Continue with Google"
            icon="logo-google"
            variant="secondary"
            onPress={() =>
              Alert.alert(
                'Google sign-in (placeholder)',
                'Google sign-in is not configured. It needs an OAuth client and backend support before it can work.',
              )
            }
          />

          <View style={styles.footer}>
            <AppText variant="small" color={colors.muted}>
              Don{'\u2019'}t have an account?{' '}
            </AppText>
            <Pressable onPress={() => navigation.navigate('Signup')} accessibilityRole="link">
              <AppText variant="small" color={colors.chocolate} style={styles.bold}>
                Sign up
              </AppText>
            </Pressable>
          </View>

          <AppText variant="caption" color={colors.muted} style={styles.demo}>
            Demo sign-in: no real account is created or verified.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 12 },
  backLink: { alignSelf: 'flex-start', marginBottom: 8 },
  logo: { marginBottom: 20 },
  h: { marginTop: 4 },
  sub: { marginBottom: 22, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.caramel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.chocolate, borderColor: colors.chocolate },
  bold: { fontFamily: 'Manrope_700Bold' },
  btn: { marginBottom: 6 },
  or: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { marginHorizontal: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  demo: { textAlign: 'center', marginTop: 14 },
});
