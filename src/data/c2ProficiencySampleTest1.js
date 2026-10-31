import { getLevelExamPartDef } from '@/lib/levelsExamCatalog';

/**
 * C2 Proficiency — official Cambridge sample paper 1.
 * Same content as the Cambridge question papers; shown when Supabase has no row for the part.
 * Text gaps use [[n]] markers (n = question number, 0 = the worked example).
 */

export const C2_SAMPLE_TEST_1_SOURCE = 'Cambridge English C2 Proficiency — official sample paper 1';

const SAMPLE = { source: C2_SAMPLE_TEST_1_SOURCE, levelLabel: 'C2', idPrefix: 'c2-sample-1' };

const ASSETS = '/c2-proficiency/sample-1';

const opts = (...texts) => texts.map((text, i) => ({ letter: 'ABCDEFGH'[i], text }));

const photo = (letter, alt) => ({
  letter,
  image: `${ASSETS}/speaking/part2-${letter.toLowerCase()}.jpg`,
  alt,
});

/** @type {Record<number, object>} */
const PARTS = {
  1: {
    kind: 'mc-cloze',
    title: 'ADVENTURE TRAVEL',
    example: { number: 0, options: opts('descriptive', 'imaginary', 'fabled', 'legendary'), answer: 'D' },
    paragraphs: [
      'Wilfred Thesinger, the [[0]] explorer once said, ‘We live our lives second-hand’. Sadly, his words are true for far too many of us, as we [[1]] in front of the television, [[2]] in ‘reality’ television, living our adventures through the words and pictures of others. But it does not have to be that way – there are more opportunities than ever for taking a break from our increasingly sanitised lives and exploring not only some exotic [[3]] of the globe, but also our own abilities and ambitions. The kind of first-hand experience whose loss Thesinger laments is still available for anyone willing to forsake the beaten [[4]], and put their mind to [[5]] into the less explored regions of this [[6]] planet.',
      'The [[7]] in travel in recent years has been towards what is known as adventure travel. But adventure doesn’t have to involve physical exertion; be it haggling over a souvenir in Peru, or getting lost in the labyrinthine passages of a Moroccan souk, it all [[8]].',
    ],
    questions: [
      { number: 1, options: opts('droop', 'slump', 'sag', 'plunge'), answer: 'B' },
      { number: 2, options: opts('captivated', 'gripped', 'engrossed', 'riveted'), answer: 'C' },
      { number: 3, options: opts('corner', 'edge', 'angle', 'pocket'), answer: 'A' },
      { number: 4, options: opts('route', 'road', 'track', 'course'), answer: 'C' },
      { number: 5, options: opts('turning out', 'taking off', 'making out', 'dropping off'), answer: 'B' },
      { number: 6, options: opts('wide', 'diverse', 'mixed', 'different'), answer: 'B' },
      { number: 7, options: opts('trend', 'direction', 'custom', 'inclination'), answer: 'A' },
      { number: 8, options: opts('fits', 'belongs', 'counts', 'holds'), answer: 'C' },
    ],
  },

  2: {
    kind: 'open-cloze',
    title: 'MOBILE COMMUNICATION',
    example: { number: 0, answer: 'IF' },
    paragraphs: [
      'For many people, mobile email is a habit they couldn’t give up even [[0]] they wanted to. And [[9]] should they want to? [[10]] all, the ability to send and receive emails from a mobile device means they can stay in touch with colleagues, friends and family, whether they’re standing in a queue at the supermarket, downing a quick cup of coffee in [[11]] meetings or killing [[12]] before a flight.',
      'It’s fair to say that access to email while [[13]] the move has done much to whet appetites for other kinds of collaborative tools. What’s [[14]], there’s a whole new way of working that has opened up in recent years and, [[15]] a result, there’s a general expectation that efficiency and productivity don’t necessarily take [[16]] within the four walls of an organisation’s physical offices.',
    ],
    answers: {
      9: ['why'],
      10: ['after'],
      11: ['between'],
      12: ['time'],
      13: ['on'],
      14: ['more'],
      15: ['as'],
      16: ['place'],
    },
  },

  3: {
    kind: 'word-formation',
    title: 'POWER NAPS',
    example: { number: 0, stem: 'EFFECT', answer: 'EFFECTIVE' },
    stems: {
      17: 'ALERT',
      18: 'EXECUTE',
      19: 'MAXIMUM',
      20: 'ORIENTATE',
      21: 'COMPARE',
      22: 'DESIGN',
      23: 'COMPANY',
      24: 'DESPAIR',
    },
    paragraphs: [
      'Power napping is an [[0]] strategy. It involves taking an intense sleep which dramatically improves [[17]], making it especially useful for those with a demanding schedule such as mothers of babies or travelling business [[18]]. However, the conditions must be right and practice is required to [[19]] the effects.',
      'To prevent [[20]] on awakening, power naps should last about 25 minutes. Falling asleep so quickly takes practice, but is in fact a habit which is [[21]] easy to acquire. Initially, it is more important to relax for a while than actually fall asleep, and power-napping is not a good idea if you find it difficult to wake up at the [[22]] time.',
      'Finally, power-napping should not be confused with the kind of dozing that can [[23]] a sensation of overwhelming sleepiness during the day, which simply represents the [[24]] experienced in the attempt to compensate for a poor sleep routine.',
    ],
    answers: {
      17: ['alertness'],
      18: ['executives'],
      19: ['maximise', 'maximize'],
      20: ['disorientation'],
      21: ['comparatively'],
      22: ['designated'],
      23: ['accompany'],
      24: ['desperation'],
    },
  },

  4: {
    kind: 'key-word',
    answerHint: '3–8 words',
    example: {
      number: 0,
      first: 'Do you mind if I watch you while you paint?',
      keyword: 'objection',
      before: 'Do you',
      after: 'you while you paint?',
      answer: 'have any objection to my watching',
    },
    questions: [
      {
        number: 25,
        first: 'It’s impossible to predict how long it will take to do this job.',
        keyword: 'telling',
        before: 'There is',
        after: 'will take.',
        keys: [
          [
            ['no telling', 'no way of telling', 'no chance of telling'],
            ['how long this job', 'how long the job', 'how long this work', 'how long the work'],
          ],
        ],
        display: 'NO (WAY / CHANCE OF) TELLING | HOW LONG THIS / THE JOB / WORK',
      },
      {
        number: 26,
        first: 'Not many people buy that particular product these days.',
        keyword: 'demand',
        before: 'There',
        after: 'that particular product these days.',
        keys: [
          [['is'], ['little demand for', 'very little demand for']],
          [['is not'], ['a lot of demand for', 'much demand for', 'much of a demand for']],
        ],
        display: "IS | (VERY) LITTLE DEMAND FOR — or IS NOT / ISN'T | A LOT OF / MUCH (OF A) DEMAND FOR",
      },
      {
        number: 27,
        first: 'For me, his skill as a negotiator was most impressive.',
        keyword: 'how',
        before: 'I was most',
        after: 'negotiator he was.',
        keys: [
          [
            ['impressed to see', 'impressed by', 'impressed with', 'impressed at'],
            ['how skilled a', 'how skilful a', 'how skillful a'],
          ],
        ],
        display: 'IMPRESSED TO SEE / BY / WITH / AT | (JUST) HOW SKILLED / SKILFUL / SKILLFUL A',
      },
      {
        number: 28,
        first: 'Nobody expected Natalia to resign.',
        keyword: 'came',
        before: 'Natalia’s',
        after: 'everyone.',
        keys: [
          [
            ['resignation came', 'resigning came', 'decision to resign came'],
            [
              'as a surprise to',
              'as a total surprise to',
              'as a complete surprise to',
              'as a shock to',
              'as a total shock to',
              'as a complete shock to',
            ],
          ],
        ],
        display: 'RESIGNATION / RESIGNING / DECISION TO RESIGN CAME | AS A (TOTAL / COMPLETE) SURPRISE / SHOCK TO',
      },
      {
        number: 29,
        first: 'The area was completely devoid of vegetation.',
        keyword: 'whatsoever',
        before: 'There',
        after: 'the area.',
        keys: [
          [['was no vegetation', 'was not any vegetation'], ['whatsoever in']],
          [['was nothing'], ['whatsoever growing in']],
        ],
        display: 'WAS NO / WAS NOT ANY VEGETATION | WHATSOEVER IN — or WAS NOTHING | WHATSOEVER GROWING IN',
      },
      {
        number: 30,
        first: 'When he was at his most successful, the President had enormous influence.',
        keyword: 'height',
        before: 'At',
        after: ', the President had enormous influence.',
        keys: [[['the height of'], ['his success']]],
        display: 'THE HEIGHT OF | HIS SUCCESS',
      },
    ],
  },

  5: {
    kind: 'long-text-mcq',
    marksPerQuestion: 2,
    intro: 'You are going to read an extract from a novel.',
    title: 'Lucy gets a new job on a newspaper',
    paragraphs: [
      'It was a precarious period for her where her own fortunes were concerned. She had to rely on freelance work for six months after the quality weekly magazine folded. The regular salary cheque had always seemed derisively small, but now it was like lost riches. Doggedly, she wrote letters and telephoned and peppered editors with unsolicited articles and suggestions. Sometimes she struck lucky and got a commission. She wrote a profile of a woman politician who appreciated her fair-minded approach and tipped her off about a local government row in a complacent cathedral town. Lucy went there, investigated, talked to people and wrote a piece exposing a rich cauldron of corruption which was snapped up by a national daily newspaper. This in turn led to a commission to investigate the controversial siting of a theme park in the north of England. Her article was noticed by the features editor in search of something sharp and bracing on the heritage industry in general. She was getting a name for abrasive comment, for spotting an issue and homing in upon it. Anxiously, she scoured the press for hints of impending issues. In this trade, she saw, you needed not so much to be abreast of things as ahead of them, lying in wait for circumstance, ready to pounce.',
      'But an article sold every week or two did not pay the bills. She began to contemplate, bleakly, a return to the treadmill of proofreading and copy-editing. And then one day she walked into the offices of the national daily which had taken her cauldron of corruption piece and whose features editor had since looked kindly upon her. Having handed over a speculative piece on the latest educational theories she’d written, she fell into conversation with an acquaintance and learned that one of the paper’s regular columnists had fallen foul of the editor and departed in a cloud of dust. The column, traditionally addressed to matters of the moment and written so as to provoke attention and controversy, was untethered, so to speak. Lucy made the necessary phone call before her nerve went.',
      'She was asked to submit a piece as a trial run which they published. ‘Great,’ they said. ‘We’ll let you know,’ they said. ‘Soon,’ they assured her, ‘really very soon.’ She chewed her nails for a fortnight; a seasoned hack was given a trial run after her; she read his contribution which, she saw with absolute clarity, was succinct, incisive and original. Or just possibly anodyne, banal and plodding.',
      'And then, the phone call came. She’d have a weekly column with her own by-line and her photograph, postage-stamp size, next to it. There’d be a salary cheque, and perhaps fame and success to follow that. Thinking more pragmatically, she realised that the job presented her with not only a wonderful opportunity but also the inevitable pressure of keeping up with the twists and turns of events to which she must supply a perceptive commentary.',
      '‘A start,’ she said to her mother, Maureen, and Bruce, her step-father. ‘It’s a start anyway, but they could fire me at any moment.’',
      '‘Just let them try,’ said Maureen belligerently. ‘I think you’re better with your hair a bit shorter. Or maybe that’s not a very flattering picture. I think you’re very clever. You did some lovely essays at school. I wonder if I’ve still got any of them somewhere.’',
      'Later, when she was alone, Lucy thought that her appointment had probably been a piece of good fortune. She refused to allow the word luck. She was young yet, and this was something of a plum. She must have got the job on her merits, she told herself, along with whatever assistance there may have been from the inadequacies of others considered for the appointment, or the failure of further rivals to apply. What she was never to know was that in fact the editor had been on the verge of offering the column to the seasoned hack – had been about to pick up the phone – when the colleague he most disliked had walked into his office and spoken with satisfaction of the prospect of closer association with this old crony of his. The editor listened with some indignation, first at the assumption that this would be his decision, and then at the notion of these two ganging up under his nose. As soon as the colleague was out of the room he reached for the phone. And rang Lucy.',
      'And so it began, that time during which she was so feverishly hitched to the affairs of public life that in retrospect it was to seem as though she hurtled from day to day with the onward rush of the news, denied any of the lethargy of individual existence.',
    ],
    questions: [
      {
        number: 31,
        stem: 'After losing her job, how did Lucy feel about the salary she used to earn?',
        options: opts(
          'She had been foolish to give it up.',
          'It had given her a sense of security.',
          'She should have appreciated it more.',
          'It represented a fair return for her work.',
        ),
        answer: 'C',
      },
      {
        number: 32,
        stem: 'Lucy thinks the secret of success as a freelance journalist is to',
        options: opts(
          'keep yourself informed about current affairs.',
          'adopt a controversial style of writing.',
          'identify future newsworthy situations.',
          'make as many contacts as possible.',
        ),
        answer: 'C',
      },
      {
        number: 33,
        stem: 'What made Lucy decide to apply for a job on the national daily?',
        options: opts(
          'She had a friend who worked there.',
          'She had impressed the features editor.',
          'She had gained a reputation for effective reporting.',
          'She had discovered some information about a vacancy.',
        ),
        answer: 'D',
      },
      {
        number: 34,
        stem: 'It is suggested that Lucy’s mother Maureen',
        options: opts(
          'is forgetful and absent-minded.',
          'understands little about Lucy’s job.',
          'has good critical judgement about writing.',
          'expects Lucy will have trouble with the editor.',
        ),
        answer: 'B',
      },
      {
        number: 35,
        stem: 'On reflection, how did Lucy account for the fact that she got the job?',
        options: opts(
          'She hoped it was because she deserved it.',
          'She was unable to understand how it happened.',
          'She thought her age had given her an advantage.',
          'She knew she was better than the many applicants.',
        ),
        answer: 'A',
      },
      {
        number: 36,
        stem: 'The impression given of the editor is that he is',
        options: opts(
          'anxious to please his colleagues.',
          'unable to make up his mind.',
          'prone to act on impulse.',
          'quick to take offence.',
        ),
        answer: 'C',
      },
    ],
  },

  6: {
    kind: 'gapped-paragraphs',
    marksPerQuestion: 2,
    intro: 'You are going to read an extract from an article.',
    title: 'The fog catcher’s forest',
    subtitle: 'A bare, dusty island where the rain never falls could soon be covered with trees. Fred Pearce reports.',
    blocks: [
      'When Spanish sailors landed in the Canary Islands in the 15th century, they were amazed to discover an aboriginal population with extensive agriculture which they had somehow managed to sustain with virtually no rainfall. Legend has it that the Guanche people derived all their water from a single large tree, which stripped moisture out of passing fogs and dripped enough water from its leaves to support a thousand people. However true the story may be, there is no doubt that the only thing stopping the Canaries from resembling the Sahara desert, just 70 kilometres to the east, is the moisture-rich fog that drifts in from the Atlantic Ocean.',
      { gap: 37 },
      'Sometime in the last century, the last of the trees on high ground were cut down and the land began to dry out. This meant that across much of the north of the island, agriculture went into decline. Now David Riebold, a forestry scientist-turned-schoolteacher who owns a home on the island, has a plan to reverse the trend. He wants to use artificial fog harvesting to bring back the cloud forest, in what promises to be the largest reforestation project ever attempted using the technology.',
      { gap: 38 },
      'For years Riebold watched these failed efforts by local foresters. Then he read about a successful research project in Chile which harvested the fogs that regularly rolled in from the Atacama desert. Nets erected on a ridge facing the ocean provided enough water for a small town. Realising that Lanzarote’s climate was very similar to Chile’s, Riebold began to wonder whether fog harvesting could be used to keep the saplings alive.',
      { gap: 39 },
      'On paper, fog harvesting looked like a solution to the island’s reforestation problems, but convincing the authorities to give it a try wasn’t easy. For many years Riebold tried and failed to convince anyone to back his idea. It took the arrival of a new mayor to finally get his scheme approved. ‘Proyecto David’, as the locals call it, got under way, and the town authorities erected eight modest fog-collecting devices on three of Lanzarote’s mountains.',
      { gap: 40 },
      'This summer, having declared the initial experiment a success, the island council plans to install eight much larger devices which will discharge water into a pumped drip irrigation network designed to keep the saplings watered. Riebold hopes that this will form the pilot phase of a full-scale reforestation of the mountains of northern Lanzarote.',
      { gap: 41 },
      'If the initial results scale up, a new cloud forest could restore the island to its former glory. The Lanzarote government has targeted an area of about 20 square kilometres in the north of the island, though Riebold believes that the potential area for reforestation using fog collectors could stretch to 50 square kilometres.',
      { gap: 42 },
      'But the knock-on effects of reviving the forests go beyond restoring the wildlife. Eventually, the forests should capture enough moisture to help recharge the area’s underground aquifers, many of which have remained empty since the forests disappeared. If this happens, wells down in the valleys could also refill, reducing the island’s growing dependence on desalination, especially during the summer tourist season.',
      { gap: 43 },
      'Whether or not fog harvesting will prompt a large-scale return to agriculture on the island remains to be seen, but the lessons learned from harvesting fog on the island’s hilltops may be adapted for people living not far away, and with a greater need to see their landscape green and watered. If Lanzarote can catch moisture from the air and convert it to forests and farmland, then perhaps its famine-prone neighbours in West Africa could do the same.',
    ],
    options: opts(
      'This more ambitious scheme could be managed in one of two ways, he says. Either the hilltops could be covered with nets to grow new forests all at the same time, or this could be done in stages with a smaller number of nets being moved around to reforest each area in turn. After perhaps two years of water from the fog collectors, saplings would be tall enough to collect the fog water themselves.',
      'The results look promising. A litre a day should be enough to support one seedling, and Riebold has found that on some sites, a square metre of net catches an average of two litres of water each day. One site averaged five litres a day even at the hottest time of year.',
      'Centuries ago, the island’s inhabitants carved tunnels up the mountainside and into underground aquifers. These drained into collecting areas lower down. Once the island’s main source of water, they could be brought back to life by reinstating the cloud forest.',
      'In times gone by, all seven of the islands had rich cloud forests that trapped moisture from the trade winds and quenched an otherwise dry region. More recently, though, much of the islands’ forest has been lost – removed for firewood, construction and to make way for farmland. Most of the islands still have some degree of forest cover, but one, Lanzarote, is all but bare.',
      'Marciano Acuna, the local town councillor in charge of the environment, says he hopes the trees will trigger a more widespread greening of northern Lanzarote and have an impact on the whole ecology of the region. Once the trees are back, the quality of the soil will improve, and a long-lost forest ecosystem will have a chance to return, providing habitat for species long since confined to other islands in the Canaries.',
      'Even in the hottest months, clouds form over the mountains of northern Lanzarote. As the trade winds blow over the island the mountains force moisture-rich vapour into droplets. The surface of the mountain is too hot for this to happen at ground level, so the fog rarely touches the ground. ‘That’s why the saplings died,’ says Riebold. ‘They never got tall enough to touch the fog and capture the moisture on their leaves.’',
      'Farmers would certainly benefit, as water in Lanzarote has become very expensive, and there are tight restrictions on the irrigation of farmland. This has made agriculture increasingly difficult and, combined with the rise of tourism as a source of revenue, has turned it into a weekend occupation at best for many residents.',
      'The bare hills in this region have been of increasing concern to the island’s authorities. Despite numerous attempts in the past decade, all replanting schemes have so far been unsuccessful. With limited water supplies on the island, the newly planted trees dried out and died, leaving the hilltops littered with hundreds of dead saplings.',
    ),
    answers: { 37: 'D', 38: 'H', 39: 'F', 40: 'B', 41: 'A', 42: 'E', 43: 'G' },
  },

  7: {
    kind: 'multiple-matching',
    intro: 'You are going to read an extract from a book on photography.',
    title: 'Photography',
    subtitle: 'A historical background',
    sections: [
      {
        letter: 'A',
        text: 'Over the past one and a half centuries, photography has been used to record all aspects of human life and activity. During this relatively short history, the medium has expanded its capabilities in the recording of time and space, thus allowing human vision to be able to view the fleeting moment or to visualise both the vast and the minuscule. It has brought us images from remote areas of the world, distant parts of the solar system, as well as the social complexities and crises of modern life. Indeed, the photographic medium has provided one of the most important and influential means of capturing the essence of our being alive. Nonetheless, the recording of events by means of the visual image has a much longer history. The earliest creations of pictorial recording go as far back as the Upper Palaeolithic period of about 35,000 years ago and, although we cannot be sure of the exact purposes of the early cave paintings, pictorial images seem to be inextricably linked to human culture as we understand it.',
      },
      {
        letter: 'B',
        text: 'Throughout the history of visual representation, questions have been raised concerning the supposed accuracy (or otherwise) of visual images, as well as their status in society. Ideas and debates concerning how we see the world and the status of its pictorial representations have been central political, philosophical and psychological issues from the time of Ancient Greece to the present-day technical revolution of the new media communications. Vision and representation have pursued interdependent trajectories, counter-influencing each other throughout history. The popular notion that ‘seeing is believing’ had always afforded special status to the visual image. So when the technology was invented, in the form of photography, the social and cultural impact was immense. Not only did it hold out the promise of providing a record of vision, but it had the capacity to make such representation enduring.',
      },
      {
        letter: 'C',
        text: 'In the mid-nineteenth century, the invention of photography appeared to offer the promise of ‘automatically’ providing an accurate visual record. It was seen not only as the culmination of visual representation but, quite simply, the camera was regarded as a machine that could provide a fixed image. And this image was considered to be a very close approximation to that which we actually see. Because of the camera’s perceived realism in its ability to replicate visual perception, it was assumed that all peoples would ‘naturally’ be able to understand photographs. This gave rise to the question of whether photography constituted a ‘universal language’. For example, a photograph of the heavens, whether it showed the sun and moon or the constellations, would immediately be understood in any part of the world. In the face of the rapid increase in global communications, we do need at least to ask to what extent the photographic image can penetrate through cultural differences in understanding.',
      },
      {
        letter: 'D',
        text: 'There are other questions that arise concerning the role of photography in society that have aimed to determine whether the camera operates as a mute, passive recorder of what is happening or whether it possesses the voice and power to instigate social change. We may further speculate whether the camera provides images that have a truly educational function or if it operates primarily as a source of amusement. In provoking such issues, the photographic debate reflects polarised arguments that traditionally have characterised much intellectual thought.',
      },
      {
        letter: 'E',
        text: 'The last 170 years have witnessed an ever-increasing influence of the visual image, culminating in the global primacy of television. For photography, the new prospects and uncertainties posed by digital storage and manipulation, and the transmission of images via the internet present new challenges. It has even been suggested that we now inhabit the ‘post-photographic era’ – where technological and cultural change have devalued photography to such an extent that events have taken us beyond the photograph’s use and value as a medium of communication. Furthermore, perhaps we should be asking if the advent of digital imagery means that photography, initially born from painting, has turned full circle and has now returned to emulating painting – its progenitor.',
      },
    ],
    questionLead: 'In which section are the following mentioned?',
    questions: [
      { number: 44, stem: 'the possibility that photography can directly influence events in the world' },
      { number: 45, stem: 'the possibility that the photographic image has become redundant' },
      { number: 46, stem: 'images being interpreted in a similar way by different societies' },
      {
        number: 47,
        stem: 'a commonly held view about the relationship between what is visible and how it is interpreted',
      },
      { number: 48, stem: 'the contrasts of scale that can be represented in photography' },
      {
        number: 49,
        stem: 'the possibility that the techniques employed in photography today have taken the medium back to where it started',
      },
      { number: 50, stem: 'the ability of photography to provide images that will exist for a long time' },
      { number: 51, stem: 'uncertainty as to whether the main purpose of photography is to inform or to entertain' },
      { number: 52, stem: 'the potential of photography to epitomise the human condition' },
      { number: 53, stem: 'the view that photography was the greatest achievement in the history of visual images' },
    ],
    answers: { 44: 'D', 45: 'E', 46: 'C', 47: 'B', 48: 'A', 49: 'E', 50: 'B', 51: 'D', 52: 'A', 53: 'C' },
  },

  8: {
    kind: 'writing-essay',
    questionLabel: 'Question 1',
    texts: [
      {
        title: 'The Excitement of Advertising',
        text: 'Outdoor advertising has to attract, engage and persuade potential customers; it is the most important way of grabbing customers’ attention and outdoor media continue to undergo a transformation. At the core of this transformation is the digital screen media, which encompass everything from giant screens to digital billboards. The technology is cheap and advertising agencies rave about the creative possibilities for advertisements which entertain, amuse, inform, make the environment brighter and enliven the world we live in.',
      },
      {
        title: 'Advertising: an undesirable business',
        text: 'Once upon a time outdoor advertising was straightforward. Posters were stuck up on anything from a bus shelter to a motorway hoarding. Many people considered this kind of advertising to be fairly dull, a harmless blot on the landscape and chose to ignore it. These people now regard digital advertising as a form of unwanted, creeping commercialisation: it attracts a buzz simply because it is new. They feel that any advertising which targets children or vulnerable adults is a dubious practice at the best of times, and digital advertising is, moreover, wasteful, damaging to the environment and completely unnecessary.',
      },
    ],
    task: 'Write your essay.',
    wordCountNote: 'Write your answer in 240 – 280 words.',
  },

  9: {
    kind: 'writing-choice',
    wordCountNote: 'Write your answer in 280 – 320 words in an appropriate style.',
    tasks: [
      {
        number: 2,
        label: 'Question 2 — Article',
        lead: 'A travel magazine has asked readers to send in articles on their favourite public building, a town hall or a museum, for example. You decide to write an article in which you describe your favourite public building, explain why it is your favourite building and assess its significance for the wider community.',
        task: 'Write your article.',
      },
      {
        number: 3,
        label: 'Question 3 — Review',
        lead: 'You belong to an English-language reading group which recently read a book in cartoon format. You have agreed to write a review of the book for the group’s website. In your review you should give your opinion of the cartoon format used for the book and say whether you think cartoons are a good way of telling a story, in general.',
        task: 'Write your review.',
      },
      {
        number: 4,
        label: 'Question 4 — Letter',
        lead: 'A popular English-language magazine has invited readers to send in letters sharing their recent experience of making an important decision. You decide to send in a letter in which you briefly describe the situation and explain the reasons why you took an important decision, and assess what the consequences of that decision might be in the future.',
        task: 'Write your letter. You do not need to write any postal addresses.',
      },
    ],
  },

  10: {
    kind: 'listening-extracts',
    extracts: [
      {
        title: 'Extract One',
        audio: `${ASSETS}/listening/part1-extract1.mp3`,
        context: 'You hear a man talking about a new project being launched in a group of small Atlantic islands.',
        questions: [
          {
            number: 1,
            stem: 'What is the main objective of the project?',
            options: opts(
              'to raise environmental awareness',
              'to encourage tourism in the islands',
              'to follow the movements of tides',
            ),
            answer: 'C',
          },
          {
            number: 2,
            stem: 'What is the speaker’s opinion of the new project?',
            options: opts(
              'The idea is over-ambitious.',
              'The approach is innovative.',
              'The experiment is unscientific.',
            ),
            answer: 'B',
          },
        ],
      },
      {
        title: 'Extract Two',
        audio: `${ASSETS}/listening/part1-extract2.mp3`,
        context:
          'You hear part of an interview with an art critic, in which an exhibition featuring the latest work of photographer Tim Fitzgerald is discussed.',
        questions: [
          {
            number: 3,
            stem: 'What is the art critic’s opinion of Fitzgerald’s latest work?',
            options: opts(
              'It demonstrates his lack of artistic range.',
              'It compares favourably with his previous work.',
              'It shows his poor understanding of relationships.',
            ),
            answer: 'A',
          },
          {
            number: 4,
            stem: 'The art critic says that Fitzgerald’s pictures in the current show',
            options: opts(
              'are unsuitable for rounding off the exhibition.',
              'do not manage to engage the visitor’s interest.',
              'lack artistic originality.',
            ),
            answer: 'B',
          },
        ],
      },
      {
        title: 'Extract Three',
        audio: `${ASSETS}/listening/part1-extract3.mp3`,
        context: 'You hear a woman talking on the radio about her favourite piece of music.',
        questions: [
          {
            number: 5,
            stem: 'How does the speaker say she feels when listening to her favourite piece of music?',
            options: opts('engrossed', 'nostalgic', 'inspired'),
            answer: 'A',
          },
          {
            number: 6,
            stem: 'The speaker believes that critics of her favourite music are wrong to',
            options: opts(
              'doubt the level of its popularity.',
              'disregard the composer’s skills.',
              'underrate it for its wide appeal.',
            ),
            answer: 'C',
          },
        ],
      },
    ],
  },

  11: {
    kind: 'listening-sentence-completion',
    audio: `${ASSETS}/listening/part2.mp3`,
    intro:
      'You will hear a nutritionist talking about the production and uses of mastic, a spice that is found in the Mediterranean area.',
    items: [
      { number: 7, before: 'Mastic is collected from a tree which looks like a smaller form of the', after: 'tree.' },
      { number: 8, before: 'Mastic resin will', after: 'only in the region around the Mediterranean.' },
      { number: 9, before: 'Basic tools like', after: 'are employed to remove impurities from the mastic.' },
      { number: 10, before: 'Crystals of mastic have been referred to as', after: 'in literature.' },
      {
        number: 11,
        before: 'The sale of mastic crystals is handled by a',
        after: 'to ensure that the growers get a fair deal.',
      },
      { number: 12, before: 'It is thought that mastic was first used as', after: 'by ancient peoples.' },
      { number: 13, before: 'When mastic is added to', after: 'it slows down the melting process.' },
      { number: 14, before: 'Flavoured drinks are made in', after: 'which have had mastic burned under them.' },
      {
        number: 15,
        before: 'Some people believe that mastic can help in the treatment of health problems, especially some',
        after: 'conditions.',
      },
    ],
    answers: {
      7: ['olive'],
      8: ['harden'],
      9: ['pins', 'simple pins'],
      10: ['tears', 'silver tears'],
      11: ['co-operative', 'cooperative', 'co-op', 'local co-operative', 'local cooperative', 'local co-op'],
      12: ['chewing gum', 'a chewing gum'],
      13: ['ice cream', 'ice-cream', 'icecream'],
      14: ['pots', 'clay pots'],
      15: ['stomach'],
    },
  },

  12: {
    kind: 'listening-mcq',
    audio: `${ASSETS}/listening/part3.mp3`,
    intro:
      'You will hear a discussion in which two marine biologists, Gina Kelso and Thomas Lundman, talk about an award-winning television film they made about wildlife in Antarctica.',
    questions: [
      {
        number: 16,
        stem: 'Gina’s interest in marine biology dates from',
        options: opts(
          'her earliest recollections of life in Africa.',
          'one memorable experience in childhood.',
          'the years she spent studying in England.',
          'a postgraduate research project she led.',
        ),
        answer: 'B',
      },
      {
        number: 17,
        stem: 'The first wildlife TV series they both worked on',
        options: opts(
          'made use of a previously untried format.',
          'was not filmed in a natural environment.',
          'was not intended to be taken too seriously.',
          'required them to do background research.',
        ),
        answer: 'A',
      },
      {
        number: 18,
        stem: 'How did Thomas feel when he was asked to produce the programmes about Antarctica?',
        options: opts(
          'disappointed not to be presenting the series',
          'surprised that people thought he was suitable',
          'uncertain how well he would get on with the team',
          'worried about having to spend the winter there',
        ),
        answer: 'B',
      },
      {
        number: 19,
        stem: 'When they were in Antarctica, they would have appreciated',
        options: opts(
          'a less demanding work schedule.',
          'more time to study certain animals.',
          'a close friend to share their feelings with.',
          'a chance to share their work with colleagues.',
        ),
        answer: 'D',
      },
      {
        number: 20,
        stem: 'What was most impressive about the whales they filmed?',
        options: opts(
          'the unusual sounds the whales made',
          'the number of whales feeding in a small bay',
          'how long the whales stayed feeding in one area',
          'how well the whales co-operated with each other',
        ),
        answer: 'D',
      },
    ],
  },

  13: {
    kind: 'listening-dual-matching',
    audio: `${ASSETS}/listening/part4.mp3`,
    intro:
      'You will hear five short extracts in which different people are talking about taking a gap year – the time which some young people take off from their studies to gain other experience.',
    tasks: [
      {
        title: 'Task One',
        prompt: 'For questions 21 – 25, choose from the list (A – H) what each speaker did during their gap year.',
        options: opts(
          'taught a language',
          'travelled widely',
          'worked in an office',
          'did voluntary work',
          'taught a sport',
          'worked in a hotel',
          'worked as a tour guide',
          'went on an organised expedition',
        ),
        firstQuestion: 21,
      },
      {
        title: 'Task Two',
        prompt: 'For questions 26 – 30, choose from the list (A – H) which benefit of having a gap year each speaker mentions.',
        options: opts(
          'making long-lasting friendships',
          'overcoming financial problems',
          'increased independence',
          'improved linguistic skills',
          'dealing with disappointment',
          'a renewed sense of adventure',
          'a more mature approach to studying',
          'a chance to consider future plans',
        ),
        firstQuestion: 26,
      },
    ],
    speakers: 5,
    answers: { 21: 'F', 22: 'E', 23: 'H', 24: 'B', 25: 'G', 26: 'E', 27: 'H', 28: 'A', 29: 'C', 30: 'B' },
  },

  14: {
    kind: 'speaking-interview',
    phases: [
      {
        title: 'Introduction',
        lines: [
          'Good morning / afternoon / evening. My name is … and this is my colleague … .',
          'And your names are … ?',
          'Could I have your mark sheets, please?',
          'Thank you.',
          'First of all, we’d like to know something about you.',
        ],
      },
      {
        title: 'About you',
        lines: [
          'Where do you live (Candidate A)? And you (Candidate B)?',
          '[address Candidate B] Are you working or studying at the moment?',
          '[address Candidate A] And you?',
        ],
      },
      {
        title: 'Further questions',
        note: 'The examiner selects a further question for each candidate.',
        questions: [
          'You said you live in (candidate’s town/area). Is that an interesting place to live?',
          'How much free time do you have at the moment?',
          'How good are you at organising your time?',
          'What would your dream job be?',
          'Do you have much opportunity to travel?',
          'How important is the internet to you?',
        ],
      },
    ],
  },

  15: {
    kind: 'speaking-picture-task',
    title: 'TV documentary – Working in the food industry',
    lines: [
      'Now, in this part of the test you’re going to do something together. Here are some pictures of people in different situations.',
    ],
    photos: [
      photo('A', 'Diners at the outdoor tables of a restaurant terrace at night'),
      photo('B', 'A man serving food from the hatch of a street food truck'),
      photo('C', 'A kitchen worker in a hairnet and face mask cutting fish'),
      photo('D', 'Two beekeepers checking hives in a field of yellow flowers'),
    ],
    steps: [
      {
        title: 'Step 1 · about 1 minute',
        note: 'The examiner selects two of the pictures (2 minutes for groups of three).',
        lines: [
          'First, I’d like you to look at pictures * and * and talk together about how common these situations are in your country.',
          'You have about a minute for this, so don’t worry if I interrupt you.',
        ],
      },
      {
        title: 'Step 2 · about 3 minutes',
        note: '4 minutes for groups of three.',
        lines: [
          'Thank you. Now look at all the pictures.',
          'I’d like you to imagine that a television documentary is being produced on working in the food industry. These pictures show some of the issues that are being considered.',
          'Talk together about the different issues related to working in the food industry that these pictures show. Then decide which issue might stimulate most interest.',
          'You have about three minutes to talk about this.',
        ],
      },
    ],
  },

  16: {
    kind: 'speaking-prompt-cards',
    topic: 'Decisions',
    lines: [
      'Now, in this part of the test you’re each going to talk on your own for about two minutes. You need to listen while your partner is speaking because you’ll be asked to comment afterwards.',
    ],
    cards: [
      {
        title: 'Task 1(a) · Candidate A',
        question: 'Which is preferable, making your own decisions or asking others for advice?',
        ideas: ['in education', 'at work', 'at different ages'],
        timing: 'Candidate A talks for about 2 minutes.',
        followUp: {
          title: 'Then · about 1 minute',
          note: 'The examiner asks Candidate B one of these questions, then invites Candidate A to join in (What do you think? / Do you agree? / How about you?).',
          questions: [
            'Generally speaking, do you think you are a decisive person?',
            'Who gives the best advice – friends, family or strangers? (Why?)',
            'Are you a good person to go to for advice? (Why? / Why not?)',
          ],
        },
      },
      {
        title: 'Task 1(b) · Candidate B',
        question: 'How much are people’s decisions influenced by the media?',
        ideas: ['spending habits', 'current affairs', 'entertainment'],
        timing: 'Candidate B talks for about 2 minutes.',
        followUp: {
          title: 'Then · about 1 minute',
          note: 'The examiner asks Candidate A one of these questions, then invites Candidate B to join in (What do you think? / Do you agree? / How about you?).',
          questions: [
            'If you had to depend on only one of the media for information, which would you choose? (Why?)',
            'To what extent do you believe what you read or hear?',
            'What kind of decisions need to be made before TV programmes are broadcast to children?',
          ],
        },
      },
    ],
    discussion: {
      title: 'Discussion · up to 4 minutes',
      note: 'The examiner asks both candidates a selection of these questions.',
      lines: ['Now, to finish the test, we’re going to talk about ‘decisions’ in general.'],
      questions: [
        'Nowadays, there are so many products to choose from that it’s impossible to choose. To what extent do you agree?',
        'Who should decide how taxes are spent, government ministers or local people? (Why?)',
        'Why do jobs that involve taking difficult decisions appeal to some people?',
        'What difficult decisions do you think scientists will face in the future?',
        'What is the best way of deciding how a criminal is punished?',
        'How easy is it to repair a wrong decision?',
      ],
    },
  },
};

/**
 * @param {number} partNumber global C2 part (1–16)
 * @returns {null | (object & { partNumber: number, directions: string, questionStart?: number, questionCount?: number, sample: object })}
 */
export function getC2SampleTest1Part(partNumber) {
  const pn = Number(partNumber);
  const part = PARTS[pn];
  if (!part) return null;
  const def = getLevelExamPartDef('c2', pn);
  return {
    ...part,
    partNumber: pn,
    directions: part.directions || def?.directions || '',
    questionStart: def?.questionStart,
    questionCount: def?.questionCount,
    sample: SAMPLE,
  };
}
