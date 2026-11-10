// data/stories/kigeli.js
//
// Full story content for "Kigeli IV Rwabugiri" — the last great warrior king
// of the Nyiginya dynasty. Same shape as ruganzu.js / gihanga.js.
//
// Historical note for whoever edits this later: unlike Gihanga or Ruganzu,
// Rwabugiri's reign (1853–1895) is well documented in written record, not just
// oral tradition — so this one leans slightly more factual/historical in tone
// rather than "as the elders say". His reign also included harsher chapters
// (forced labor under the land-redistribution system he introduced) — this
// telling doesn't erase that, but keeps the tone educational rather than
// dwelling on it, since the story's focus is his life and reputation, not
// a political argument. Handle any further edits to this period carefully.

// Image: key into assets/images/commonsImageCache.json (resolved to a URL in stories.ts).
export const kigeliStory = {
  id: 'kigeli-iv-rwabugiri',
  title: 'Kigeli IV Rwabugiri',
  category: 'Royal history',
  explorerCategory: 'warrior', // matches EXPLORER_CATEGORY['warrior'] in Home.jsx — his reign was defined by conquest
  location: 'Lake Kivu',
  image: 'Kigeli IV Rwabugiri – The Warrior King',
  xpReward: 55,
  desc: 'The last great warrior king of Rwanda, whose conquests carried the kingdom to the largest borders it would ever hold.',
  content: [
    `By the time Kigeli IV Rwabugiri took the throne in 1853, the kingdom his ancestors had built over centuries — reaching all the way back to Gihanga, the founder himself — had grown large, but not yet as large as it would become under him. Born Sezisoni Rwabugiri, son of Mutara II Rwogera, he would spend the whole of his reign proving that the dynasty's oldest ideal — kwanda, to expand — still had one more chapter left to write.`,

    `He earned his reputation the way Rwandan kings before him always had: on campaign. Expedition followed expedition, year after year, until his name carried titles meant to be sung rather than simply spoken — Inkotanyi cyane among them, "the truly relentless." Elders who remembered his era compared his bravery to Ruganzu II Ndoli's, the king who had crossed the Nyabarongo two centuries before him. It was rare praise, reserved for a king who was said to treat the battlefield the way other men treated their own home.`,

    `His campaigns reached further than any king before him — west toward Lake Kivu, where he fought for control of Ijwi Island and its ruler Kabego; south into Bugesera; east toward kingdoms that had never answered to Rwanda before. Each victory folded new land, new cattle, and new subjects into a kingdom that, by the time his reign ended, stretched to the widest borders it would ever hold. He built a lakeside residence at Nyamasheke, from where the campaigns against Kivu's islands were planned — a war room with a view of the water he meant to conquer.`,

    `Rwabugiri did not only fight; he rebuilt what he ruled. He reorganized the army into standing units — the elite Intore among them — replacing loose levies with something closer to a professional fighting force. He redrew the kingdom's map into provinces, districts, and hills, each answering to chiefs he appointed himself, and split the old duties of land and cattle management so that no single chief could grow powerful enough to rival the throne. It was, in its way, the most centralized Rwanda had ever been.`,

    `He was also the first Rwandan king to stand face to face with Europeans arriving on his borders — explorers, then traders, then the beginnings of colonial ambition. He met them carefully: taking German firearms to arm his own soldiers, while barring most other foreigners, including Arab traders, from entering his kingdom at all. He meant to use what the outside world offered without letting it in any further than that — a balancing act few kings anywhere in the region managed as long as he did.`,

    `It would be incomplete to tell this story only as one of glory. The same reforms that centralized his rule also reshaped how ordinary Rwandans lived on the land — introducing a system where appointed Tutsi chiefs demanded labor from Hutu families in exchange for the right to farm it, a patronage system that hardened social lines in ways that would echo long after Rwabugiri himself was gone. A full account of his reign holds both things at once: the warrior-king who carried Rwanda to its widest borders, and the ruler whose reforms left divisions his successors — and the country itself — would spend generations reckoning with.`,

    `Rwabugiri died in 1895, on campaign as he had lived, and is remembered by many as the last true king of the old Nyiginya line — his death followed swiftly by a palace coup that installed a very different kind of rule. What survived him wasn't only territory. It was a reputation carried in songs composed in his own lifetime, praising his relentlessness, and a kingdom whose shape — for better and for worse — still marks the outline of Rwanda today.`,
  ].join('\n\n'),
  quiz: [
    {
      question: "Which of the following kings was Kigeli IV Rwabugiri's father?",
      options: ["Gihanga Ngomijana", "Ruganzu II Ndoli", "Mutara II Rwogera", "Musinga"],
      correctIndex: 2,
      explanation: "He was born Sezisoni Rwabugiri, son of Mutara II Rwogera."
    },
    {
      question: "What does 'Inkotanyi cyane' mean?",
      options: ["The truly relentless", "The great king", "The conqueror", "The first warrior"],
      correctIndex: 0,
      explanation: "He earned the title 'Inkotanyi cyane' meaning 'the truly relentless' due to his constant campaigns."
    },
    {
      question: "How did Kigeli IV Rwabugiri reform the military?",
      options: ["He disbanded the military", "He reorganized the army into standing units like the Intore", "He relied solely on mercenaries", "He created a navy on Lake Kivu"],
      correctIndex: 1,
      explanation: "He reorganized the army into standing units—the elite Intore among them—replacing loose levies with a professional fighting force."
    }
  ]
};

export default kigeliStory;