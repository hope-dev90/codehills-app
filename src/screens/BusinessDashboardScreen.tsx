import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState } from '../components/StateViews';
import { colors, radius, shadow } from '../theme';
import { demoBusinessOrders } from '../data/business';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useLearningResources } from '../hooks/useResource';
import { formatRwf } from '../utils/format';
import { hasErrors, validatePositiveNumber, validateRequired } from '../utils/validation';

/** Screen 15: business profile, products, demo orders, demo earnings, rewards and learning. */
export default function BusinessDashboardScreen() {
  const navigation = useRootNav();
  const { data, addBusinessProduct, removeBusinessProduct } = useApp();
  const resources = useLearningResources();
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const business = data.business;
  if (!business) {
    return (
      <Screen>
        <ScreenHeader title="My Business" showBack onBack={() => navigation.navigate('Main', { screen: 'Profile' })} />
        <EmptyState
          icon="storefront-outline"
          title="No business yet"
          message="Create your business to manage products and orders."
          actionLabel="Create Your Business"
          onAction={() => navigation.replace('CreateBusiness')}
        />
      </Screen>
    );
  }

  const demoEarnings = demoBusinessOrders.reduce((n, o) => n + o.totalRwf, 0);

  const addProduct = () => {
    const next = {
      name: validateRequired(pName, 'a product name', 2),
      price: validatePositiveNumber(pPrice, 'a price'),
    };
    setErrors(next);
    if (hasErrors(next)) return;
    addBusinessProduct(pName, Math.round(Number(pPrice.replace(/[,\s]/g, ''))));
    setPName('');
    setPPrice('');
  };

  return (
    <Screen padBottom>
      <ScreenHeader title="My Business" showBack onBack={() => navigation.navigate('Main', { screen: 'Profile' })} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.profile}>
          <SmartImage imageKey="artisan" uri={business.imageUri} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <AppText variant="heading" numberOfLines={1}>
              {business.name}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {business.category}
            </AppText>
          </View>
          <Button title="Edit" variant="secondary" onPress={() => navigation.navigate('CreateBusiness', { mode: 'edit' })} style={styles.edit} />
        </View>
        <AppText variant="small" color={colors.muted} style={{ marginBottom: 14 }}>
          {business.description}
        </AppText>

        <View style={styles.stats}>
          <Stat label="Demo orders" value={String(demoBusinessOrders.length)} />
          <Stat label="Demo earnings" value={formatRwf(demoEarnings)} />
          <Stat label="Story rewards" value={String(demoBusinessOrders.length)} />
        </View>
        <DemoNotice>Orders, earnings and rewards below are sample numbers, not real sales.</DemoNotice>

        <SectionTitle>Products</SectionTitle>
        {business.products.length === 0 ? (
          <AppText variant="small" color={colors.muted} style={{ marginBottom: 10 }}>
            No products yet. Add your first one below.
          </AppText>
        ) : (
          business.products.map((p) => (
            <View key={p.id} style={styles.rowCard}>
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{p.name}</AppText>
                <AppText variant="small" color={colors.caramel}>
                  {formatRwf(p.priceRwf)}
                </AppText>
              </View>
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${p.name}`}
                onPress={() =>
                  Alert.alert('Remove product', `Remove ${p.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeBusinessProduct(p.id) },
                  ])
                }
              >
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            </View>
          ))
        )}
        <View style={styles.addBox}>
          <TextField label="Product name" value={pName} onChangeText={setPName} placeholder="Product name" error={errors.name} />
          <TextField label="Price (RWF)" value={pPrice} onChangeText={setPPrice} placeholder="e.g. 8000" keyboardType="number-pad" error={errors.price} />
          <Button title="Add product" icon="add" variant="secondary" onPress={addProduct} />
        </View>

        <SectionTitle>Orders (demo)</SectionTitle>
        {demoBusinessOrders.map((o) => (
          <View key={o.id} style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">{o.customer}</AppText>
              <AppText variant="small" color={colors.muted}>
                {o.item} · {formatRwf(o.totalRwf)}
              </AppText>
            </View>
            <View style={styles.status}>
              <AppText variant="caption" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                {o.status}
              </AppText>
            </View>
          </View>
        ))}

        <SectionTitle>Business learning</SectionTitle>
        {resources.data.map((r) => (
          <Pressable
            key={r.id}
            style={styles.rowCard}
            onPress={() => navigation.navigate('LearningResource', { resourceId: r.id })}
            accessibilityRole="button"
            accessibilityLabel={`Open lesson: ${r.title}`}
          >
            <Ionicons name="school-outline" size={22} color={colors.caramel} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="subheading">{r.title}</AppText>
              <AppText variant="small" color={colors.muted}>
                {r.summary}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="heading" style={{ marginTop: 22, marginBottom: 10 }}>
      {children}
    </AppText>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="subheading" adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow },
  avatar: { width: 62, height: 62, borderRadius: radius.md },
  edit: { minHeight: 38, paddingHorizontal: 16 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 12 },
  rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginBottom: 8 },
  addBox: { backgroundColor: colors.sandstone, borderRadius: radius.lg, padding: 14, marginTop: 6 },
  status: { backgroundColor: colors.sandstone, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
});
