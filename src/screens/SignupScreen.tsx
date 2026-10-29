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
import { hasErrors, validateContact, validatePassword, validateRequired } from '../utils/validation';

/**
 * ASSETS (assets/images, replace with your own using the same file name):
 *  - hills.jpg   landscape photo behind the top of the screen
 *
 * The Google "G" and the imigongo strip are inline SVG (react-native-svg).
 *
 * Layout (dp), measured from the design reference:
 *  title 21 / subtitle 13 · card margin 20, radius 18 · fields 42 high, 9 gap
 *  Sign Up button 44 high · Google button 44 high · imigongo strip 28 high
 */
const HILLS = require('../../assets/images/hills.jpg');

const PHOTO_HEIGHT = 340;
const CARD_MARGIN = 20;
const CARD_PADDING = 12;
const STRIP_HEIGHT = 28;
const INK = colors.darkBrown;

/** Repeating imigongo diamond motif, drawn as a tiled SVG pattern. */
function ImigongoPattern({ id, color }: { id: string; color: string }) {
  return (
    <Svg width="100%" height="100%">
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
function GoogleIcon({ size = 24, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
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

/** Input used on this screen: 42dp high, 10dp radius, 13dp text, dark icons. */
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
        <Ionicons name={icon} size={20} color={INK} style={fieldStyles.icon} />
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor="#6F6054"
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
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={INK} />
          </Pressable>
        )}
      </View>
      {error ? <AppText style={fieldStyles.error}>{error}</AppText> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 9 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.28)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 13, color: INK, paddingVertical: 0 },
  error: { marginTop: 3, marginLeft: 4, fontFamily: 'Manrope_500Medium', fontSize: 11, color: colors.danger },
});

/** Screen 3: sign up with validation. */
export default function SignupScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { signUp } = useApp();
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next = {
      fullName: validateRequired(fullName, 'your full name', 2),
      contact: validateContact(contact),
      password: validatePassword(password),
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
      {/* Landscape photo that darkens into the page colour */}
      <View style={[styles.photo, { height: PHOTO_HEIGHT }]}>
        <Image source={HILLS} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(43,33,27,0)', 'rgba(43,33,27,0.15)', 'rgba(43,33,27,0.82)', colors.darkBrown]}
          locations={[0, 0.4, 0.78, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Landing'))}
            hitSlop={12}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>

          <View style={styles.header}>
            <AppText style={styles.title}>Create Your Account</AppText>
            <AppText style={styles.sub}>Join CodeHills and explore Rwanda like never before.</AppText>
          </View>

          <View style={styles.cardShadow}>
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Field
                  icon="person-outline"
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoComplete="name"
                  error={errors.fullName}
                />
                <Field
                  icon="mail-outline"
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
                  autoComplete="new-password"
                  error={errors.password}
                />

                <Button title="Sign Up" onPress={submit} loading={busy} style={styles.btn} />

                <View style={styles.or}>
                  <View style={styles.line} />
                  <AppText style={styles.orText}>or</AppText>
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
                  <GoogleIcon size={24} style={styles.g} />
                  <AppText style={styles.googleText}>Continue with Google</AppText>
                </Pressable>

                <View style={styles.footer}>
                  <AppText style={styles.footerText}>Already have an account? </AppText>
                  <Pressable onPress={() => navigation.replace('Login')} accessibilityRole="link">
                    <AppText style={[styles.footerText, styles.bold]}>Login</AppText>
                  </Pressable>
                </View>

                <AppText style={styles.demo}>Demo sign-up: no real account is created or verified.</AppText>
              </View>

              {/* Imigongo strip along the bottom edge of the card */}
              <View pointerEvents="none" style={styles.strip}>
                <ImigongoPattern id="imigongo-signup" color={colors.caramel} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkBrown },
  photo: { position: 'absolute', top: 0, left: 0, right: 0 },

  back: { alignSelf: 'flex-start', marginLeft: 20, padding: 0 },

  // Title 21dp bold, subtitle 13dp on two lines
  header: { marginTop: 100, paddingHorizontal: 28 },
  title: { fontFamily: 'Manrope_700Bold', fontSize: 21, lineHeight: 28, color: colors.white },
  sub: {
    marginTop: 2,
    maxWidth: 250,
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.92)',
  },

  // Floating cream card
  cardShadow: {
    marginTop: 18,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 18,
    backgroundColor: colors.cream,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  card: { borderRadius: 18, overflow: 'hidden', backgroundColor: colors.cream },
  cardBody: { padding: CARD_PADDING, paddingTop: 10, paddingBottom: STRIP_HEIGHT + 8 },

  // Sign Up button: full width, 44dp pill
  btn: { height: 44, minHeight: 44, paddingVertical: 0, marginTop: 4 },

  or: { flexDirection: 'row', alignItems: 'center', marginTop: 17, marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(74,46,28,0.25)' },
  orText: { marginHorizontal: 14, fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 14, color: INK },

  // Google button: 44dp high, 10dp radius
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.28)',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  g: { marginRight: 12 },
  googleText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 18, color: INK },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 23 },
  footerText: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16, color: INK },
  bold: { fontFamily: 'Manrope_800ExtraBold' },
  demo: {
    textAlign: 'center',
    marginTop: 8,
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
    height: STRIP_HEIGHT,
    overflow: 'hidden',
    opacity: 0.4,
    backgroundColor: colors.sandstone,
  },
});