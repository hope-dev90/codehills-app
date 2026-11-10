// data/stories/ruganzu.js
//
// Full story content for "King Ruganzu II Ndoli" — used by:
//   - components/Discover.jsx        (landing page teaser, first paragraphs only)
//   - components/Gamification/StoryReadModal.jsx (full unlocked reading experience)
//
// Framed throughout as oral tradition ("the elders say", "as it is told") rather than
// settled historical fact, since this story has been passed down through generations
// of storytelling rather than written record — keep that framing if you expand this.

// Image: key into assets/images/commonsImageCache.json (resolved to a URL in stories.ts).
export const ruganzuStory = {
  id: 'ruganzu-ii-ndoli',
  title: {
    en: 'King Ruganzu II Ndoli',
    rw: 'Umwami Ruganzu II Ndoli',
    fr: 'Le Roi Ruganzu II Ndoli'
  },
  category: 'Royal history',
  explorerCategory: 'warrior', // matches EXPLORER_CATEGORY['warrior'] in Home.jsx
  location: 'Nyabarongo River',
  image: 'Ingabo – The Royal Guard',
  xpReward: 50,
  desc: {
    en: 'The exiled prince who crossed the Nyabarongo and returned to reclaim a kingdom that had almost forgotten him.',
    rw: 'Umuhungu w\'Ubwami bwataye amatwi wambukye Nyabarongo akagaruka kwigarurira ubwami bwasige bwamwibagirwa.',
    fr: 'Le prince exilé qui traversa la Nyabarongo et retourna reprendre un royaume qui l\'avait presque oublié.'
  },
  content: {
    en: [
      `Long before the hills of Rwanda carried roads and wires, they carried names — and few names are told around the fire as often as Ruganzu II Ndoli. As the elders tell it, he was still a boy when his household fell out of favor at court and he was sent away, far from the kingdom that should one day have been his. He grew up among strangers, in a home that was not his own, raised less on comfort than on a single promise repeated to him quietly, year after year: that the hills he had been carried away from were still waiting for their rightful heir.`,

      `The stories say that exile does two things to a prince — it either erases him, or it forges him. For Ruganzu, it did the second. Away from the court, he learned to listen before he spoke, to earn loyalty rather than assume it, and to read the temperament of people who owed him nothing. By the time word reached him that the throne of his fathers sat unsteady, he was no longer the frightened child who had left it. He was a young man who had spent a lifetime waiting for exactly this moment, and who had nothing left to lose in seizing it.`,

      `His return, as it is told, was never going to be simple. Between Ruganzu and the court that had once been his stood the Nyabarongo — a river that Rwandans have long treated as more than water, a boundary between what a person was and what they were about to become. The elders who kept this story say the river was high and unwelcoming the day he reached its banks, as though the land itself needed convincing that this exiled son deserved to come home. Some who traveled with him hesitated at the water's edge. Ruganzu did not.`,

      `He crossed. What exactly carried him across — courage, conviction, or the simple refusal to turn back after so many years of waiting — depends on who in the village is telling the story. But every version agrees on what came after: he did not arrive quietly. Word of a prince who had crossed the Nyabarongo without flinching moved through the hills faster than he did, reaching the court before he ever set foot in it. By the time he arrived, he was no longer just a name people vaguely remembered. He was already becoming a story.`,

      `Not everyone at court welcomed him. Rivals who had grown comfortable in his absence had little interest in a returning heir reminding them what loyalty was supposed to look like. The elders describe long seasons of testing — whispered doubts about whether the boy who had been gone so long could really lead, quiet challenges meant to see whether his resolve at the river had been a single act of bravery or something he could sustain. Ruganzu answered each test the same way he had answered the river: not with declarations, but with presence. He stayed. He listened. He did not flinch twice.`,

      `In time, the doubts gave way to something else — the recognition that the kingdom he had returned to needed exactly the kind of steadiness he had shown at its edge. Under his rule, as the oral histories describe it, Rwanda's reach and its confidence both grew. Ruganzu is remembered less for a single victory than for a temperament: a king who had already survived being erased once, and who ruled afterward like a man who understood, more than most, what it cost a people to lose their place and what it took to reclaim it.`,

      `What has carried his name through so many generations of storytelling isn't only the crossing itself, but what it came to represent. Every child in Rwanda who has heard this story around a fire, a radio, or — now — a screen, has heard it as more than a tale about one prince and one river. It is told as a lesson about return: that the home you were taken from can still be reached, that doubt is not the same as defeat, and that sometimes the most important thing a person can do is simply refuse to turn back at the water's edge.`,

      `The story of Ruganzu II Ndoli belongs to no single version — griots, grandparents, and now digital archives like this one all carry it a little differently, each shaped by the voice that passed it on. That is, in its own way, the truest thing about it: a story this old survives not by staying exactly the same, but by being told again, and again, by whoever needs to hear it next.`,
    ].join('\n\n'),
    rw: [
      `Mbere y'uko udusozi tw'u Rwanda twakira inzira na kaburi, twakiriza amazina — kandi ni amwe mazina avugwa ku ziko nka Ruganzu II Ndoli. Nk'uko abakuru babivuga, yari akiri umwana mu gihe umuryango we wakwangirika mu ngoro y'ubwami akajyanwa kure, kure y'ubwami bwari kuzaba uwe. Yakuriye mu bantu batanu, mu nzu itari iwe, yarerewe mu buryo butari ubw'ibyishimo ahubwo ku isezerano rimwe ryamubwirwaga mu bwumvikane, uko umwaka wakabagaho: ko udusozi yavuyeho twari gutegereza umurage wabyo w'ukuri.`,

      `Inkuru zivuga ko ubwami bwataye amatwi bikora ibintu bibiri ku muhungu w'ubwami — cyangwa bikumusiba, cyangwa bikumukora. Ku Ruganzu, byakoze icya kabiri. Kure y'ingoro, yize kumva mbere y'uko avuga, kwihutira kwizana aho gutegereza ko azabikora, no gusoma umutima w'abantu bamutwaraga nk'utagira icyo abakorera. Igihe ubutumwa bwe bwageraga ko intebe y'abakurambere ye yari igorana, ntiyari ukundi umwana w'umutima w'ubwoba wavuyeho. Yari umusore wari amaze igihe cyose yiteguye iki kanya, kandi nta cyo yari asigaranye mu kugifata.`,

      `Kugaruka kwe, nk'uko bivugwa, ntabwo kwari kuba byoroshye. Hagati ya Ruganzu n'ingoro yari iye hahagaze Nyabarongo — umugezi Rwandese bamaze igihe bafata nk'ibiruta amazi, umupaka w'umuntu uwo yari n'uwo yari agiye kuba. Abakuru b'inkuru bavuga ko umugezi wari muremure kandi utemera ku munsi yageze ku nkengero zabyo, nk'aho n'ubutaka bwashyaga kwemeza ko uyu muhungu w'ubwami wari ubutaye amatwi akwiye kugaruka iwe. Bamwe bari kumwe na we batinya ku nkengero y'amazi. Ruganzu ntiyatinya.`,

      `Yambukye. Icyo cyamutwaye — ubutwari, icyizere, cyangwa ukwanga gusubira inyuma nyuma y'imyaka myinshi yiteguye — bisaba uwo mu mudugudu uvuga inkuru. Ariko buri verisiyo yemera icyo cyakurikiye: ntiyaje mu bwumvikane. Ubutumwa bw'umuhungu w'ubwami wambutse Nyabarongo atatinya bwanyura mu misozi byaruta uko yajyaga, bugera mu ngoro mbere y'uko ashyira ikirenge muri yo. Igihe yageraga, ntiyari ukundi amazina abantu bari bafite akamenyetso gake. Yari akimera inkuru.`,

      `Si bose mu ngoro bamwakiriye. Abanzi bari bamaze kumenyera mu kubura kwabo nta cyo bari bifuza ku murage ugaruka wibutsa ko umutimanama wari uko wagendekera. Abakuru bavuga imisi myinshi y'igerageza — amagambo y'umutima yibaza n'umwana wari kurekerewe akaba ashobora kuyobora, ibibazo by'ubwenge byari kugira ngo bamenye n'ubutwari bwe ku mugezi bwari igikorwa kimwe cya kintu cyangwa icyo yashoboraga gukomeza. Ruganzu yasubije buri gerageza mu buryo bwe bwasubije umugezi: atavuga amagambo, ahubwo ariho. Yari ariho. Yumvaga. Ntiyatinya kabiri.`,

      `Muri make, amagambo yahindutse ikindi kintu — kumenya ko ubwami yari agarutseho bari uko bwashatse uko yari yerekanye ku mpande zabyo. Mu ngoma ze, nk'uko amateka avuga, u Rwanda rwageze kure kandi n'umutima wabwo wakomeye. Ruganzu yibukwa nk'utavuga ku ntsinzi imwe, ahubwo ku mutima: umwami wari waracitse akabura, kandi wategetse nyuma nk'umuntu wasobanukiwe, kuruta abandi benshi, igihe abantu batakaje aho bari n'icyo bakeneye kugira ngo bagaruke.`,

      `Icyo cyatumye amazina ye akomoka mu nkuru nyinshi z'ibihe si ukwambuka kwonyine, ahubwo n'icyo yahindukiye. Buri mwana w'u Rwanda wumvise iyi nkuru ku ziko, kuri radiyo, cyangwa — ubu — ku mugaragaro, yumvise nk'inkuru itari iy'umuhungu w'ubwami n'umugezi umwe gusa. Ivugwa nk'inyigisho y'ukugaruka: ko iwe wavuyemo ushobora kuzasubira, ko gutekereza ko bidashoboka si ko kutsindwa, kandi ko rimwe na rimwe ikintu cy'ingenzi umuntu ashobora gukora ni ukwanga gusubira inyuma ku nkengero y'amazi.`,

      `Inkuru ya Ruganzu II Ndoli itari iy'umuntu umwe — abaririmbyi, abakuru, kandi ubu n'ibubiko by'ikoranabuhanga nka ibi, bwayijyaho mu buryo butandukanye, buri wese ayikuyeho ijwi ryayimuhaye. Iyo, mu buryo bwayo, ni yo kuri ukuri: inkuru nk'iyi iraho itavuga mu buryo bunaka, ahubwo ivugwa kandi, kandi, n'uwo wese ukeneye kuyumva ukarikurikira.`,
    ].join('\n\n'),
    fr: [
      `Longtemps avant que les collines du Rwanda ne portent des routes et des fils électriques, elles portaient des noms — et peu de noms sont racontés autour du feu aussi souvent que Ruganzu II Ndoli. Comme le disent les anciens, il n'était encore qu'un garçon lorsque sa maison perdit la faveur de la cour et qu'il fut envoyé loin, loin du royaume qui aurait dû être le sien un jour. Il grandit parmi des étrangers, dans une maison qui n'était pas la sienne, élevé moins dans le confort que dans une seule promise répétée à voix basse, année après année : que les collines dont on l'avait arraché attendaient toujours leur héritier légitime.`,

      `Les histoires disent que l'exil fait deux choses à un prince — soit il l'efface, soit il le forge. Pour Ruganzu, ce fut la seconde. Loin de la cour, il apprit à écouter avant de parler, à gagner la loyauté plutôt que de l'assumer, et à lire le tempérament de gens qui ne lui devaient rien. Au moment où la nouvelle lui parvint que le trône de ses ancêtres était chancelant, il n'était plus l'enfant effrayé qui l'avait quitté. C'était un jeune homme qui avait passé sa vie à attendre précisément ce moment, et qui n'avait plus rien à perdre en le saisissant.`,

      `Son retour, comme on le raconte, n'allait pas être simple. Entre Ruganzu et la cour qui avait autrefois été la sienne se dressait la Nyabarongo — une rivière que les Rwandais ont longtemps traitée comme plus que de l'eau, une frontière entre ce qu'une personne était et ce qu'elle était sur le point de devenir. Les anciens qui ont conservé cette histoire disent que la rivière était haute et peu accueillante le jour où il atteignit ses rives, comme si la terre elle-même avait besoin d'être convaincue que ce fils exilé méritait de rentrer chez lui. Certains qui voyageaient avec lui hésitèrent au bord de l'eau. Ruganzu, non.`,

      `Il traversa. Ce qui exactement le porta de l'autre côté — courage, conviction, ou le simple refus de faire demi-tour après tant d'années d'attente — dépend de qui raconte l'histoire dans le village. Mais toutes les versions s'accordent sur ce qui vint après : il n'arriva pas silencieusement. La nouvelle d'un prince qui avait traversé la Nyabarongo sans flancher se propagea dans les collines plus vite que lui, atteignant la cour avant qu'il n'y ait jamais mis le pied. Au moment où il arriva, il n'était plus seulement un nom que les gens se souvenaient vaguement. Il était déjà en train de devenir une histoire.`,

      `Tout le monde à la cour ne l'accueillit pas. Les rivaux qui s'étaient installés confortablement en son absence n'avaient que peu d'intérêt à voir un héritier revenant leur rappeler à quoi la loyauté était censée ressembler. Les anciens décrivent de longues saisons d'épreuves — des doutes chuchotés sur la capacité du garçon qui était parti si longtemps à vraiment diriger, des défis discrets destinés à voir si sa résolution au bord de la rivière avait été un acte unique de bravoure ou quelque chose qu'il pouvait soutenir. Ruganzu répondit à chaque épreuve de la même manière qu'il avait répondu à la rivière : non pas par des déclarations, mais par sa présence. Il resta. Il écouta. Il ne flancha pas deux fois.`,

      `Avec le temps, les doutes firent place à autre chose — la reconnaissance que le royaume qu'il avait rejoint avait précisément besoin de la stabilité qu'il avait montrée à sa frontière. Sous son règne, comme le décrivent les histoires orales, la portée et la confiance du Rwanda grandirent toutes deux. Ruganzu est moins rappelé pour une victoire unique que pour un tempérament : un roi qui avait déjà survécu à l'effacement une fois, et qui régna par la suite comme un homme qui comprenait, plus que la plupart, ce que coûte à un peuple de perdre sa place et ce qu'il faut pour la reconquérir.`,

      `Ce qui a porté son nom à travers tant de générations de conteurs n'est pas seulement la traversée elle-même, mais ce qu'elle est venue représenter. Chaque enfant au Rwanda qui a entendu cette histoire autour d'un feu, d'une radio, ou — maintenant — d'un écran, l'a entendue comme plus qu'un conte sur un prince et une rivière. Elle est racontée comme une leçon sur le retour : que la maison dont on vous a arraché peut toujours être atteinte, que le doute n'est pas la même chose que la défaite, et que parfois la chose la plus importante qu'une personne puisse faire est simplement refuser de faire demi-tour au bord de l'eau.`,

      `L'histoire de Ruganzu II Ndoli n'appartient à aucune version unique — les griots, les grands-parents, et maintenant les archives numériques comme celle-ci la portent tous un peu différemment, chacun façonné par la voix qui l'a transmise. C'est, à sa manière, la chose la plus vraie à son sujet : une histoire aussi ancienne ne survit pas en restant exactement la même, mais en étant racontée encore et encore, par quiconque a besoin de l'entendre ensuite.`,
    ].join('\n\n')
  },
  quiz: [
    {
      question: {
        en: "What river did Ruganzu II Ndoli have to cross to return to his kingdom?",
        rw: "Ni uwuhe mugezi Ruganzu II Ndoli yari agomba kwambuka kugira ngo agaruke mu bwami bwe?",
        fr: "Quelle rivière Ruganzu II Ndoli a-t-il dû traverser pour retourner dans son royaume?"
      },
      options: ["Akagera", "Nyabarongo", "Rusizi", "Sebeya"],
      correctIndex: 1,
      explanation: {
        en: "He crossed the Nyabarongo river, which was seen as a boundary between what a person was and what they were about to become.",
        rw: "Yambutse umugezi Nyabarongo, wabonwaga nk'umupaka w'umuntu uwo yari n'uwo yari agiye kuba.",
        fr: "Il traversa la rivière Nyabarongo, qui était vue comme une frontière entre ce qu'une personne était et ce qu'elle était sur le point de devenir."
      }
    },
    {
      question: {
        en: "How did Ruganzu answer the tests and challenges from his rivals at court?",
        rw: "Ruganzu yasubije ate ibibazo n'ibigeragezo by'abanzi be mu ngoro?",
        fr: "Comment Ruganzu a-t-il répondu aux tests et défis de ses rivaux à la cour?"
      },
      options: ["With declarations of war", "By fleeing again", "With presence and by listening", "By replacing them all"],
      correctIndex: 2,
      explanation: {
        en: "He stayed, listened, and did not flinch, proving his steadiness to the court.",
        rw: "Yari ariho, yumvaga, kandi ntiyatinya, agaragaza ko ari uwo kwizerwa mu ngoro.",
        fr: "Il resta, écouta et ne flancha pas, prouvant sa stabilité à la cour."
      }
    },
    {
      question: {
        en: "What is a main lesson of Ruganzu's story according to oral tradition?",
        rw: "Ni irihe somo rikomeye ry'inkuru ya Ruganzu nk'uko amateka avuga?",
        fr: "Quelle est la principale leçon de l'histoire de Ruganzu selon la tradition orale?"
      },
      options: ["Doubt is the same as defeat", "The home you were taken from can still be reached", "Exile always erases a person", "Never trust rivals"],
      correctIndex: 1,
      explanation: {
        en: "The story is told as a lesson about return: that the home you were taken from can still be reached, and you shouldn't turn back at the water's edge.",
        rw: "Inkuru ivugwa nk'inyigisho y'ukugaruka: ko iwe wavuyemo ushobora kuzasubira, kandi ntiwagomba gusubira inyuma ku nkengero y'amazi.",
        fr: "L'histoire est racontée comme une leçon sur le retour : que la maison dont on vous a arraché peut toujours être atteinte, et vous ne devriez pas faire demi-tour au bord de l'eau."
      }
    }
  ]
};

export default ruganzuStory;
