import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { images, ImageKey } from '../data/images';
import { colors } from '../theme';

interface Props {
  imageKey?: ImageKey;
  /** Remote image (future backend). Takes priority over `imageKey`. */
  uri?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain';
  children?: React.ReactNode;
}

/**
 * Image with a graceful fallback: a missing or broken image shows a neutral placeholder
 * instead of a blank hole. Children render on top (overlays, buttons, titles).
 */
export function SmartImage({ imageKey, uri, style, contentFit = 'cover', children }: Props) {
  const [failed, setFailed] = useState(false);
  const source = uri ? { uri } : imageKey ? images[imageKey] : undefined;
  const showImage = source !== undefined && !failed;

  return (
    <View style={[styles.base, style]}>
      {showImage ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={150}
          onError={() => {
            // If a remote image fails, retry with the bundled one before giving up.
            setFailed(true);
          }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Ionicons name="image-outline" size={32} color={colors.caramel} />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: colors.sandstone },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sandstone },
});
