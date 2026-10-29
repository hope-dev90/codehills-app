import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState } from '../components/StateViews';
import { colors, radius } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { config } from '../services/config';
import { formatRwf } from '../utils/format';
import { hasErrors, validateRequired, isPhone } from '../utils/validation';

function ImigongoPattern({
  id,
  color,
  style,
}: {
  id: string;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Svg style={style} width="100%" height="100%">
      <Defs>
        <Pattern id={id} width={56} height={56} patternUnits="userSpaceOnUse">
          <Path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke={color} strokeWidth={2} />
          <Path d="M28 12 L44 28 L28 44 L12 28 Z" fill="none" stroke={color} strokeWidth={2} />
          <Path d="M28 22 L34 28 L28 34 L22 28 Z" fill={color} />
          <Path
            d="M0 0 L6 0 L0 6 Z M56 0 L50 0 L56 6 Z M0 56 L6 56 L0 50 Z M56 56 L50 56 L56 50 Z"
            fill={color}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

const DARK = '#3B2416';
const CREAM = '#FBF4EA';
const MUTED = '#8A7566';
const BORDER = '#E6D9C8';
const CARAMEL = '#B5651D';

const BAND_BG = '#e8e3dfff';
const BAND_LINE = 'rgba(214,170,120,0.55)';
const VISIBLE_CARDS = 2;

/** Cart screen, matching the "Cart / Checkout Screen" design. */
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
  const [listHeight, setListHeight] = useState(0);

  const items = data.cart;
  const shipping = items.length > 0 ? config.demoShippingRwf : 0;
  const total = cartSubtotal + shipping;

  // Two cards always fill the list area exactly. Extra items scroll.
  // The items live in ONE white card; each row is half of its height.
  // Row height scales with screen width (like the mockup) but never exceeds what fits two rows.
  const { width: screenWidth } = useWindowDimensions();
  const fitHeight = listHeight > 0 ? Math.floor((listHeight - 16 - 2) / VISIBLE_CARDS) : 0;
  const cardHeight = fitHeight > 0 ? Math.min(fitHeight, Math.round(screenWidth * 0.3)) : 0;
  const thumbSize = Math.max(44, cardHeight - 20);

  const onListLayout = (e: LayoutChangeEvent) => setListHeight(e.nativeEvent.layout.height);

  const confirmRemove = (id: string, name: string) =>
    Alert.alert('Remove item', `Remove ${name} from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
    ]);

  const goBack = () => (step === 'checkout' ? setStep('cart') : navigation.goBack());

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

  const Header = (
    <View style={styles.header}>
      <Pressable
        onPress={goBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={22} color={DARK} />
      </Pressable>
      <View>
        <AppText variant="heading" color={DARK}>
          {step === 'cart' ? 'Cart' : 'Checkout'}
        </AppText>
        <Text style={styles.subtitle}>
          {step === 'cart' ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : 'Demo checkout'}
        </Text>
      </View>
    </View>
  );

  const Summary = (
    <View style={styles.summary}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Subtotal</Text>
        <Text style={styles.rowValue}>{formatRwf(cartSubtotal)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Shipping</Text>
        <Text style={styles.rowValue}>{formatRwf(shipping)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatRwf(total)}</Text>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <Screen padBottom>
        {Header}
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
      {Header}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 'cart' ? (
          <View style={styles.page}>
            {/* List area: always sized for exactly two cards. */}
            <View style={styles.list} onLayout={onListLayout}>
             <View style={[styles.listCard, { height: cardHeight * VISIBLE_CARDS + 2 }]}>
              {cardHeight > 0 && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={items.length > VISIBLE_CARDS}
                  snapToInterval={cardHeight}
                  decelerationRate="fast"
                >
                  {items.map((item, index) => (
                    <View
                      key={item.productId}
                      style={[
                        styles.item,
                        { height: cardHeight },
                        index !== items.length - 1 && styles.itemDivider,
                      ]}
                    >
                      <View style={[styles.thumbWrap, { width: thumbSize, height: thumbSize }]}>
                        <SmartImage
                          imageKey={item.image}
                          uri={item.imageUrl}
                          style={{ width: thumbSize, height: thumbSize, borderRadius: 10 }}
                        />
                      </View>
                      <View style={styles.itemBody}>
                        <AppText variant="subheading" numberOfLines={1} color={DARK}>
                          {item.name}
                        </AppText>
                        <Text style={styles.itemPrice}>{formatRwf(item.priceRwf)}</Text>
                        <View style={styles.stepper}>
                          <Pressable
                            onPress={() => setCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Decrease quantity"
                            style={styles.stepBtn}
                          >
                            <Ionicons name="remove" size={14} color={DARK} />
                          </Pressable>
                          <Text style={styles.qty}>{item.quantity}</Text>
                          <Pressable
                            onPress={() => setCartQuantity(item.productId, item.quantity + 1)}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Increase quantity"
                            style={styles.stepBtn}
                          >
                            <Ionicons name="add" size={14} color={DARK} />
                          </Pressable>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => confirmRemove(item.productId, item.name)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.name}`}
                        style={styles.trash}
                      >
                        <Ionicons name="trash-outline" size={18} color={MUTED} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
             </View>
            </View>

            {/* Footer pinned to the bottom: summary + button. */}
            <View style={styles.footer}>
              {Summary}
              <Pressable
                onPress={() => setStep('checkout')}
                accessibilityRole="button"
                accessibilityLabel="Proceed to Checkout"
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.ctaText}>Proceed to Checkout</Text>
              </Pressable>
            </View>

            {/* Imigongo band under the checkout button */}
            <View style={styles.patternBand} pointerEvents="none">
              <ImigongoPattern id="cartBottom" color={BAND_LINE} style={StyleSheet.absoluteFill} />
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center', marginRight: 8 },
  title: { fontFamily: 'Manrope_700Bold', fontSize: 22, lineHeight: 28, color: DARK },
  subtitle: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16, color: MUTED },

  page: { flex: 1 },
  list: { flex: 1, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  footer: { paddingHorizontal: 20, paddingBottom: 16 },
  patternBand: { height: 36, width: '100%', overflow: 'hidden', backgroundColor: BAND_BG },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: BORDER },
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  thumbWrap: { borderRadius: 10, overflow: 'hidden', backgroundColor: CREAM },
  itemBody: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontFamily: 'Manrope_700Bold', fontSize: 14, lineHeight: 20, color: DARK },
  itemPrice: { fontFamily: 'Manrope_700Bold', fontSize: 13, lineHeight: 18, color: CARAMEL, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: DARK,
    minWidth: 28,
    textAlign: 'center',
  },
  trash: { alignSelf: 'flex-start', padding: 4 },

  summary: { paddingHorizontal: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: MUTED },
  rowValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: DARK },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 8 },
  totalLabel: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: DARK },
  totalValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: DARK },

  cta: {
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#FFFFFF' },

  h: { marginTop: 8, marginBottom: 12 },
  payBox: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
});