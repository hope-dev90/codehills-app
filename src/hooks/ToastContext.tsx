import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { colors, radius } from '../theme';

type ShowToast = (message: string) => void;
const ToastContext = createContext<ShowToast>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback<ShowToast>(
    (msg) => {
      setMessage(msg);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
      }, 1800);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
        <Animated.View style={[styles.toast, { opacity }]}>
          <AppText variant="small" color={colors.white} style={styles.text}>
            {message}
          </AppText>
        </Animated.View>
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    backgroundColor: colors.darkBrown,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    maxWidth: '86%',
  },
  text: { textAlign: 'center' },
});
