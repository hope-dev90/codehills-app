import React from 'react';
import { Image } from 'expo-image';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { images } from '../data/images';
import { AppText } from './AppText';
import { colors } from '../theme';

interface Props {
  size?: number;
  /** Show the "CodeHills" wordmark under the symbol. */
  showWordmark?: boolean;
  showSubtitle?: boolean;
  light?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The logo is shown at its natural aspect ratio (square asset), never stretched. */
export function Logo({ size = 80, showWordmark = false, showSubtitle = false, light = false, style }: Props) {
  const textColor = light ? colors.cream : colors.chocolate;
  return (
    <View style={[styles.wrap, style]}>
      <Image source={images.logo} style={{ width: size, height: size }} contentFit="contain" />
      {showWordmark && (
        <AppText variant="title" color={textColor} style={styles.word}>
          CodeHills
        </AppText>
      )}
      {showSubtitle && (
        <AppText variant="caption" color={textColor} style={styles.sub}>
          Heritage · Culture · Business
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  word: { marginTop: 6, fontSize: 30, lineHeight: 36 },
  sub: { marginTop: 2, letterSpacing: 0.5 },
});
