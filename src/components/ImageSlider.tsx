import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SmartImage } from './SmartImage';
import type { ImageKey } from '../data/images';

interface Props {
  /** Ordered list of images to cycle through. */
  images: ImageKey[];
  /** Time each image stays visible, in milliseconds. */
  interval?: number;
  /** Crossfade duration in milliseconds. */
  fadeDuration?: number;
  style?: typeof StyleSheet.absoluteFill;
}

/**
 * Auto-advancing full-screen image slideshow with a crossfade between slides.
 * Loops back to the first image after the last one.
 */
export function ImageSlider({ images, interval = 2000, fadeDuration = 400, style }: Props) {
  // Stable Animated.Value per slide — created once via useState so refs are never
  // touched during render.
  const [opacities] = useState(() =>
    images.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  );
  const indexRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const prev = indexRef.current;
      const next = (prev + 1) % images.length;
      indexRef.current = next;
      Animated.timing(opacities[prev], {
        toValue: 0,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
      Animated.timing(opacities[next], {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval, fadeDuration, opacities]);

  return (
    <>
      {images.map((key, i) => (
        <Animated.View key={key} style={[StyleSheet.absoluteFill, { opacity: opacities[i] }]}>
          <SmartImage imageKey={key} style={style ?? StyleSheet.absoluteFill} />
        </Animated.View>
      ))}
    </>
  );
}
