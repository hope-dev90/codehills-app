// data/stories/nyirarucyaba.js
//
// Full story content for "Nyirarucyaba" — Gihanga's daughter, credited in
// Rwandan folklore with bringing the first cattle to the kingdom. A natural
// companion piece to gihanga.js: same generation, same founding era, but a
// smaller, gentler story with a woman at its center rather than a king.
// Same shape as the other story files.

// Image: key into assets/images/commonsImageCache.json (resolved to a URL in stories.ts).
export const nyirarucyabaStory = {
  id: 'nyirarucyaba',
  title: 'Nyirarucyaba',
  category: 'Founding history',
  explorerCategory: 'folklore', // matches EXPLORER_CATEGORY['folktale-hunter'] in Home.jsx
  location: 'Mount Kabuye',
  image: 'Ubudehe – Community Self-Help',
  xpReward: 45,
  desc: 'Gihanga\'s daughter, and the woman said to have brought the first cattle to the Kingdom of Rwanda.',
  content: [
    `Not every founding story in Rwanda belongs to a king. Some of the oldest and gentlest ones belong to the women standing just beside the throne — and few are told as fondly as the story of Nyirarucyaba, daughter of Gihanga, the founder-king himself. Where her father's story is one of thrones and prophecies, hers is a smaller story, about a single household and a single unfamiliar animal — and yet it is the story Rwandans still credit for one of the most treasured things in their culture: the cow.`,

    `As it is told, Nyirarucyaba did not grow up in easy peace. A dispute arose between her mother, Nyamususa, and her stepmother, Nyirampirangwe — the kind of household rivalry that, in a royal family, could turn dangerous quickly. Nyirarucyaba defended her mother fiercely, so fiercely that she feared what punishment might follow. Rather than wait to find out, she fled her childhood home, the way so many figures in these old stories do, carrying little more than her own resolve.`,

    `She found her way eventually to a quieter life, marrying a farmer named Kazigaba and settling far from the disputes of court. It is here, in this small and unremarkable household, that the story turns from family drama into legend. One day, the elders say, an animal neither of them recognized arrived at their home — unlike anything they had kept or seen before. The next day, it gave birth.`,

    `Nyirarucyaba noticed something else strange: a liquid dripping from the animal, one she had never encountered. Curious rather than afraid, she investigated it herself, and carried what she found back to her father's court — not as a report, but as a gift. She brought Gihanga the milk.`,

    `The king, the story goes, was relieved simply by the taste of it — and understood immediately that this was no ordinary discovery. He ordered his servants to retrieve these animals for the kingdom itself, and it is from that single household's unfamiliar visitor that Rwandan tradition traces the beginning of cattle-keeping across the land. Mount Kabuye, in what is now Gakenke District, is remembered as the place that sheltered Nyirarucyaba and her cattle in the years that followed.`,

    `It's worth pausing on why this particular story has lasted as long as it has. Cattle in Rwanda were never simply livestock — they became wealth, status, poetry, and ceremony, celebrated in songs and central to marriage customs and royal ritual alike for centuries afterward. That such a foundational part of Rwandan life is credited not to a conquest or a divine descent, but to one woman's curiosity and generosity toward her father, says something the grander stories of kings and battles rarely do: that some of the most enduring gifts a culture carries began as something quietly noticed, and freely given.`,
  ].join('\n\n'),
  quiz: [
    {
      question: "Who was Nyirarucyaba?",
      options: ["A famous warrior", "The daughter of Gihanga", "A powerful queen from a neighboring kingdom", "The founder of Rwanda"],
      correctIndex: 1,
      explanation: "Nyirarucyaba was the daughter of the founder-king Gihanga."
    },
    {
      question: "What is Nyirarucyaba credited with bringing to the Kingdom of Rwanda?",
      options: ["Iron forging", "The first cattle and milk", "The sacred drum", "New farming techniques"],
      correctIndex: 1,
      explanation: "She is credited with bringing the first cattle and milk to her father's court, starting the cattle-keeping tradition in Rwanda."
    },
    {
      question: "Why did Nyirarucyaba leave her childhood home?",
      options: ["To conquer new lands", "Because of a dispute between her mother and stepmother", "To get married", "She was exiled by her father"],
      correctIndex: 1,
      explanation: "She fled due to a fierce dispute between her mother and stepmother, fearing punishment for defending her mother."
    }
  ]
};

export default nyirarucyabaStory;