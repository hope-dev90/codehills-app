// prisma/seed.js
// Seeds the database with the same content the mobile app uses locally.
// Run: node prisma/seed.js  (or: npm run seed)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Stories ──────────────────────────────────────────────────
const stories = [
  {
    id: 'gihanga-ngomijana',
    title: 'Gihanga Ngomijana',
    subtitle: 'Buhanga Sacred Forest',
    category: 'Founding History',
    explorerCategory: 'royal',
    location: 'Buhanga Sacred Forest',
    summary: 'In Rwandan oral tradition, Gihanga is remembered as a founding king who brought people together and is associated with important crafts, royal symbols, and the sacred fire.',
    contentSummary: 'Stories about Gihanga connect the beginnings of the kingdom with creativity, craftsmanship, cattle, royal traditions, and the enduring memory of a fire that symbolized continuity.',
    body: JSON.stringify(['In Rwandan oral tradition, Gihanga is remembered as a founding king who brought people together and is associated with important crafts, royal symbols, and the sacred fire.', 'Stories about Gihanga connect the beginnings of the kingdom with creativity, craftsmanship, cattle, royal traditions, and the enduring memory of a fire that symbolized continuity. Versions differ because the story has been passed down orally.']),
    tags: ['Founding History', 'royal', 'Buhanga Sacred Forest'],
    gallery: [],
    imageKey: 'royal-court',
    relatedStoryIds: [],
    xpReward: 60,
    isDemo: false,
  },
  {
    id: 'nyirarucyaba',
    title: 'Nyirarucyaba',
    subtitle: 'Mount Kabuye',
    category: 'Founding History',
    explorerCategory: 'folklore',
    location: 'Mount Kabuye',
    summary: "A traditional story about Gihanga's daughter, remembered for bringing cattle and milk to her father's court.",
    contentSummary: "According to the story, Nyirarucyaba left a family dispute and began a new life. When she encountered cattle and discovered milk, she shared it with Gihanga.",
    body: JSON.stringify(["A traditional story about Gihanga's daughter, remembered for bringing cattle and milk to her father's court.", "According to the story, Nyirarucyaba left a family dispute and began a new life. When she encountered cattle and discovered milk, she shared it with Gihanga. The tale connects her curiosity and generosity with the importance cattle later held in Rwandan culture."]),
    tags: ['Founding History', 'folklore', 'Mount Kabuye'],
    gallery: [],
    imageKey: 'buhanga',
    relatedStoryIds: [],
    xpReward: 45,
    isDemo: false,
  },
  {
    id: 'ruganzu-ii-ndoli',
    title: 'King Ruganzu II Ndoli',
    subtitle: 'Nyabarongo River',
    category: 'Royal History',
    explorerCategory: 'warrior',
    location: 'Nyabarongo River',
    summary: 'An oral tradition about an exiled prince who crossed the Nyabarongo and returned to reclaim his place in the kingdom.',
    contentSummary: "Ruganzu's story follows his exile, growth, and return across the Nyabarongo.",
    body: JSON.stringify(["An oral tradition about an exiled prince who crossed the Nyabarongo and returned to reclaim his place in the kingdom.", "Ruganzu's story follows his exile, growth, and return across the Nyabarongo. Remembered as a determined leader, he symbolizes perseverance, belonging, and the courage to return home."]),
    tags: ['Royal History', 'warrior', 'Nyabarongo River'],
    gallery: [],
    imageKey: 'ruganzu',
    relatedStoryIds: [],
    xpReward: 50,
    isDemo: false,
  },
  {
    id: 'kigeli-iv-rwabugiri',
    title: 'Kigeli IV Rwabugiri',
    subtitle: 'Lake Kivu',
    category: 'Royal History',
    explorerCategory: 'warrior',
    location: 'Lake Kivu',
    summary: "A powerful nineteenth-century king remembered for expanding Rwanda's territory.",
    contentSummary: 'Rwabugiri ruled from 1853 to 1895. His reign brought territorial expansion and centralizing reforms.',
    body: JSON.stringify(["A powerful nineteenth-century king remembered for expanding Rwanda's territory and reorganizing its military and administration.", 'Rwabugiri ruled from 1853 to 1895. His reign brought territorial expansion and centralizing reforms, while also reshaping social and political relationships.']),
    tags: ['Royal History', 'warrior', 'Lake Kivu'],
    gallery: [],
    imageKey: 'lake-kivu',
    relatedStoryIds: [],
    xpReward: 55,
    isDemo: false,
  },
  {
    id: 'ryangombe',
    title: 'Ryangombe',
    subtitle: 'Virunga Volcanoes',
    category: 'Nature & Legend',
    explorerCategory: 'nature',
    location: 'Virunga Volcanoes',
    summary: "A legendary hunter in Rwandan oral tradition whose story connects courage, community, forests, and the Virunga mountains.",
    contentSummary: 'Ryangombe is remembered in stories as a skilled hunter who became associated with the spirit world and the wild landscape.',
    body: JSON.stringify(["A legendary hunter in Rwandan oral tradition whose story connects courage, community, forests, and the Virunga mountains.", "Ryangombe is remembered in stories as a skilled hunter who became associated with the spirit world and the wild landscape. His legend connects music, gathering, and community memory with Rwanda's forests and volcanoes."]),
    tags: ['Nature & Legend', 'nature', 'Virunga Volcanoes'],
    gallery: [],
    imageKey: 'buhanga',
    relatedStoryIds: [],
    xpReward: 50,
    isDemo: false,
  },
  {
    id: 'inanga-mazimpaka',
    title: 'The Inanga and the Poet-King',
    subtitle: 'Nyanza Royal Court',
    category: 'Traditional Music',
    explorerCategory: 'music',
    location: 'Nyanza Royal Court',
    summary: 'Discover the inanga, a traditional string instrument associated with storytelling, poetry, and Rwanda\'s royal court.',
    contentSummary: 'The inanga is a wooden trough zither whose music has carried poetry, memory, and cultural knowledge.',
    body: JSON.stringify(["Discover the inanga, a traditional string instrument associated with storytelling, poetry, and Rwanda's royal court.", "The inanga is a wooden trough zither whose music has carried poetry, memory, and cultural knowledge. Oral and court-poetry traditions remember kings such as Yuhi III Mazimpaka for their association with poetry and the instrument."]),
    tags: ['Traditional Music', 'music', 'Nyanza Royal Court'],
    gallery: [],
    imageKey: 'inanga',
    relatedStoryIds: [],
    xpReward: 45,
    isDemo: false,
  },
  // Explore stories (also used as destinations)
  {
    id: 'card-1',
    title: 'The Royal Palace of Nyanza',
    subtitle: 'Nyanza',
    category: 'Ubwami',
    explorerCategory: 'pre-colonial',
    era: 'pre-colonial',
    location: 'Nyanza',
    latitude: -2.358,
    longitude: 29.546,
    summary: "Explore Rwanda's royal heritage through the palace, traditional architecture, ceremonies, and court life.",
    body: JSON.stringify(["Explore Rwanda's royal heritage through the palace, traditional architecture, ceremonies, and court life."]),
    tags: ['Ubwami', 'pre-colonial', 'Nyanza'],
    gallery: [],
    imageKey: 'nyanza',
    relatedStoryIds: [],
    xpReward: 0,
    isDemo: false,
  },
  {
    id: 'card-2',
    title: 'Intore – The Dance of Warriors',
    subtitle: 'Nyanza',
    category: 'Ubutwari',
    explorerCategory: 'pre-colonial',
    era: 'pre-colonial',
    location: 'Nyanza',
    latitude: -1.97,
    longitude: 30.104,
    summary: 'Discover Intore, the energetic warrior dance passed down through generations.',
    body: JSON.stringify(['Discover Intore, the energetic warrior dance passed down through generations.']),
    tags: ['Ubutwari', 'pre-colonial', 'Nyanza'],
    gallery: [],
    imageKey: 'intore',
    relatedStoryIds: [],
    xpReward: 0,
    isDemo: false,
  },
  {
    id: 'card-3',
    title: 'Inanga – The Heart of Rwandan Music',
    subtitle: 'Nationwide',
    category: 'Umuziki',
    explorerCategory: 'pre-colonial',
    era: 'pre-colonial',
    location: 'Nationwide',
    latitude: -1.95,
    longitude: 29.9,
    summary: 'The inanga is a trough zither central to Rwandan musical tradition.',
    body: JSON.stringify(['The inanga is a trough zither central to Rwandan musical tradition.']),
    tags: ['Umuziki', 'pre-colonial', 'Nationwide'],
    gallery: [],
    imageKey: 'artifact',
    relatedStoryIds: [],
    xpReward: 0,
    isDemo: false,
  },
];

// ─── Destinations (derived from explore stories) ──────────────
const destinations = [
  { id: 'card-1', name: 'The Royal Palace of Nyanza', category: 'Culture', summary: "Explore Rwanda's royal heritage.", description: "Explore Rwanda's royal heritage through the palace, traditional architecture, ceremonies, and court life. Location: Nyanza.", latitude: -2.358, longitude: 29.546, imageKey: 'nyanza', isDemo: false },
  { id: 'card-2', name: 'Intore – The Dance of Warriors', category: 'Culture', summary: 'Discover Intore warrior dance.', description: 'Discover Intore, the energetic warrior dance passed down through generations. Location: Nyanza.', latitude: -1.97, longitude: 30.104, imageKey: 'intore', isDemo: false },
  { id: 'card-3', name: 'Inanga – Heart of Rwandan Music', category: 'Culture', summary: 'Rwandan trough zither tradition.', description: 'The inanga is a trough zither central to Rwandan musical tradition. Location: Nationwide.', latitude: -1.95, longitude: 29.9, imageKey: 'artifact', isDemo: false },
  { id: 'card-4', name: 'Lake Kivu', category: 'Lakes', summary: 'One of the African Great Lakes.', description: 'Lake Kivu borders Rwanda and the DRC and is one of the African Great Lakes. Location: Western Province.', latitude: -2.05, longitude: 29.1, imageKey: 'lake_kivu', isDemo: false },
  { id: 'card-5', name: 'Volcanoes National Park', category: 'Nature', summary: 'Home of the mountain gorillas.', description: 'Home of the mountain gorillas in the Virunga range. Location: Northern Province.', latitude: -1.47, longitude: 29.52, imageKey: 'volcanoes', isDemo: false },
  { id: 'card-6', name: 'Kigali City', category: 'City', summary: 'The capital of Rwanda.', description: 'The clean, modern capital of Rwanda with thriving culture. Location: Kigali.', latitude: -1.944, longitude: 30.061, imageKey: 'kigali', isDemo: false },
];

// ─── Events ───────────────────────────────────────────────────
const events = [
  { id: 'e-festival', title: 'Cultural Festival (sample)', category: 'Festival', location: 'Location to be announced', dateLabel: 'Sample event, no date', summary: 'Placeholder for a celebration of music, dance and crafts.', description: 'Sample event used to show the layout. Real festivals, with verified dates and venues, will be published by CodeHills organisers.', imageKey: 'festival', isDemo: true },
  { id: 'e-coffee', title: 'Coffee Harvest Experience (sample)', category: 'Coffee', location: 'Location to be announced', dateLabel: 'Sample event, no date', summary: 'Placeholder for a farm visit and tasting.', description: 'Sample event used to show the layout. Real coffee experiences will be added by partner farms.', imageKey: 'coffeeHarvest', isDemo: true },
  { id: 'e-crafts', title: 'Craft Workshop (sample)', category: 'Culture', location: 'Location to be announced', dateLabel: 'Sample event, no date', summary: 'Placeholder for a hands-on session with local artisans.', description: 'Sample event used to show the layout. Real workshops will be added by artisans and organisers.', imageKey: 'artisan', isDemo: true },
];

// ─── Artisans ─────────────────────────────────────────────────
const artisans = [
  { id: 'artisan-1', name: 'Sample Artisan Cooperative', location: 'Rwanda (demo)' },
  { id: 'artisan-2', name: 'Sample Coffee Growers', location: 'Rwanda (demo)' },
  { id: 'artisan-3', name: 'Sample Weavers Group', location: 'Rwanda (demo)' },
  { id: 'artisan-4', name: 'Sample Beekeepers', location: 'Rwanda (demo)' },
  { id: 'artisan-5', name: 'Sample Tea Growers', location: 'Rwanda (demo)' },
  { id: 'artisan-6', name: 'Sample Textile Workshop', location: 'Rwanda (demo)' },
  { id: 'artisan-7', name: 'Sample Beadwork Group', location: 'Rwanda (demo)' },
  { id: 'artisan-8', name: 'Sample Woodcraft Studio', location: 'Rwanda (demo)' },
];

// ─── Products ─────────────────────────────────────────────────
const products = [
  { id: 'p-imigongo', name: 'Imigongo Art', slug: 'imigongo-art', shortDescription: 'A hand-made geometric wall piece in the Imigongo style.', description: 'A hand-made geometric wall piece in the Imigongo style.', category: 'Art', categoryId: 'art', priceRwf: 15000, craftsmanship: 'Each piece is shaped and painted by hand.', tags: ['Handmade', 'Local'], imageKey: 'imigongo', gallery: [], artisanId: 'artisan-1', sellerName: 'Sample Artisan Cooperative', isActive: true, rewardStoryId: 'card-1', isDemo: true },
  { id: 'p-coffee', name: 'Rwandan Coffee', slug: 'rwandan-coffee', shortDescription: 'Whole-bean coffee from Rwandan hills, roasted in small batches.', description: 'Whole-bean coffee from Rwandan hills, roasted in small batches.', category: 'FoodAndDrinks', categoryId: 'food-drinks', priceRwf: 8000, craftsmanship: 'Grown, washed and dried by local producers.', tags: ['Local', 'Small batch'], imageKey: 'coffee', gallery: [], artisanId: 'artisan-2', sellerName: 'Sample Coffee Growers', isActive: true, rewardStoryId: 'card-2', isDemo: true },
  { id: 'p-basket', name: 'Traditional Basket', slug: 'traditional-basket', shortDescription: 'Handwoven by local artisans.', description: 'Handwoven by local artisans, this basket represents our heritage and craftsmanship.', category: 'Handicrafts', categoryId: 'handicrafts', priceRwf: 12000, craftsmanship: 'Coiled and woven by hand over several days.', tags: ['Handmade', 'Local', 'Woven'], imageKey: 'basket', gallery: [], artisanId: 'artisan-3', sellerName: 'Sample Weavers Group', isActive: true, rewardStoryId: 'card-3', isDemo: true },
  { id: 'p-honey', name: 'Tea Hills Honey', slug: 'tea-hills-honey', shortDescription: 'Natural honey from a small local producer.', description: 'Natural honey from a small local producer.', category: 'FoodAndDrinks', categoryId: 'food-drinks', priceRwf: 10000, craftsmanship: 'Collected in small quantities by local beekeepers.', tags: ['Local', 'Natural'], imageKey: 'honey', gallery: [], artisanId: 'artisan-4', sellerName: 'Sample Beekeepers', isActive: true, rewardStoryId: 'card-1', isDemo: true },
  { id: 'p-tea', name: 'Highland Tea', slug: 'highland-tea', shortDescription: 'Loose-leaf tea from the hills.', description: 'Loose-leaf tea from the hills.', category: 'FoodAndDrinks', categoryId: 'food-drinks', priceRwf: 6000, craftsmanship: 'Leaves are picked by hand and dried locally.', tags: ['Local', 'Loose leaf'], imageKey: 'tea', gallery: [], artisanId: 'artisan-5', sellerName: 'Sample Tea Growers', isActive: true, rewardStoryId: 'card-2', isDemo: true },
  { id: 'shop-tshirt', name: 'Traditional T-Shirt', slug: 'traditional-tshirt', shortDescription: 'Printed with patterns inspired by Rwandan heritage.', description: 'Comfort · Culture · Style. Printed with patterns inspired by Rwandan heritage.', category: 'Handicrafts', categoryId: 'handicrafts', priceRwf: 25000, craftsmanship: 'Cut and printed in small runs.', tags: ['Comfort', 'Culture', 'Style'], imageKey: 'tshirt', gallery: [], artisanId: 'artisan-6', sellerName: 'Sample Textile Workshop', isActive: true, rewardStoryId: 'card-3', isDemo: true },
  { id: 'shop-bracelet', name: 'Handcrafted Bracelet', slug: 'handcrafted-bracelet', shortDescription: 'A one-off piece made by hand.', description: 'Natural materials · Unique Design. A one-off piece made by hand.', category: 'Handicrafts', categoryId: 'handicrafts', priceRwf: 12000, craftsmanship: 'Beads and fibres are strung by hand.', tags: ['Natural materials', 'Unique design'], imageKey: 'bracelet', gallery: [], artisanId: 'artisan-7', sellerName: 'Sample Beadwork Group', isActive: true, rewardStoryId: 'card-1', isDemo: true },
  { id: 'shop-pen', name: 'Cultural Pen', slug: 'cultural-pen', shortDescription: 'A carved pen decorated with traditional motifs.', description: 'Elegant · Durable · Inspired. A carved pen decorated with traditional motifs.', category: 'Handicrafts', categoryId: 'handicrafts', priceRwf: 8000, craftsmanship: 'Carved and finished by hand from local wood.', tags: ['Elegant', 'Durable', 'Inspired'], imageKey: 'pen', gallery: [], artisanId: 'artisan-8', sellerName: 'Sample Woodcraft Studio', isActive: true, rewardStoryId: 'card-2', isDemo: true },
];

// ─── Learning resources ───────────────────────────────────────
const learningResources = [
  { id: 'l-start', title: 'Getting started', summary: 'First steps for a small craft or food business.', body: JSON.stringify(['Sample lesson text. The real business-learning material will be provided by the CodeHills team.', 'Topics planned for this section could include naming your business, choosing products and setting a fair price.']), sortOrder: 1, isDemo: true },
  { id: 'l-photos', title: 'Showing your products', summary: 'Simple ideas for presenting products well.', body: JSON.stringify(['Sample lesson text. Real guidance on product photography and descriptions will be added later.']), sortOrder: 2, isDemo: true },
  { id: 'l-stories', title: 'Telling your story', summary: 'Why the story behind a product matters.', body: JSON.stringify(['Sample lesson text. This section will explain how product stories can be linked to cultural stories in the app.']), sortOrder: 3, isDemo: true },
];

// ─── Admin dashboard account ───────────────────────────────────
// Override with ADMIN_EMAIL / ADMIN_PASSWORD before running the seed.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'oop@gmail.co';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'oop';

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { contact: ADMIN_EMAIL },
    update: { role: 'admin', isActive: true, passwordHash },
    create: {
      fullName: 'CodeHills Admin',
      contact: ADMIN_EMAIL,
      contactType: 'email',
      passwordHash,
      authProvider: 'password',
      role: 'admin',
      language: 'en',
      rememberMe: true,
      isActive: true,
    },
  });
}

async function main() {
  console.log('Seeding database…');

  // Stories
  for (const s of stories) {
    await prisma.story.upsert({ where: { id: s.id }, update: s, create: s });
  }
  console.log(`  ✓ ${stories.length} stories`);

  // Destinations
  for (const d of destinations) {
    await prisma.destination.upsert({ where: { id: d.id }, update: d, create: d });
  }
  console.log(`  ✓ ${destinations.length} destinations`);

  // Events
  for (const e of events) {
    await prisma.event.upsert({ where: { id: e.id }, update: e, create: e });
  }
  console.log(`  ✓ ${events.length} events`);

  // Artisans
  for (const a of artisans) {
    await prisma.artisan.upsert({ where: { id: a.id }, update: a, create: a });
  }
  console.log(`  ✓ ${artisans.length} artisans`);

  // Products (stories must exist first for the FK)
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
  }
  console.log(`  ✓ ${products.length} products`);

  // Learning resources
  for (const l of learningResources) {
    await prisma.learningResource.upsert({ where: { id: l.id }, update: l, create: l });
  }
  console.log(`  ✓ ${learningResources.length} learning resources`);

  // Admin account for the web dashboard
  await seedAdmin();
  console.log(`  ✓ admin account (${ADMIN_EMAIL})`);

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
