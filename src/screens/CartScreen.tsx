import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { QuantityStepper } from '../components/QuantityStepper';
import { TextField } from '../components/TextField';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState } from '../components/StateViews';
import { colors, radius, shadow } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { config } from '../services/config';
import { formatRwf } from '../utils/format';
import { hasErrors, validateRequired, isPhone } from '../utils/validation';

/**
 * Screen 9: cart and checkout.
 * Checkout here is a DEMO: it creates a local sample order and never takes a payment.
 */
export default function CartScreen() {
  const navigation = useRootNav();
  const { data, cartSubtotal, setCartQuantity, removeFromCart, placeDemoOrder } = useApp();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [fullName, setFullName] = useState(data.user?.fullName ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  const items = data.cart;
  const shipping = items.length > 0 ? config.demoShippingRwf : 0;
  const total = cartSubtotal + shipping;

  const confirmRemove = (id: string, name: string) =>
    Alert.alert('Remove item', `Remove ${name} from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
    ]);

  const placeOrder = async () => {
    const next = {
      fullName: validateRequired(fullName, 'your full name', 2),
      phone: !phone.trim() ? 'Enter your phone number' : !isPhone(phone) ? 'Enter a valid phone number' : undefined,
      address: validateRequired(address, 'a delivery address', 4),
      city: validateRequired(city, 'your town or city', 2),
    };
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      const order = await placeDemoOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      });
      navigation.replace('Reward', { orderId: order.id });
    } catch (e) {
      Alert.alert('Could not place the demo order', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const Summary = (
    <View style={styles.summary}>
      <Row label="Subtotal" value={formatRwf(cartSubtotal)} />
      <Row label="Shipping (demo estimate)" value={formatRwf(shipping)} />
      <View style={styles.divider} />
      <Row label="Total" value={formatRwf(total)} strong />
    </View>
  );

  if (items.length === 0) {
    return (
      <Screen padBottom>
        <ScreenHeader title="Cart" showBack />
        <EmptyState
          icon="bag-outline"
          title="Your cart is empty"
          message="Add a product from the shop to start."
          actionLabel="Browse the shop"
          onAction={() => navigation.navigate('Main', { screen: 'Shop' })}
        />
      </Screen>
    );
  }

  return (
    <Screen padBottom>
      <ScreenHeader
        title={step === 'cart' ? 'Cart' : 'Checkout'}
        subtitle={step === 'cart' ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : 'Demo checkout'}
        showBack
        onBack={() => (step === 'checkout' ? setStep('cart') : navigation.goBack())}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 'cart' ? (
            <>
              {items.map((item) => (
                <View key={item.productId} style={styles.item}>
                  <SmartImage imageKey={item.image} uri={item.imageUrl} style={styles.thumb} />
                  <View style={styles.itemBody}>
                    <AppText variant="subheading" numberOfLines={1}>
                      {item.name}
                    </AppText>
                    <AppText variant="small" color={colors.caramel} style={{ fontFamily: 'Manrope_700Bold' }}>
                      {formatRwf(item.priceRwf)}
                    </AppText>
                    <View style={{ marginTop: 8 }}>
                      <QuantityStepper
                        compact
                        value={item.quantity}
                        onChange={(q) => setCartQuantity(item.productId, q)}
                      />
                    </View>
                  </View>
                  <Pressable
                    onPress={() => confirmRemove(item.productId, item.name)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name}`}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.muted} />
                  </Pressable>
                </View>
              ))}
              {Summary}
              <Button title="Proceed to Checkout" onPress={() => setStep('checkout')} style={{ marginTop: 18 }} />
            </>
          ) : (
            <>
              <AppText variant="heading" style={styles.h}>
                Delivery details
              </AppText>
              <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Full name" error={errors.fullName} autoComplete="name" />
              <TextField label="Phone number" value={phone} onChangeText={setPhone} placeholder="+250 …" keyboardType="phone-pad" error={errors.phone} />
              <TextField label="Address" value={address} onChangeText={setAddress} placeholder="Street, sector or landmark" error={errors.address} />
              <TextField label="Town or city" value={city} onChangeText={setCity} placeholder="Town or city" error={errors.city} />

              <AppText variant="heading" style={styles.h}>
                Payment
              </AppText>
              <View style={styles.payBox}>
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.caramel} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText variant="subheading">Demo checkout</AppText>
                  <AppText variant="small" color={colors.muted}>
                    No payment is taken and no real order is created. Real payment (for example mobile money) is not integrated yet.
                  </AppText>
                </View>
              </View>

              {Summary}
              <View style={{ marginTop: 14 }}>
                <DemoNotice>
                  Placing this demo order unlocks a sample story reward. It is not a verified transaction.
                </DemoNotice>
              </View>
              <Button title="Place Demo Order" icon="checkmark-circle-outline" onPress={placeOrder} loading={busy} style={{ marginTop: 18 }} />
              <Button title="Back to cart" variant="ghost" onPress={() => setStep('cart')} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText variant={strong ? 'subheading' : 'small'} color={strong ? colors.darkBrown : colors.muted}>
        {label}
      </AppText>
      <AppText variant={strong ? 'heading' : 'small'} color={colors.darkBrown} style={strong ? undefined : { fontFamily: 'Manrope_600SemiBold' }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, marginBottom: 12, ...shadow },
  thumb: { width: 76, height: 76, borderRadius: radius.md },
  itemBody: { flex: 1, marginLeft: 12 },
  summary: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  h: { marginTop: 8, marginBottom: 12 },
  payBox: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, alignItems: 'flex-start', marginBottom: 14 },
});
