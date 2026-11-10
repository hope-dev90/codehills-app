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
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { hasErrors, validateContact, validatePassword } from '../utils/validation';
import { useGoogleSignIn } from '../services/googleAuth';

/**
 * ASSETS (assets/images, same file names):
 *  - login_bg.jpg   sunrise over the hills photo (the full-bleed picture behind the top)
 *  - logo.png       used by <Logo /> (shared with other screens)
 *
 * The Google "G", the wavy sheet edges and the imigongo strips are all inline SVG.
 */
const LOGIN_BG = require('../../assets/images/login_bg.jpg');

const SIDE_PADDING = 26;
const FIELD_HEIGHT = 46;
const WAVE_TOP_HEIGHT = 46;
const WAVE_BOTTOM_HEIGHT = 58;
const STRIP_HEIGHT = 46;
const LOGO_SIZE = 80;
const INK = colors.darkBrown;
const LINE = 'rgba(168,117,66,0.6)';

/** Imigongo diamond tile. `bold` is the red/brown strip at the very bottom; otherwise a faint line motif. */
function ImigongoPattern({ id, bold = false }: { id: string; bold?: boolean }) {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id={id} width={46} height={46} patternUnits="userSpaceOnUse">
          {bold ? (
            <>
              <Rect width={46} height={46} fill="#B8431F" />
              <Path d="M23 0 L46 23 L23 46 L0 23 Z" fill={colors.darkBrown} />
              <Path d="M23 5 L41 23 L23 41 L5 23 Z" fill={colors.cream} />
              <Path d="M23 12 L34 23 L23 34 L12 23 Z" fill={colors.darkBrown} />
              <Path d="M23 18 L28 23 L23 28 L18 23 Z" fill={colors.cream} />
            </>
          ) : (
            <>
              <Path d="M23 0 L46 23 L23 46 L0 23 Z" fill="none" stroke={colors.caramel} strokeWidth={2} />
              <Path d="M23 10 L36 23 L23 36 L10 23 Z" fill="none" stroke={colors.caramel} strokeWidth={2} />
              <Path d="M23 18 L28 23 L23 28 L18 23 Z" fill={colors.caramel} />
            </>
          )}
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** The multicolour Google "G", drawn as inline SVG. */
function GoogleIcon({ size = 22, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
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

/** Pill-shaped input with a leading icon. */
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
          focused && { borderColor: colors.chocolate, borderWidth: 1.5 },
          !!error && { borderColor: colors.danger },
        ]}
      >
        <Ionicons name={icon} size={22} color={colors.chocolate} style={fieldStyles.icon} />
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
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color={INK} />
          </Pressable>
        )}
      </View>
      {error ? <AppText style={fieldStyles.error}>{error}</AppText> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: FIELD_HEIGHT,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: FIELD_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Outfit_500Medium', fontSize: 14, color: INK, paddingVertical: 0, borderWidth: 0, outlineStyle: 'none' as any },
  error: { marginTop: 3, marginLeft: 18, fontFamily: 'Outfit_500Medium', fontSize: 11, color: colors.danger },
});

/** Screen 2: Login. */
export default function LoginScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { signIn, signInWithGoogle, data } = useApp();
  const [contact, setContact] = useState(data.rememberedContact);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ contact?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const photoHeight = screenH * 0.46;
  const sheetOffset = screenH * 0.22; // where the wavy sheet starts

  const { prompt: promptGoogle, loading: googleLoading } = useGoogleSignIn(
    async (user) => {
      await signInWithGoogle(user);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    },
    (msg) => Alert.alert('Google sign-in failed', msg),
  );

  const submit = async () => {
    const next = { contact: validateContact(contact), password: validatePassword(password) };
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      await signIn(contact, password, remember);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert('Sign in failed', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Full-bleed sunrise photo */}
      <View style={[styles.photo, { height: photoHeight }]}>
        <Image source={LOGIN_BG} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>

      {/* Logo + wordmark on the photo */}
      <View pointerEvents="none" style={[styles.brand, { top: insets.top + 14 }]}>
        <Logo size={LOGO_SIZE} />
        <AppText style={styles.wordmark}>CodeHills</AppText>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={{ height: sheetOffset }} />

          {/* Wavy top edge of the cream sheet */}
          <Svg
            width="100%"
            height={WAVE_TOP_HEIGHT}
            viewBox="0 0 390 46"
            preserveAspectRatio="none"
            style={styles.waveTop}
          >
            <Path
              d="M0 34 C 30 10, 80 0, 130 4 C 190 9, 230 40, 290 40 C 335 40, 365 28, 390 30 L390 46 L0 46 Z"
              fill="rgba(247,240,229,0.55)"
            />
            <Path
              d="M0 40 C 20 20, 70 8, 112 12 C 170 18, 225 44, 285 44 C 332 44, 366 34, 390 36 L390 46 L0 46 Z"
              fill={colors.cream}
            />
          </Svg>

          <View style={styles.sheet}>
            {/* Faint imigongo motif hugging the left and right edges */}
            <View pointerEvents="none" style={[styles.edge, { left: 0 }]}>
              <ImigongoPattern id="imigongo-edge-l" />
            </View>
            <View pointerEvents="none" style={[styles.edge, { right: 0 }]}>
              <ImigongoPattern id="imigongo-edge-r" />
            </View>

            <View style={styles.body}>
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
                    {remember && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                  <AppText style={styles.small}>Remember me</AppText>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Password reset',
                      'Password reset requires the CodeHills account service. Please contact support.',
                    )
                  }
                  accessibilityRole="button"
                >
                  <AppText style={styles.small}>Forgot password?</AppText>
                </Pressable>
              </View>

              <Button title="Login" onPress={submit} loading={busy} style={styles.btn} />

              <View style={styles.or}>
                <View style={styles.line} />
                <AppText style={styles.orText}>or</AppText>
                <View style={styles.line} />
              </View>

              <Pressable
                style={[styles.google, (googleLoading || busy) && styles.googleDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                onPress={promptGoogle}
                disabled={googleLoading || busy}
              >
                <GoogleIcon size={22} style={styles.g} />
                <AppText style={styles.googleText}>Continue with Google</AppText>
              </Pressable>

              <View style={styles.footer}>
                <AppText style={styles.footerText}>Don&apos;t have an account? </AppText>
                <Pressable onPress={() => navigation.navigate('Signup')} accessibilityRole="link">
                  <AppText style={[styles.footerText, styles.footerBold]}>Sign up</AppText>
                </Pressable>
              </View>
            </View>

            {/* Dark brown ribbon waves, then the red/brown imigongo strip */}
            <Svg
              width="100%"
              height={WAVE_BOTTOM_HEIGHT}
              viewBox="0 0 390 58"
              preserveAspectRatio="none"
              style={styles.waveBottom}
            >
              <Path
                d="M0 14 C 60 2, 130 14, 210 30 C 290 46, 350 30, 390 16 L390 58 L0 58 Z"
                fill={colors.darkBrown}
              />
              <Path
                d="M0 34 C 80 22, 170 44, 260 44 C 320 44, 360 34, 390 28 L390 58 L0 58 Z"
                fill={colors.cream}
              />
              <Path
                d="M0 46 C 90 36, 180 54, 270 52 C 330 51, 365 44, 390 40"
                fill="none"
                stroke={colors.darkBrown}
                strokeWidth={3}
              />
            </Svg>

            <View style={[styles.strip, { height: STRIP_HEIGHT + insets.bottom }]}>
              <ImigongoPattern id="imigongo-strip" bold />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  photo: { position: 'absolute', top: 0, left: 0, right: 0 },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  wordmark: {
    marginTop: 6,
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 34,
    lineHeight: 42,
    color: colors.chocolate,
    textShadowColor: 'rgba(255,255,255,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  scroll: { flexGrow: 1 },
  waveTop: { marginBottom: -1 },
  sheet: { flexGrow: 1, backgroundColor: colors.cream, justifyContent: 'space-between' },
  edge: { position: 'absolute', top: 0, bottom: WAVE_BOTTOM_HEIGHT, width: 40, overflow: 'hidden', opacity: 0.1 },
  body: { paddingHorizontal: SIDE_PADDING, paddingTop: 6, paddingBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, marginBottom: 18 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  boxOn: { backgroundColor: colors.chocolate },
  small: { fontFamily: 'Outfit_500Medium', fontSize: 14, lineHeight: 18, color: INK },
  // Login button: full width pill
  btn: { height: 50, minHeight: 50, paddingVertical: 0, borderRadius: 25 },
  or: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: LINE },
  orText: { marginHorizontal: 14, fontFamily: 'Outfit_500Medium', fontSize: 14, lineHeight: 18, color: INK },
  // Google button: outlined pill
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: colors.chocolate,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  googleDisabled: { opacity: 0.5 },
  g: { marginRight: 12 },
  googleText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, lineHeight: 20, color: INK },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  footerText: { fontFamily: 'Outfit_500Medium', fontSize: 14, lineHeight: 20, color: INK },
  footerBold: { fontFamily: 'Outfit_800ExtraBold' },
  waveBottom: { marginBottom: -1 },
  strip: { overflow: 'hidden', backgroundColor: '#B8431F' },
});
