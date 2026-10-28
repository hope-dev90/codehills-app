import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/StateViews';
import { colors, radius, shadow } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { formatDate, formatRwf } from '../utils/format';

/** Lists the (demo) orders placed on this device. */
export default function MyOrdersScreen() {
  const navigation = useRootNav();
  const { data } = useApp();

  return (
    <Screen padBottom>
      <ScreenHeader title="My Orders" subtitle="Demo orders on this device" showBack />
      <FlatList
        data={data.orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('OrderConfirmation', { orderId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={`Open order ${item.id}`}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">{item.id}</AppText>
              <AppText variant="small" color={colors.muted}>
                {formatDate(item.createdAt)} · {item.lines.reduce((n, l) => n + l.quantity, 0)} items
              </AppText>
              <AppText variant="small" color={colors.caramel} style={{ fontFamily: 'Manrope_700Bold', marginTop: 2 }}>
                {formatRwf(item.totalRwf)} · Demo order
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            message="Place a demo order from the shop to see it here."
            actionLabel="Browse the shop"
            onAction={() => navigation.navigate('Main', { screen: 'Shop' })}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 10, ...shadow },
});
