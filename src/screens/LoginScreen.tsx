import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { hasErrors, validateContact, validatePassword } from '../utils/validation';
import { Logo } from '../components/Logo';
/**
 * ASSETS TO REPLACE (same file names, in assets/images):
 *  - login_bg.jpg        faded mountain photo shown behind the top of the screen
 *  - logo.png            the CodeHills logo (shared with other screens)
 *
 * The Google "G" and the imigongo strip are drawn as inline SVG (react-native-svg),
 * so they need no bitmap assets.
 */
// Layout measured from the design reference (dp).
const BG_HEIGHT = 300;
const STRIP_HEIGHT = 30;
const LOGO_SIZE = 70;
const SIDE_PADDING = 30;

// Bundled images (replace these two files with your own, keeping the names).
const LOGIN_BG = require('../../assets/images/login_bg.jpg');


/** Compact input used on this screen: 44dp high, 12dp radius, 13dp text. */
function Field({
  icon,
  error,
  password = false,
  ...rest
}: Omit<TextInputProps, 'style'> & {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  password?: boolean;
}) {
  const [hidden, setHidden] = useState(password);
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrap}>
      <View
        style={[
          fieldStyles.field,
          focused && { borderColor: colors.caramel },
          !!error && { borderColor: colors.danger },
        ]}
      >
        <Ionicons name={icon} size={19} color={colors.caramel} style={fieldStyles.icon} />
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor="#A39283"
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={fieldStyles.input}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error ? <AppText style={fieldStyles.error}>{error}</AppText> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13, color: colors.darkBrown, paddingVertical: 8 },
  error: { marginTop: 4, marginLeft: 4, fontFamily: 'Manrope_500Medium', fontSize: 11, color: colors.danger },
});

/** Repeating imigongo diamond motif, drawn as a tiled SVG pattern. */
function ImigongoPattern({
  id,
  color,
  style,
}: {
  id: string;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Svg style={style} width="100%" height="100%">
      <Defs>
        <Pattern id={id} width={56} height={56} patternUnits="userSpaceOnUse">
          <Path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke={color} strokeWidth={2} />
          <Path d="M28 12 L44 28 L28 44 L12 28 Z" fill="none" stroke={color} strokeWidth={2} />
          <Path d="M28 22 L34 28 L28 34 L22 28 Z" fill={color} />
          <Path
            d="M0 0 L6 0 L0 6 Z M56 0 L50 0 L56 6 Z M0 56 L6 56 L0 50 Z M56 56 L50 56 L56 50 Z"
            fill={color}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** The multicolour Google "G", drawn as inline SVG. */
function GoogleIcon({ size = 20, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg style={style} width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

/** Screen 2: Login. */
export default function LoginScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      {/* Faded mountain background that melts into the cream page */}
      <View style={[styles.bg, { height: BG_HEIGHT }]}>
        <Image source={LOGIN_BG} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247,240,229,0.35)' }]} />
        <LinearGradient
          colors={['rgba(247,240,229,0)', 'rgba(247,240,229,0.75)', colors.cream]}
          locations={[0, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 32, paddingBottom: STRIP_HEIGHT + insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBlock}>
            <Logo size={LOGO_SIZE} />
            <AppText style={styles.wordmark}>CodeHills</AppText>
            <AppText style={styles.tagline}>Heritage   ·   Culture   ·   Business</AppText>
          </View>

          <AppText style={styles.h}>Welcome Back</AppText>
          <AppText style={styles.sub}>
            Sign in to continue your journey
          </AppText>

          <Field
            icon="person-outline"
            placeholder="Email or phone number"
            value={contact}
            onChangeText={setContact}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="username"
            error={errors.contact}
          />
          <Field
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
              <AppText style={styles.small}>Remember me</AppText>
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Password reset',
                  'Password reset needs the CodeHills account service, which is not connected yet. In this demo, any valid email/phone and a password of 6+ characters will sign you in.',
                )
              }
            >
              <AppText style={[styles.small, styles.bold]}>
                Forgot password?
              </AppText>
            </Pressable>
          </View>

          <Button title="Login" onPress={submit} loading={busy} style={styles.btn} />

          <View style={styles.or}>
            <View style={styles.line} />
            <AppText style={styles.orText}>
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
            <GoogleIcon size={20} style={styles.g} />
            <AppText style={styles.googleText}>
              Continue with Google
            </AppText>
          </Pressable>

          <View style={styles.footer}>
            <AppText style={[styles.small, { color: colors.muted }]}>
              Don&apos;t have an account?{' '}
            </AppText>
            <Pressable onPress={() => navigation.navigate('Signup')} accessibilityRole="link">
              <AppText style={[styles.small, styles.bold]}>
                Sign up
              </AppText>
            </Pressable>
          </View>

          <AppText style={styles.demo}>
            Demo sign-in: no real account is created or verified.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Imigongo strip along the bottom edge (SVG pattern, tiled) */}
      <View
        pointerEvents="none"
        style={[styles.strip, { height: STRIP_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}
      >
        <ImigongoPattern id="imigongo-strip" color={colors.caramel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  bg: { position: 'absolute', top: 0, left: 0, right: 0 },
  scroll: { paddingHorizontal: SIDE_PADDING },

  // Logo block: 70dp symbol, 30dp wordmark, 11dp tagline
  logoBlock: { alignItems: 'center', marginBottom: 30 },
  wordmark: {
    marginTop: 4,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 30,
    lineHeight: 36,
    color: colors.darkBrown,
  },
  tagline: {
    marginTop: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    lineHeight: 15,
    color: colors.darkBrown,
  },

  // Heading: 28dp title, 14dp subtitle
  h: { fontFamily: 'Manrope_800ExtraBold', fontSize: 28, lineHeight: 34, color: colors.darkBrown },
  sub: {
    marginTop: 6,
    marginBottom: 21,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },

  small: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16, color: colors.darkBrown },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 1, marginBottom: 19 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxOn: { backgroundColor: colors.chocolate },
  bold: { fontFamily: 'Manrope_700Bold', color: colors.chocolate },

  // Login button: full width, 48dp high pill
  btn: { minHeight: 48, height: 48, paddingVertical: 0 },

  or: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { marginHorizontal: 12, fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 14, color: colors.muted },

  // Google button: 44dp high, 12dp radius
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  g: { marginRight: 10 },
  googleText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 18, color: colors.darkBrown },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  demo: {
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
  },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    opacity: 0.45,
    backgroundColor: colors.sandstone,
  },
});