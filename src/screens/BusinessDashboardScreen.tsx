import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SmartImage } from '../components/SmartImage';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { TextField } from '../components/TextField';
import { EmptyState } from '../components/StateViews';
import { colors, radius, shadow } from '../theme';
import { demoBusinessOrders } from '../data/business';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useLearningResources } from '../hooks/useResource';
import { formatRwf } from '../utils/format';
import { hasErrors, validatePositiveNumber, validateRequired } from '../utils/validation';
import type { RootStackParamList } from '../navigation/types';

/* -------------------------------------------------------------------------- */
/* Gemini                                                                      */
/* -------------------------------------------------------------------------- */

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TIMEOUT_MS = 45000;

type PlanState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; plan: BusinessPlan }
  | { status: 'error'; message: string };

type PlanAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; plan: BusinessPlan }
  | { type: 'FETCH_ERROR'; message: string };

function planReducer(_: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case 'FETCH_START': return { status: 'loading' };
    case 'FETCH_SUCCESS': return { status: 'success', plan: action.plan };
    case 'FETCH_ERROR': return { status: 'error', message: action.message };
  }
}

type BusinessPlan = {
  summary: string;
  targetCustomers: string[];
  valueProposition: string;
  rawMaterials: { name: string; sourcing: string }[];
  productIdeas: { name: string; description: string; priceRwf: number }[];
  startupCosts: { item: string; costRwf: number }[];
  marketing: string[];
  operations: string[];
  risks: string[];
  nextSteps: string[];
};

type PlanInput = {
  name: string;
  category: string;
  description: string;
  materials: string[];
};

function buildPrompt(input: PlanInput) {
  return `You are a business advisor for small entrepreneurs in Rwanda.

Write a practical, realistic starter business plan for this business. Use Rwandan francs (RWF) for every amount, keep it simple and specific to Rwanda, and keep each text item to one or two short sentences.

Business name: ${input.name}
Category: ${input.category}
Description: ${input.description}
Raw materials the owner wants to use: ${input.materials.length ? input.materials.join(', ') : 'not specified'}

Reply with ONLY a JSON object in exactly this shape:
{
  "summary": string,
  "targetCustomers": string[],
  "valueProposition": string,
  "rawMaterials": [{ "name": string, "sourcing": string }],
  "productIdeas": [{ "name": string, "description": string, "priceRwf": number }],
  "startupCosts": [{ "item": string, "costRwf": number }],
  "marketing": string[],
  "operations": string[],
  "risks": string[],
  "nextSteps": string[]
}

Give 3 to 5 items in each list.`;
}

const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];

function parsePlan(raw: string): BusinessPlan {
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const j = JSON.parse(cleaned);
  const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
  return {
    summary: String(j.summary ?? ''),
    targetCustomers: asStrings(j.targetCustomers),
    valueProposition: String(j.valueProposition ?? ''),
    rawMaterials: list(j.rawMaterials).map((m) => ({
      name: String((m as { name?: unknown })?.name ?? ''),
      sourcing: String((m as { sourcing?: unknown })?.sourcing ?? ''),
    })),
    productIdeas: list(j.productIdeas).map((p) => ({
      name: String((p as { name?: unknown })?.name ?? ''),
      description: String((p as { description?: unknown })?.description ?? ''),
      priceRwf: Math.round(Number((p as { priceRwf?: unknown })?.priceRwf) || 0),
    })),
    startupCosts: list(j.startupCosts).map((c) => ({
      item: String((c as { item?: unknown })?.item ?? ''),
      costRwf: Math.round(Number((c as { costRwf?: unknown })?.costRwf) || 0),
    })),
    marketing: asStrings(j.marketing),
    operations: asStrings(j.operations),
    risks: asStrings(j.risks),
    nextSteps: asStrings(j.nextSteps),
  };
}

/** Hardcoded demo plan returned when no Gemini API key is configured. */
function demoPlan(input: PlanInput): BusinessPlan {
  const name = input.name || 'Your Business';
  const mats = input.materials.length ? input.materials : ['local Rwandan materials'];
  return {
    summary:
      `${name} is a ${input.category} business in Rwanda that transforms ${mats.join(', ')} ` +
      `into premium products for local and export markets. ` +
      `Rooted in Rwandan heritage, it combines quality craftsmanship with sustainable sourcing.`,
    targetCustomers: [
      'Local households and markets in Kigali and nearby towns',
      'Hotels and restaurants seeking locally produced goods',
      'Export buyers and diaspora customers interested in Rwandan products',
      'NGOs and cooperatives supporting Rwandan smallholder farmers',
    ],
    valueProposition:
      `${name} offers authentic, traceable Rwandan products made from the finest local raw materials, ` +
      `giving customers quality they can trust and a story they can share.`,
    rawMaterials: mats.slice(0, 5).map((m) => ({
      name: m,
      sourcing: `Source directly from local cooperatives and farmers in the surrounding provinces.`,
    })),
    productIdeas: [
      { name: `Premium ${mats[0]} Pack`, description: 'Packaged for retail sale in supermarkets and online.', priceRwf: 8000 },
      { name: `${mats[0]} Gift Set`, description: 'Curated gift box targeted at hotels and tourist shops.', priceRwf: 25000 },
      { name: `Artisan ${mats[0]} Collection`, description: 'Small-batch, handcrafted product for export and premium buyers.', priceRwf: 45000 },
      { name: 'Wholesale Bulk Supply', description: 'Bulk orders for restaurants, caterers, and distributors.', priceRwf: 150000 },
    ],
    startupCosts: [
      { item: 'Initial raw material stock', costRwf: 200000 },
      { item: 'Basic processing and packaging equipment', costRwf: 350000 },
      { item: 'Business registration and licenses', costRwf: 80000 },
      { item: 'Branding, labels and marketing materials', costRwf: 60000 },
      { item: 'First month operational costs (transport, phone, etc.)', costRwf: 50000 },
    ],
    marketing: [
      'Create a WhatsApp Business profile and share products with local groups.',
      'Sell at local markets (Kimironko, Nyabugogo) on weekends to build awareness.',
      'Partner with hotels and guesthouses in Kigali to supply directly.',
      'Use Instagram and Facebook to post product photos and customer stories.',
      'Offer free samples to key decision-makers and cooperatives.',
    ],
    operations: [
      'Source raw materials weekly from trusted local farmers and cooperatives.',
      'Process and package products in a clean, dedicated workspace.',
      'Keep a simple stock register to track inventory and sales.',
      'Deliver orders within 24–48 hours using moto delivery in Kigali.',
      'Review pricing and stock every month and adjust based on demand.',
    ],
    risks: [
      'Seasonal supply fluctuations — build a small buffer stock during harvest season.',
      'Price competition from established brands — differentiate with quality and story.',
      'Cash flow gaps between purchasing materials and receiving payment — negotiate credit terms.',
      'Quality inconsistency — establish clear supplier standards and inspect every batch.',
    ],
    nextSteps: [
      `Register your business with RDB (Rwanda Development Board) online at rdb.rw.`,
      'Open a dedicated business bank account to separate personal and business funds.',
      `Place your first small test order of ${mats[0]} and produce a sample batch.`,
      'Get feedback from five potential customers before scaling up production.',
      'Apply for a small business loan or grant from BRD or a local microfinance institution.',
    ],
  };
}

async function fetchBusinessPlan(input: PlanInput, signal: AbortSignal): Promise<BusinessPlan> {
  if (!GEMINI_KEY) {
    // No API key yet — return a realistic hardcoded plan so the UI works end-to-end.
    return demoPlan(input);
  }

  const ctl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctl.abort();
  }, TIMEOUT_MS);

  const onAbort = () => ctl.abort();
  signal.addEventListener('abort', onAbort);

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      let detail = '';
      try {
        const body = await res.json();
        detail = (body as { error?: { message?: string } })?.error?.message ?? '';
      } catch { /* ignore */ }
      throw new Error(detail || `Gemini request failed (${res.status}).`);
    }

    const body = await res.json();
    const text: string | undefined = (
      body as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    )?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('');

    if (!text) throw new Error('Gemini returned an empty answer. Please try again.');

    try {
      return parsePlan(text);
    } catch {
      throw new Error('Could not read the business plan from Gemini. Please try again.');
    }
  } catch (e: unknown) {
    if (timedOut) throw new Error('Gemini took too long to respond. Check your connection and try again.');
    throw e;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                      */
/* -------------------------------------------------------------------------- */

type Tab = 'plan' | 'products' | 'orders' | 'learning';

const tabs: { id: Tab; label: string }[] = [
  { id: 'plan', label: 'Business Plan' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'learning', label: 'Learning' },
];

/** Screen 15: business profile with an AI-generated business plan, products, demo orders and learning. */
export default function BusinessDashboardScreen() {
  const navigation = useRootNav();
  const { params } = useRoute<RouteProp<RootStackParamList, 'BusinessDashboard'>>();
  const { data, addBusinessProduct, removeBusinessProduct } = useApp();
  const resources = useLearningResources();

  const materials = useMemo(
    () => (params?.materials ?? []).filter(Boolean),
    [params],
  );
  const materialsKey = materials.join('|');

  const [tab, setTab] = useState<Tab>('plan');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [planState, dispatch] = useReducer(planReducer, { status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  const business = data.business;

  useEffect(() => {
    if (!business) return;
    const controller = new AbortController();
    dispatch({ type: 'FETCH_START' });
    fetchBusinessPlan(
      { name: business.name, category: business.category, description: business.description, materials },
      controller.signal,
    )
      .then((p) => { if (!controller.signal.aborted) dispatch({ type: 'FETCH_SUCCESS', plan: p }); })
      .catch((e: Error) => {
        if (!controller.signal.aborted) dispatch({ type: 'FETCH_ERROR', message: e.message || 'Something went wrong.' });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.name, business?.category, business?.description, materialsKey, attempt]);

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

  const addIdeaAsProduct = (name: string, priceRwf: number) => {
    if (!name || priceRwf <= 0) return;
    if (business.products.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Already added', `${name} is already in your products.`);
      return;
    }
    addBusinessProduct(name, priceRwf);
    Alert.alert('Product added', `${name} was added to your products.`);
  };

  return (
    <Screen padBottom>
      <ScreenHeader title="My Business" showBack onBack={() => navigation.navigate('Main', { screen: 'Profile' })} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Profile */}
        <View style={styles.profile}>
          <SmartImage imageKey="artisan" uri={business.imageUri} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <AppText variant="heading" numberOfLines={1}>{business.name}</AppText>
            <AppText variant="small" color={colors.muted}>{business.category}</AppText>
          </View>
          <Button title="Edit" variant="secondary" onPress={() => navigation.navigate('CreateBusiness', { mode: 'edit' })} style={styles.edit} />
        </View>

        <AppText variant="small" color={colors.muted} style={{ marginBottom: 12 }}>
          {business.description}
        </AppText>

        {materials.length > 0 && (
          <View style={styles.materialsRow}>
            {materials.map((m) => (
              <View key={m} style={styles.materialPill}>
                <Ionicons name="leaf-outline" size={12} color={colors.caramel} />
                <AppText variant="caption" color={colors.chocolate}>{m}</AppText>
              </View>
            ))}
          </View>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((t) => (
            <Chip key={t.id} label={t.label} selected={tab === t.id} onPress={() => setTab(t.id)} />
          ))}
        </ScrollView>

        {/* Business plan */}
        {tab === 'plan' && (
          <View>
            {planState.status === 'loading' && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.caramel} />
                <AppText variant="subheading" style={{ marginTop: 14 }}>Writing your business plan...</AppText>
                <AppText variant="small" color={colors.muted} style={styles.center}>
                  Gemini is building a plan from your business details and the raw materials you chose.
                </AppText>
              </View>
            )}
            {planState.status === 'error' && (
              <View style={styles.stateBox}>
                <Ionicons name="alert-circle-outline" size={34} color={colors.danger} />
                <AppText variant="subheading" style={{ marginTop: 10 }}>Could not create the plan</AppText>
                <AppText variant="small" color={colors.muted} style={[styles.center, { marginBottom: 14 }]}>
                  {planState.message}
                </AppText>
                <Button title="Try again" icon="refresh" variant="secondary" onPress={() => setAttempt((a) => a + 1)} />
              </View>
            )}
            {planState.status === 'success' && (
              <PlanView plan={planState.plan} onAddProduct={addIdeaAsProduct} onRegenerate={() => setAttempt((a) => a + 1)} />
            )}
          </View>
        )}

        {/* Products */}
        {tab === 'products' && (
          <View>
            <SectionTitle>Products</SectionTitle>
            {business.products.length === 0 ? (
              <AppText variant="small" color={colors.muted} style={{ marginBottom: 10 }}>
                No products yet. Add your first one below, or use a product idea from your business plan.
              </AppText>
            ) : (
              business.products.map((p) => (
                <View key={p.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subheading">{p.name}</AppText>
                    <AppText variant="small" color={colors.caramel}>{formatRwf(p.priceRwf)}</AppText>
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
          </View>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <View>
            <View style={styles.stats}>
              <Stat label="Orders" value={String(demoBusinessOrders.length)} />
              <Stat label="Earnings" value={formatRwf(demoEarnings)} />
              <Stat label="Story rewards" value={String(demoBusinessOrders.length)} />
            </View>
            <SectionTitle>Orders</SectionTitle>
            {demoBusinessOrders.map((o) => (
              <View key={o.id} style={styles.rowCard}>
                <View style={{ flex: 1 }}>
                  <AppText variant="subheading">{o.customer}</AppText>
                  <AppText variant="small" color={colors.muted}>{o.item} · {formatRwf(o.totalRwf)}</AppText>
                </View>
                <View style={styles.status}>
                  <AppText variant="caption" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                    {o.status}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Learning */}
        {tab === 'learning' && (
          <View>
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
                  <AppText variant="small" color={colors.muted}>{r.summary}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </Screen>
  );
}

/* -------------------------------------------------------------------------- */
/* Plan view                                                                   */
/* -------------------------------------------------------------------------- */

function PlanView({
  plan,
  onAddProduct,
  onRegenerate,
}: {
  plan: BusinessPlan;
  onAddProduct: (name: string, priceRwf: number) => void;
  onRegenerate: () => void;
}) {
  const totalCost = plan.startupCosts.reduce((n, c) => n + c.costRwf, 0);
  return (
    <View>
      <View style={styles.hero}>
        <View style={styles.heroTag}>
          <Ionicons name="sparkles" size={13} color={colors.white} />
          <AppText variant="caption" color={colors.white} style={{ fontFamily: 'Manrope_700Bold' }}>
            Your business plan
          </AppText>
        </View>
        <AppText variant="body" color={colors.white} style={{ marginTop: 10 }}>{plan.summary}</AppText>
      </View>

      {plan.valueProposition ? (
        <PlanCard icon="diamond-outline" title="What makes you different">
          <AppText variant="body">{plan.valueProposition}</AppText>
        </PlanCard>
      ) : null}

      {plan.targetCustomers.length > 0 && (
        <PlanCard icon="people-outline" title="Who will buy from you">
          <BulletList items={plan.targetCustomers} />
        </PlanCard>
      )}

      {plan.rawMaterials.length > 0 && (
        <PlanCard icon="leaf-outline" title="Raw materials and sourcing">
          {plan.rawMaterials.map((m, i) => (
            <View key={`${m.name}-${i}`} style={styles.item}>
              <AppText variant="subheading">{m.name}</AppText>
              <AppText variant="small" color={colors.muted}>{m.sourcing}</AppText>
            </View>
          ))}
        </PlanCard>
      )}

      {plan.productIdeas.length > 0 && (
        <PlanCard icon="cube-outline" title="Product ideas">
          {plan.productIdeas.map((p, i) => (
            <View key={`${p.name}-${i}`} style={[styles.item, styles.ideaRow]}>
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{p.name}</AppText>
                <AppText variant="small" color={colors.muted}>{p.description}</AppText>
                {p.priceRwf > 0 && (
                  <AppText variant="small" color={colors.caramel} style={{ marginTop: 2 }}>
                    {formatRwf(p.priceRwf)}
                  </AppText>
                )}
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => onAddProduct(p.name, p.priceRwf)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${p.name} to my products`}
                style={styles.addIdea}
              >
                <Ionicons name="add" size={20} color={colors.white} />
              </Pressable>
            </View>
          ))}
        </PlanCard>
      )}

      {plan.startupCosts.length > 0 && (
        <PlanCard icon="cash-outline" title="Estimated startup costs">
          {plan.startupCosts.map((c, i) => (
            <View key={`${c.item}-${i}`} style={styles.costRow}>
              <AppText variant="small" style={{ flex: 1 }}>{c.item}</AppText>
              <AppText variant="small" color={colors.chocolate} style={{ fontFamily: 'Manrope_700Bold' }}>
                {formatRwf(c.costRwf)}
              </AppText>
            </View>
          ))}
          <View style={[styles.costRow, styles.totalRow]}>
            <AppText variant="subheading" style={{ flex: 1 }}>Total</AppText>
            <AppText variant="subheading" color={colors.caramel}>{formatRwf(totalCost)}</AppText>
          </View>
        </PlanCard>
      )}

      {plan.marketing.length > 0 && (
        <PlanCard icon="megaphone-outline" title="Marketing">
          <BulletList items={plan.marketing} />
        </PlanCard>
      )}

      {plan.operations.length > 0 && (
        <PlanCard icon="construct-outline" title="How you will operate">
          <BulletList items={plan.operations} />
        </PlanCard>
      )}

      {plan.risks.length > 0 && (
        <PlanCard icon="warning-outline" title="Risks to watch">
          <BulletList items={plan.risks} />
        </PlanCard>
      )}

      {plan.nextSteps.length > 0 && (
        <PlanCard icon="checkmark-done-outline" title="Your next steps">
          {plan.nextSteps.map((s, i) => (
            <View key={`${s}-${i}`} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <AppText variant="caption" color={colors.white} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {i + 1}
                </AppText>
              </View>
              <AppText variant="small" style={{ flex: 1 }}>{s}</AppText>
            </View>
          ))}
        </PlanCard>
      )}

      <AppText variant="caption" color={colors.muted} style={{ marginTop: 6, marginBottom: 12 }}>
        {GEMINI_KEY
          ? 'Created by Gemini. Amounts are rough estimates — check prices in your local market before spending.'
          : 'Demo plan — add EXPO_PUBLIC_GEMINI_API_KEY to .env for a personalised AI-generated plan.'}
      </AppText>
      <Button title="Regenerate plan" icon="refresh" variant="secondary" onPress={onRegenerate} />
    </View>
  );
}

function PlanCard({
  icon,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.planCard}>
      <View style={styles.planHead}>
        <View style={styles.planIcon}>
          <Ionicons name={icon} size={16} color={colors.white} />
        </View>
        <AppText variant="subheading">{title}</AppText>
      </View>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <View key={`${t}-${i}`} style={styles.bulletRow}>
          <View style={styles.bullet} />
          <AppText variant="small" style={{ flex: 1 }}>{t}</AppText>
        </View>
      ))}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="heading" style={{ marginTop: 18, marginBottom: 10 }}>{children}</AppText>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" color={colors.muted}>{label}</AppText>
      <AppText variant="subheading" adjustsFontSizeToFit numberOfLines={1}>{value}</AppText>
    </View>
  );
}

const DARK_BROWN = '#5A2E14';

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow },
  avatar: { width: 62, height: 62, borderRadius: radius.md },
  edit: { minHeight: 38, paddingHorizontal: 16 },
  materialsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  materialPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.sandstone, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tabs: { gap: 8, paddingVertical: 4, marginBottom: 6 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 12 },
  rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginBottom: 8 },
  addBox: { backgroundColor: colors.sandstone, borderRadius: radius.lg, padding: 14, marginTop: 6 },
  status: { backgroundColor: colors.sandstone, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  stateBox: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 24, marginTop: 14 },
  center: { textAlign: 'center', marginTop: 6 },
  hero: { backgroundColor: DARK_BROWN, borderRadius: radius.lg, padding: 16, marginTop: 14, marginBottom: 10 },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  planCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, marginBottom: 10 },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  planIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: DARK_BROWN, alignItems: 'center', justifyContent: 'center' },
  item: { marginBottom: 10 },
  ideaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addIdea: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.caramel, alignItems: 'center', justifyContent: 'center' },
  costRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.sandstone, marginTop: 4, paddingTop: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.caramel, marginTop: 7 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: DARK_BROWN, alignItems: 'center', justifyContent: 'center' },
});
