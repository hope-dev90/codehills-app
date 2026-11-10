/**
 * Gemini AI service — the single entry point for every AI feature in the app.
 *
 * Talks to the Gemini REST API directly (no SDK dependency) and reads the key
 * from EXPO_PUBLIC_GEMINI_API_KEY in .env.
 * Get a key at: https://aistudio.google.com/app/apikey
 *
 * Each generator falls back to a realistic, personalised demo result when no
 * API key is configured, so the UI keeps working end-to-end during development.
 */

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 45_000;

/** True when a key is configured — results are AI-generated rather than demo data. */
export function isGeminiConfigured(): boolean {
  return API_KEY.length > 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** The business details every generator works from. */
export interface BusinessPlanInput {
  name: string;
  category: string;
  description: string;
  materials: string[];
}

export interface GeminiCallOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface BusinessPlan {
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
}

/** The nine building blocks of a Business Model Canvas. */
export interface BusinessModelCanvas {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

// ─── Transport ────────────────────────────────────────────────────────────────

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

/**
 * Sends a prompt to Gemini and returns the raw text answer.
 * Applies a timeout, honours an incoming abort signal, and throws
 * user-friendly errors for the common failure modes.
 */
async function callGemini(
  prompt: string,
  { signal, timeoutMs = TIMEOUT_MS, json = false }: GeminiCallOptions & { json?: boolean } = {},
): Promise<string> {
  const ctl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctl.abort();
  }, timeoutMs);

  const onAbort = () => ctl.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: json
          ? { temperature: 0.7, responseMimeType: 'application/json' }
          : { temperature: 0.7, maxOutputTokens: 200 },
      }),
    });

    const body = (await res.json()) as GeminiResponse;
    if (!res.ok || body.error) {
      throw new Error(body.error?.message ?? `Gemini request failed (${res.status}).`);
    }

    const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    if (!text) throw new Error('Gemini returned an empty answer. Please try again.');
    return text;
  } catch (e: unknown) {
    if (timedOut) throw new Error('Gemini took too long to respond. Check your connection and try again.');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

const stripFence = (raw: string) =>
  raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

const asList = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];
const asText = (v: unknown): string => (v == null ? '' : String(v));
const asInt = (v: unknown): number => Math.round(Number(v) || 0);

function parsePlan(raw: string): BusinessPlan {
  const j = JSON.parse(stripFence(raw)) as Record<string, unknown>;
  return {
    summary: asText(j.summary),
    targetCustomers: asStrings(j.targetCustomers),
    valueProposition: asText(j.valueProposition),
    rawMaterials: asList(j.rawMaterials).map((m) => ({
      name: asText((m as { name?: unknown })?.name),
      sourcing: asText((m as { sourcing?: unknown })?.sourcing),
    })),
    productIdeas: asList(j.productIdeas).map((p) => ({
      name: asText((p as { name?: unknown })?.name),
      description: asText((p as { description?: unknown })?.description),
      priceRwf: asInt((p as { priceRwf?: unknown })?.priceRwf),
    })),
    startupCosts: asList(j.startupCosts).map((c) => ({
      item: asText((c as { item?: unknown })?.item),
      costRwf: asInt((c as { costRwf?: unknown })?.costRwf),
    })),
    marketing: asStrings(j.marketing),
    operations: asStrings(j.operations),
    risks: asStrings(j.risks),
    nextSteps: asStrings(j.nextSteps),
  };
}

function parseModel(raw: string): BusinessModelCanvas {
  const j = JSON.parse(stripFence(raw)) as Record<string, unknown>;
  return {
    keyPartners: asStrings(j.keyPartners),
    keyActivities: asStrings(j.keyActivities),
    keyResources: asStrings(j.keyResources),
    valuePropositions: asStrings(j.valuePropositions),
    customerRelationships: asStrings(j.customerRelationships),
    channels: asStrings(j.channels),
    customerSegments: asStrings(j.customerSegments),
    costStructure: asStrings(j.costStructure),
    revenueStreams: asStrings(j.revenueStreams),
  };
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

function contextBlock(input: BusinessPlanInput): string {
  return `Business name: ${input.name}
Category: ${input.category}
Description: ${input.description}
Raw materials the owner wants to use: ${input.materials.length ? input.materials.join(', ') : 'not specified'}`;
}

function buildPlanPrompt(input: BusinessPlanInput): string {
  return `You are a business advisor for small entrepreneurs in Rwanda.

Write a practical, realistic starter business plan for this business. Use Rwandan francs (RWF) for every amount, keep it simple and specific to Rwanda, and keep each text item to one or two short sentences.

${contextBlock(input)}

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

function buildModelPrompt(input: BusinessPlanInput): string {
  return `You are a business advisor for small entrepreneurs in Rwanda.

Create a Business Model Canvas for this business. Cover the nine building blocks below, keep every item specific to Rwanda, mention Rwandan francs (RWF) where money is involved, and keep each item to one short sentence.

${contextBlock(input)}

Reply with ONLY a JSON object in exactly this shape:
{
  "keyPartners": string[],
  "keyActivities": string[],
  "keyResources": string[],
  "valuePropositions": string[],
  "customerRelationships": string[],
  "channels": string[],
  "customerSegments": string[],
  "costStructure": string[],
  "revenueStreams": string[]
}

Give 3 to 5 items in each list.`;
}

// ─── Generators ───────────────────────────────────────────────────────────────

/** Generates a full starter business plan from the owner's details. */
export async function generateBusinessPlan(
  input: BusinessPlanInput,
  opts: GeminiCallOptions = {},
): Promise<BusinessPlan> {
  if (!API_KEY) return demoPlan(input);
  const text = await callGemini(buildPlanPrompt(input), { ...opts, json: true });
  try {
    return parsePlan(text);
  } catch {
    throw new Error('Could not read the business plan from Gemini. Please try again.');
  }
}

/** Generates a Business Model Canvas from the owner's details. */
export async function generateBusinessModel(
  input: BusinessPlanInput,
  opts: GeminiCallOptions = {},
): Promise<BusinessModelCanvas> {
  if (!API_KEY) return demoModel(input);
  const text = await callGemini(buildModelPrompt(input), { ...opts, json: true });
  try {
    return parseModel(text);
  } catch {
    throw new Error('Could not read the business model from Gemini. Please try again.');
  }
}

/**
 * Generates a short business description (2–3 sentences) from the selected
 * raw materials and category — used to pre-fill the create-business form.
 */
export async function generateBusinessDescription(
  materials: string[],
  category: string,
  businessName?: string,
): Promise<string> {
  if (!API_KEY) return demoDescription(materials, category, businessName);

  const materialsText = materials.join(', ');
  const nameHint = businessName?.trim() ? ` called "${businessName.trim()}"` : '';

  const prompt = `You are a helpful business advisor specialising in Rwandan small businesses.

Write a short, compelling business description (2 to 3 sentences) for a ${category} business${nameHint} in Rwanda that uses the following raw materials: ${materialsText}.

The description should:
- Explain what the business does and what it produces or offers
- Mention the specific raw materials it uses
- Highlight its connection to Rwandan culture or heritage
- Be written in a warm, professional tone suitable for a business profile

Return only the description text, with no headings, bullet points or extra formatting.`;

  return callGemini(prompt);
}

// ─── Demo fallbacks (used when no API key is configured) ──────────────────────

function demoDescription(materials: string[], category: string, businessName?: string): string {
  const name = businessName?.trim() || 'this business';
  const mats = materials.length > 0 ? materials.join(', ') : 'local Rwandan materials';
  return (
    `${name} is a ${category} venture rooted in Rwanda's rich natural heritage, ` +
    `crafting premium products from locally sourced ${mats}. ` +
    `By working directly with Rwandan farmers and cooperatives, the business ensures fair trade practices ` +
    `while delivering authentic, high-quality goods that celebrate the flavours and traditions of Rwanda. ` +
    `With a focus on sustainable production and community impact, ${name} connects local artisans ` +
    `with customers who value culture, quality, and purpose.`
  );
}

function demoPlan(input: BusinessPlanInput): BusinessPlan {
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
      sourcing: 'Source directly from local cooperatives and farmers in the surrounding provinces.',
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
      'Register your business with RDB (Rwanda Development Board) online at rdb.rw.',
      'Open a dedicated business bank account to separate personal and business funds.',
      `Place your first small test order of ${mats[0]} and produce a sample batch.`,
      'Get feedback from five potential customers before scaling up production.',
      'Apply for a small business loan or grant from BRD or a local microfinance institution.',
    ],
  };
}

function demoModel(input: BusinessPlanInput): BusinessModelCanvas {
  const name = input.name || 'Your Business';
  const mats = input.materials.length ? input.materials : ['local Rwandan materials'];
  return {
    keyPartners: [
      `Local farmers and cooperatives supplying ${mats.join(', ')}`,
      'Rwanda Development Board (RDB) and sector associations',
      'Packaging and transport suppliers in Kigali',
      'Microfinance institutions and business support programmes',
    ],
    keyActivities: [
      'Sourcing and quality-checking raw materials from local suppliers',
      'Processing, packaging and labelling products',
      'Selling through markets, online channels and partner outlets',
    ],
    keyResources: [
      'Skilled founders and staff',
      'Processing and packaging equipment',
      'Brand, recipes and product know-how',
    ],
    valuePropositions: [
      `${name} offers authentic Rwandan products made from traceable local materials.`,
      'Consistent quality at fair prices for customers.',
      'Every purchase supports local farmers and artisans.',
    ],
    customerRelationships: [
      'Personal service over WhatsApp Business and at local markets',
      'Repeat-customer offers and community referrals',
    ],
    channels: [
      'Local markets such as Kimironko and Nyabugogo',
      'WhatsApp Business and social media',
      'Hotels, restaurants and retail shops',
    ],
    customerSegments: [
      'Households in Kigali and nearby towns',
      'Hotels, restaurants and cafés',
      'Diaspora and export buyers',
    ],
    costStructure: [
      'Raw material purchases (largest cost)',
      'Packaging, transport and labour',
      'Licences, marketing and equipment upkeep',
    ],
    revenueStreams: [
      'Direct retail sales at markets and online',
      'Wholesale orders from businesses',
      'Gift sets and seasonal bulk orders',
    ],
  };
}
