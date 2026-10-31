import { getLevelExamPartDef } from '@/lib/levelsExamCatalog';

/**
 * B1 Preliminary (2020 format) — official Cambridge sample test (B1 Preliminary for Schools).
 * Same content as the Cambridge question papers; shown when Supabase has no row for the part.
 * Text gaps use [[n]] markers (n = question number).
 */

export const B1_SAMPLE_TEST_1_SOURCE = 'Cambridge English B1 Preliminary for Schools — official sample test';

const ASSETS = '/b1-preliminary/sample-1';

const picture = (q, letter, alt, ext = 'png') => ({
  letter,
  image: `${ASSETS}/listening/part1-q${q}-${letter.toLowerCase()}.${ext}`,
  alt,
});

const opts = (...texts) => texts.map((text, i) => ({ letter: 'ABCDEFGH'[i], text }));

/** @type {Record<number, object>} */
const PARTS = {
  1: {
    kind: 'short-texts-mcq',
    questions: [
      {
        number: 1,
        textType: 'sign',
        heading: 'Hollins Farm Campsite',
        body: 'No groups of 4 or more unless by previous arrangement',
        options: opts(
          'All campers must reserve a place in advance.',
          'Groups bigger than four are not allowed on this site.',
          'Groups of more than three should contact the campsite before arriving.',
        ),
        answer: 'C',
      },
      {
        number: 2,
        textType: 'email',
        heading: 'New Message',
        meta: [{ label: 'To', value: 'Students booked on Oxford trip' }],
        body: "Money for Saturday's trip must be handed in at the school office by Wednesday lunchtime at the latest or you will lose your place.",
        options: opts(
          "Those who don't pay punctually won't be able to go to Oxford.",
          'There are very few places left on the Oxford trip.',
          'This is the last chance for students to register for the Oxford trip.',
        ),
        answer: 'A',
      },
      {
        number: 3,
        textType: 'note',
        heading: 'School sports day',
        body: 'If interested in taking part, please sign below but note you are permitted to enter no more than two races.',
        options: opts(
          'You must have signed permission to take part in sports day.',
          'You have to limit the number of sports day races you take part in.',
          'You need to write your name here to get more information about sports day.',
        ),
        answer: 'B',
      },
      {
        number: 4,
        textType: 'notice',
        heading: 'School play',
        body: 'Actors urgently required by director; previous experience welcome but not essential as training will be provided if needed.',
        options: opts(
          "It is essential to have more actors even if they haven't acted before.",
          'It is important for all actors to have training before being involved in the play.',
          'It is necessary to find a new director to train the actors.',
        ),
        answer: 'A',
      },
      {
        number: 5,
        textType: 'message',
        heading: 'Phone message',
        meta: [{ label: 'Re', value: 'Biology class on Thursday' }],
        body: "Please remember to bring last term's work to the lesson as you need to have your notes with you to help you do an experiment.",
        options: opts(
          "Students must write detailed notes on this week's experiment.",
          'Students should check that their work last term was done accurately.',
          'Students need to look at previous work while doing an experiment.',
        ),
        answer: 'C',
      },
    ],
  },

  2: {
    kind: 'matching',
    intro:
      'The young people below all want to do a cycling course during their school holidays. There are descriptions of eight cycling courses (A–H). Decide which course would be the most suitable for each person.',
    textsTitle: 'Cycling Courses',
    people: [
      {
        number: 6,
        name: 'Nancy',
        text: "Nancy is fourteen and cycles quite well. She needs to learn how to cycle safely from her home to school on busy city roads. She's only free at the weekends.",
      },
      {
        number: 7,
        name: 'Markus',
        text: "Markus is an excellent cyclist and he wants the excitement of riding on countryside and woodland tracks. He'd also like to learn more about looking after his bike. He can't attend a morning course.",
      },
      {
        number: 8,
        name: 'Ellie',
        text: "Ellie is nine and knows how to ride her bike, but isn't confident about starting and stopping. She'd love to meet other cyclists with a similar ability and have fun with them.",
      },
      {
        number: 9,
        name: 'Leo',
        text: "Leo can't cycle yet, and wants to learn on his own with the teacher. He'd prefer a course with sessions twice a week. He'd also like some practical information about cycling clothes and equipment.",
      },
      {
        number: 10,
        name: 'Josh',
        text: "Josh is eleven and a skilled cyclist. He's keen to learn to do exciting cycling tricks in a safe environment. He'd like to be with people of a similar age.",
      },
    ],
    texts: [
      {
        letter: 'A',
        title: 'Two Wheels Good!',
        text: "Mountains! Rivers! Forests! Our 'off-road' course offers you the chance to get out of the city. You'll need very good cycling skills and confidence. You will be with others of the same ability. Expert advice on keeping your bike in good condition also included. Mondays 2.00 pm–6.00 pm or Fridays 3.00 pm–7.00 pm.",
      },
      {
        letter: 'B',
        title: 'On Your Bike!',
        text: "Can't ride a bike yet, but really want to? Don't worry. Our beginners-only group (4–10 pupils per group) is just what you're looking for. Excellent teaching in safe surroundings. Makes learning to cycle fun, exciting and easy. Mondays 9.00 am–11.00 am and Thursdays 2.00 pm–4.00 pm.",
      },
      {
        letter: 'C',
        title: 'Fun and Games',
        text: "Do you want some adventure? Find out how to do 'wheelies' (riding on one wheel), 'rampers' (cycling off low walls), 'spins' and much more… We offer a secure practice ground, excellent trainers and loads of fun equipment. Wear suitable clothes. Only for advanced cyclists. (Age 11–12) Saturdays 1.00 pm–4.00 pm.",
      },
      {
        letter: 'D',
        title: 'Pedal Power',
        text: 'A course for able cyclists. We specialise in teaching riders of all ages how to manage difficult situations in heavy traffic in towns and cities. We guarantee that by the end of the course, no roundabout or crossroads will worry you! Saturdays 2.00 pm–4.00 pm.',
      },
      {
        letter: 'E',
        title: 'Cycling 4 U',
        text: "Not a beginner, but need plenty of practice? This course offers practical help with the basics of balancing and using your brakes safely. You'll be in a group of pupils of the same level. Improve your cycling skills and enjoy yourself at the same time! Open to all children up to the age of ten. Sundays 10.00 am–12.00 pm.",
      },
      {
        letter: 'F',
        title: 'Bike Doctors',
        text: 'Have you been doing too many tricks on your bike? Taken it up mountains and through rivers? Then it probably needs some tender loving care. Bike Doctors teach you to maintain and repair your bike. (Some basic equipment required.) Ages 11–19. Tuesdays 9.00 am–12.00 pm or Wednesdays 3.00 pm–6.00 pm.',
      },
      {
        letter: 'G',
        title: 'Safety First',
        text: "We teach cycling safety for the city centre and country lane biker. We'll teach you the skills you need to deal with all the vehicles using our busy roads. All ages welcome from 10+. Thursdays 9.00 am–11.00 am.",
      },
      {
        letter: 'H',
        title: 'Setting Out',
        text: 'A course for absolute beginners needing one-to-one instruction to get off to a perfect start. We also give advice on helmets, lights, what to wear and much more. A fantastic introduction to cycling! Mondays and Tuesdays 9.00 am–11.00 am.',
      },
    ],
    answers: { 6: 'D', 7: 'A', 8: 'E', 9: 'H', 10: 'C' },
  },

  3: {
    kind: 'long-text-mcq',
    title: 'Play to win',
    subtitle: '16-year-old Harry Moore writes about his hobby, tennis.',
    paragraphs: [
      "My parents have always loved tennis and they're members of a tennis club. My older brother was really good at it and they supported him – taking him to lessons all the time. So I guess when I announced that I wanted to be a tennis champion when I grew up I just intended for them to notice me. My mother laughed. She knew I couldn't possibly be serious, I was just a 4-year-old kid!",
      "Later, I joined the club's junior coaching group and eventually took part in my first proper contest, confident that my team would do well. We won, which was fantastic, but I wasn't so successful. I didn't even want to be in the team photo because I didn't feel I deserved to be. When my coach asked what happened in my final match, I didn't know what to say. I couldn't believe I'd lost – I knew I was the better player. But every time I attacked, the other player defended brilliantly. I couldn't explain the result.",
      "After that, I decided to listen more carefully to my coach because he had lots of tips. I realised that you need the right attitude to be a winner. On court I have a plan but sometimes the other guy will do something unexpected so I'll change it. If I lose a point, I do my best to forget it and find a way to win the next one.",
      "At tournaments, it's impossible to avoid players who explode in anger. Lots of players can be negative – including myself sometimes. Once I got so angry that I nearly broke my racket! But my coach has helped me develop ways to control those feelings. After all, the judges have a hard job and you just have to accept their decisions.",
      "My coach demands that I train in the gym to make sure I'm strong right to the end of a tournament. I'm getting good results: my shots are more accurate and I'm beginning to realise that with hard work there's a chance that I could be a champion one day.",
    ],
    questions: [
      {
        number: 11,
        stem: 'Harry thinks he said that he was going to be a tennis champion in order to',
        options: opts('please his parents.', 'get some attention.', 'annoy his older brother.', 'persuade people that he was serious.'),
        answer: 'B',
      },
      {
        number: 12,
        stem: 'How did Harry feel after his first important competition?',
        options: opts(
          'confused about his defeat',
          'proud to be a member of the winning team',
          'ashamed of the way he treated another player',
          'amazed that he had got so far in the tournament',
        ),
        answer: 'A',
      },
      {
        number: 13,
        stem: "What does Harry try to remember when he's on the court?",
        options: opts(
          "Don't let the other player surprise you.",
          'Follow your game plan.',
          'Respect the other player.',
          "Don't keep thinking about your mistakes.",
        ),
        answer: 'D',
      },
      {
        number: 14,
        stem: 'What does Harry say about his behaviour in tournaments?',
        options: opts(
          'He broke his racket once when he was angry.',
          'He stays away from players who behave badly.',
          'He tries to keep calm during the game.',
          "He found it difficult to deal with one judge's decisions.",
        ),
        answer: 'C',
      },
      {
        number: 15,
        stem: 'What might a sports journalist write about Harry now?',
        options: opts(
          'Harry needs to believe in his own abilities and stop depending on good luck when he plays.',
          'Harry has really grown up since his first tournament and discovered that tennis is a battle of minds not just rackets.',
          'Harry looked exhausted when he finished his last match so maybe he should think about working out.',
          'Harry could be a great player but he needs to find a coach to take him all the way to the big competitions.',
        ),
        answer: 'B',
      },
    ],
  },

  4: {
    kind: 'gapped-text',
    title: 'Planting trees',
    subtitle: 'by Mark Rotheram, aged 13',
    paragraphs: [
      "This spring, our teacher suggested we should get involved in a green project and plant some trees around the school. Everyone thought it was a great idea, so we started looking online for the best trees to buy. [[16]] If we wanted them to grow properly, they had to be the right type – but there were so many different ones available! So our teacher suggested that we should look for trees that grew naturally in our part of the world. [[17]] They'd also be more suitable for the wildlife here.",
      'Then we had to think about the best place for planting the trees. We learnt that trees are happiest where they have room to grow, with plenty of space for their branches. The trees might get damaged close to the school playgrounds, for example. [[18]] Finally, we found a quiet corner close to the school garden – perfect!',
      "Once we'd planted the trees, we knew we had to look after them carefully. We all took turns to check the leaves regularly and make sure they had no strange spots or marks on them. [[19]] And we decided to check the following spring in case the leaves turned yellow too soon, as that could also mean the tree was sick.",
      "We all knew that we wouldn't be at the school anymore by the time the trees grew tall, and that was a bit sad. But we'd planted the trees to benefit not only the environment, but also future students at the school. [[20]] And that thought really cheered us up!",
    ],
    sentences: opts(
      'So we tried to avoid areas where students were very active.',
      'However, our parents did offer to help with the digging!',
      'That could mean the tree had a disease.',
      'But we soon found that choosing trees was quite complicated.',
      'It can be quite good for young trees, though.',
      "We knew they'd get as much pleasure from them as we had.",
      'But at least we were doing it in the right season.',
      'That way, the trees would be used to local conditions.',
    ),
    answers: { 16: 'D', 17: 'H', 18: 'A', 19: 'C', 20: 'F' },
  },

  5: {
    kind: 'mc-cloze',
    title: 'This car runs on chocolate!',
    paragraphs: [
      "Scientists have built a 300kph racing car that uses chocolate as a fuel! The project is [[21]] to show how car-making could [[22]] environmentally friendly. The car meets all racing car [[23]] apart from its fuel. This is a mixture of waste chocolate and vegetable oil, and such 'biofuels' are not [[24]] in the sport yet. It has to be mixed with normal fuel so that all parts of the car keep working.",
      'Carrots and other root vegetables were used to make some parts inside and outside the car. Even the mirrors are made from potatoes! The sides of the car [[25]] a mixture of natural materials from plants as well as other recycled materials.',
      "The project is still young, so the scientists have not yet found out how 'green' the car is. They are planning many experiments to compare its [[26]] against that of normal racing cars.",
    ],
    questions: [
      { number: 21, options: opts('intended', 'wished', 'decided', 'insisted'), answer: 'A' },
      { number: 22, options: opts('develop', 'move', 'become', 'arrive'), answer: 'C' },
      { number: 23, options: opts('levels', 'standards', 'grades', 'orders'), answer: 'B' },
      { number: 24, options: opts('allowed', 'let', 'ruled', 'agreed'), answer: 'A' },
      { number: 25, options: opts('store', 'involve', 'collect', 'contain'), answer: 'D' },
      { number: 26, options: opts('operation', 'performance', 'display', 'technique'), answer: 'B' },
    ],
  },

  6: {
    kind: 'open-cloze',
    title: 'Our new skatepark!',
    subtitle: 'by Jack Fletcher',
    paragraphs: [
      "Is there a great skatepark in your town? We've now got the [[27]] fantastic skatepark ever, and it's all because of my friends and me!",
      "Our old skatepark was full of broken equipment, so none of us ever went there. But we all agreed that [[28]] we had a better skatepark in our town, we'd use it. And teenagers might come [[29]] other towns to join us, too.",
      'So I set up an online questionnaire to find out [[30]] local people wanted. I asked them whether we should improve our old skatepark [[31]] build a completely new one. People voted to build a new one.',
      "Then we held some events to get money to pay for it. In the end we collected half the cost, and the local council paid the rest. It [[32]] finally finished last month. So come and try it – you'll have a great time!",
    ],
    answers: {
      27: ['most'],
      28: ['if', 'when'],
      29: ['from'],
      30: ['what'],
      31: ['or'],
      32: ['was'],
    },
  },

  7: {
    kind: 'writing-email',
    questionLabel: 'Question 1',
    intro: 'Read this email from your English teacher Mrs Lake and the notes you have made.',
    email: {
      from: 'Mrs Lake',
      subject: 'End of year party',
      greeting: 'Dear Class,',
      lines: [
        { text: "I'd like our class to have a party to celebrate the end of the school year.", note: 'Great!' },
        {
          text: 'We could either have a party in the classroom or we could go to the park. Which would you prefer to do?',
          note: 'Explain',
        },
        { text: 'What sort of activities or games should we do during the party?', note: 'Suggest …' },
        { text: 'What food do you think we should have at the party?', note: 'Tell Mrs Lake' },
      ],
      closing: ['Reply soon!', 'Anna Lake'],
    },
    task: 'Write your email to Mrs Lake using all the notes.',
    wordCountNote: 'Write your answer in about 100 words.',
  },

  8: {
    kind: 'writing-choice',
    tasks: [
      {
        number: 2,
        format: 'article',
        label: 'Question 2 — Article',
        lead: 'You see this announcement in your school English-language magazine.',
        announcement: {
          kicker: 'Articles wanted!',
          heading: 'WHAT MAKES YOU LAUGH?',
          lines: [
            'Write an article telling us what you find funny and who you enjoy laughing with.',
            "Do you think it's good to laugh a lot? Why?",
            'The best articles answering these questions will be published next month.',
          ],
        },
        task: 'Write your article.',
      },
      {
        number: 3,
        format: 'story',
        label: 'Question 3 — Story',
        lead: 'Your English teacher has asked you to write a story.',
        storyIntro: 'Your story must begin with this sentence.',
        openingSentence: 'Jo looked at the map and decided to go left.',
        task: 'Write your story.',
      },
    ],
    wordCountNote: 'Write your answer in about 100 words.',
  },

  9: {
    kind: 'listening-pictures',
    audio: `${ASSETS}/listening/part1.mp3`,
    questions: [
      {
        number: 1,
        stem: 'What will the boy bring for the barbecue?',
        options: [picture(1, 'A', 'A packet of sausages'), picture(1, 'B', 'A packet of chicken legs'), picture(1, 'C', 'A packet of burgers')],
        answer: 'A',
      },
      {
        number: 2,
        stem: "Which part of the boy's body hurts now?",
        options: [
          picture(2, 'A', 'A boy with an arrow pointing at his head'),
          picture(2, 'B', 'A boy with an arrow pointing at his ankle'),
          picture(2, 'C', 'A boy with an arrow pointing at his shoulder'),
        ],
        answer: 'B',
      },
      {
        number: 3,
        stem: 'What will the visitors see last?',
        options: [
          picture(3, 'A', 'A racing car'),
          picture(3, 'B', 'A display of jewellery'),
          picture(3, 'C', 'Pictures of rock stars'),
        ],
        answer: 'C',
      },
      {
        number: 4,
        stem: 'Where did the police catch the zebra?',
        options: [
          picture(4, 'A', 'A zebra outside a fish shop'),
          picture(4, 'B', 'A zebra on a road with cars'),
          picture(4, 'C', 'A zebra by a river in the countryside'),
        ],
        answer: 'C',
      },
      {
        number: 5,
        stem: 'What did the girl do yesterday?',
        options: [
          picture(5, 'A', 'People swimming in a pool'),
          picture(5, 'B', 'People watching a film about giraffes at the cinema', 'jpg'),
          picture(5, 'C', 'Visitors looking at a space capsule in a science museum'),
        ],
        answer: 'C',
      },
      {
        number: 6,
        stem: 'Which computer game does the girl like most?',
        options: [
          picture(6, 'A', 'A game box with a ballet dancer on the cover'),
          picture(6, 'B', 'A game box with a tiger cub on the cover'),
          picture(6, 'C', 'A game box with a chef cooking on the cover'),
        ],
        answer: 'A',
      },
      {
        number: 7,
        stem: 'Which sport did the boy do for the first time on holiday?',
        options: [picture(7, 'A', 'A boy sailing'), picture(7, 'B', 'A boy water skiing'), picture(7, 'C', 'A boy windsurfing')],
        answer: 'C',
      },
    ],
  },

  10: {
    kind: 'listening-mcq',
    audio: `${ASSETS}/listening/part2.mp3`,
    questions: [
      {
        number: 8,
        context: 'You will hear two friends talking about a campsite they have been to.',
        stem: 'What did the boy like best about it?',
        options: opts('It was very close to the beach.', 'There were lots of people his age.', 'The activities were free.'),
        answer: 'B',
      },
      {
        number: 9,
        context: 'You will hear two friends talking about homework.',
        stem: 'The girl thinks that doing homework with friends',
        options: opts('is fun.', 'helps concentration.', 'takes longer than doing it alone.'),
        answer: 'A',
      },
      {
        number: 10,
        context: 'You will hear a boy telling his friend about a rock-climbing trip.',
        stem: 'How did he feel about it?',
        options: opts('grateful for the help he got', 'satisfied with his climbing', 'hopeful of going again'),
        answer: 'C',
      },
      {
        number: 11,
        context: 'You will hear two friends talking about learning to play the guitar.',
        stem: 'The girl advises the boy to',
        options: opts('practise more often.', 'play in a variety of styles.', 'listen to the best guitarists.'),
        answer: 'C',
      },
      {
        number: 12,
        context: "You will hear two friends talking about a book they've read.",
        stem: 'They agree that it has',
        options: opts('lots of action.', 'realistic characters.', 'an unexpected ending.'),
        answer: 'B',
      },
      {
        number: 13,
        context: 'You will hear two friends talking about a concert they have been to.',
        stem: 'They agree that',
        options: opts('the organisation was poor.', 'the performance was good.', 'the tickets were expensive.'),
        answer: 'C',
      },
    ],
  },

  11: {
    kind: 'listening-gap-fill',
    audio: `${ASSETS}/listening/part3.mp3`,
    intro: 'You will hear a man called Phil Lamb telling a group of students about his work as a TV news presenter.',
    title: 'TV news presenter',
    items: [
      { number: 14, before: "Phil's first job after university was on local", after: '.' },
      { number: 15, before: "Before presenting the news, Phil looks through the day's", after: '.' },
      { number: 16, before: "Phil says that he's very careful about which", after: 'he wears.' },
      { number: 17, before: 'Phil sometimes finds the names of some', after: 'difficult to say correctly.' },
      { number: 18, before: 'Phil enjoys presenting news on the topic of', after: '.' },
      { number: 19, before: 'Phil would like to be a', after: 'in the future.' },
    ],
    answers: {
      14: ['radio'],
      15: ['newspaper', 'newspapers', 'paper', 'papers', 'news paper', 'news papers'],
      16: ['jacket', 'jackets'],
      17: ['people'],
      18: ['business', 'busines', 'bussines', 'bussiness'],
      19: ['producer'],
    },
  },

  12: {
    kind: 'listening-mcq',
    audio: `${ASSETS}/listening/part4.mp3`,
    intro: 'You will hear a radio interview with a young singer called Mandy.',
    questions: [
      {
        number: 20,
        stem: 'Mandy started working as a DJ',
        options: opts('once she could afford the equipment.', 'after she lost her job as a nurse.', 'when she first left school.'),
        answer: 'A',
      },
      {
        number: 21,
        stem: 'What does Mandy say about her singing career?',
        options: opts('It started by chance.', 'It took years of practice.', 'It began with a song that she wrote.'),
        answer: 'A',
      },
      {
        number: 22,
        stem: "What is Mandy's new song about?",
        options: opts('making new friends', 'changing your mind', 'finding life difficult'),
        answer: 'C',
      },
      {
        number: 23,
        stem: 'How does Mandy feel about her new CD?',
        options: opts('sure that people will like it', "pleased with what she's achieved", "sorry that it wasn't ready on time"),
        answer: 'B',
      },
      {
        number: 24,
        stem: "Mandy's favourite songs are those which",
        options: opts('are easy to dance to.', 'other women have written.', 'have interesting words.'),
        answer: 'C',
      },
      {
        number: 25,
        stem: 'In the future, Mandy plans to',
        options: opts('learn another instrument.', 'run her own business.', 'work in television.'),
        answer: 'B',
      },
    ],
  },

  13: {
    kind: 'speaking-interview',
    timing: '2–3 minutes',
    phases: [
      {
        title: 'Phase 1',
        lines: [
          'Good morning / afternoon / evening.',
          'Can I have your mark sheets, please?',
          "I'm … and this is … .",
          "What's your name?",
          'How old are you?',
          'Where do you live?',
          'Do you live in …?',
        ],
      },
      {
        title: 'Phase 2',
        note: 'The examiner selects one or more questions for each candidate. Back-up questions are used if a candidate needs help.',
        questions: [
          { question: 'Tell us about a teacher you like. (Why?)', backUp: 'Which teacher do you like? (Why?)' },
          { question: 'How often do you use a mobile phone?', backUp: 'Do you often use a mobile phone?' },
          { question: 'How do you get to school every day?', backUp: 'Do you walk to school every day?' },
          {
            question: 'Which do you like best, the morning or the afternoon? (Why?)',
            backUp: 'Which is better, morning or afternoon? (Why?)',
          },
        ],
      },
    ],
  },

  14: {
    kind: 'speaking-photos',
    timing: '2–3 minutes',
    examinerIntro:
      "Now I'd like each of you to talk on your own about something. I'm going to give each of you a photograph and I'd like you to talk about it.",
    photos: [
      {
        id: '1A',
        title: 'Learning a new skill',
        image: `${ASSETS}/speaking/part2-photo-1a.jpg`,
        alt: 'A girl and a woman baking together in a kitchen, following a recipe on a tablet',
        prompt: 'It shows someone learning how to do something. Please tell us what you can see in the photograph.',
      },
      {
        id: '1B',
        title: 'At home after school',
        image: `${ASSETS}/speaking/part2-photo-1b.jpg`,
        alt: 'A boy at home in a living room watching a football match on TV',
        prompt: 'It shows someone at home after school. Please tell us what you can see in the photograph.',
      },
    ],
    candidateTime: 'Approximately 1 minute each',
    backUpPrompts: ['Talk about the people / person.', 'Talk about the place.', 'Talk about other things in the photograph.'],
  },

  15: {
    kind: 'speaking-collaborative',
    timing: '2–3 minutes (Parts 3 and 4 take about 6 minutes in total)',
    title: 'A school visit to a capital city',
    examinerIntro:
      "Now, in this part of the test you're going to talk about something together for about two minutes. I'm going to describe a situation to you.",
    situation:
      'Some students from a small village school are going on a trip to their capital city. Here are some activities they could do there.',
    task: 'Talk together about the different activities they could do in their capital city, and say which would be most interesting.',
    image: `${ASSETS}/speaking/part3-task.jpg`,
    alt: 'Ideas for a school trip to a capital city: a market, a transport museum, a bus tour, a castle, a zoo, an art gallery and a football stadium, around a village school bus',
  },

  16: {
    kind: 'speaking-discussion',
    timing: 'Parts 3 and 4 take about 6 minutes in total',
    questions: [
      'Would you like to have more school trips? (Where would you like to go?)',
      'What do you need to take when you go on a trip?',
      'Do you prefer to go on trips with your friends or your family? (Why?)',
      'What do you think is the best time of year to visit a city? (Why?)',
      'Which do you think is more interesting: visiting the countryside or visiting a city? (Why?)',
    ],
    prompts: ['How / What about you?', 'Do you agree?', 'What do you think?'],
    closing: 'Thank you. That is the end of the test.',
  },
};

/**
 * @param {number} partNumber global B1 part (1–16)
 * @returns {null | (object & { partNumber: number, directions: string, questionStart?: number, questionCount?: number })}
 */
export function getB1SampleTest1Part(partNumber) {
  const pn = Number(partNumber);
  const part = PARTS[pn];
  if (!part) return null;
  const def = getLevelExamPartDef('b1', pn);
  return {
    ...part,
    partNumber: pn,
    directions: def?.directions || '',
    questionStart: def?.questionStart,
    questionCount: def?.questionCount,
  };
}

/** Plain-text task for the writing AI panel (task + input text the candidate must answer). */
export function buildB1WritingTaskText(part, taskNumber = null) {
  if (!part) return '';
  if (part.kind === 'writing-email') {
    const { email } = part;
    return [
      part.intro,
      `From: ${email.from}`,
      `Subject: ${email.subject}`,
      email.greeting,
      ...email.lines.map((line) => `${line.text} [Note: ${line.note}]`),
      ...email.closing,
      part.task,
      part.wordCountNote,
    ].join('\n');
  }
  if (part.kind === 'writing-choice') {
    const task = part.tasks.find((t) => t.number === Number(taskNumber)) || part.tasks[0];
    if (!task) return '';
    const lines = [task.label, task.lead];
    if (task.announcement) {
      lines.push(task.announcement.kicker, task.announcement.heading, ...task.announcement.lines);
    }
    if (task.openingSentence) {
      lines.push(task.storyIntro, task.openingSentence);
    }
    lines.push(task.task, part.wordCountNote);
    return lines.filter(Boolean).join('\n');
  }
  return '';
}
