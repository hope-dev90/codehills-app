import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { IconButton } from '../components/ScreenHeader';
import { QuantityStepper } from '../components/QuantityStepper';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState, LoadingState } from '../components/StateViews';
import { Screen } from '../components/Screen';
import { colors, radius, shadow } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useProducts } from '../hooks/useResource';
import { useToast } from '../hooks/ToastContext';
import { formatRwf } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

/** Screen 8: product photo, price, artisan, craftsmanship, quantity and Add to Cart. */
export default function ProductDetailsScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ProductDetails'>>();
  const { data, cartCount, toggleFavorite, addToCart } = useApp();
  const products = useProducts();
  const [quantity, setQuantity] = useState(1);

  if (products.loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  const product = products.data.find((p) => p.id === params.productId);
  if (!product) {
    return (
      <Screen>
        <EmptyState
          icon="bag-outline"
          title="Product not found"
          message="This product is not available."
          actionLabel="Back to shop"
          onAction={() => navigation.navigate('Main', { screen: 'Shop' })}
        />
      </Screen>
    );
  }

  const favorite = data.favorites.includes(product.id);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <SmartImage imageKey={product.image} uri={product.imageUrl} style={styles.image}>
          <View style={[styles.actions, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" label="Go back" onPress={() => navigation.goBack()} />
            <View style={styles.right}>
              <IconButton
                name={favorite ? 'heart' : 'heart-outline'}
                label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                tint={favorite ? colors.caramel : colors.chocolate}
                onPress={() => toggleFavorite(product.id)}
              />
              <IconButton name="bag-outline" label="Open cart" badge={cartCount} onPress={() => navigation.navigate('Cart')} />
            </View>
          </View>
        </SmartImage>

        <View style={styles.body}>
          <AppText variant="title">{product.name}</AppText>
          <AppText variant="heading" color={colors.caramel} style={{ marginTop: 4 }}>
            {formatRwf(product.priceRwf)}
          </AppText>
          <AppText variant="body" color={colors.muted} style={{ marginTop: 10 }}>
            {product.description}
          </AppText>

          <View style={styles.tags}>
            {product.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <AppText variant="caption" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {t}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.artisan}>
            <View style={styles.avatar}>
              <Ionicons name="hand-left-outline" size={20} color={colors.cream} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="caption" color={colors.muted}>
                Made by
              </AppText>
              <AppText variant="subheading">{product.artisan.name}</AppText>
              <AppText variant="small" color={colors.muted}>
                {product.artisan.location}
              </AppText>
            </View>
          </View>

          <AppText variant="heading" style={{ marginTop: 20, marginBottom: 6 }}>
            Craftsmanship
          </AppText>
          <AppText variant="body">{product.craftsmanship}</AppText>

          {product.isDemo && (
            <View style={{ marginTop: 16 }}>
              <DemoNotice>Demo product: name, price and artisan are sample data, and nothing here can be bought for real yet.</DemoNotice>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button
          title={`Add to Cart · ${formatRwf(product.priceRwf * quantity)}`}
          icon="bag-add-outline"
          onPress={() => {
            addToCart(product, quantity);
            toast(`${quantity} × ${product.name} added to cart`);
            setQuantity(1);
          }}
          style={styles.addBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  image: { height: 360 },
  actions: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  right: { flexDirection: 'row', gap: 8 },
  body: { padding: 20, marginTop: -20, backgroundColor: colors.cream, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: { backgroundColor: colors.sandstone, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  artisan: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, marginTop: 18, ...shadow },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.chocolate, alignItems: 'center', justifyContent: 'center' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addBtn: { flex: 1 },
});
