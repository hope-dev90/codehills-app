import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Logo } from '../components/Logo';
import { AppText } from '../components/AppText';
import { SearchBar } from '../components/SearchBar';
import { SmartImage } from '../components/SmartImage';
import { StoryCard } from '../components/StoryCard';
import { ProductCard } from '../components/ProductCard';
import { LoadingState, ErrorState } from '../components/StateViews';
import { colors, radius, shadow } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useProducts, useStories } from '../hooks/useResource';
import { useToast } from '../hooks/ToastContext';
import { firstName } from '../utils/format';

type IconName = keyof typeof Ionicons.glyphMap;

/** Screen 4: greeting, hero card, search, shortcuts, featured stories and products. */
export default function HomeScreen() {
  const navigation = useRootNav();
  const toast = useToast();
  const { data, toggleBookmark, toggleFavorite, addToCart } = useApp();
  const stories = useStories();
  const products = useProducts();
  const [query, setQuery] = useState('');

  const name = firstName(data.user?.fullName);
  const featured = useMemo(() => stories.data.slice(0, 5), [stories.data]);
  const recommended = useMemo(() => products.data.slice(0, 5), [products.data]);

  const goSearch = () => {
    const q = query.trim();
    navigation.navigate('Main', { screen: 'Stories', params: q ? { query: q } : undefined });
  };

  const shortcuts: { label: string; icon: IconName; onPress: () => void }[] = [
    { label: 'Stories', icon: 'book', onPress: () => navigation.navigate('Main', { screen: 'Stories' }) },
    { label: 'Shop', icon: 'bag-handle', onPress: () => navigation.navigate('Main', { screen: 'Shop' }) },
    { label: 'Map', icon: 'location', onPress: () => navigation.navigate('Main', { screen: 'Map' }) },
    { label: 'Events', icon: 'calendar', onPress: () => navigation.navigate('Main', { screen: 'Events' }) },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.top}>
          <Pressable
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Landing'))}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.chocolate} />
          </Pressable>
          <View style={styles.brand}>
            <Logo size={34} />
            <View style={styles.brandText}>
              <AppText variant="heading">CodeHills</AppText>
              <AppText variant="caption" color={colors.muted}>
                {name ? `Muraho, ${name}` : 'Muraho, Explorer'}
              </AppText>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartBtn}
            accessibilityRole="button"
            accessibilityLabel="Open cart"
          >
            <Ionicons name="bag-outline" size={20} color={colors.chocolate} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Main', { screen: 'Stories' })}
          accessibilityRole="button"
          accessibilityLabel="Discover Rwanda's heritage"
          style={styles.hero}
        >
          <SmartImage imageKey="hills" style={StyleSheet.absoluteFill}>
            <LinearGradient colors={['rgba(43,33,27,0.1)', 'rgba(43,33,27,0.82)']} style={StyleSheet.absoluteFill} />
          </SmartImage>
          <View style={styles.heroText}>
            <AppText variant="title" color={colors.white}>
              Discover{'\n'}Rwanda{'\u2019'}s Heritage
            </AppText>
            <AppText variant="small" color="rgba(255,255,255,0.9)" style={{ marginTop: 6 }}>
              Stories, culture, people and places
            </AppText>
            <View style={styles.heroBtn}>
              <AppText variant="caption" color={colors.cream} style={{ fontFamily: 'Manrope_700Bold' }}>
                Explore
              </AppText>
            </View>
          </View>
        </Pressable>

        <View style={styles.pad}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search stories…" onSubmit={goSearch} />
        </View>

        <View style={styles.shortcuts}>
          {shortcuts.map((s) => (
            <Pressable key={s.label} onPress={s.onPress} style={styles.shortcut} accessibilityRole="button" accessibilityLabel={s.label}>
              <View style={styles.shortcutIcon}>
                <Ionicons name={s.icon} size={22} color={colors.cream} />
              </View>
              <AppText variant="caption" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                {s.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <SectionTitle title="Featured stories" onSeeAll={() => navigation.navigate('Main', { screen: 'Stories' })} />
        {stories.loading ? (
          <LoadingState />
        ) : stories.error ? (
          <ErrorState message={stories.error} onRetry={stories.reload} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {featured.map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                variant="compact"
                bookmarked={data.bookmarks.includes(s.id)}
                onToggleBookmark={() => toggleBookmark(s.id)}
                onPress={() => navigation.navigate('StoryDetails', { storyId: s.id })}
              />
            ))}
          </ScrollView>
        )}

        <SectionTitle title="Recommended products" onSeeAll={() => navigation.navigate('Main', { screen: 'Shop' })} />
        {products.loading ? (
          <LoadingState />
        ) : products.error ? (
          <ErrorState message={products.error} onRetry={products.reload} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {recommended.map((p) => (
              <ProductCard
                key={p.id}
                width={170}
                product={p}
                favorite={data.favorites.includes(p.id)}
                onToggleFavorite={() => toggleFavorite(p.id)}
                onAddToCart={() => {
                  addToCart(p);
                  toast(`${p.name} added to cart`);
                }}
                onPress={() => navigation.navigate('ProductDetails', { productId: p.id })}
              />
            ))}
          </ScrollView>
        )}

        <Pressable style={styles.business} onPress={() => navigation.navigate('StartBusiness')} accessibilityRole="button">
          <Ionicons name="storefront-outline" size={22} color={colors.cream} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText variant="subheading" color={colors.cream}>
              Start your business
            </AppText>
            <AppText variant="caption" color="rgba(247,240,229,0.8)">
              Share your craft with CodeHills
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.ochre} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
        <AppText variant="small" color={colors.caramel} style={{ fontFamily: 'Manrope_700Bold' }}>
          See all
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 24 },
  pad: { paddingHorizontal: 20 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandText: { marginLeft: 10 },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: { marginHorizontal: 20, height: 190, borderRadius: radius.xl, overflow: 'hidden', marginBottom: 16, ...shadow },
  heroText: { position: 'absolute', left: 18, bottom: 18, right: 18 },
  heroBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.ochre,
    backgroundColor: 'rgba(74,46,28,0.75)',
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginTop: 18 },
  shortcut: { alignItems: 'center', gap: 6 },
  shortcutIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.chocolate,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  hList: { paddingHorizontal: 20 },
  business: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chocolate,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: radius.lg,
  },
});
