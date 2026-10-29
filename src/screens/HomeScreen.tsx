import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { SmartImage } from '../components/SmartImage';
import { LoadingState, ErrorState } from '../components/StateViews';
import { images, ImageKey } from '../data/images';
import { colors } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useDestinations, useProducts, useStories } from '../hooks/useResource';
import { useToast } from '../hooks/ToastContext';
import { firstName, formatRwf } from '../utils/format';

/**
 * Screen 4: Home.
 * Layout (dp), measured from the design reference:
 *  header 40 high · hero 216 high, radius 14 · search 40 high · shortcut blobs 60x44
 *  poster cards 180x146, radius 12, 16 gap
 */
const SIDE = 20;
const HERO_HEIGHT = 216;
const CARD_W = 180;
const CARD_H = 146;
const INK = colors.darkBrown;

type IconName = keyof typeof Ionicons.glyphMap;

/** Image card with a title and a small pill button (used for stories and products). */
function PosterCard({
  imageKey,
  uri,
  title,
  subtitle,
  cta,
  onPress,
  onCta,
}: {
  imageKey: ImageKey;
  uri?: string;
  title: string;
  subtitle?: string;
  cta: string;
  onPress: () => void;
  onCta?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      style={styles.poster}
    >
      <SmartImage imageKey={imageKey} uri={uri} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(43,33,27,0)', 'rgba(43,33,27,0.18)', 'rgba(43,33,27,0.78)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </SmartImage>
      <View style={styles.posterText}>
        <AppText style={styles.posterTitle} numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? <AppText style={styles.posterSub}>{subtitle}</AppText> : null}
        <Pressable
          onPress={onCta ?? onPress}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${cta} ${title}`}
          style={styles.pill}
        >
          <AppText style={styles.pillText}>{cta}</AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function SectionTitle({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
        <AppText style={styles.seeAll}>See all</AppText>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useRootNav();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data, addToCart } = useApp();
  const stories = useStories();
  const products = useProducts();
  const destinations = useDestinations();
  const [query, setQuery] = useState('');

  const name = firstName(data.user?.fullName);
  const featured = useMemo(() => stories.data.slice(0, 6), [stories.data]);
  const recommended = useMemo(() => products.data.slice(0, 6), [products.data]);

  // Search across stories, products and places
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const has = (...parts: string[]) => parts.some((p) => p.toLowerCase().includes(q));
    return {
      stories: stories.data.filter((s) => has(s.title, s.summary, s.category, ...s.tags)).slice(0, 5),
      products: products.data.filter((p) => has(p.name, p.description, p.category, ...p.tags)).slice(0, 5),
      places: destinations.data.filter((d) => has(d.name, d.summary, d.category)).slice(0, 5),
    };
  }, [q, stories.data, products.data, destinations.data]);
  const resultCount = results ? results.stories.length + results.products.length + results.places.length : 0;

  const shortcuts: { label: string; icon: IconName; bg: string; fg: string; onPress: () => void }[] = [
    { label: 'Stories', icon: 'book', bg: colors.chocolate, fg: colors.cream, onPress: () => navigation.navigate('Main', { screen: 'Stories' }) },
    { label: 'Shop', icon: 'bag-handle', bg: '#B8602E', fg: colors.cream, onPress: () => navigation.navigate('Main', { screen: 'Shop' }) },
    { label: 'Map', icon: 'location', bg: colors.sandstone, fg: colors.chocolate, onPress: () => navigation.navigate('Main', { screen: 'Map' }) },
    { label: 'Events', icon: 'calendar', bg: colors.sandstone, fg: colors.chocolate, onPress: () => navigation.navigate('Main', { screen: 'Events' }) },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={images.logo} style={styles.logo} contentFit="cover" />
            <View>
              <AppText style={styles.brandName}>CodeHills</AppText>
              {name ? <AppText style={styles.greeting}>Muraho, {name}</AppText> : null}
            </View>
          </View>
          <Pressable
            onPress={() => toast('No new notifications')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications" size={24} color={INK} />
          </Pressable>
        </View>

        {/* Hero */}
        <Pressable
          onPress={() => navigation.navigate('Main', { screen: 'Stories' })}
          accessibilityRole="button"
          accessibilityLabel="Discover Rwanda's heritage"
          style={styles.hero}
        >
          <SmartImage imageKey="hills" style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['rgba(43,33,27,0.05)', 'rgba(43,33,27,0.2)', 'rgba(43,33,27,0.72)']}
              locations={[0, 0.35, 1]}
              style={StyleSheet.absoluteFill}
            />
          </SmartImage>
          <View style={styles.heroText}>
            <AppText style={styles.heroTitle}>{'Discover\nRwanda’s Heritage'}</AppText>
            <AppText style={styles.heroSub}>{'Stories, culture, people, places\n— all in one place.'}</AppText>
            <View style={styles.heroBtn}>
              <AppText style={styles.pillText}>Explore</AppText>
            </View>
          </View>
        </Pressable>

        {/* Search */}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={INK} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search places, stories, products…"
            placeholderTextColor="#6F6054"
            returnKeyType="search"
            style={styles.searchInput}
            accessibilityLabel="Search places, stories and products"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {results ? (
          /* Search results */
          <View style={styles.results}>
            {resultCount === 0 ? (
              <AppText style={styles.noResults}>No results for “{query.trim()}”.</AppText>
            ) : (
              <>
                {results.stories.length > 0 && <ResultGroup label="Stories" />}
                {results.stories.map((s) => (
                  <ResultRow
                    key={s.id}
                    image={s.image}
                    uri={s.imageUrl}
                    title={s.title}
                    note={s.category}
                    onPress={() => navigation.navigate('StoryDetails', { storyId: s.id })}
                  />
                ))}
                {results.products.length > 0 && <ResultGroup label="Products" />}
                {results.products.map((p) => (
                  <ResultRow
                    key={p.id}
                    image={p.image}
                    uri={p.imageUrl}
                    title={p.name}
                    note={formatRwf(p.priceRwf)}
                    onPress={() => navigation.navigate('ProductDetails', { productId: p.id })}
                  />
                ))}
                {results.places.length > 0 && <ResultGroup label="Places" />}
                {results.places.map((d) => (
                  <ResultRow
                    key={d.id}
                    image={d.image}
                    uri={d.imageUrl}
                    title={d.name}
                    note={d.category}
                    onPress={() => navigation.navigate('DestinationDetails', { destinationId: d.id })}
                  />
                ))}
              </>
            )}
          </View>
        ) : (
          <>
            {/* Shortcuts */}
            <View style={styles.shortcuts}>
              {shortcuts.map((s) => (
                <Pressable
                  key={s.label}
                  onPress={s.onPress}
                  style={styles.shortcut}
                  accessibilityRole="button"
                  accessibilityLabel={s.label}
                >
                  <View style={[styles.blob, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={22} color={s.fg} />
                  </View>
                  <AppText style={styles.shortcutLabel}>{s.label}</AppText>
                </Pressable>
              ))}
            </View>

            {/* Featured stories */}
            <SectionTitle title="Featured" onSeeAll={() => navigation.navigate('Main', { screen: 'Stories' })} />
            {stories.loading ? (
              <LoadingState />
            ) : stories.error ? (
              <ErrorState message={stories.error} onRetry={stories.reload} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                {featured.map((s) => (
                  <PosterCard
                    key={s.id}
                    imageKey={s.image}
                    uri={s.imageUrl}
                    title={s.title}
                    cta="Read"
                    onPress={() => navigation.navigate('StoryDetails', { storyId: s.id })}
                  />
                ))}
              </ScrollView>
            )}

            {/* Recommended products */}
            <SectionTitle title="Recommended" onSeeAll={() => navigation.navigate('Main', { screen: 'Shop' })} />
            {products.loading ? (
              <LoadingState />
            ) : products.error ? (
              <ErrorState message={products.error} onRetry={products.reload} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                {recommended.map((p) => (
                  <PosterCard
                    key={p.id}
                    imageKey={p.image}
                    uri={p.imageUrl}
                    title={p.name}
                    subtitle={formatRwf(p.priceRwf)}
                    cta="Add"
                    onPress={() => navigation.navigate('ProductDetails', { productId: p.id })}
                    onCta={() => {
                      addToCart(p);
                      toast(`${p.name} added to cart`);
                    }}
                  />
                ))}
              </ScrollView>
            )}

            {/* Start your business */}
            <Pressable
              style={styles.business}
              onPress={() => navigation.navigate('StartBusiness')}
              accessibilityRole="button"
              accessibilityLabel="Start your business"
            >
              <Ionicons name="storefront-outline" size={22} color={colors.cream} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText style={styles.businessTitle}>Start your business</AppText>
                <AppText style={styles.businessSub}>Share your craft with CodeHills</AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.ochre} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ResultGroup({ label }: { label: string }) {
  return <AppText style={styles.resultGroup}>{label}</AppText>;
}

function ResultRow({
  image,
  uri,
  title,
  note,
  onPress,
}: {
  image: ImageKey;
  uri?: string;
  title: string;
  note: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.resultRow} accessibilityRole="button" accessibilityLabel={title}>
      <SmartImage imageKey={image} uri={uri} style={styles.resultThumb} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <AppText style={styles.resultTitle} numberOfLines={1}>
          {title}
        </AppText>
        <AppText style={styles.resultNote}>{note}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },

  // Header: 40dp logo, 20dp wordmark, bell on the right
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
    height: 40,
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  brandName: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, lineHeight: 24, color: INK },
  greeting: { fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 13, color: colors.muted },

  // Hero: 216dp high, 24dp title, 12dp subtitle, 118x30 button
  hero: {
    marginHorizontal: SIDE,
    height: HERO_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.sandstone,
    shadowColor: '#2B211B',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 15 },
  heroTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, lineHeight: 32, color: colors.white },
  heroSub: {
    marginTop: 6,
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.92)',
  },
  heroBtn: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    width: 118,
    height: 30,
    marginTop: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(231,200,160,0.9)',
    backgroundColor: 'rgba(110,70,44,0.78)',
  },

  // Search: 40dp high, 10dp radius
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginHorizontal: SIDE,
    marginTop: 15,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,117,66,0.28)',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 0,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: INK,
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },

  // Shortcuts: 60x44 rounded blobs, 12dp labels
  shortcuts: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingHorizontal: 8 },
  shortcut: { alignItems: 'center' },
  blob: {
    width: 60,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B211B',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  shortcutLabel: { marginTop: 8, fontFamily: 'Manrope_700Bold', fontSize: 12, lineHeight: 16, color: INK },

  // Section titles: 17dp bold, "See all" 12dp
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIDE,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, lineHeight: 22, color: INK },
  seeAll: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, lineHeight: 16, color: INK },

  // Poster cards: 180x146, 12dp radius, 16dp gap
  hList: { paddingHorizontal: SIDE, gap: 16 },
  poster: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.sandstone,
  },
  posterText: { position: 'absolute', left: 16, right: 12, bottom: 8 },
  posterTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13, lineHeight: 18, color: colors.white },
  posterSub: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 15, color: 'rgba(255,255,255,0.9)' },
  pill: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 26,
    marginTop: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(231,200,160,0.9)',
    backgroundColor: 'rgba(74,46,28,0.72)',
  },
  pillText: { fontFamily: 'Manrope_700Bold', fontSize: 12, lineHeight: 16, color: colors.cream },

  business: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chocolate,
    marginHorizontal: SIDE,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
  },
  businessTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15, lineHeight: 20, color: colors.cream },
  businessSub: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16, color: 'rgba(247,240,229,0.8)' },

  // Search results
  results: { paddingHorizontal: SIDE, marginTop: 18 },
  noResults: { textAlign: 'center', marginTop: 24, fontFamily: 'Manrope_500Medium', fontSize: 14, color: colors.muted },
  resultGroup: { marginTop: 8, marginBottom: 8, fontFamily: 'Manrope_800ExtraBold', fontSize: 14, color: INK },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  resultThumb: { width: 48, height: 48, borderRadius: 10 },
  resultTitle: { fontFamily: 'Manrope_700Bold', fontSize: 14, lineHeight: 19, color: INK },
  resultNote: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16, color: colors.muted },
});