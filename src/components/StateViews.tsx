import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors } from '../theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.caramel} />
      <AppText variant="small" color={colors.muted} style={styles.gap}>
        {label}
      </AppText>
    </View>
  );
}

interface EmptyProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'leaf-outline', title, message, actionLabel, onAction }: EmptyProps) {
  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={colors.caramel} />
      </View>
      <AppText variant="heading" style={styles.gap}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="small" color={colors.muted} style={styles.msg}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sandstone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap: { marginTop: 14 },
  msg: { marginTop: 6, textAlign: 'center' },
  action: { marginTop: 20, alignSelf: 'stretch' },
});
