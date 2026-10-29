import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { SmartImage } from '../components/SmartImage';
import { EmptyState, LoadingState } from '../components/StateViews';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useProducts } from '../hooks/useResource';
import { useToast } from '../hooks/ToastContext';
import { formatRwf } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

/**
 * Screen 8: Product Details.
 * Layout (dp), measured from the design reference:
 *  photo ~50% of the screen · title 20 / price 17 / description 13 · tags 28 high
 *  quantity pill 34 high · Add to Cart 48 high (both pinned to the bottom)
 */
const SIDE = 20;
const INK = colors.darkBrown;
const BAR_H = 130;

export default function ProductDetailsScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const toast = useToast();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ProductDetails'>>();
  const { data, toggleFavorite, addToCart } = useApp();
  const products = useProducts();
  const [quantity, setQuantity] = useState(1);

  // Light status-bar icons over the photo, restored when leaving the screen.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, []),
  );

  if (products.loading) {
    return (
      <View style={styles.plain}>
        <LoadingState />
      </View>
    );
  }
  const product = products.data.find((p) => p.id === params.productId);
  if (!product) {
    return (
      <View style={[styles.plain, { paddingTop: insets.top }]}>
        <EmptyState
          icon="bag-outline"
          title="Product not found"
          message="This product is not available."
          actionLabel="Back to shop"
          onAction={() => navigation.navigate('Main', { screen: 'Shop' })}
        />
      </View>
    );
  }

  const favorite = data.favorites.includes(product.id);
  const photoH = Math.min(400, Math.round(height * 0.5));
  const barPad = insets.bottom + 14;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BAR_H + barPad }}
      >
        {/* Photo */}
        <SmartImage imageKey={product.image} uri={product.imageUrl} style={{ height: photoH }}>
          <LinearGradient
            colors={['rgba(43,33,27,0.4)', 'rgba(43,33,27,0)']}
            locations={[0, 0.35]}
            style={StyleSheet.absoluteFill}
          />
        </SmartImage>

        {/* Info card overlapping the photo */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <AppText style={styles.title} numberOfLines={2}>
              {product.name}
            </AppText>
            <Pressable
              onPress={() => toggleFavorite(product.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? colors.chocolate : INK}
              />
            </Pressable>
          </View>
          <AppText style={styles.price}>{formatRwf(product.priceRwf)}</AppText>
          <AppText style={styles.desc}>{product.description}</AppText>

          <View style={styles.tags}>
            {product.tags.slice(0, 4).map((t) => (
              <View key={t} style={styles.tag}>
                <AppText style={styles.tagText}>{t}</AppText>
              </View>
            ))}
          </View>

          {/* Extra product information (below the main view) */}
          <View style={styles.artisan}>
            <Ionicons name="hand-left-outline" size={18} color={colors.caramel} />
            <AppText style={styles.artisanText}>
              Made by {product.artisan.name} · {product.artisan.location}
            </AppText>
          </View>
          <AppText style={styles.heading}>Craftsmanship</AppText>
          <AppText style={styles.desc}>{product.craftsmanship}</AppText>
          {product.isDemo && (
            <AppText style={styles.demo}>
              Demo product: name, price and artisan are sample data. Nothing here can be bought for real yet.
            </AppText>
          )}
        </View>
      </ScrollView>

      {/* Top buttons */}
      <View style={[styles.actions, { top: insets.top + 10 }]} pointerEvents="box-none">
        <Pressable
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main', { screen: 'Shop' }))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.circle}
        >
          <Ionicons name="chevron-back" size={20} color={INK} />
        </Pressable>
        <Pressable
          onPress={() => toggleFavorite(product.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          style={styles.circle}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={19}
            color={favorite ? colors.caramel : INK}
          />
        </Pressable>
      </View>

      {/* Quantity + Add to Cart pinned to the bottom */}
      <View pointerEvents="box-none" style={styles.barWrap}>
        <LinearGradient
          colors={['rgba(247,240,229,0)', colors.cream]}
          style={styles.barFade}
          pointerEvents="none"
        />
        <View style={[styles.bar, { paddingBottom: barPad }]}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={[styles.stepBtn, quantity <= 1 && { opacity: 0.4 }]}
            >
              <Ionicons name="remove" size={16} color={INK} />
            </Pressable>
            <AppText style={styles.qty}>{quantity}</AppText>
            <Pressable
              onPress={() => setQuantity((q) => Math.min(99, q + 1))}
              disabled={quantity >= 99}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={styles.stepBtn}
            >
              <Ionicons name="add" size={16} color={INK} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              addToCart(product, quantity);
              toast(`${quantity} × ${product.name} added to cart`);
              setQuantity(1);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Add ${quantity} ${product.name} to cart`}
            style={styles.addBtn}
          >
            <AppText style={styles.addText}>Add to Cart</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  plain: { flex: 1, backgroundColor: colors.cream },

  actions: {
    position: 'absolute',
    left: SIDE,
    right: SIDE,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,240,229,0.92)',
  },

  // Info card: title 20, price 17, description 13
  card: {
    marginTop: -22,
    paddingHorizontal: SIDE,
    paddingTop: 16,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontFamily: 'Manrope_800ExtraBold', fontSize: 20, lineHeight: 26, color: INK },
  price: { marginTop: 4, fontFamily: 'Manrope_800ExtraBold', fontSize: 17, lineHeight: 23, color: INK },
  desc: { marginTop: 6, fontFamily: 'Manrope_500Medium', fontSize: 13, lineHeight: 19, color: '#5E4E42' },

  // Tags: 28dp pills, 10dp gap
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  tag: {
    height: 28,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.3)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tagText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, lineHeight: 16, color: INK },

  artisan: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  artisanText: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 17, color: '#5E4E42' },
  heading: { marginTop: 16, fontFamily: 'Manrope_800ExtraBold', fontSize: 15, lineHeight: 20, color: INK },
  demo: { marginTop: 14, fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 15, color: colors.muted },

  // Bottom area
  barWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barFade: { height: 18 },
  bar: { paddingHorizontal: SIDE, paddingTop: 2, backgroundColor: colors.cream },
  stepper: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 6,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.4)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 30, textAlign: 'center', fontFamily: 'Manrope_700Bold', fontSize: 14, lineHeight: 18, color: INK },

  // Add to Cart: full-width 48dp pill
  addBtn: {
    height: 48,
    marginTop: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chocolate,
  },
  addText: { fontFamily: 'Manrope_700Bold', fontSize: 15, lineHeight: 20, color: colors.cream },
});