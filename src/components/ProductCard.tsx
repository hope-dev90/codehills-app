import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from './SmartImage';
import { AppText } from './AppText';
import { colors, radius, shadow } from '../theme';
import { formatRwf } from '../utils/format';
import type { Product } from '../types';

interface Props {
  product: Product;
  favorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onPress: () => void;
  /** Fixed width for horizontal carousels; omit inside grids. */
  width?: number;
}

export function ProductCard({ product, favorite, onToggleFavorite, onAddToCart, onPress, width }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open product: ${product.name}`}
      style={[styles.card, width ? { width, marginRight: 14 } : { flex: 1 }]}
    >
      <SmartImage imageKey={product.image} uri={product.imageUrl} style={styles.image}>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          style={styles.fav}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={17} color={favorite ? colors.caramel : colors.chocolate} />
        </Pressable>
      </SmartImage>
      <View style={styles.body}>
        <View style={styles.text}>
          <AppText variant="subheading" numberOfLines={1}>
            {product.name}
          </AppText>
          <AppText variant="small" color={colors.caramel} style={styles.price}>
            {formatRwf(product.priceRwf)}
          </AppText>
        </View>
        <Pressable
          onPress={onAddToCart}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to cart`}
          style={styles.add}
        >
          <Ionicons name="add" size={20} color={colors.cream} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 14,
    ...shadow,
  },
  image: { height: 128 },
  fav: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(247,240,229,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  text: { flex: 1 },
  price: { fontFamily: 'Manrope_700Bold', marginTop: 2 },
  add: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
