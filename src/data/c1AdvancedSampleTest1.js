import { getLevelExamPartDef } from '@/lib/levelsExamCatalog';

/**
 * C1 Advanced (2015 format) — official Cambridge sample paper 1.
 * Same content as the Cambridge question papers; shown when Supabase has no row for the part.
 * Text gaps use [[n]] markers (n = question number, 0 = the worked example).
 */

export const C1_SAMPLE_TEST_1_SOURCE = 'Cambridge English C1 Advanced — official sample paper 1';

const SAMPLE = { source: C1_SAMPLE_TEST_1_SOURCE, levelLabel: 'C1', idPrefix: 'c1-sample-1' };

const ASSETS = '/c1-advanced/sample-1';

const opts = (...texts) => texts.map((text, i) => ({ letter: 'ABCDEFGH'[i], text }));

const photo = (task, letter, alt) => ({
  letter,
  image: `${ASSETS}/speaking/part2-task${task}-${letter.toLowerCase()}.jpg`,
  alt,
});

const PART3_QUESTION = 'What might people have to consider when making these decisions?';

/** Mind map order: top left, top right, middle left, middle right, bottom. */
const PART3_PROMPTS = [
  'choosing a university',
  'finding a job',
  'starting a family',
  'getting married',
  'moving to another country',
];

/** @type {Record<number, object>} */
const PARTS = {
  1: {
    kind: 'mc-cloze',
    title: 'Studying black bears',
    example: { number: 0, options: opts('straight', 'common', 'everyday', 'conventional'), answer: 'D' },
    paragraphs: [
      'After years studying North America’s black bears in the [[0]] way, wildlife biologist Luke Robertson felt no closer to understanding the creatures. He realised that he had to [[1]] their trust. Abandoning scientific detachment, he took the daring step of forming relationships with the animals, bringing them food to gain their acceptance.',
      'The [[2]] this has given him into their behaviour has allowed him to dispel certain myths about bears. [[3]] to popular belief, he contends that bears do not [[4]] as much for fruit as previously supposed. He also [[5]] claims that they are ferocious. He says that people should not be [[6]] by behaviour such as swatting paws on the ground, as this is a defensive, rather than an aggressive, act.',
      'However, Robertson is no sentimentalist. After devoting years of his life to the bears, he is under no [[7]] about their feelings for him. It is clear that their interest in him does not [[8]] beyond the food he brings.',
    ],
    questions: [
      { number: 1, options: opts('catch', 'win', 'achieve', 'receive'), answer: 'B' },
      { number: 2, options: opts('perception', 'awareness', 'insight', 'vision'), answer: 'C' },
      { number: 3, options: opts('Opposite', 'Opposed', 'Contrary', 'Contradictory'), answer: 'C' },
      { number: 4, options: opts('care', 'bother', 'desire', 'hope'), answer: 'A' },
      { number: 5, options: opts('concludes', 'disputes', 'reasons', 'argues'), answer: 'B' },
      { number: 6, options: opts('misguided', 'misled', 'misdirected', 'misinformed'), answer: 'B' },
      { number: 7, options: opts('error', 'doubt', 'illusion', 'impression'), answer: 'C' },
      { number: 8, options: opts('expand', 'spread', 'widen', 'extend'), answer: 'D' },
    ],
  },

  2: {
    kind: 'open-cloze',
    title: 'The origin of language',
    example: { number: 0, answer: 'IS' },
    paragraphs: [
      'The truth [[0]] nobody really knows how language first began. Did we all start talking at around the same time [[9]] of the manner in which our brains had begun to develop?',
      'Although there is a lack of clear evidence, people have come up with various theories about the origins of language. One recent theory is that human beings have evolved in [[10]] a way that we are programmed for language from the moment of birth. In [[11]] words, language came about as a result of an evolutionary change in our brains at some stage.',
      'Language [[12]] well be programmed into the brain but, [[13]] this, people still need stimulus from others around them. From studies, we know that [[14]] children are isolated from human contact and have not learnt to construct sentences before they are ten, it is doubtful they will ever do so. This research shows, if [[15]] else, that language is a social activity, not something invented [[16]] isolation.',
    ],
    answers: {
      9: ['because'],
      10: ['such'],
      11: ['other'],
      12: ['could', 'may', 'might'],
      13: ['despite'],
      14: ['if', 'when', 'whenever'],
      15: ['nothing', 'little'],
      16: ['in'],
    },
  },

  3: {
    kind: 'word-formation',
    title: 'Training sports champions',
    example: { number: 0, stem: 'PROFESSION', answer: 'PROFESSIONAL' },
    stems: {
      17: 'COME',
      18: 'FIT',
      19: 'ENDURE',
      20: 'BENEFIT',
      21: 'ABLE',
      22: 'STRONG',
      23: 'TYPE',
      24: 'SEVERE',
    },
    paragraphs: [
      'What are the abilities that a [[0]] sports person needs? To guarantee that opponents can be [[17]], speed, stamina and agility are essential, not to mention outstanding natural talent. Both a rigorous and comprehensive [[18]] regime and a highly nutritious diet are vital for top-level performance. It is carbohydrates, rather than proteins and fat, that provide athletes with the [[19]] they need to compete. This means that pasta is more [[20]] than eggs or meat. Such a diet enables them to move very energetically when required. Failure to follow a sensible diet can result in the [[21]] to maintain stamina.',
      'Regular training to increase muscular [[22]] is also a vital part of a professional’s regime, and this is [[23]] done by exercising with weights. Sports people are prone to injury but a quality training regime can ensure that the [[24]] of these can be minimised.',
    ],
    answers: {
      17: ['overcome'],
      18: ['fitness'],
      19: ['endurance'],
      20: ['beneficial'],
      21: ['inability'],
      22: ['strength'],
      23: ['typically'],
      24: ['severity'],
    },
  },

  4: {
    kind: 'key-word',
    answerHint: '3–6 words',
    example: {
      number: 0,
      first: 'James would only speak to the head of department alone.',
      keyword: 'ON',
      before: 'James',
      after: 'to the head of department alone.',
      answer: 'insisted on speaking',
    },
    questions: [
      {
        number: 25,
        first: 'My brother now earns far less than he did when he was younger.',
        keyword: 'NEARLY',
        before: 'My brother',
        after: 'much now as he did when he was younger.',
        keys: [[['does not earn', "doesn't earn", 'does not make', "doesn't make"], ['nearly so', 'nearly as']]],
        display: "DOES NOT / DOESN'T EARN (or MAKE) | NEARLY SO / AS",
      },
      {
        number: 26,
        first: 'They are demolishing the old bus station and replacing it with a new one.',
        keyword: 'PULLED',
        before: 'The old bus station is',
        after: 'with a new one.',
        keys: [
          [['being pulled down'], ['and replaced', 'and being replaced', 'to be replaced']],
          [['to be pulled down'], ['and replaced']],
        ],
        display: 'BEING PULLED DOWN | AND (BEING) REPLACED / TO BE REPLACED — or TO BE PULLED DOWN | AND REPLACED',
      },
      {
        number: 27,
        first: 'The number of students now at university has reached an all-time high, apparently.',
        keyword: 'THE',
        before: 'The number of students now at university is',
        after: 'been, apparently.',
        keys: [
          [
            ['the highest'],
            ['it has ever', 'that it has ever', 'which it has ever', "it's ever", "that it's ever", "which it's ever"],
          ],
        ],
        display: "THE HIGHEST | (THAT / WHICH) IT HAS EVER / IT'S EVER",
      },
      {
        number: 28,
        first: 'I’m disappointed with the Fishers’ new album when I compare it to their previous one.',
        keyword: 'COMPARISON',
        before: 'I think the Fishers’ new album is',
        after: 'their previous one.',
        keys: [[['disappointing', 'a disappointment'], ['in comparison with', 'in comparison to']]],
        display: 'DISAPPOINTING / A DISAPPOINTMENT | IN COMPARISON WITH / TO',
      },
      {
        number: 29,
        first: 'Anna got the job even though she didn’t have much experience in public relations.',
        keyword: 'SPITE',
        before: 'Anna got the job',
        after: 'of experience in public relations.',
        keys: [[['in spite of'], ['a lack', 'her lack']]],
        display: 'IN SPITE OF | A / HER LACK',
      },
      {
        number: 30,
        first: '‘I must warn you how dangerous it is to cycle at night without any lights,’ said the police officer to Max.',
        keyword: 'DANGERS',
        before: 'Max received a',
        after: 'at night without any lights from the police officer.',
        keys: [
          [
            ['warning about', 'warning regarding', 'warning concerning'],
            ['the dangers of cycling', 'the dangers when cycling'],
          ],
        ],
        display: 'WARNING ABOUT / REGARDING / CONCERNING | THE DANGERS OF / WHEN CYCLING',
      },
    ],
  },

  5: {
    kind: 'long-text-mcq',
    marksPerQuestion: 2,
    intro: 'You are going to read the introduction to a book about the history of colour.',
    title: 'Introduction to a book about the history of colour',
    paragraphs: [
      'This book examines how the ever-changing role of colour in society has been reflected in manuscripts, stained glass, clothing, painting and popular culture. Colour is a natural phenomenon, of course, but it is also a complex cultural construct that resists generalization and, indeed, analysis itself. No doubt this is why serious works devoted to colour are rare, and rarer still are those that aim to study it in historical context. Many authors search for the universal or archetypal truths they imagine reside in colour, but for the historian, such truths do not exist. Colour is first and foremost a social phenomenon. There is no transcultural truth to colour perception, despite what many books based on poorly grasped neurobiology or – even worse – on pseudoesoteric pop psychology would have us believe. Such books unfortunately clutter the bibliography on the subject, and even do it harm.',
      'The silence of historians on the subject of colour, or more particularly their difficulty in conceiving colour as a subject separate from other historical phenomena, is the result of three different sets of problems. The first concerns documentation and preservation. We see the colours transmitted to us by the past as time has altered them and not as they were originally. Moreover, we see them under light conditions that often are entirely different from those known by past societies. And finally, over the decades we have developed the habit of looking at objects from the past in black-and-white photographs and, despite the current diffusion of colour photography, our ways of thinking about and reacting to these objects seem to have remained more or less black and white.',
      'The second set of problems concerns methodology. As soon as the historian seeks to study colour, he must grapple with a host of factors all at once: physics, chemistry, materials, and techniques of production, as well as iconography, ideology, and the symbolic meanings that colours convey. How to make sense of all of these elements? How can one establish an analytical model facilitating the study of images and coloured objects? No researcher, no method, has yet been able to resolve these problems, because among the numerous facts pertaining to colour, a researcher tends to select those facts that support his study and to conveniently forget those that contradict it. This is clearly a poor way to conduct research. And it is made worse by the temptation to apply to the objects and images of a given historical period information found in texts of that period. The proper method – at least in the first phase of analysis – is to proceed as do palaeontologists (who must study cave paintings without the aid of texts): by extrapolating from the images and the objects themselves a logic and a system based on various concrete factors such as the rate of occurrence of particular objects and motifs, their distribution and disposition. In short, one undertakes the internal structural analysis with which any study of an image or coloured object should begin.',
      'The third set of problems is philosophical: it is wrong to project our own conceptions and definitions of colour onto the images, objects and monuments of past centuries. Our judgements and values are not those of previous societies (and no doubt they will change again in the future). For the writer-historian looking at the definitions and taxonomy of colour, the danger of anachronism is very real. For example, the spectrum with its natural order of colours was unknown before the seventeenth century, while the notion of primary and secondary colours did not become common until the nineteenth century. These are not eternal notions but stages in the ever-changing history of knowledge.',
      'I have reflected on such issues at greater length in my previous work, so while the present book does address certain of them, for the most part it is devoted to other topics. Nor is it concerned only with the history of colour in images and artworks – in any case that area still has many gaps to be filled. Rather, the aim of this book is to examine all kinds of objects in order to consider the different facets of the history of colour and to show how far beyond the artistic sphere this history reaches. The history of painting is one thing; that of colour is another, much larger, question. Most studies devoted to the history of colour err in considering only the pictorial, artistic or scientific realms. But the lessons to be learned from colour and its real interest lie elsewhere.',
    ],
    questions: [
      {
        number: 31,
        stem: 'What problem regarding colour does the writer explain in the first paragraph?',
        options: opts(
          'Our view of colour is strongly affected by changing fashion.',
          'Analysis is complicated by the bewildering number of natural colours.',
          'Colours can have different associations in different parts of the world.',
          'Certain popular books have dismissed colour as insignificant.',
        ),
        answer: 'C',
      },
      {
        number: 32,
        stem: 'What is the first reason the writer gives for the lack of academic work on the history of colour?',
        options: opts(
          'There are problems of reliability associated with the artefacts available.',
          'Historians have seen colour as being outside their field of expertise.',
          'Colour has been rather looked down upon as a fit subject for academic study.',
          'Very little documentation exists for historians to use.',
        ),
        answer: 'A',
      },
      {
        number: 33,
        stem: 'The writer suggests that the priority when conducting historical research on colour is to',
        options: opts(
          'ignore the interpretations of other modern day historians.',
          'focus one’s interest as far back as the prehistoric era.',
          'find some way of organising the mass of available data.',
          'relate pictures to information from other sources.',
        ),
        answer: 'C',
      },
      {
        number: 34,
        stem: 'In the fourth paragraph, the writer says that the historian writing about colour should be careful',
        options: opts(
          'not to analyse in an old-fashioned way.',
          'when making basic distinctions between key ideas.',
          'not to make unwise predictions.',
          'when using certain terms and concepts.',
        ),
        answer: 'D',
      },
      {
        number: 35,
        stem: 'In the fifth paragraph, the writer says there needs to be further research done on',
        options: opts(
          'the history of colour in relation to objects in the world around us.',
          'the concerns he has raised in an earlier publication.',
          'the many ways in which artists have used colour over the years.',
          'the relationship between artistic works and the history of colour.',
        ),
        answer: 'D',
      },
      {
        number: 36,
        stem: 'An idea recurring in the text is that people who have studied colour have',
        options: opts(
          'failed to keep up with scientific developments.',
          'not understood its global significance.',
          'found it difficult to be fully objective.',
          'been muddled about their basic aims.',
        ),
        answer: 'C',
      },
    ],
  },

  6: {
    kind: 'cross-text-matching',
    marksPerQuestion: 2,
    intro: 'You are going to read four reviews of a book about how architecture can affect the emotions.',
    directions: 'For questions 37 – 40, choose from the reviews A – D. The reviews may be chosen more than once.',
    title: 'The Architecture of Happiness',
    subtitle: 'Four reviewers comment on philosopher Alain De Botton’s book',
    texts: [
      {
        letter: 'A',
        text: 'Alain de Botton is a brave and highly intelligent writer who writes about complex subjects, clarifying the arcane for the layman. Now, with typical self-assurance, he has turned to the subject of architecture. The essential theme of his book is how architecture influences mood and behaviour. It is not about the specifically architectural characteristics of space and design, but much more about the emotions that architecture inspires in the users of buildings. Yet architects do not normally talk nowadays very much about emotion and beauty. They talk about design and function. De Botton’s message, then, is fairly simple but worthwhile precisely because it is simple, readable and timely. His commendable aim is to encourage architects, and society more generally, to pay more attention to the psychological consequences of design in architecture: architecture should be treated as something that affects all our lives, our happiness and well-being.',
      },
      {
        letter: 'B',
        text: 'Alain de Botton raises important, previously unasked, questions concerning the quest for beauty in architecture, or its rejection or denial. Yet one is left with the feeling that he needed the help and support of earlier authors on the subject to walk him across the daunting threshold of architecture itself. And he is given to making extraordinary claims: ‘Architecture is perplexing ... in how inconsistent is its capacity to generate the happiness on which its claim to our attention is founded.’ If architecture’s capacity to generate happiness is inconsistent, this might be because happiness has rarely been something architects think about. De Botton never once discusses the importance of such dull, yet determining, matters as finance or planning laws, much less inventions such as the lift or reinforced concrete. He appears to believe that architects are still masters of their art, when increasingly they are cogs in a global machine for building in which beauty, and how de Botton feels about it, are increasingly beside the point.',
      },
      {
        letter: 'C',
        text: 'In The Architecture of Happiness, Alain de Botton has a great time making bold and amusing judgements about architecture, with lavish and imaginative references, but anyone in search of privileged insights into the substance of building design should be warned that he is not looking at drain schedules or pipe runs. He worries away, as many architects do, at how inert material things can convey meaning and alter consciousness. Although he is a rigorous thinker, most of de Botton’s revelations, such as the contradictions in Le Corbusier’s theory and practice, are not particularly new. However, this is an engaging and intelligent book on architecture and something everyone, professionals within the field in particular, should read.',
      },
      {
        letter: 'D',
        text: 'Do we want our buildings merely to shelter us, or do we also want them to speak to us? Can the right sort of architecture even improve our character? Music mirrors the dynamics of our emotional lives. Mightn’t architecture work the same way? De Botton thinks so, and in The Architecture of Happiness he makes the most of this theme on his jolly trip through the world of architecture. De Botton certainly writes with conviction and, while focusing on happiness can be a lovely way to make sense of architectural beauty, it probably won’t be of much help in resolving conflicts of taste.',
      },
    ],
    questionLead: 'Which reviewer',
    questions: [
      {
        number: 37,
        stem: 'has a different opinion from the others on the confidence with which de Botton discusses architecture?',
        answer: 'B',
      },
      {
        number: 38,
        stem: 'shares reviewer A’s opinion whether architects should take note of de Botton’s ideas?',
        answer: 'C',
      },
      {
        number: 39,
        stem: 'expresses a similar view to reviewer B regarding the extent to which architects share de Botton’s concerns?',
        answer: 'A',
      },
      {
        number: 40,
        stem: 'has a different view to reviewer C on the originality of some of de Botton’s ideas?',
        answer: 'B',
      },
    ],
  },

  7: {
    kind: 'gapped-paragraphs',
    marksPerQuestion: 2,
    intro: 'You are going to read an extract from a magazine article. Six paragraphs have been removed from the extract.',
    directions:
      'Choose from the paragraphs A – G the one which fits each gap (41 – 46). There is one extra paragraph which you do not need to use.',
    title: 'Scottish Wildcat',
    blocks: [
      'On my living-room wall I have a painting of a wildcat by John Holmes of which I am extremely fond. It depicts a snarling, spitting animal, teeth bared and back arched: a taut coiled spring ready to unleash some unknown fury.',
      { gap: 41 },
      'However, the physical differences are tangible. The wildcat is a much larger animal, weighing in some cases up to seven kilos, the same as a typical male fox. The coat pattern is superficially similar to a domestic tabby cat but it is all stripes and no spots. The tail is thicker and blunter, with three to five black rings. The animal has an altogether heavier look.',
      'The Scottish wildcat was originally distinguished as a separate subspecies in 1912, but it is now generally recognised that there is little difference between the Scottish and other European populations. According to an excellent report on the wildcat printed in 1991, the animals originally occurred in a variety of habitats throughout Europe.',
      { gap: 42 },
      'It was during the nineteenth century, with the establishment of many estates used by landowners for hunting, that the wildcat became a nuisance and its rapid decline really began; 198 wildcats were killed in three years in the area of Glengarry, for example. However, things were later to improve for the species.',
      { gap: 43 },
      'The future is by no means secure, though, and recent evidence suggests that the wildcat is particularly vulnerable to local eradication, especially in the remoter parts of northern and western Scotland. This is a cause for real concern, given that the animals in these areas have less contact with domestic cats and are therefore purer.',
      { gap: 44 },
      'Part of the problem stems from the fact that the accepted physical description of the species originates from the selective nature of the examination process by the British Natural History Museum at the start of the century, and this has been used as the type-definition for the animal ever since. Animals that did not conform to that large blunt-tailed ‘tabby’ description were discarded as not being wildcats. In other words, an artificial collection of specimens was built up, exhibiting the features considered typical of the wildcat.',
      'The current research aims to resolve this potential problem. It is attempting to find out whether there are any physical features which characterise the so-called wild-living cats.',
      { gap: 45 },
      'But what of his lifestyle? Wildcat kittens are usually born in May/June in a secluded den, secreted in a gap amongst boulders. Another favourite location is in the roots of a tree.',
      { gap: 46 },
      'Rabbits are a favourite prey, and some of the best areas to see wildcats are at rabbit warrens close to the forest and moorland edge. Mice, small birds and even insects also form a large part of the diet, and the animal may occasionally take young deer.',
      'The wildcat is one of the Scottish Highlands’ most exciting animals. Catch a glimpse of one and the memory will linger forever.',
    ],
    options: [
      {
        letter: 'A',
        text: 'The recruitment of men to the armed forces during the conflict in Europe from 1914 to 1918 meant there was very little persecution, since gamekeepers went off to fight. As the number of gamekeepers decreased, the wildcat began to increase its range, recolonising many of its former haunts. Extinction was narrowly averted.',
      },
      {
        letter: 'B',
        text: 'The wildcat waits for a while in rapt concentration, ears twitching and eyes watching, seeing everything and hearing everything, trying to detect the tell-tale movement of a vole or a mouse. But there is nothing, and in another leap he disappears into the gloom.',
      },
      {
        letter: 'C',
        text: 'The results, which are expected shortly, will be fascinating. But anyone who has seen a wildcat will be in little doubt that there is indeed a unique and distinctive animal living in the Scottish Highlands, whatever his background.',
      },
      {
        letter: 'D',
        text: 'They probably used deciduous and coniferous woodland for shelter, particularly in winter, and hunted over more open areas such as forest edge, open woodland, thickets and scrub, grassy areas and marsh. The wildcat was probably driven into more mountainous areas by a combination of deforestation and persecution.',
      },
      {
        letter: 'E',
        text: 'As the animals emerge, their curiosity is aroused by every movement and rustle in the vegetation. Later they will accompany their mother on hunting trips, learning quickly, and soon become adept hunters themselves.',
      },
      {
        letter: 'F',
        text: 'This is what makes many people think that the wildcat is a species in its own right. Research currently being undertaken by Scottish Natural Heritage is investigating whether the wildcat really is distinct from its home-living cousin, or whether it is nothing more than a wild-living form of the domestic cat.',
      },
      {
        letter: 'G',
        text: 'It is a typical image most folk have of the beast, but it is very much a false one, for the wildcat is little more than a bigger version of the domestic cat, and probably shows his anger as often.',
      },
    ],
    answers: { 41: 'G', 42: 'D', 43: 'A', 44: 'F', 45: 'C', 46: 'E' },
  },

  8: {
    kind: 'multiple-matching',
    intro:
      'You are going to read a magazine article in which five career consultants give advice about starting a career.',
    directions: 'For questions 47 – 56, choose from the consultants (A – E). The consultants may be chosen more than once.',
    title: 'Starting out on your career',
    lead: 'Are you a graduate trying to plan out the best career path for yourself? We’ve asked five careers consultants to give some tips on how to go about it.',
    sections: [
      {
        letter: 'A',
        text: 'A university degree is no guarantee of a job, and job hunting in itself requires a whole set of skills. If you find you are not getting past the first interview, ask yourself what is happening. Is it a failure to communicate or are there some skills you lack? Once you see patterns emerging it will help you decide whether the gaps you have identified can be filled relatively easily. If you cannot work out what the mismatch is, get back to the selection panel with more probing questions, and find out what you need to do to bring yourself up to the level of qualification that would make you more attractive to them: but be careful to make this sound like a genuine request rather than a challenge or complaint.',
      },
      {
        letter: 'B',
        text: 'Do not be too dispirited if you are turned down for a job, but think about the reasons the employers give. They often say it is because others are ‘better qualified’, but they use the term loosely. Those who made the second interview might have been studying the same subject as you and be of similar ability level, but they had something which made them a closer match to the selector’s ideal. That could be experience gained through projects or vacation work, or it might be that they were better at communicating what they could offer. Do not take the comments at face value: think back to the interviews that generated them and make a list of where you think the shortfall in your performance lies. With this sort of analytical approach you will eventually get your foot in the door.',
      },
      {
        letter: 'C',
        text: 'Deciding how long you should stay in your first job is a tough call. Stay too long and future employers may question your drive and ambition. Of course, it depends where you are aiming. There can be advantages in moving sideways rather than up, if you want to gain real depth of knowledge. If you are a graduate, spending five or six years in the same job is not too long provided that you take full advantage of the experience. However, do not use this as an excuse for apathy. Graduates sometimes fail to take ownership of their careers and take the initiative. It is up to you to make the most of what’s available within a company, and to monitor your progress in case you need to move on. This applies particularly if you are still not sure where your career path lies.',
      },
      {
        letter: 'D',
        text: 'It is helpful to think through what kind of experience you need to get your dream job and it is not a problem to move around to a certain extent. But in the early stages of your career you need a definite strategy for reaching your goal, so think about that carefully before deciding to move on from your first job. You must cultivate patience to master any role. There is no guarantee that you will get adequate training, and research has shown that if you do not receive proper help in a new role, it can take 18 months to master it.',
      },
      {
        letter: 'E',
        text: 'A prospective employer does not want to see that you have changed jobs every six months with no thread running between them. You need to be able to demonstrate the quality of your experience to a future employer, and too many moves too quickly can be a bad thing. In any company it takes three to six months for a new employee to get up to speed with the structure and the culture of the company. From the company’s perspective, they will not receive any return on the investment in your salary until you have been there for 18 months. This is when they begin to get most value from you – you are still fired up and enthusiastic. If you leave after six months it has not been a good investment – and may make other employers wary.',
      },
    ],
    questionLead: 'Which consultant makes the following statements?',
    questions: [
      { number: 47, stem: 'Keep your final objective in mind when you are planning to change jobs.', answer: 'D' },
      { number: 48, stem: 'It takes time to become familiar with the characteristics of a company you have joined.', answer: 'E' },
      { number: 49, stem: 'You should demonstrate determination to improve your job prospects.', answer: 'C' },
      { number: 50, stem: 'Make sure your approach for information is positive in tone.', answer: 'A' },
      { number: 51, stem: 'It is not certain that you will be given very much support in your job initially.', answer: 'D' },
      { number: 52, stem: 'Stay optimistic in spite of setbacks.', answer: 'B' },
      { number: 53, stem: 'Promotion isn’t the only way to increase your expertise.', answer: 'C' },
      { number: 54, stem: 'Ask for information about your shortcomings.', answer: 'A' },
      { number: 55, stem: 'Some information you are given may not give a complete picture.', answer: 'B' },
      { number: 56, stem: 'It will be some time before you start giving your employers their money’s worth.', answer: 'E' },
    ],
  },

  9: {
    kind: 'writing-essay',
    questionLabel: 'Question 1',
    situation:
      'Your class has attended a panel discussion on facilities which should receive money from local authorities. You have made the notes below:',
    notes: {
      heading: 'Which facilities should receive money from local authorities?',
      items: ['museums', 'sports centres', 'public gardens'],
      opinionsHeading: 'Some opinions expressed in the discussion:',
      opinions: [
        '“Museums aren’t popular with everybody!”',
        '“Sports centres mean healthier people.”',
        '“A town needs green spaces – parks are great for everybody.”',
      ],
    },
    task: 'Write an essay discussing two of the facilities in your notes. You should explain which facility it is more important for local authorities to give money to, giving reasons in support of your answer.',
    extraNote:
      'You may, if you wish, make use of the opinions expressed in the discussion, but you should use your own words as far as possible.',
    wordCountNote: 'Write your answer in 220–260 words in an appropriate style.',
  },

  10: {
    kind: 'writing-choice',
    wordCountNote: 'Write your answer in 220–260 words in an appropriate style.',
    tasks: [
      {
        number: 2,
        label: 'Question 2 — Report',
        lead: 'You have just completed six months in a new job. In preparation for a progress meeting, you have been asked to write a report to your manager.',
        body: 'Your report should explain what you feel you have achieved in the job so far, describe any problems you have had, and suggest any future training that would be suitable.',
        task: 'Write your report.',
      },
      {
        number: 3,
        label: 'Question 3 — Review',
        lead: 'You see the following announcement on a website, Great Lives:',
        announcement: {
          heading: 'Reviews wanted',
          lines: [
            'Send us a review of a book or film that focuses on somebody who has made an important contribution to society.',
            'Did you learn anything new about the person’s life from the book or film? Did the book or film help you understand why this person made their important contribution?',
          ],
        },
        task: 'Write your review.',
      },
      {
        number: 4,
        label: 'Question 4 — Letter',
        lead: 'You have received a letter from an English friend:',
        letter: [
          '…',
          'My new job is great, and next month I get to travel on business. Guess what – I’m actually coming to your town for a week!',
          'I’ll be free some evenings and one weekend. I want to make the most of this opportunity, so I’d like your advice please: where to go, what to do, and why?',
          'Cheers,',
          'Chris',
        ],
        task: 'Write your letter in reply. You do not need to include postal addresses.',
      },
    ],
  },

  11: {
    kind: 'listening-extracts',
    extracts: [
      {
        title: 'Extract One',
        audio: `${ASSETS}/listening/part1-extract1.mp3`,
        context: 'You hear two friends discussing the topic of marketing.',
        questions: [
          {
            number: 1,
            stem: 'Which aspect of college publicity material do the friends disagree about?',
            options: opts(
              'how useful the environmental rating system is',
              'how well the different courses are described',
              'how visually attractive the brochures are',
            ),
            answer: 'A',
          },
          {
            number: 2,
            stem: 'In the woman’s opinion, companies link themselves with charities in order to',
            options: opts(
              'boost their profits.',
              'improve their image in society.',
              'distract attention away from other issues.',
            ),
            answer: 'B',
          },
        ],
      },
      {
        title: 'Extract Two',
        audio: `${ASSETS}/listening/part1-extract2.mp3`,
        context: 'You hear two friends talking about ways of keeping fit.',
        questions: [
          {
            number: 3,
            stem: 'What is the woman’s criticism of exercising in gyms?',
            options: opts(
              'Members get limited access to the facilities.',
              'The membership cost is too high for the services offered.',
              'It encourages exercise habits that lead to unhealthy lifestyles.',
            ),
            answer: 'C',
          },
          {
            number: 4,
            stem: 'How does the man respond to his friend’s criticism?',
            options: opts(
              'He objects to her making sweeping generalisations about gyms.',
              'He questions the value of excessive gym attendance.',
              'He suspects she’d enjoy a different type of gym.',
            ),
            answer: 'A',
          },
        ],
      },
      {
        title: 'Extract Three',
        audio: `${ASSETS}/listening/part1-extract3.mp3`,
        context: 'You hear a woman telling a friend about living in her capital city as a student.',
        questions: [
          {
            number: 5,
            stem: 'What is she doing during the conversation?',
            options: opts(
              'admitting to regrets about her choice of place to study',
              'complaining about challenges she’s had to face',
              'expressing her admiration for people in the city',
            ),
            answer: 'C',
          },
          {
            number: 6,
            stem: 'Why does the man give the example of trees?',
            options: opts(
              'to support her main point',
              'to present a counter-argument to hers',
              'to express a reservation about her interpretation',
            ),
            answer: 'A',
          },
        ],
      },
    ],
  },

  12: {
    kind: 'listening-sentence-completion',
    audio: `${ASSETS}/listening/part2.mp3`,
    intro:
      'You will hear a student called Josh Brady talking about visiting South Africa as part of his university course in botany.',
    title: 'Trip to South Africa',
    items: [
      {
        number: 7,
        before: 'As well as his research project, Josh planned to write a',
        after: 'for a website while he was in Africa.',
      },
      {
        number: 8,
        before: 'Josh’s group planned to check out a particular region after a',
        after: 'that had occurred there.',
      },
      { number: 9, before: 'Josh was surprised to see', after: 'being grown in the first area they visited.' },
      {
        number: 10,
        before: 'Josh describes the vehicle they travelled in as a',
        after: 'when they went in search of specimens.',
      },
      {
        number: 11,
        before: 'Josh uses the word',
        after: 'to give us an idea of the shape of the leaves he found.',
      },
      {
        number: 12,
        before: 'Josh was particularly impressed by one type of flower which was',
        after: 'in colour.',
      },
      {
        number: 13,
        before: 'Josh uses the word',
        after: 'to convey his feelings about an area of vegetation he studied.',
      },
      { number: 14, before: 'Josh really appreciated the view he got from the', after: 'of his accommodation.' },
    ],
    answers: {
      7: ['report'],
      8: ['fire'],
      9: ['tea', 'red tea'],
      10: ['safari truck'],
      11: ['needle', 'needles'],
      12: ['orange', 'deep orange'],
      13: ['paradise'],
      14: ['roof'],
    },
  },

  13: {
    kind: 'listening-mcq',
    audio: `${ASSETS}/listening/part3.mp3`,
    intro:
      'You will hear an interview in which two journalists called Jenny Langdon and Peter Sharples are talking about their work.',
    questions: [
      {
        number: 15,
        stem: 'What does Jenny say about the story which made her name?',
        options: opts(
          'She’d been on the lookout for just such a lucky break.',
          'She resented colleagues trying to take the credit for it.',
          'She wasn’t actually responsible for the finished article.',
          'She asked for a more prestigious job on the strength of it.',
        ),
        answer: 'C',
      },
      {
        number: 16,
        stem: 'What does Jenny suggest about the editor she worked for on her first national daily newspaper?',
        options: opts(
          'He respected her for standing up to him.',
          'He tended to blame her for things unfairly.',
          'He wasn’t as unreasonable as everyone says.',
          'He taught her the value of constructive criticism.',
        ),
        answer: 'B',
      },
      {
        number: 17,
        stem: 'When Jenny got her own daily column on the newspaper, she felt',
        options: opts(
          'satisfied that the good work she’d done elsewhere had been recognised.',
          'relieved that it was only likely to be a short-term appointment.',
          'determined to prove exactly what she was capable of.',
          'unsure of her ability to make a success of it.',
        ),
        answer: 'C',
      },
      {
        number: 18,
        stem: 'Peter thinks he got a job on Carp Magazine thanks to',
        options: opts(
          'his academic achievements at college.',
          'his practical knowledge of everyday journalism.',
          'his familiarity with the interests of its main target audience.',
          'his understanding of how best to present himself at interview.',
        ),
        answer: 'B',
      },
      {
        number: 19,
        stem: 'Peter and Jenny agree that courses in journalism',
        options: opts(
          'need to be supplemented by first-hand experience.',
          'are attractive because they lead to paid employment.',
          'are of little value compared to working on a student newspaper.',
          'provide an opportunity for writers to address contentious issues.',
        ),
        answer: 'A',
      },
      {
        number: 20,
        stem: 'When asked about their novels, Peter and Jenny reveal',
        options: opts(
          'an ambition to gain recognition for their craft.',
          'a desire to develop careers outside journalism.',
          'a need to prove how versatile they are as writers.',
          'a wish to keep their journalism fresh and appealing.',
        ),
        answer: 'D',
      },
    ],
  },

  14: {
    kind: 'listening-dual-matching',
    audio: `${ASSETS}/listening/part4.mp3`,
    intro: 'You will hear five short extracts in which people are talking about changing their jobs.',
    tasks: [
      {
        title: 'Task One',
        prompt: 'For questions 21 – 25, choose from the list (A – H) the reason each speaker gives for changing job.',
        options: opts(
          'unfriendly colleagues',
          'poor holiday entitlement',
          'lacking a sense of purpose',
          'needing more of a challenge',
          'the workload',
          'disagreements with superiors',
          'no prospect of advancement',
          'the physical environment',
        ),
        firstQuestion: 21,
      },
      {
        title: 'Task Two',
        prompt: 'For questions 26 – 30, choose from the list (A – H) what each speaker feels about their new job.',
        options: opts(
          'encouraged by early results',
          'hopeful about future success',
          'delighted by a change in lifestyle',
          'relieved the initial uncertainty is over',
          'glad to be helping other people',
          'grateful for an increase in salary',
          'happy to feel in control',
          'satisfied with the training received',
        ),
        firstQuestion: 26,
      },
    ],
    speakers: 5,
    answers: { 21: 'C', 22: 'D', 23: 'A', 24: 'G', 25: 'E', 26: 'D', 27: 'C', 28: 'E', 29: 'B', 30: 'G' },
  },

  15: {
    kind: 'speaking-interview',
    phases: [
      {
        title: 'Introduction',
        lines: [
          'Good morning / afternoon / evening. My name is … and this is my colleague … .',
          'And your names are?',
          'Can I have your mark sheets, please?',
          'Thank you.',
          'First of all, we’d like to know something about you.',
        ],
      },
      {
        title: 'About you',
        note: 'The examiner selects one or two questions and asks candidates in turn, as appropriate.',
        questions: [
          'Where are you from? / Where do you live?',
          'What do you do here / there?',
          'How long have you been studying English?',
          'What do you enjoy most about learning English?',
        ],
      },
      {
        title: 'Further questions',
        note: 'The examiner selects one or more questions from the following, as appropriate.',
        questions: [
          'What free time activity do you most enjoy? (Why?)',
          'What sort of work would you like to do in the future? (Why?)',
          'Do you think you spend too much time working or studying? (Why? / Why not?)',
          'Do you like using the internet to keep in touch with people?',
          'Have you celebrated anything recently? (How?)',
          'If you could travel to one country in the world, where would you go? (Why?)',
          'How important is it to you to spend time with your family? (Why? / Why not?)',
          'Who do you think has had the greatest influence on your life? (Why?)',
        ],
      },
    ],
  },

  16: {
    kind: 'speaking-long-turn',
    tasks: [
      {
        title: 'Task 1',
        questions: ['Why might the people be doing these things together?', 'How might the people be feeling?'],
        photos: [
          photo(1, 'A', 'A group of people on a snow expedition, skiing across a frozen landscape'),
          photo(1, 'B', 'Three girls baking biscuits together in a kitchen'),
          photo(1, 'C', 'Two teenagers rehearsing in a band with drums, a guitar and a keyboard'),
        ],
      },
      {
        title: 'Task 2',
        questions: [
          'How can students benefit from doing these different activities?',
          'How helpful might the activities be in preparing them for their future lives?',
        ],
        photos: [
          photo(2, 'A', 'A student studying on her own in a library'),
          photo(2, 'B', 'A young man with a microphone speaking to students seated in an arena'),
          photo(2, 'C', 'Teenagers and an adult building a structure out of sticks outdoors'),
        ],
      },
    ],
    credits: 'Picture Task 1 © 2014 Hoyt Music Studios. Pictures Task 2 © Young Harris College, © UniServity.',
  },

  17: {
    kind: 'speaking-collaborative',
    question: PART3_QUESTION,
    prompts: PART3_PROMPTS,
  },

  18: {
    kind: 'speaking-discussion',
    topic: 'Topic from Part 3: life decisions',
    question: PART3_QUESTION,
    prompts: PART3_PROMPTS,
  },
};

/**
 * @param {number} partNumber global C1 part (1–18)
 * @returns {null | (object & { partNumber: number, directions: string, questionStart?: number, questionCount?: number, sample: object })}
 */
export function getC1SampleTest1Part(partNumber) {
  const pn = Number(partNumber);
  const part = PARTS[pn];
  if (!part) return null;
  const def = getLevelExamPartDef('c1', pn);
  return {
    ...part,
    partNumber: pn,
    directions: part.directions || def?.directions || '',
    questionStart: def?.questionStart,
    questionCount: def?.questionCount,
    sample: SAMPLE,
  };
}
