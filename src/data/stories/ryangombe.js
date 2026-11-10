// data/stories/ryangombe.js
//
// Full story content for "Ryangombe" — the hunter-hero of Rwandan oral
// tradition, whose legend is closely tied to forests, wilderness, and the
// Virunga volcanoes. Same shape as the other story files.
//
// Careful note for whoever edits this: Ryangombe is the central figure of
// Kubandwa, a real spiritual tradition still honored by some communities
// today — this isn't a purely historical legend the way Gihanga or Ruganzu
// are. This telling deliberately stays respectful and focuses on Ryangombe's
// role as a nature/hunter figure (which is what makes him fit the
// "nature-lover" explorer type), and leaves out the more mature or
// contested elements found in some fuller academic tellings of his myth
// (details around his son Binego, and later colonial-era political
// readings of the cult). If you expand this story, keep that same care —
// treat it as living heritage, not just folklore trivia.

// Image: key into assets/images/commonsImageCache.json (resolved to a URL in stories.ts).
// Using "Mount Karisimbi" — the story says Ryangombe made his home in Karisimbi,
// one of the great Virunga volcanoes.

export const ryangombeStory = {
  id: 'ryangombe',
  title: 'Ryangombe',
  category: 'Nature & legend',
  location: 'Virunga Volcanoes',
  image: 'Mount Karisimbi',
  xpReward: 50,
  explorerCategory: 'nature', // matches EXPLORER_CATEGORY['nature-lover'] in Home.jsx
  desc: 'The legendary hunter said to have become one with the forest — and with the volcano where his story still lives.',
  content: [
    `Of all the figures carried through Rwanda's oral tradition, none belongs to the wild places quite like Ryangombe. Where kings are remembered for courts and conquests, Ryangombe is remembered for forests, hunts, and mountains — a hero whose whole story unfolds not behind palace walls, but out among the hills, the game trails, and the volcanoes that still rise along Rwanda's northern border.`,

    `The elders say he came originally from Kitara, in what is now western Uganda, arriving in Rwanda generations ago as a young man already known for his skill in the hunt. He was not born into the throne the way Rwanda's kings were — his reputation was built entirely out in the wilderness, tracking game through forest and grassland until his name for courage and skill traveled faster than he did.`,

    `It was on one such hunt, the story goes, that everything changed. Deep in a forest, Ryangombe is said to have come upon a sacred grove unlike any other — a place where the boundary between the ordinary world and something older and larger grew thin. There, spirits are said to have recognized in him a kind of greatness the forest itself had been waiting for, and offered him a place among them.`,

    `What makes Ryangombe's story endure isn't a single act of bravery, but the way he is remembered afterward — as jovial rather than distant, fond of music, dance, and feasting as much as the hunt, a spirit closer to the people who honored him than the fiercer, more fearsome figures found in other traditions. Communities who kept his memory alive did so not out of fear, but out of a sense that he understood the wild world better than almost anyone, and could be trusted to look after those who respected it.`,

    `His story ends, as many old hunting tales do, out in the field — struck down during a hunt, his companions said to have grieved him so deeply that his memory was carried forward not as an ending, but as a beginning. From that day, the elders say, Ryangombe made his home in Karisimbi, one of the great Virunga volcanoes that still stand along Rwanda's northern edge — visible, on a clear day, from almost anywhere in the country.`,

    `That detail is worth sitting with for a moment: of all the places a legendary figure could be said to dwell, Ryangombe's story chose a volcano — visible, permanent, part of the landscape itself. For generations, communities who honored his memory treated Karisimbi the way some cultures treat a temple spire: a constant, shared point on the horizon, a reminder that some stories don't need walls to be remembered. Even now, some communities continue to honor traditions connected to his memory, a living thread between old forests and the present day.`,

    `Whatever else his story carries, the throughline is this: Ryangombe belonged to the wild places first, and only became a legend because he refused to be separated from them. For anyone drawn to Rwanda's forests, hills, and volcanoes today, his story is a reminder that this landscape has always been more than scenery — it has been, for as long as these stories have been told, a place people believed was watching back.`,
  ].join('\n\n'),
};

export default ryangombeStory;