import { prisma } from '../../config/database.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { badRequest, notFound } from '../../utils/errors.js';
import { pagination } from './admin.controller.js';

// ─── Coercion helpers ─────────────────────────────────────────

const DESTINATION_CATEGORIES = ['Nature', 'Lakes', 'Culture', 'City'];
const EVENT_CATEGORIES = ['Festival', 'Coffee', 'Culture'];
const PRODUCT_CATEGORY_DB = {
  Handicrafts: 'Handicrafts',
  'Food & Drinks': 'FoodAndDrinks',
  Art: 'Art',
};
const PRODUCT_CATEGORY_DISPLAY = {
  Handicrafts: 'Handicrafts',
  FoodAndDrinks: 'Food & Drinks',
  Art: 'Art',
};
const CATEGORY_ID_BY_DB = {
  Handicrafts: 'handicrafts',
  FoodAndDrinks: 'food-drinks',
  Art: 'art',
};

const dropUndefined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through to the split below */
    }
    return value.split('\n');
  }
  return [];
};

const toStr = (v) => (v === undefined ? undefined : String(v));
const toNullableStr = (v) => (v === undefined ? undefined : v === null || v === '' ? null : String(v));

const toStringArray = (v, field) => {
  if (v === undefined) return undefined;
  if (!Array.isArray(v)) throw badRequest(`${field} must be an array of strings`, 'INVALID_ARRAY');
  return v.map((x) => String(x)).filter((s) => s.trim() !== '');
};

const toInt = (v, field) => {
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw badRequest(`${field} must be a number`, 'INVALID_NUMBER');
  return Math.round(n);
};

const toFloat = (v, field) => {
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw badRequest(`${field} must be a number`, 'INVALID_NUMBER');
  return n;
};

const toBool = (v, field) => {
  if (v === undefined) return undefined;
  if (typeof v !== 'boolean') throw badRequest(`${field} must be a boolean`, 'INVALID_BOOLEAN');
  return v;
};

const toEnum = (v, allowed, field) => {
  if (v === undefined) return undefined;
  if (!allowed.includes(v)) {
    throw badRequest(`${field} must be one of: ${allowed.join(', ')}`, 'INVALID_ENUM');
  }
  return v;
};

/** Builds a URL-safe id for the models whose `id` has no database default. */
const makeId = (text) => {
  const base = String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${base || 'item'}-${Math.random().toString(36).slice(2, 8)}`;
};

const requireFields = (data, fields, create) => {
  if (!create) return;
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw badRequest(`${field} is required`, 'MISSING_FIELD');
    }
  }
};

// ─── Row formatters ───────────────────────────────────────────

const formatStoryRow = (s) => ({
  id: s.id,
  title: s.title,
  subtitle: s.subtitle ?? '',
  category: s.category,
  summary: s.summary,
  body: asArray(s.body),
  tags: s.tags,
  imageKey: s.imageKey ?? null,
  imageUrl: s.imageUrl ?? null,
  xpReward: s.xpReward,
  isPublished: s.isPublished,
  isDemo: s.isDemo,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

const formatDestinationRow = (d) => ({
  id: d.id,
  name: d.name,
  category: d.category,
  summary: d.summary,
  description: d.description,
  latitude: d.latitude,
  longitude: d.longitude,
  imageKey: d.imageKey ?? null,
  imageUrl: d.imageUrl ?? null,
  isPublished: d.isPublished,
  isDemo: d.isDemo,
  createdAt: d.createdAt,
});

const formatEventRow = (e) => ({
  id: e.id,
  title: e.title,
  category: e.category,
  location: e.location,
  dateLabel: e.dateLabel,
  summary: e.summary,
  description: e.description,
  imageKey: e.imageKey ?? null,
  imageUrl: e.imageUrl ?? null,
  isPublished: e.isPublished,
  isDemo: e.isDemo,
  createdAt: e.createdAt,
});

const formatProductRow = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  shortDescription: p.shortDescription,
  description: p.description,
  category: PRODUCT_CATEGORY_DISPLAY[p.category] ?? p.category,
  categoryId: p.categoryId,
  priceRwf: p.priceRwf,
  craftsmanship: p.craftsmanship,
  sellerName: p.sellerName,
  imageKey: p.imageKey ?? null,
  imageUrl: p.imageUrl ?? null,
  tags: p.tags,
  artisanId: p.artisanId ?? null,
  isActive: p.isActive,
  isDemo: p.isDemo,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

const formatArtisanRow = (a) => ({
  id: a.id,
  name: a.name,
  location: a.location,
  bio: a.bio ?? null,
  imageUrl: a.imageUrl ?? null,
  productCount: a._count?.products ?? 0,
  createdAt: a.createdAt,
});

const formatBusinessRow = (b) => ({
  id: b.id,
  name: b.name,
  category: b.category,
  description: b.description,
  imageUrl: b.imageUrl ?? null,
  ownerName: b.user?.fullName ?? null,
  ownerContact: b.user?.contact ?? null,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
  productCount: b._count?.products ?? 0,
  orderCount: b._count?.orders ?? 0,
});

const formatLearningRow = (r) => ({
  id: r.id,
  title: r.title,
  summary: r.summary,
  body: asArray(r.body),
  sortOrder: r.sortOrder,
  isPublished: r.isPublished,
  isDemo: r.isDemo,
  createdAt: r.createdAt,
});

// ─── Write builders ───────────────────────────────────────────

const storyWrite = (body, { create }) => {
  const data = dropUndefined({
    title: toStr(body.title),
    subtitle: toNullableStr(body.subtitle ?? (create ? '' : undefined)),
    category: toStr(body.category),
    summary: toStr(body.summary),
    body: toStringArray(body.body, 'body'),
    tags: toStringArray(body.tags, 'tags'),
    imageKey: toNullableStr(body.imageKey),
    imageUrl: toNullableStr(body.imageUrl),
    xpReward: toInt(body.xpReward, 'xpReward'),
    isPublished: toBool(body.isPublished, 'isPublished'),
  });
  requireFields(data, ['title', 'category', 'summary'], create);
  if (create) {
    data.body ??= [];
    data.tags ??= [];
    data.gallery = [];
    data.relatedStoryIds = [];
  }
  return data;
};

const destinationWrite = (body, { create }) => {
  const data = dropUndefined({
    name: toStr(body.name),
    category: toEnum(body.category, DESTINATION_CATEGORIES, 'category'),
    summary: toStr(body.summary),
    description: toStr(body.description),
    latitude: toFloat(body.latitude, 'latitude'),
    longitude: toFloat(body.longitude, 'longitude'),
    imageKey: toNullableStr(body.imageKey),
    imageUrl: toNullableStr(body.imageUrl),
    isPublished: toBool(body.isPublished, 'isPublished'),
  });
  requireFields(data, ['name', 'category', 'summary', 'description'], create);
  if (create) {
    data.latitude ??= 0;
    data.longitude ??= 0;
  }
  return data;
};

const eventWrite = (body, { create }) => {
  const data = dropUndefined({
    title: toStr(body.title),
    category: toEnum(body.category, EVENT_CATEGORIES, 'category'),
    location: toStr(body.location),
    dateLabel: toStr(body.dateLabel),
    summary: toStr(body.summary),
    description: toStr(body.description),
    imageKey: toNullableStr(body.imageKey),
    imageUrl: toNullableStr(body.imageUrl),
    isPublished: toBool(body.isPublished, 'isPublished'),
  });
  requireFields(data, ['title', 'category', 'location', 'dateLabel', 'summary', 'description'], create);
  return data;
};

const productWrite = (body, { create }) => {
  const category = toEnum(body.category, Object.keys(PRODUCT_CATEGORY_DB), 'category');
  const dbCategory = category === undefined ? undefined : PRODUCT_CATEGORY_DB[category];

  const data = dropUndefined({
    name: toStr(body.name),
    slug: toStr(body.slug),
    shortDescription: toStr(body.shortDescription),
    description: toStr(body.description),
    category: dbCategory,
    categoryId: toStr(body.categoryId),
    priceRwf: toInt(body.priceRwf, 'priceRwf'),
    craftsmanship: toStr(body.craftsmanship),
    sellerName: toStr(body.sellerName),
    tags: toStringArray(body.tags, 'tags'),
    imageKey: toNullableStr(body.imageKey),
    imageUrl: toNullableStr(body.imageUrl),
    artisanId: toNullableStr(body.artisanId),
    isActive: toBool(body.isActive, 'isActive'),
  });

  // Keep the denormalised categoryId in step with the enum value.
  if (dbCategory !== undefined && data.categoryId === undefined) {
    data.categoryId = CATEGORY_ID_BY_DB[dbCategory];
  }

  requireFields(data, ['name'], create);
  if (create) {
    data.slug ??= makeId(data.name);
    data.category ??= 'Handicrafts';
    data.categoryId ??= CATEGORY_ID_BY_DB[data.category];
    data.shortDescription ??= '';
    data.description ??= data.shortDescription;
    data.priceRwf ??= 0;
    data.craftsmanship ??= '';
    data.sellerName ??= '';
    data.tags ??= [];
    data.gallery = [];
  }
  return data;
};

const artisanWrite = (body, { create }) => {
  const data = dropUndefined({
    name: toStr(body.name),
    location: toStr(body.location),
    bio: toNullableStr(body.bio),
    imageUrl: toNullableStr(body.imageUrl),
  });
  requireFields(data, ['name', 'location'], create);
  return data;
};

const businessWrite = (body, { create }) => {
  const data = dropUndefined({
    name: toStr(body.name),
    category: toStr(body.category),
    description: toStr(body.description),
    imageUrl: toNullableStr(body.imageUrl),
    userId: create ? toStr(body.userId) : undefined,
  });
  requireFields(data, ['name', 'category', 'description'], create);
  if (create && !data.userId) {
    throw badRequest('userId is required to create a business', 'MISSING_USER_ID');
  }
  return data;
};

const learningWrite = (body, { create }) => {
  const data = dropUndefined({
    title: toStr(body.title),
    summary: toStr(body.summary),
    body: toStringArray(body.body, 'body'),
    sortOrder: toInt(body.sortOrder, 'sortOrder'),
    isPublished: toBool(body.isPublished, 'isPublished'),
  });
  requireFields(data, ['title', 'summary'], create);
  if (create) data.body ??= [];
  return data;
};

// ─── Generic collection factory ───────────────────────────────

function defineCollection({ label, delegate, search, publishField, orderBy, include, format, build, beforeCreate }) {
  const list = asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = pagination(req.query);
    const { q, published } = req.query;

    const where = {
      ...(publishField && published === 'true' && { [publishField]: true }),
      ...(publishField && published === 'false' && { [publishField]: false }),
      ...(q && {
        OR: search.map((field) => ({ [field]: { contains: q, mode: 'insensitive' } })),
      }),
    };

    const [items, total] = await Promise.all([
      delegate.findMany({ where, orderBy, skip, take, ...(include ? { include } : {}) }),
      delegate.count({ where }),
    ]);

    ok(res, { items: items.map(format), total, page, pageSize });
  });

  const create = asyncHandler(async (req, res) => {
    const data = build(req.body, { create: true });
    if (beforeCreate) await beforeCreate(data);
    const row = await delegate.create({ data, ...(include ? { include } : {}) });
    created(res, format(row));
  });

  const update = asyncHandler(async (req, res) => {
    const existing = await delegate.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound(`${label} not found`);

    const data = build(req.body, { create: false });
    const row = await delegate.update({
      where: { id: req.params.id },
      data,
      ...(include ? { include } : {}),
    });
    ok(res, format(row), `${label} updated`);
  });

  const remove = asyncHandler(async (req, res) => {
    const existing = await delegate.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound(`${label} not found`);
    await delegate.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id }, `${label} deleted`);
  });

  return { list, create, update, remove };
}

// ─── Registry ─────────────────────────────────────────────────

export const collections = {
  stories: defineCollection({
    label: 'Story',
    delegate: prisma.story,
    search: ['title', 'summary', 'category'],
    publishField: 'isPublished',
    orderBy: { createdAt: 'desc' },
    format: formatStoryRow,
    build: (body, opts) => {
      const data = storyWrite(body, opts);
      if (opts.create) data.id = makeId(body.title);
      return data;
    },
  }),

  destinations: defineCollection({
    label: 'Destination',
    delegate: prisma.destination,
    search: ['name', 'summary'],
    publishField: 'isPublished',
    orderBy: { createdAt: 'desc' },
    format: formatDestinationRow,
    build: (body, opts) => {
      const data = destinationWrite(body, opts);
      if (opts.create) data.id = makeId(body.name);
      return data;
    },
  }),

  events: defineCollection({
    label: 'Event',
    delegate: prisma.event,
    search: ['title', 'location', 'summary'],
    publishField: 'isPublished',
    orderBy: { createdAt: 'desc' },
    format: formatEventRow,
    build: eventWrite,
  }),

  products: defineCollection({
    label: 'Product',
    delegate: prisma.product,
    search: ['name', 'shortDescription', 'sellerName'],
    publishField: 'isActive',
    orderBy: { createdAt: 'desc' },
    format: formatProductRow,
    build: (body, opts) => {
      const data = productWrite(body, opts);
      if (opts.create) data.id = makeId(body.name);
      return data;
    },
  }),

  artisans: defineCollection({
    label: 'Artisan',
    delegate: prisma.artisan,
    search: ['name', 'location'],
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
    format: formatArtisanRow,
    build: artisanWrite,
  }),

  businesses: defineCollection({
    label: 'Business',
    delegate: prisma.business,
    search: ['name', 'category'],
    orderBy: { createdAt: 'desc' },
    include: { user: true, _count: { select: { products: true, orders: true } } },
    format: formatBusinessRow,
    build: businessWrite,
    beforeCreate: async (data) => {
      const owner = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!owner) throw badRequest('No user exists with that userId', 'USER_NOT_FOUND');
    },
  }),

  learning: defineCollection({
    label: 'Learning resource',
    delegate: prisma.learningResource,
    search: ['title', 'summary'],
    publishField: 'isPublished',
    orderBy: { sortOrder: 'asc' },
    format: formatLearningRow,
    build: (body, opts) => {
      const data = learningWrite(body, opts);
      if (opts.create) data.id = makeId(body.title);
      return data;
    },
  }),
};
