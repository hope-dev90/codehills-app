import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, shadow } from '../theme';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Branded confirmation dialog. Replaces `window.confirm` (web) and
 * `Alert.alert` (native) so confirmations look like the app everywhere.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="none">
        <Pressable style={styles.card} onPress={() => {}}>
          {icon && (
            <View style={styles.iconWrap}>
              <Ionicons name={icon} size={26} color={colors.cream} />
            </View>
          )}
          <AppText variant="heading" style={styles.title}>
            {title}
          </AppText>
          {message ? (
            <AppText variant="body" color={colors.muted} style={styles.message}>
              {message}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <Button
              title={cancelText}
              variant="ghost"
              onPress={onCancel}
              style={styles.btn}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              style={[styles.btn, confirmVariant === 'danger' && styles.btnDanger]}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 22,
    alignItems: 'center',
    ...shadow,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { textAlign: 'center', color: colors.darkBrown },
  message: { textAlign: 'center', marginTop: 8 },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
  },
  btn: { flex: 1 },
  btnDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
});
