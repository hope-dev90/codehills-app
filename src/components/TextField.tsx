import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, fonts, radius } from '../theme';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  /** Adds a show/hide toggle. */
  password?: boolean;
  multiline?: boolean;
}

export function TextField({ label, icon, error, password = false, multiline, ...rest }: Props) {
  const [hidden, setHidden] = useState(password);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="caption" color={colors.muted} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          focused && { borderColor: colors.caramel },
          !!error && { borderColor: colors.danger },
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={colors.caramel} style={styles.icon} />}
        <TextInput
          {...rest}
          multiline={multiline}
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
          style={[styles.input, multiline && { height: 96, textAlignVertical: 'top', paddingTop: 12 }]}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, marginLeft: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  multiline: { alignItems: 'flex-start' },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.darkBrown,
    paddingVertical: 12,
  },
  error: { marginTop: 5, marginLeft: 4 },
});
