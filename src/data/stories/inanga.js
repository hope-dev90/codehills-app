// data/stories/inanga.js
//
// Full story content about the Inanga — Rwanda's most revered traditional
// instrument — anchored around the real historical king Yuhi III Mazimpaka,
// remembered as a poet and inanga player. Same shape as the other story files.
//
// Unlike Ryangombe or Gihanga, this one leans on documented cultural history
// rather than pure legend — Mazimpaka's reputation as a poet-king is
// recorded in Rwandan oral and court-poetry tradition (ibitekerezo). Keep
// that same grounded, factual tone if this story is expanded.

// Image: key into assets/images/commonsImageCache.json (resolved to a URL in stories.ts).
export const inangaStory = {
  id: 'inanga-mazimpaka',
  title: 'The Inanga and the Poet-King',
  category: 'Traditional music',
  location: 'Nyanza Royal Court',
  image: 'Inanga – The Soul of Rwandan Music',
  xpReward: 45,
  explorerCategory: 'music', // matches EXPLORER_CATEGORY['music-explorer'] in Home.jsx
  desc: 'How a single string, threaded back and forth across a wooden trough, became the sound of Rwanda\'s royal court.',
  content: [
    `Long before speakers and stages, the sound that carried Rwanda's history was startlingly simple: one long string, threaded back and forth across notches cut into a hollowed wooden trough, plucked by a single pair of hands. That instrument is the inanga, and for centuries it has been considered one of the most revered instruments in Rwandan life — not because of volume or complexity, but because of what it was trusted to carry: memory itself.`,

    `The inanga's design hides its cleverness in plain sight. What looks like six to eight separate strings is often just one continuous length, woven across a series of carved notches at either end of the trough, then tuned string by string with small wooden pegs. Seated with the instrument resting against the lap, a player plucks out a repeating, pentatonic melody — and it's over that gentle, looping foundation that the real performance begins: a voice, half-sung and half-whispered, carrying stories of history, personal experience, or the ordinary events of daily life.`,

    `In Rwanda's royal courts, the inanga held a place few instruments anywhere are given — it was played for kings, trusted to praise them, and trusted just as often to record them. Among the names still remembered from that tradition is Yuhi III Mazimpaka, a king of the early eighteenth century remembered less for conquest than for a rarer kind of reputation: a brilliant poet and skilled musician in his own right, said to have used his gift to tell the story of his own kingdom's rise.`,

    `That a king would be remembered as a performer, rather than only as a ruler, says something about how central this tradition was to Rwandan court life. The inanga wasn't background music — it was one of the primary ways history moved from one generation to the next, through ibitekerezo, epic poems recounting the deeds of kings and dynasties, composed and performed with the same instrument used for quieter, personal songs about love, loss, or the passing of ordinary days.`,

    `The whispery, murmuring singing style that traditionally accompanies the inanga — sometimes called kwivuga — was deliberately understated, almost private, even when performed for a king. Listeners didn't always catch every word; the lyrics often carried layered or hidden meanings meant to be interpreted rather than simply heard. In many ways, the instrument's quiet character was the point: history told gently is still history remembered.`,

    `The inanga's story didn't end with the royal courts. It survived colonization, cultural upheaval, and — after 1994 — the task of helping a country rebuild a shared cultural identity in the wake of unimaginable loss. Musicians like Thomas Kirusu and his daughter Sophie Nzayisenga, among Rwanda's most celebrated inanga players in recent generations, carried the instrument forward into a new era, proving it could hold both grief and unity in the same strings that once praised kings.`,

    `Today the inanga still rests in players' laps the same way it did centuries ago, still tuned by hand, still accompanied by that same soft, half-sung voice. It remains, as it always has, less an instrument for performance and more a vessel — one string, threaded back and forth, carrying forward whatever a person trusts it to remember.`,
  ].join('\n\n'),
};

export default inangaStory;