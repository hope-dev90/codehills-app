// data/stories/gihanga.js
//
// Full story content for "Gihanga Ngomijana" — the founding king of Rwanda.
// Same shape as data/stories/ruganzu.js, so it can be dropped into Discover.jsx,
// the story library, or StoryReadModal.jsx without any changes to those components.
//
// Framed throughout as oral tradition ("the elders say", "it is told") rather than
// settled fact — Gihanga's historicity is itself debated by scholars, and the story
// has been carried by generations of court poets and elders rather than a single
// written record. Keep that framing if you expand this.

// Image: key into assets/images/commonsImageCache.json (resolved to a URL in stories.ts).
export const gihangaStory = {
  id: 'gihanga-ngomijana',
  title: 'Gihanga Ngomijana',
  category: 'Founding history',
  explorerCategory: 'royal', // matches EXPLORER_CATEGORY['royal-historian'] in Home.jsx
  location: 'Buhanga Sacred Forest',
  image: 'The Sacred Forests of Rwanda',
  xpReward: 60,
  desc: 'The founder-king said to have descended from the sky, and the fire he lit that was meant to never go out.',
  content: [
    `Before there were kings counted one after another, before there was a name for the land itself, the elders say there was only Gihanga — the one whose name comes from guhanga, "to create." Every story about how Rwanda came to be a kingdom begins, in one way or another, with him. He is remembered less as a man who was born and grew old like other men, and more as the moment a scattered people first became a nation with a name.`,

    `As it is told, his line reached back further than any ordinary ancestry — through his father's side to a distant forefather named Kigwa, "the one who descended," said to have come down from the heavens themselves to plant the royal line on earth. Whether the storyteller means this as memory or as metaphor for something too important to describe plainly has never mattered as much as what came after: a family marked, from its very beginning, as meant to lead.`,

    `Gihanga's own childhood was not an easy one. He was born, the elders say, in a time of disaster, and lost his father while still young. His mother carried him to her own grandfather's home, and it was there — away from where he might otherwise have been raised — that he grew into a boy so clever and so promising that he became his grandfather's favorite. A prophecy began to follow him quietly: that the throne of his forefathers would one day be his.`,

    `A promise like that rarely goes unchallenged. His maternal uncle, watching the boy rise in favor and hearing the same prophecy repeated, was consumed by envy rather than pride. Rather than wait to see whether the prophecy was true, he began to scheme against the nephew who stood to inherit what he himself could not. Gihanga, still young, fled his uncle's reach together with a handful of loyal cousins — the first of several journeys that would carry him across unfamiliar territory before he ever ruled anything at all.`,

    `It was in his wandering, not in a palace, that Gihanga became the figure Rwandans still speak of today. Wherever he went, the stories say, he brought knowledge that a scattered people badly needed — the forging of iron, the shaping of wood, the working of clay into pottery, the keeping of fire, the raising of cattle. He was not only a claimant to a throne; he was, by every account, a craftsman first — a blacksmith's son who had learned his father's trade and carried it with him like a second inheritance.`,

    `He eventually made his way to Buhanga, a forest that would come to be remembered as sacred ground, and it was there that the scattered pieces of his journey became a kingdom. It was in Buhanga that he is said to have performed the rituals that marked his rule as legitimate, and where his first royal symbols were set — a hammer, for the craft that had carried him this far, and a musical instrument whose call was said to be able to seal the fate of the condemned. Later, tradition holds, one of his companions revealed to him the secret of a sacred royal drum — the beginning of what would become the Kalinga, the drum that would define Rwandan kingship for centuries afterward.`,

    `Perhaps the most enduring symbol of all was the fire Gihanga lit at his court — a flame that, once kindled, was never meant to go out. For generations after him, it did not: kept burning through the reigns of kings who came long after his name had passed from memory into legend, a living sign that the kingdom he founded still stood. It would take colonial officials, centuries later, to finally order it extinguished — an act many Rwandans still describe not merely as political, but as an attempt to sever something the fire had always represented: an unbroken line between a people and their beginning.`,

    `Gihanga's story does not end tidily with a single victory or a single throne. It survives instead in fragments carried by different families, different clans, different court poets — some claiming descent from a son who inherited his kingdom, others from a daughter said to have brought the first cattle to Rwanda after a family dispute of her own. That every version disagrees on some detail and agrees on the shape of the whole is, in its own way, exactly how a founding story should survive: not as one fixed account, but as something every generation retells a little differently, because it still belongs to all of them.`,
  ].join('\n\n'),
}

export default gihangaStory;