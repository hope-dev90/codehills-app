import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { Logo } from '../components/Logo';
import { AppText } from '../components/AppText';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { images } from '../data/images';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { hasErrors, validateContact, validatePassword } from '../utils/validation';

/**
 * ASSETS TO REPLACE (same file names, in assets/images):
 *  - login_bg.jpg        faded mountain photo shown behind the top of the screen
 *  - imigongo_tile.png   one repeating imigongo tile; it is tiled along the bottom edge
 *  - google_g.png        the multicolour Google "G"
 *  - logo.png            the CodeHills logo (shared with other screens)
 */
const BG_HEIGHT = 330;
const STRIP_HEIGHT = 30;

/** Screen 2: Login. */
export default function LoginScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { signIn, data } = useApp();
  const [contact, setContact] = useState(data.rememberedContact);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ contact?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const tiles = Math.ceil(width / STRIP_HEIGHT);

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
    <View style={styles.root}>
      {/* Faded mountain background that melts into the cream page */}
      <SmartImage imageKey="loginBg" style={[styles.bg, { height: BG_HEIGHT }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247,240,229,0.35)' }]} />
        <LinearGradient
          colors={['rgba(247,240,229,0)', 'rgba(247,240,229,0.75)', colors.cream]}
          locations={[0, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </SmartImage>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24, paddingBottom: STRIP_HEIGHT + insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo size={64} showWordmark showSubtitle style={styles.logo} />

          <AppText style={styles.h}>Welcome Back</AppText>
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
                {remember && <Ionicons name="checkmark" size={13} color={colors.cream} />}
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
              <AppText variant="small" style={styles.bold}>
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

          <Pressable
            style={styles.google}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            onPress={() =>
              Alert.alert(
                'Google sign-in (placeholder)',
                'Google sign-in is not configured. It needs an OAuth client and backend support before it can work.',
              )
            }
          >
            <Image source={images.googleG} style={styles.g} contentFit="contain" />
            <AppText variant="small" style={styles.googleText}>
              Continue with Google
            </AppText>
          </Pressable>

          <View style={styles.footer}>
            <AppText variant="small" color={colors.muted}>
              Don't have an account?{' '}
            </AppText>
            <Pressable onPress={() => navigation.navigate('Signup')} accessibilityRole="link">
              <AppText variant="small" style={styles.bold}>
                Sign up
              </AppText>
            </Pressable>
          </View>

          <AppText variant="caption" color={colors.muted} style={styles.demo}>
            Demo sign-in: no real account is created or verified.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Imigongo strip along the bottom edge (one tile, repeated) */}
      <View
        pointerEvents="none"
        style={[styles.strip, { height: STRIP_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}
      >
        {Array.from({ length: tiles }).map((_, i) => (
          <Image
            key={i}
            source={images.imigongoTile}
            style={{ width: STRIP_HEIGHT, height: STRIP_HEIGHT }}
            contentFit="cover"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  bg: { position: 'absolute', top: 0, left: 0, right: 0 },
  scroll: { paddingHorizontal: 24 },
  logo: { marginBottom: 26 },
  h: { fontFamily: 'Manrope_800ExtraBold', fontSize: 30, lineHeight: 36, color: colors.darkBrown },
  sub: { marginTop: 2, marginBottom: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxOn: { backgroundColor: colors.chocolate },
  bold: { fontFamily: 'Manrope_700Bold', color: colors.chocolate },
  btn: { minHeight: 56 },
  or: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { marginHorizontal: 12 },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  g: { width: 20, height: 20, marginRight: 10 },
  googleText: { fontFamily: 'Manrope_600SemiBold', color: colors.darkBrown },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  demo: { textAlign: 'center', marginTop: 12 },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    opacity: 0.55,
    backgroundColor: colors.sandstone,
  },
});