import React, { useMemo, useState } from 'react';
import { Image, ImageSourcePropType, ImageStyle, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { SmartImage } from '../components/SmartImage';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import { formatRwf } from '../utils/format';
import { images } from '../data/images';
import { getProductById } from '../data/products';

/**
 * Shop: hero header, three category chips and three featured products
 * (two cards on top, one wide card below). The tiles mirror the matching
 * entries in src/data/products.ts so opening a tile finds the product.
 */
/** Product image sizing: always exactly the available image slot of the card.
 *  Kept out of StyleSheet.create so it stays an ImageStyle (not a View/Text union). */
const IMG_FILL: ImageStyle = { width: '100%', height: '100%' };

const SIDE = 20;
const GAP = 12;
const DARK = '#3B2416';
const BROWN = '#4A2C1A';
const CARAMEL = '#B5651D';
const STAR = '#D9A441';
const MUTED = '#7A6757';
const CARD_BORDER = 'rgba(168,117,66,0.18)';

type ShopItem = {
  id: string;
  category: 'T-Shirts' | 'Bracelets' | 'Pens';
  name: string;
  tags: string;
  priceRwf: number;
  rating: number;
  reviews: number;
  source: ImageSourcePropType;
};

const ITEMS: ShopItem[] = [
  { id: 'shop-tshirt', category: 'T-Shirts', name: 'Traditional T-Shirt', tags: 'Comfort · Culture · Style', priceRwf: 25000, rating: 4.8, reviews: 124, source: images.tshirt },
  { id: 'shop-bracelet', category: 'Bracelets', name: 'Handcrafted Bracelet', tags: 'Natural Materials · Unique Design', priceRwf: 12000, rating: 4.7, reviews: 98, source: images.bracelet },
  { id: 'shop-pen', category: 'Pens', name: 'Cultural Pen', tags: 'Elegant · Durable · Inspired', priceRwf: 8000, rating: 4.6, reviews: 76, source: images.pen },
];

const CATEGORIES: { label: ShopItem['category']; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'T-Shirts', icon: 'shirt-outline' },
  { label: 'Bracelets', icon: 'ellipse-outline' },
  { label: 'Pens', icon: 'pencil-outline' },
];

function Heart({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={on ? 'Remove from wishlist' : 'Add to wishlist'}
      style={styles.heart}
    >
      <Ionicons name={on ? 'heart' : 'heart-outline'} size={17} color={on ? '#F0A35E' : '#F7F0E5'} />
    </Pressable>
  );
}

function Rating({ item }: { item: ShopItem }) {
  return (
    <View style={styles.rating}>
      <Ionicons name="star" size={13} color={STAR} />
      <Text style={styles.ratingText}>
        {item.rating} ({item.reviews})
      </Text>
    </View>
  );
}

function AddButton({ onPress, name }: { onPress: () => void; name: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Add ${name} to cart`}
      style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.88 }]}
    >
      <Ionicons name="cart-outline" size={16} color="#F7F0E5" />
      <Text style={styles.addText}>Add to Cart</Text>
    </Pressable>
  );
}

export default function ShopScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data, cartCount, toggleFavorite, addToCart } = useApp();
  const [category, setCategory] = useState<ShopItem['category']>('T-Shirts');
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return new Set(ITEMS.filter((i) => !q || `${i.name} ${i.tags}`.toLowerCase().includes(q)).map((i) => i.id));
  }, [query]);

  const toggleSearch = () => {
    if (showSearch) setQuery('');
    setShowSearch((v) => !v);
  };

  const add = (item: ShopItem) => {
    const product = getProductById(item.id);
    if (!product) return;
    addToCart(product);
    toast(`${item.name} added to cart`);
  };
  const open = (item: ShopItem) => navigation.navigate('ProductDetails', { productId: item.id });
  const isFav = (item: ShopItem) => data.favorites.includes(item.id);

  const [tshirt, bracelet, pen] = ITEMS;

  // The card is a plain View: a button must not be nested inside another button on web,
  // so only the image area is pressable and the heart / add button are its siblings.
  const SquareCard = ({ item }: { item: ShopItem }) => (
    <View
      style={[styles.card, { flex: 1 }, !matches.has(item.id) && styles.dim, category === item.category && styles.cardOn]}
    >
      <Pressable
        onPress={() => open(item)}
        accessibilityRole="button"
        accessibilityLabel={`Open product: ${item.name}`}
        style={styles.squareImgWrap}
      >
        <Image source={item.source} style={IMG_FILL} resizeMode="cover" />
      </Pressable>
      <Heart on={isFav(item)} onPress={() => toggleFavorite(item.id)} />
      <View style={styles.squareBody}>
        <AppText variant="subheading" color={DARK} numberOfLines={1}>
          {item.name}
        </AppText>
        <Text style={styles.tags} numberOfLines={1}>
          {item.tags}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatRwf(item.priceRwf)}</Text>
          <Rating item={item} />
        </View>
        <AddButton onPress={() => add(item)} name={item.name} />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Hero header */}
      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <SmartImage imageKey="heroOnboarding" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(59,36,22,0.95)', 'rgba(59,36,22,0.6)', 'rgba(59,36,22,0.1)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </Pressable>
          <AppText variant="display" color="#FFFFFF" style={styles.title}>
            Shop
          </AppText>
          <View style={styles.icons}>
            <Pressable onPress={toggleSearch} hitSlop={10} accessibilityRole="button" accessibilityLabel={showSearch ? 'Close search' : 'Search products'}>
              <Ionicons name={showSearch ? 'close' : 'search'} size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Cart')} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Open cart, ${cartCount} items`}>
              <Ionicons name="cart-outline" size={26} color="#FFFFFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            </Pressable>
          </View>
        </View>
        <Text style={styles.subtitle}>Authentic pieces. Rich culture.{'\n'}Made for you.</Text>
      </View>

      {showSearch && (
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={DARK} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products…"
            placeholderTextColor="#8A7566"
            autoFocus
            returnKeyType="search"
            underlineColorAndroid="transparent"
            style={styles.searchInput}
            accessibilityLabel="Search products"
          />
        </View>
      )}

      {/* Category chips */}
      <View style={styles.chips}>
        {CATEGORIES.map((c) => {
          const on = c.label === category;
          return (
            <Pressable
              key={c.label}
              onPress={() => setCategory(c.label)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Ionicons name={c.icon} size={18} color={on ? '#F7F0E5' : DARK} />
              <Text style={[styles.chipText, on && { color: '#F7F0E5' }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Products: two cards, then one wide card. Always fills the screen. */}
      <View style={styles.grid}>
        <View style={[styles.gridRow, { flex: 1.3 }]}>
          <SquareCard item={tshirt} />
          <SquareCard item={bracelet} />
        </View>

        <View
          style={[styles.card, styles.wide, !matches.has(pen.id) && styles.dim, category === pen.category && styles.cardOn]}
        >
          <Pressable
            onPress={() => open(pen)}
            accessibilityRole="button"
            accessibilityLabel={`Open product: ${pen.name}`}
            style={styles.wideImgWrap}
          >
            <Image source={pen.source} style={IMG_FILL} resizeMode="cover" />
          </Pressable>
          <Heart on={isFav(pen)} onPress={() => toggleFavorite(pen.id)} />
          <View style={styles.wideBody}>
            <AppText variant="subheading" color={DARK} numberOfLines={1}>
              {pen.name}
            </AppText>
            <Text style={styles.tags} numberOfLines={1}>
              {pen.tags}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatRwf(pen.priceRwf)}</Text>
              <Rating item={pen} />
            </View>
            <AddButton onPress={() => add(pen)} name={pen.name} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },

  // Hero
  hero: { paddingHorizontal: SIDE, paddingBottom: 18, backgroundColor: BROWN, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  back: { marginLeft: -6, marginRight: 10 },
  title: { flex: 1, fontSize: 34, lineHeight: 42 },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D2691E',
  },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10, lineHeight: 12, color: '#FFFFFF' },
  subtitle: {
    marginTop: 8,
    marginLeft: 28,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.95)',
  },

  // Search
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    marginHorizontal: SIDE,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#EFE3D2',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 0,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: DARK,
    borderWidth: 0,
    // @ts-ignore web only: remove the browser focus outline
    outlineStyle: 'none',
  },

  // Chips
  chips: { flexDirection: 'row', gap: 10, paddingHorizontal: SIDE, marginTop: 16 },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EBDDC9',
  },
  chipOn: { backgroundColor: BROWN },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: DARK },

  // Grid
  grid: { flex: 1, paddingHorizontal: SIDE, paddingTop: 16, paddingBottom: 14, gap: GAP },
  gridRow: { flexDirection: 'row', gap: GAP },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FBF6EE',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  cardOn: { borderColor: CARAMEL },
  dim: { opacity: 0.3 },

  squareImgWrap: { flex: 1, minHeight: 60, overflow: 'hidden' },
  squareBody: { padding: 12, paddingBottom: 12 },
  wide: { flex: 0.95, flexDirection: 'row' },
  wideImgWrap: { width: '46%', overflow: 'hidden' },
  wideBody: { flex: 1, padding: 14, justifyContent: 'center' },

  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59,36,22,0.6)',
  },

  tags: { fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 16, color: MUTED, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 8 },
  price: { fontFamily: 'Manrope_800ExtraBold', fontSize: 16, color: DARK },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: 'Manrope_500Medium', fontSize: 11, color: MUTED },

  addBtn: {
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BROWN,
  },
  addText: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#F7F0E5' },
});