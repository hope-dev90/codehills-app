import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { DemoNotice } from '../components/DemoBadge';
import { colors, radius } from '../theme';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import type { LanguageCode } from '../types';

const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'fr', name: 'Français' },
];

/** Stores the preferred language. Translations are not implemented yet. */
export default function LanguageScreen() {
  const { data, setLanguage } = useApp();
  const toast = useToast();

  return (
    <Screen padBottom>
      <ScreenHeader title="Language" showBack />
      <View style={styles.pad}>
        {LANGUAGES.map((l) => {
          const active = data.preferences.language === l.code;
          return (
            <Pressable
              key={l.code}
              onPress={() => {
                setLanguage(l.code);
                toast(`${l.name} saved as your preference`);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.row, active && styles.active]}
            >
              <AppText variant="subheading" style={{ flex: 1 }}>
                {l.name}
              </AppText>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.chocolate} />}
            </Pressable>
          );
        })}
        <DemoNotice>Your choice is saved, but the app text is only available in English for now.</DemoNotice>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  active: { borderColor: colors.caramel },
});
