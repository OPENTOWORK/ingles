/**
 * Contenido original para Examen 6 B2 (sin OpenAI).
 * Tema: voluntariado, festivales locales y huertos urbanos.
 */

function opt(words) {
  return words.map((w, i) => `${String.fromCharCode(65 + i)}) ${w}`);
}

function mcq(num, options, answer) {
  return {
    id: `q${num}`,
    number: num,
    type: 'mcq',
    options: opt(options),
  };
}

function ma(id, answer) {
  return { id, answer };
}

function openQ(num) {
  return { id: `q${num}`, number: num, type: 'short', prompt: `Gap ${num}` };
}

export function buildB2Exam6Content() {
  const parts = {};

  parts[1] = {
    title: 'Growing Together in the City',
    passage: `Urban community gardens have become popular in many neighbourhoods. Residents who (0) ___ part in the project often say it has changed how they see their area. At first, some people were unsure whether the idea would (1) ___ off, but volunteers worked hard to clear empty plots and plant vegetables.
Shared gardens give neighbours a reason to (2) ___ in touch regularly. Parents bring children to learn where food comes from, and older residents enjoy having a peaceful place to (3) ___ time outdoors. Local councils sometimes (4) ___ support by providing tools or water supplies.
Of course, running a garden is not always easy. Bad weather can (5) ___ progress, and it can be difficult to agree on rules. Yet most groups find that cooperation helps them (6) ___ with problems more effectively. In the end, these small green spaces can (7) ___ a real difference to community life.`,
    questions: [
      mcq(1, ['take', 'make', 'give', 'hold'], 'A'),
      mcq(2, ['set', 'take', 'bring', 'pay'], 'B'),
      mcq(3, ['keep', 'stay', 'hold', 'remain'], 'A'),
      mcq(4, ['spend', 'pass', 'take', 'give'], 'A'),
      mcq(5, ['offer', 'give', 'provide', 'supply'], 'A'),
      mcq(6, ['delay', 'slow', 'hold', 'stop'], 'B'),
      mcq(7, ['deal', 'cope', 'work', 'manage'], 'B'),
    ],
    modelAnswers: [
      ma('q1', 'A'),
      ma('q2', 'B'),
      ma('q3', 'A'),
      ma('q4', 'A'),
      ma('q5', 'A'),
      ma('q6', 'B'),
      ma('q7', 'B'),
    ],
  };

  parts[2] = {
    title: 'Helping at a Summer Festival',
    passage: `Every July, our town holds a music and food festival that attracts thousands of visitors. The event could not take place without the hundreds of volunteers who (0) ___ up each year to help. Many students join because they want to gain useful experience and (1) ___ new skills.
Volunteers are given training so they know exactly what to do. Some work at information desks, while others (2) ___ charge of recycling stations. During the busiest hours, teams have to (3) ___ with long queues calmly and politely.
Organisers say the festival is a chance for the community to (4) ___ pride in local culture. Local businesses also benefit, as visitors often (5) ___ money in cafés and shops. After the last concert, everyone is tired, but most helpers agree it was worth (6) ___ effort.
If you are thinking of joining next year, you should (7) ___ sure you register early, because popular roles fill up quickly. In the end, volunteering can (8) ___ you feel more connected to the place where you live.`,
    questions: [openQ(9), openQ(10), openQ(11), openQ(12), openQ(13), openQ(14), openQ(15), openQ(16)],
    modelAnswers: [
      ma('q9', 'sign'),
      ma('q10', 'learn'),
      ma('q11', 'take'),
      ma('q12', 'deal'),
      ma('q13', 'take'),
      ma('q14', 'spend'),
      ma('q15', 'the'),
      ma('q16', 'making'),
    ],
  };

  parts[3] = {
    title: 'The Value of Local Festivals',
    passage: `Festivals play an important role in many towns. They are often organised by (0) ___ (ENTHUSIASM) volunteers who want to celebrate local traditions. Good planning is (1) ___ (ESSENTIAL) if the event is to run smoothly.
A successful festival can be highly (2) ___ (BENEFIT) for small businesses, especially when visitors stay for several days. However, poor weather may reduce (3) ___ (ATTEND) numbers, which affects income.
To avoid problems, teams must remain (4) ___ (FLEXIBLE) and prepared to change schedules. Clear communication keeps the public (5) ___ (INFORM) about any updates. After the event, many residents feel a strong sense of (6) ___ (ACHIEVE).
Local media often publish (7) ___ (COMMENT) articles praising the organisers. With enough support, festivals can become an (8) ___ (COMPARE) part of a town's identity.`,
    questions: [
      { id: 'q17', number: 17, type: 'word-formation', stem: 'ENTHUSIASM' },
      { id: 'q18', number: 18, type: 'word-formation', stem: 'ESSENTIAL' },
      { id: 'q19', number: 19, type: 'word-formation', stem: 'BENEFIT' },
      { id: 'q20', number: 20, type: 'word-formation', stem: 'ATTEND' },
      { id: 'q21', number: 21, type: 'word-formation', stem: 'FLEXIBLE' },
      { id: 'q22', number: 22, type: 'word-formation', stem: 'INFORM' },
      { id: 'q23', number: 23, type: 'word-formation', stem: 'ACHIEVE' },
      { id: 'q24', number: 24, type: 'word-formation', stem: 'COMMENT' },
    ],
    modelAnswers: [
      ma('q17', 'enthusiastic'),
      ma('q18', 'essential'),
      ma('q19', 'beneficial'),
      ma('q20', 'attendance'),
      ma('q21', 'flexibility'),
      ma('q22', 'informed'),
      ma('q23', 'achievement'),
      ma('q24', 'commentators'),
    ],
  };

  parts[4] = {
    questions: [
      {
        id: 'q1',
        number: 25,
        type: 'transformation',
        sentence1: 'The festival was more popular than we expected.',
        keyword: 'SO',
        sentence2Start: 'The festival was ',
      },
      {
        id: 'q2',
        number: 26,
        type: 'transformation',
        sentence1: '"I\'ll help you set up the stall," Maria said.',
        keyword: 'OFFERED',
        sentence2Start: 'Maria ',
      },
      {
        id: 'q3',
        number: 27,
        type: 'transformation',
        sentence1: 'It isn\'t necessary to wear a uniform.',
        keyword: 'HAVE',
        sentence2Start: 'You ',
      },
      {
        id: 'q4',
        number: 28,
        type: 'transformation',
        sentence1: 'We started planning the event six months ago.',
        keyword: 'SINCE',
        sentence2Start: 'We ',
      },
      {
        id: 'q5',
        number: 29,
        type: 'transformation',
        sentence1: 'Nobody expected so many visitors would arrive.',
        keyword: 'WERE',
        sentence2Start: 'So many visitors ',
      },
      {
        id: 'q6',
        number: 30,
        type: 'transformation',
        sentence1: 'The organisers cancelled the concert because of the storm.',
        keyword: 'CALLED',
        sentence2Start: 'The organisers ',
      },
    ],
    modelAnswers: [
      ma('q1', 'so popular that we had not expected'),
      ma('q2', 'offered to help me set up the stall'),
      ma('q3', 'do not have to wear a uniform'),
      ma('q4', 'have been planning the event for six months'),
      ma('q5', 'were not expected to arrive by anybody'),
      ma('q6', 'called off the concert because of the storm'),
    ],
  };

  const readingPassage = `Many young people are choosing to spend less time on social media and more time on offline activities. Some join sports clubs, while others prefer creative hobbies such as photography or cooking. A recent survey found that students who take regular breaks from screens often report better concentration and sleep.
Community projects are especially attractive because they allow people to contribute something practical. Planting trees, organising litter collections, or helping at food banks can give volunteers a sense of purpose. Experts argue that working with others teaches communication skills that are difficult to practise online.
However, not everyone has equal access to these opportunities. People in rural areas may live far from clubs or cultural centres. Transport costs and lack of information can prevent them from taking part. Local governments are therefore encouraged to advertise events clearly and keep fees low.
Despite these challenges, the trend towards active citizenship appears to be growing. Schools now promote volunteering as a way to develop confidence before entering the job market. Employers, too, increasingly value candidates who can show commitment to a cause beyond their own studies.`;

  parts[5] = {
    title: 'Beyond the Screen',
    passage: readingPassage,
    questions: [
      {
        id: 'q1',
        number: 31,
        type: 'mcq',
        prompt: 'What does the writer say about students who limit screen time?',
        options: opt(['They rarely enjoy offline hobbies.', 'They often sleep and focus better.', 'They avoid community projects.', 'They prefer working alone.']),
      },
      {
        id: 'q2',
        number: 32,
        type: 'mcq',
        prompt: 'Community projects are popular partly because they',
        options: opt(['require expensive equipment.', 'offer practical ways to help.', 'replace formal education.', 'focus mainly on sport.']),
      },
      {
        id: 'q3',
        number: 33,
        type: 'mcq',
        prompt: 'What problem is mentioned for some rural residents?',
        options: opt(['They dislike volunteering.', 'They have too many clubs nearby.', 'They may struggle to reach activities.', 'They refuse to use the internet.']),
      },
      {
        id: 'q4',
        number: 34,
        type: 'mcq',
        prompt: 'Local governments are advised to',
        options: opt(['ban social media for teenagers.', 'charge high fees for events.', 'make activities easy to discover.', 'reduce the number of food banks.']),
      },
      {
        id: 'q5',
        number: 35,
        type: 'mcq',
        prompt: 'According to the final paragraph, employers now',
        options: opt(['ignore volunteering experience.', 'value commitment outside study.', 'prefer candidates who work online.', 'discourage creative hobbies.']),
      },
      {
        id: 'q6',
        number: 36,
        type: 'mcq',
        prompt: 'Which title best fits the text?',
        options: opt(['Why screens are always harmful', 'The rise of active citizenship', 'How to become a professional athlete', 'Problems with rural transport only']),
      },
    ],
    modelAnswers: [ma('q1', 'B'), ma('q2', 'B'), ma('q3', 'C'), ma('q4', 'C'), ma('q5', 'B'), ma('q6', 'B')],
  };

  parts[6] = {
    title: 'Starting a New Hobby',
    passage: `Learning a new hobby can be exciting, but it also requires patience. (31) ______. Many beginners give up too quickly because they expect immediate results.
It helps to set realistic goals and celebrate small improvements. (32) ______. Joining a club is another effective strategy, since feedback from others can speed up progress.
Equipment does not need to be expensive at the start. (33) ______. What matters most is regular practice and curiosity.
Some hobbies, such as learning an instrument, demand daily repetition. (34) ______. Others, like hiking, may only be possible at weekends, yet still bring health benefits.
When motivation disappears, remembering why you began can restore enthusiasm. (35) ______. Sharing your progress online may also encourage friends to join you.
In the long term, hobbies can reduce stress and widen your social circle. (36) ______. That is why experts recommend trying something new at least once a year.`,
    sentencePool: [
      'A) However, simple tools are often enough for the first few months.',
      'B) For this reason, keeping a short diary of achievements can help.',
      'C) In fact, teachers often say consistency matters more than talent.',
      'D) Consequently, you may discover skills you did not know you had.',
      'E) At the same time, comparing yourself with experts can be discouraging.',
      'F) Similarly, group activities create opportunities to make friends.',
      'G) Above all, enjoyment should remain the main reason for continuing.',
    ],
    questions: [
      { id: 'q31', number: 31, type: 'mcq', options: opt(['A', 'B', 'C', 'D', 'E', 'F', 'G']) },
      { id: 'q32', number: 32, type: 'mcq', options: opt(['A', 'B', 'C', 'D', 'E', 'F', 'G']) },
      { id: 'q33', number: 33, type: 'mcq', options: opt(['A', 'B', 'C', 'D', 'E', 'F', 'G']) },
      { id: 'q34', number: 34, type: 'mcq', options: opt(['A', 'B', 'C', 'D', 'E', 'F', 'G']) },
      { id: 'q35', number: 35, type: 'mcq', options: opt(['A', 'B', 'C', 'D', 'E', 'F', 'G']) },
      { id: 'q36', number: 36, type: 'mcq', options: opt(['A', 'B', 'C', 'D', 'E', 'F', 'G']) },
    ],
    modelAnswers: [
      ma('q31', 'C'),
      ma('q32', 'F'),
      ma('q33', 'A'),
      ma('q34', 'C'),
      ma('q35', 'B'),
      ma('q36', 'D'),
    ],
  };

  parts[7] = {
    matchingIntro: 'Which person…',
    sections: [
      {
        letter: 'A',
        name: 'Nina',
        text: 'I began volunteering at the library after finishing university. I wanted experience that would look good on applications, but I soon realised I enjoyed helping children choose books. Now I train new volunteers myself.',
      },
      {
        letter: 'B',
        name: 'Omar',
        text: 'I only joined the river-cleaning group because a friend insisted. I did not think I would stay long, yet seeing the water look clearer each month made me proud. These days I organise weekend events for families.',
      },
      {
        letter: 'C',
        name: 'Elena',
        text: 'My doctor suggested I should be more active, so I started helping at a community kitchen. Preparing meals for older residents has improved my cooking and given me more energy. I have also made friends of all ages.',
      },
      {
        letter: 'D',
        name: 'Jon',
        text: 'I volunteer at the town festival every summer. The work is tiring, but the atmosphere is fantastic. I love meeting performers and learning how large events are planned behind the scenes.',
      },
    ],
    questions: [
      { id: 'q1', number: 37, prompt: 'mentions starting volunteering for career reasons?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q2', number: 38, prompt: 'did not expect to continue the activity at first?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q3', number: 39, prompt: 'was advised to volunteer for health reasons?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q4', number: 40, prompt: 'now helps to organise activities for others?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q5', number: 41, prompt: 'enjoys the social atmosphere of a big event?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q6', number: 42, prompt: 'has gained practical skills through volunteering?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q7', number: 43, prompt: 'works with young people as part of the role?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q8', number: 44, prompt: 'felt motivated by visible environmental results?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q9', number: 45, prompt: 'benefits from meeting people of different generations?', options: opt(['A', 'B', 'C', 'D']) },
      { id: 'q10', number: 46, prompt: 'is involved with a project related to food?', options: opt(['A', 'B', 'C', 'D']) },
    ],
    modelAnswers: [
      ma('q1', 'A'),
      ma('q2', 'B'),
      ma('q3', 'C'),
      ma('q4', 'B'),
      ma('q5', 'D'),
      ma('q6', 'C'),
      ma('q7', 'A'),
      ma('q8', 'B'),
      ma('q9', 'C'),
      ma('q10', 'C'),
    ],
  };

  parts[8] = {
    question:
      'Some people say that fast food is always a bad thing to eat. Do you agree?',
    bulletPoints: ['health', 'price and convenience', 'your own idea'],
    instructions:
      'Write an essay in 140–190 words. You must answer the question and include the three points below.',
    wordMin: 140,
    wordMax: 190,
  };

  parts[9] = {
    instructions:
      'Choose ONE of the tasks below and write your answer in 140–190 words.',
    wordMin: 140,
    wordMax: 190,
    questions: [
      {
        number: 1,
        prompt:
          'You see this announcement on an English-language website:\n\nArticles wanted: Healthy habits for busy students\n\nWhat healthy habits would you recommend to students who have little free time?\n\nWrite an article giving advice and examples.',
        format: 'article',
      },
      {
        number: 2,
        prompt:
          'You have received an email from your English-speaking friend Sam:\n\nI’m visiting your town next month and I’d like to try some local food. Where should I go and what should I eat?\n\nWrite your email.',
        format: 'email',
      },
      {
        number: 3,
        prompt:
          'You see this announcement in an English-language magazine:\n\nReviews wanted: A restaurant I would recommend\n\nWrite a review of a restaurant or café you know. Say what the food is like and whether you would recommend it.',
        format: 'review',
      },
      {
        number: 4,
        prompt:
          'Your English teacher has asked you to write a report about food options at your school or college.\n\nWrite a report explaining what is good, what could be improved and making recommendations.',
        format: 'report',
      },
    ],
  };

  const listeningExtracts = [
    {
      num: 1,
      context: 'You hear a woman talking to a friend about a cooking class.',
      q: 'Why did she join the class?',
      opts: ['to meet new people', 'to improve her job prospects', 'to prepare for a party'],
      ans: 'A',
      audioScript:
        'I started the evening cooking class last month. My sister said I needed a hobby, but honestly I joined mainly to meet new people — I had hardly spoken to anyone since I moved to this street.',
    },
    {
      num: 2,
      context: 'You hear a man leaving a message about a train journey.',
      q: 'What is he doing?',
      opts: ['apologising for being late', 'asking for directions', 'canceling a meeting'],
      ans: 'A',
      audioScript:
        "Hi, it's David. My train was delayed, so I'm running about fifteen minutes late for our meeting. Sorry — I'll be there as soon as I get off at Central Station.",
    },
    {
      num: 3,
      context: 'You hear two students discussing a museum visit.',
      q: 'What surprised them?',
      opts: ['the size of the building', 'how interactive the displays were', 'the price of tickets'],
      ans: 'B',
      audioScript:
        'We thought it would be quiet, but the touch screens and games were brilliant. What surprised us most was how interactive the displays were — history felt alive.',
    },
    {
      num: 4,
      context: 'You hear an advert for a fitness app.',
      q: 'What does the speaker emphasise?',
      opts: ['low cost', 'personalised plans', 'group competitions'],
      ans: 'B',
      audioScript:
        'FitTrack builds a plan just for you. Tell us your goals and we design personalised workouts that change as you improve — not the same routine for everyone.',
    },
    {
      num: 5,
      context: 'You hear a woman talking about her garden.',
      q: 'What problem does she mention?',
      opts: ['lack of space', 'too much shade', 'noisy neighbours'],
      ans: 'A',
      audioScript:
        "I'd love to grow tomatoes, but our balcony is tiny. The real problem is lack of space — there's room for two small pots and that's it.",
    },
    {
      num: 6,
      context: 'You hear a man talking about learning the guitar.',
      q: 'How does he feel now?',
      opts: ['discouraged', 'confident', 'bored'],
      ans: 'B',
      audioScript:
        "Six months ago I couldn't play a chord. Now I can play a whole song for my friends. I feel genuinely confident when I pick up the guitar.",
    },
    {
      num: 7,
      context: 'You hear a tour guide speaking to visitors.',
      q: 'What does she recommend?',
      opts: ['visiting the market first', 'wearing comfortable shoes', 'booking tickets online'],
      ans: 'B',
      audioScript:
        "Today's walk is three hours on cobbled streets and hills. I strongly recommend wearing comfortable shoes — you'll thank me by the end of the tour.",
    },
    {
      num: 8,
      context: 'You hear two friends planning a weekend trip.',
      q: 'What do they agree on?',
      opts: ['the destination', 'the budget', 'the transport'],
      ans: 'C',
      audioScript:
        "Barcelona or Rome? We couldn't agree on the city, but we finally decided we'll go by train — it's cheaper and simpler than flying.",
    },
  ];

  parts[10] = {
    setting: 'You will hear eight short extracts. For questions 1–8, choose the best answer (A, B or C).',
    audioClips: listeningExtracts.map((e) => ({
      orden: e.num,
      titulo: `${e.context} ${e.q}`.slice(0, 120),
      text: e.audioScript,
    })),
    script: listeningExtracts.map((e, i) => `Extract ${i + 1}\n${e.audioScript}`).join('\n\n'),
    questions: listeningExtracts.map((e) => ({
      id: `q${e.num}`,
      number: e.num,
      type: 'mcq',
      prompt: `${e.context}\n\n${e.q}`,
      options: opt(e.opts),
    })),
    modelAnswers: listeningExtracts.map((e) => ma(`q${e.num}`, e.ans)),
  };

  const part11Script = `Hello, my name is Rachel Grant and I coordinate the Riverside Arts Festival. I first became involved ten years ago when a friend asked me to help design posters. Although I studied graphic design at university, I had never organised a large event before. These days my team includes more than eighty volunteers.
The festival takes place every September along the riverbank. We invite musicians, craft sellers, and food producers from the region. One challenge is the weather, because heavy rain can damage equipment. Last year we bought waterproof covers for the main stage, which saved the Saturday concerts.
My favourite moment is the opening parade on Friday evening. Local schools prepare costumes months in advance, and thousands of families come to watch. After the parade, visitors can join workshops where they learn drumming, dancing, or simple circus skills.
If you want to volunteer, you should register online in July. We provide training sessions so everyone knows their responsibilities. Most helpers say the experience improves their confidence and teaches them how to work under pressure.`;

  parts[11] = {
    setting: 'You will hear a woman called Rachel Grant talking about her work as a festival coordinator.',
    audioClips: [{ orden: 1, titulo: 'Rachel Grant — festival coordinator', text: part11Script }],
    script: part11Script,
    questions: [
      { id: 'q1', number: 9, type: 'short', lead: 'Rachel first helped with the festival by designing', prompt: 'Complete: Rachel first helped with the festival by designing' },
      { id: 'q2', number: 10, type: 'short', lead: 'The festival is held beside the', prompt: 'Complete' },
      { id: 'q3', number: 11, type: 'short', lead: 'Rain can cause damage to festival', prompt: 'Complete' },
      { id: 'q4', number: 12, type: 'short', lead: 'Last year the team bought waterproof covers for the', prompt: 'Complete' },
      { id: 'q5', number: 13, type: 'short', lead: 'Rachel\'s favourite event is the opening', prompt: 'Complete' },
      { id: 'q6', number: 14, type: 'short', lead: 'Schools spend months preparing', prompt: 'Complete' },
      { id: 'q7', number: 15, type: 'short', lead: 'Volunteers should register on the website in', prompt: 'Complete' },
      { id: 'q8', number: 16, type: 'short', lead: 'Training sessions explain volunteers\'', prompt: 'Complete' },
      { id: 'q9', number: 17, type: 'short', lead: 'Most helpers say the work improves their', prompt: 'Complete' },
      { id: 'q10', number: 18, type: 'short', lead: 'Volunteers learn to work under', prompt: 'Complete' },
    ],
    modelAnswers: [
      ma('q1', 'posters'),
      ma('q2', 'river'),
      ma('q3', 'equipment'),
      ma('q4', 'stage'),
      ma('q5', 'parade'),
      ma('q6', 'costumes'),
      ma('q7', 'July'),
      ma('q8', 'responsibilities'),
      ma('q9', 'confidence'),
      ma('q10', 'pressure'),
    ],
  };

  const part12Script = `Mia: Have you decided which club to join yet?\nTom: Almost. I went to see the basketball training on Tuesday, but the hall was already full.\nMia: So what are you considering now?\nTom: Swimming, maybe. The pool has early-morning sessions before work.\nMia: That sounds practical. Is it expensive?\nTom: There's a discount if you pay for a full year. I'm also worried about having enough time.\nMia: You could start with two sessions a week.\nTom: True. The coach said beginners get a free assessment first.\nMia: Useful. Do you need special equipment?\nTom: Just goggles and a towel for now. If I enjoy it, I'll buy proper trainers later.\nMia: Let me know when you sign up — I might join the yoga class next door.`;

  parts[12] = {
    setting: 'You will hear a conversation between two friends, Mia and Tom, about joining a sports club.',
    audioClips: [{ orden: 1, titulo: 'Mia and Tom — sports club', text: part12Script }],
    script: part12Script,
    questions: [
      {
        id: 'q1',
        number: 19,
        type: 'mcq',
        prompt: 'Why didn\'t Tom join basketball?',
        options: opt(['The training was cancelled.', 'The hall was full.', 'He disliked the coach.']),
      },
      {
        id: 'q2',
        number: 20,
        type: 'mcq',
        prompt: 'What attracts Tom to swimming?',
        options: opt(['early sessions', 'team competitions', 'free equipment']),
      },
      {
        id: 'q3',
        number: 21,
        type: 'mcq',
        prompt: 'What discount is mentioned?',
        options: opt(['for students', 'for annual payment', 'for families']),
      },
      {
        id: 'q4',
        number: 22,
        type: 'mcq',
        prompt: 'What do beginners receive?',
        options: opt(['a free assessment', 'a private lesson', 'a uniform']),
      },
      {
        id: 'q5',
        number: 23,
        type: 'mcq',
        prompt: 'What might Mia do?',
        options: opt(['join a yoga class', 'leave the sports centre', 'coach swimming']),
      },
    ],
    modelAnswers: [ma('q1', 'B'), ma('q2', 'A'), ma('q3', 'B'), ma('q4', 'A'), ma('q5', 'A')],
  };

  const speakers = [
    { n: 24, topic: 'enjoyed meeting authors', ans: 'C' },
    { n: 25, topic: 'found the venue difficult to reach', ans: 'H' },
    { n: 26, topic: 'preferred the outdoor performances', ans: 'D' },
    { n: 27, topic: 'thought tickets were good value', ans: 'B' },
    { n: 28, topic: 'wants to volunteer next year', ans: 'E' },
    { n: 29, topic: 'disliked the crowded food area', ans: 'F' },
    { n: 30, topic: 'learned about local history', ans: 'G' },
  ];

  const part13SpeakerScripts = [
    'I spent most of the day at the author talks. Meeting writers and hearing them read aloud was the highlight for me.',
    'Getting there was a nightmare — no parking, and the shuttle from the station was full. The transport links to that site are awful.',
    'The indoor concerts were fine, but I loved the garden concerts in the park. The outdoor performances were what I enjoyed most.',
    'Tickets were only twelve euros for the whole afternoon. I thought that was excellent value compared with other festivals.',
    'I helped at the volunteer desk for two hours. I enjoyed it so much that I want to volunteer again next year.',
    'The food stalls smelled amazing, but the area was packed and noisy. I did not enjoy eating there at all.',
    'We joined the history walk at the end. The guide explained how the old market was built — I learned a lot about local history.',
  ];
  const poolLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const poolTexts = [
    'the book fair',
    'the ticket price',
    'the author talks',
    'the garden concerts',
    'the volunteer desk',
    'the food stalls',
    'the history walk',
    'the transport links',
  ];

  const part13Script = part13SpeakerScripts
    .map((text, i) => `Speaker ${i + 1}: ${text}`)
    .join('\n\n');

  parts[13] = {
    setting: 'You will hear five different people talking about a weekend festival. For questions 24–30, choose from the list (A–H).',
    audioClips: [{ orden: 1, titulo: 'Seven speakers — weekend festival', text: part13Script }],
    script: part13Script,
    questions: speakers.map((s) => ({
      id: `q${s.n - 23}`,
      number: s.n,
      type: 'mcq',
      prompt: `Speaker ${s.n - 23} is mainly talking about…`,
      options: poolLetters.map((L, i) => `${L}) ${poolTexts[i]}`),
    })),
    modelAnswers: speakers.map((s) => ma(`q${s.n - 23}`, s.ans)),
  };

  parts[14] = {
    directions: 'Part 14: Interview. Answer the examiner\'s questions about yourself.',
    speakingPrompts: [
      'Where are you from?',
      'What do you like about living in your area?',
      'How do you usually spend your free time?',
      'Have you ever volunteered for a community project?',
      'Would you like to learn a new skill this year? Why?',
      'Is it important for towns to organise festivals?',
      'How do you prefer to travel, and why?',
      'What are your plans for the next few years?',
    ],
    modelAnswers: Array.from({ length: 8 }, (_, i) =>
      ma(`q${i + 1}`, 'Sample personal answer for examiner reference.'),
    ),
  };

  parts[15] = {
    directions: 'Part 15: Long turn. Compare the photographs.',
    theme: 'Outdoor activities',
    comparePrompt:
      'Compare the two photographs. Say what you see and why people might enjoy each activity.',
    modelAnswers: [ma('q1', 'Candidate compares both photos and gives opinions with reasons.')],
  };

  parts[16] = {
    directions: 'Part 16: Collaborative task.',
    taskTitle: 'Planning a community event',
    collaborativePrompts: [
      'What kind of event could attract different age groups?',
      'How could we advertise it effectively?',
      'What facilities would we need?',
      'How could volunteers be organised?',
      'What problems might occur and how could we solve them?',
    ],
    bulletPoints: [
      'decide on the best type of event',
      'choose two ways to promote it',
      'agree on the main priority',
    ],
    modelAnswers: [ma('q1', 'Candidates negotiate and reach agreement on the task.')],
  };

  parts[17] = {
    directions: 'Part 17: Discussion.',
    discussionQuestions: [
      'How popular are community events in your country?',
      'What are the advantages for local businesses?',
      'Should governments fund cultural festivals?',
      'How can events be made environmentally friendly?',
      'Will online events replace live festivals in the future?',
    ],
    modelAnswers: Array.from({ length: 5 }, (_, i) =>
      ma(`q${i + 1}`, 'Extended discussion with opinions and examples.'),
    ),
  };

  return parts;
}

export function getB2Exam6GeneratedPart(partNumber) {
  const all = buildB2Exam6Content();
  const gen = all[partNumber];
  if (!gen) throw new Error(`No seed content for part ${partNumber}`);
  return { ...gen, partNumber };
}
