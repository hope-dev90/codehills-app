import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ScreenHeader, IconButton } from '../components/ScreenHeader';
import { SearchBar } from '../components/SearchBar';
import { ChipRow } from '../components/Chip';
import { ProductCard } from '../components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useProducts } from '../hooks/useResource';
import { useToast } from '../hooks/ToastContext';

const FILTERS = ['All', 'Favorites', 'Handicrafts', 'Food & Drinks', 'Art'];

/** Screen 7: product grid with categories, search, favorites and Add to Cart. */
export default function ShopScreen() {
  const navigation = useRootNav();
  const toast = useToast();
  const { data, cartCount, toggleFavorite, addToCart } = useApp();
  const products = useProducts();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.data.filter((p) => {
      if (filter === 'Favorites' && !data.favorites.includes(p.id)) return false;
      if (filter !== 'All' && filter !== 'Favorites' && p.category !== filter) return false;
      return !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [products.data, query, filter, data.favorites]);

  return (
    <Screen>
      <ScreenHeader
        title="Shop"
        subtitle="Support local. Take a piece of Rwanda home."
        showBack
        right={
          <IconButton
            name="bag-outline"
            label="Open cart"
            badge={cartCount}
            onPress={() => navigation.navigate('Cart')}
            filled={false}
          />
        }
      />
      <View style={styles.search}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search products…" />
      </View>
      <View style={styles.chips}>
        <ChipRow options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      {products.loading ? (
        <LoadingState />
      ) : products.error ? (
        <ErrorState message={products.error} onRetry={products.reload} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.col}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              favorite={data.favorites.includes(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onAddToCart={() => {
                addToCart(item);
                toast(`${item.name} added to cart`);
              }}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={filter === 'Favorites' ? 'heart-outline' : 'search-outline'}
              title={filter === 'Favorites' ? 'No favorites yet' : 'No products found'}
              message={filter === 'Favorites' ? 'Tap the heart on a product to save it here.' : 'Try another search or category.'}
              actionLabel="Show all products"
              onAction={() => {
                setFilter('All');
                setQuery('');
              }}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: 20, marginBottom: 12 },
  chips: { marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  col: { gap: 14 },
});
