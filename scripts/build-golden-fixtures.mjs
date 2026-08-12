#!/usr/bin/env node
/**
 * Build immutable golden fixture JSON files from transcribed official Cambridge text.
 * Run after manual transcription review.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'features', 'writing', 'calibration', 'fixtures');
const MANIFEST = path.join(
  ROOT,
  'docs',
  'writing-v3',
  'calibration',
  'sources',
  'source-manifest.json',
);

function sha256(text) {
  return createHash('sha256').update(text.normalize('NFC').replace(/\r\n?/g, '\n'), 'utf8').digest('hex');
}

function caseFile(payload) {
  const task_prompt_checksum = sha256(payload.task_prompt);
  const candidate_response_checksum = sha256(payload.candidate_response);
  return {
    ...payload,
    task_prompt_checksum,
    candidate_response_checksum,
    source_verification: {
      task_prompt: 'verified',
      candidate_response: 'verified',
      marks_source: payload.marks_source,
    },
  };
}

const DIGITAL_ESSAY_TASK = [
  'In your English class you have been talking about the environment. Now, your English',
  'teacher has asked you to write an essay.',
  '',
  'Write an essay using all the notes and giving reasons for your point of view.',
  '',
  'Every country in the world has problems with pollution and damage to the environment.',
  'Do you think these problems can be solved?',
  '',
  'Notes',
  'Write about:',
  '1. transport',
  '2. rivers and seas',
  '3. ...................................... (your own idea)',
].join('\n');

const BOOK_REVIEW_TASK = [
  'You see this announcement in your college English-language magazine.',
  '',
  'Book reviews wanted',
  'Have you read a book in which the main character behaved in a surprising way?',
  'Write us a review of the book, explaining what the main character did and why it was surprising.',
  'Tell us whether or not you would recommend this book to other people.',
  'The best reviews will be published in the magazine.',
  '',
  'Write your review.',
].join('\n');

const USEFUL_ARTICLE_TASK = [
  'You see this announcement on an English-language website.',
  '',
  'Articles wanted',
  'The most useful thing I have ever learned.',
  'What is the most useful thing you have learned?',
  'Who did you learn it from? Why is it useful?',
  'Write us an article answering these questions.',
  'We will publish the best articles on our website.',
  '',
  'Write your article.',
].join('\n');

const INFORMAL_EMAIL_TASK = [
  'You have received this email from your English-speaking friend David.',
  '',
  'From: David',
  'Subject: touring holiday',
  '',
  "Some college friends of mine are visiting your area soon for a week's touring holiday. They would",
  'like to travel around and learn about your local area and its history.',
  '',
  'Can you tell me about some of the places they could visit? What’s the best way to travel around –',
  'car, bike or coach?',
  '',
  'Thanks,',
  'David',
  '',
  'Write your email.',
].join('\n');

const FASHION_ESSAY_TASK = [
  'In your English class you have been talking about the fashion industry. Now, your English',
  'teacher has asked you to write an essay.',
  '',
  'Write an essay using all the notes and giving reasons for your point of view.',
  '',
  "Some people say the fashion industry has a bad effect on people’s lives.",
  'Do you agree?',
  '',
  'Notes',
  'Write about:',
  "1. whether people’s appearance is important",
  '2. the price of clothes',
  '3. …………………… (your own idea)',
].join('\n');

const TECHNOLOGY_REPORT_TASK = [
  'A group of British teachers is going to visit your college for two days. The aim of their trip',
  'is to learn about how technology is used in education in your country.',
  'You have been asked to write a report for the group leader. Your report should:',
  '• include information about how technology is used to teach different subjects',
  '• recommend which lessons the teachers should watch to see technology being',
  'used.',
  '',
  'Write your report.',
].join('\n');

const MUSIC_ARTICLE_TASK = [
  'You see this announcement on an English-language website:',
  '',
  'Articles wanted',
  'MUSIC AND ME',
  'When do you listen to music? How do you choose what to listen to at different times?',
  'Write us an article answering these questions.',
  'The best articles will be posted on our website.',
  '',
  'Write your article.',
].join('\n');

const COURSE_REVIEW_TASK = [
  'You see this announcement on an English-language website:',
  '',
  'Reviews wanted',
  'Courses',
  'Have you been on a course recently? Please tell us about it! It could be any type of',
  'course, like a sports course, photography course or language course. What were the',
  'classes like? What was the most interesting thing you learned? Would you recommend',
  'the course to other people?',
  "The best reviews will be published in next month’s magazine.",
  '',
  'Write your review.',
].join('\n');

const cases = [
  caseFile({
    case_id: 'G-01',
    label: 'Environmental essay A',
    source_family: 'digital',
    source_reference:
      '167791-b2-first-handbook.pdf pp.37–38 digital Candidate A; task from 174037 B2 First sample paper 1 Writing 2022.pdf Part 1 Q1',
    sample_identity: 'Digital sample · Question 1 · Candidate A',
    task_type: 'essay',
    task_prompt: DIGITAL_ESSAY_TASK,
    candidate_response: [
      'To begin with pollution and damage to the environment is the most serious and difficult problem for countries of all over the world. Scientists of different countries predict a global ecocatastrophe if people won’t change their attitude to our planet.',
      'First of all a huge damage to the environment brings a transport. People can’t imagine their living without cars, buses, trains, ships and planes. But it’s an open secret that one of disadvantage of these accustomed things is harmful exhaust. Needless to say that use of environment friendly engines helps us to save atmosphere from pollution.',
      'In addition to this our rivers and seas are in not less danger situation. It’s a fact of common knowledge that numerous factories and plants pour off their waste to ponds. Obviously that cleaning manufacturing water helps to avoid extinction of ocean residents.',
      'Apart from this I’m inclined to believe that every person can and must contribute to solving this important problem. Doing a little steps for protection our environment every day we will be able to save our Earth. And it’s a task of each of us.',
    ].join('\n'),
    expected_marks: { content: 4, communicative_achievement: 3, organisation: 3, language: 3 },
    marks_source: '167791 handbook digital Candidate A examiner marks',
    examiner_commentary:
      'Near-complete Content stops at 4 when third aspect/full solutions are missing.',
  }),
  caseFile({
    case_id: 'G-02',
    label: 'Environmental essay B',
    source_family: 'digital',
    source_reference:
      '167791-b2-first-handbook.pdf pp.38–39 digital Candidate B; task from 174037 Writing 2022 Part 1 Q1',
    sample_identity: 'Digital sample · Question 1 · Candidate B',
    task_type: 'essay',
    task_prompt: DIGITAL_ESSAY_TASK,
    candidate_response: [
      'I think that my country has problems with pollution to the environment like all other countries. This problem is normal for Russia. We have big problems with transport because there are too much cars in our country. And because of that we have problems with atmospeer, air in my city and in all Russia is really dirty and sometimes I can’t make a sigh because it smells around me and of course around that cars on the road. I’ve heard about tradition of one country. They don’t go anywhere by car one day a month or a year, they just use bycicle or their feet. I think it could be very good if we had a tradition like that.',
      'So, what about the rivers and the seas? Yeah, there are some really good and clean rivers and seas where you can go, but there are not many of them. Once I saw the river OB in my city, it was about two years ago but I stil remember that in some places it was not blue, it was green or purple I didn’t really understand because it had different colours.',
      'I don’t know what should we do. Maybe we should just open our eyes and look what we did. But Russian people don’t care about the world around them many people care only about themselves an that’s all.',
      'So, the best idea is look around and try to do something good for our planet and for us and our children.',
    ].join('\n'),
    expected_marks: { content: 3, communicative_achievement: 3, organisation: 3, language: 3 },
    marks_source: '167791 handbook digital Candidate B examiner marks',
    examiner_commentary: 'Relevant discussion does not fully answer the central question.',
  }),
  caseFile({
    case_id: 'G-03',
    label: 'Environmental essay C',
    source_family: 'digital',
    source_reference:
      '167791-b2-first-handbook.pdf pp.39–40 digital Candidate C; task from 174037 Writing 2022 Part 1 Q1',
    sample_identity: 'Digital sample · Question 1 · Candidate C',
    task_type: 'essay',
    task_prompt: DIGITAL_ESSAY_TASK,
    candidate_response: [
      'DEVELOPMENT VS ENVIRONMENT',
      'If we surf the web looking for pollution and environmental catastrophes, we will find out that every country in the world suffers them. This is a natural consequence of the struggle between development and environment.',
      'If a country decided to live isolated from the rest of the world, living on what it can naturally grow and produce, it surely wouldn’t be highly polluted. But we all want exotic food and technological items from all over the world, so we have to pay the price.',
      'Investing on electrical transport would benefit the environment a lot. Even more if this electricity came from a natural source of energy like wind, rivers and solar boards. It’s difficult to achieve this because petrol companies will fight against these actions.',
      'We also have to take care of our rivers and seas. We all have heard about factories throwing highly toxic substances to rivers, without minimizing their poisoning effects. A really strict law should be applied to fine these factories and make them change their policy.',
      'But what about ourselves? We also can do a lot! If, when possible, we bought larger packs of food, we would be producing less rubbish. And this is only an example!',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 5, organisation: 4, language: 5 },
    marks_source: '167791 handbook digital Candidate C examiner marks',
    examiner_commentary: 'High performance can still have Organisation 4.',
  }),
  caseFile({
    case_id: 'G-04',
    label: 'Book review D',
    source_family: 'digital',
    source_reference:
      '167791-b2-first-handbook.pdf pp.40–41 digital Candidate D; task from 174037 Writing 2022 Part 2 Q2',
    sample_identity: 'Digital sample · Question 2 · Candidate D',
    task_type: 'review',
    task_prompt: BOOK_REVIEW_TASK,
    candidate_response: [
      '“Life of Buddah”: A Book Review',
      'What would you do if you were born as a prince with all the exclusive fasilities to enjoy this material world? yes, most of people will celebrate and enjoy every single right that they have as a son of a king. Beautiful women, money, parties and all senses’ gratification stuff. Surprisingly, it didn’t work that way for little Gautama who in the future would be a Buddah.',
      'In the book “Life of Buddha”, it is told that Gautama was born as a prince. He got all the facilities to make him being comfortable staying in the palace. The king didn’t allow him to get out from the palace for outside of the palace is the place of real life happened.',
      'One day, the king asked him to get married but the prince rejected it and decided to leave the palace instead. There, he started his spiritual journey and later on had self realization and became a buddha.',
      'This book is suitable for you who like to read about someone’s autobiography and life’s lesson. As a reader I can say that I learn a lot from this book. High recommended as something to read before going to bed!',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 3, organisation: 3, language: 3 },
    marks_source: '167791 handbook digital Candidate D examiner marks',
    examiner_commentary: 'Complete task fulfilment can coexist with straightforward Band 3 execution.',
  }),
  caseFile({
    case_id: 'G-05',
    label: 'Useful-thing article E',
    source_family: 'digital',
    source_reference:
      '167791-b2-first-handbook.pdf pp.41–42 digital Candidate E; task from 174037 Writing 2022 Part 2 Q3',
    sample_identity: 'Digital sample · Question 3 · Candidate E',
    task_type: 'article',
    task_prompt: USEFUL_ARTICLE_TASK,
    candidate_response: [
      'The most useful thing I have ever learned',
      'The most useful thing i have learned is surely speaking English. I’ve been studing English for nine years till now. I used to take regular classes in these language which i found very interesting. Also, i learn English in school, my teacher is awesome but strict, so i have to study constantly. But most of all, i learn English, watching movies, TV shows. Allso cartoons when i was younger. When i came across a movie which was subtitled i turned the subtitle off. I enjoy wathing TV and movies on English.',
      'English is the most spoken language across the world. It is studied all over the world. In order to get in a conversation with a stranger from other country, you need to speak English. I’m a swimmer, so i go on competissions in many countries, and in all of those countries i speak English. I want to study abroad when i finish highschool, so i’ll defenetly need English.',
      'All in all, i enjoy speaking it, writing it, and I’m very glad I got to learn it, i find it very useful.',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 3, organisation: 3, language: 3 },
    marks_source: '167791 handbook digital Candidate E examiner marks',
    examiner_commentary: 'Detailed task completion does not automatically raise other criteria.',
  }),
  caseFile({
    case_id: 'G-06',
    label: 'Informal email F',
    source_family: 'digital',
    source_reference:
      '167791-b2-first-handbook.pdf pp.42–43 digital Candidate F; task from 174037 Writing 2022 Part 2 Q4',
    sample_identity: 'Digital sample · Question 4 · Candidate F',
    task_type: 'informal_email',
    task_prompt: INFORMAL_EMAIL_TASK,
    candidate_response: [
      'Dear David,',
      "I’m glad your friends are visiting my area soon for a week’s touring holiday. I have many ideas what I can show them and tell about.",
      'In my opinion the best way to travel around will be by bike because of small distances between the places and views are amazing.',
      'My area includes also beautiful Baltic Sea which many tourist visit especially in summer. Your friends could sunbath or swim if they would like but the water is quite cold in this season. Beautiful sightseeing of sunrise is the best memorise!',
      'You wrote that they are intrested in history of my local area. That’s great! We have museum of our local history where I can go with them. Tickets are not so expensive and I can think about some discount.',
      'What do you think about it? Would you mind send me some your ideas?',
      'I look forward to hearing from you soon.',
      'Best wishes,',
      'Sam',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 3, organisation: 4, language: 3 },
    marks_source: '167791 handbook digital Candidate F examiner marks',
    examiner_commentary: 'Strong structure/reference can produce Organisation 4.',
  }),
  caseFile({
    case_id: 'G-07',
    label: 'Fashion essay A',
    source_family: 'paper',
    source_reference:
      '167791-b2-first-handbook.pdf pp.44–45 paper Candidate A; task from 178516 B2 First sample paper 2 Writing 2022.pdf Part 1 Q1',
    sample_identity: 'Paper sample · Question 1 · Candidate A',
    task_type: 'essay',
    task_prompt: FASHION_ESSAY_TASK,
    candidate_response: [
      "In today’s world, the fashion industry has a strong importance in people’s lives. The fashion industry say to the society what to wear and creates new types of clothes all the time.",
      "Some people claim that the fashion industry has a bad effect on people’s lives, they say that the fashion industry creates clothes that the society has to wear. Furthermore, the clothes’ price is extremely high and people, who can’t afford it, should not be in the society.",
      'In the other hand, the fashion industry guide the people to be in a good appearance, because, nowadays, the appearance of the person is more important than the person itself.',
      "In my opinion, the fashion industry doesn’t has a bad influence on people’s lives. It’s something which was created to help people what to wear.",
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 2, organisation: 2, language: 2 },
    marks_source: '167791 handbook paper Candidate A examiner marks',
    examiner_commentary: 'Content is independent of weak execution.',
  }),
  caseFile({
    case_id: 'G-08',
    label: 'Fashion essay B',
    source_family: 'paper',
    source_reference:
      '167791-b2-first-handbook.pdf pp.45–46 paper Candidate B; task from 178516 Writing 2022 Part 1 Q1',
    sample_identity: 'Paper sample · Question 1 · Candidate B',
    task_type: 'essay',
    task_prompt: FASHION_ESSAY_TASK,
    candidate_response: [
      'Fashion industry is very a discussed subject nowadays: they create and design new clothes everyday in order to satisfy some people needs.',
      'There are many people who claim that the fashion industry is important and good for society. According to them, this industry design beautiful clothes and thanks to that every person can wear shirts, trousers or any acessory which is on today’s fashion.',
      'On the other hand, the fashion industry in some people opinion, controls the market of clothes and because of that they can’t wear what they want to. In addition, the industry can increase the price of clothes, forcing people who don’t want to be “old-fashioned” to buy and pay a large amount of money to keep “beautiful”',
      'In my opinion, we can’t let the fashion industry decide what we must or musn’t wear. We shouldn’t judge people for its appearance, because that is not important. We must wear whatever we like, want and feel confortable with.',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 3, organisation: 4, language: 3 },
    marks_source: '167791 handbook paper Candidate B examiner marks',
    examiner_commentary: 'Cross-sentence reference raises Organisation above CA/Language.',
  }),
  caseFile({
    case_id: 'G-09',
    label: 'Fashion essay C',
    source_family: 'paper',
    source_reference:
      '167791-b2-first-handbook.pdf pp.46–47 paper Candidate C; task from 178516 Writing 2022 Part 1 Q1',
    sample_identity: 'Paper sample · Question 1 · Candidate C',
    task_type: 'essay',
    task_prompt: FASHION_ESSAY_TASK,
    candidate_response: [
      'The society we live today is characterised by technology in constant development, fast speed processes, information travelling and getting to people at a blink of an eye and a complex web of social networking. In this context, the fashion industry is becoming increasingly important and having a more and more paramount role in our lives.',
      'On one hand, the fashion industry is undeniably a source of profit and income. It hires millions of people all over the world and generates millions of dollars every year. Furthermore, such profitable business is also believed to be able to spread and make known the culture of a people, encouraging and enhancing a better understanding of each other.',
      'Nevertheless, for those who are neither impressed nor motivated by numbers and figures, the fashion industry is seen as one which segregates people, isolating those who not fit their laws and commands. It is stated that people place too much importance on appearance and the material, world, sadly true, and the fashion industry just spurs on such situation. Moreover, not only are the costs of fashion item unrealistically high, it is thought to be a money better spent on more pressing issues, such as poverty and hunger.',
      'I do believe that the fashion industry, as it is today, has a harmful effect, because it values a minority of people in detriment to the majority. However, it has such a wide reach that, it put into a good use, it can save lives.',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 5, organisation: 5, language: 5 },
    marks_source: '167791 handbook paper Candidate C examiner marks',
    examiner_commentary: 'Full high-band profile.',
  }),
  caseFile({
    case_id: 'G-10',
    label: 'Technology report D',
    source_family: 'paper',
    source_reference:
      '167791-b2-first-handbook.pdf pp.47–48 paper Candidate D; task from 178516 Writing 2022 Part 2 Q2',
    sample_identity: 'Paper sample · Question 2 · Candidate D',
    task_type: 'report',
    task_prompt: TECHNOLOGY_REPORT_TASK,
    candidate_response: [
      'Use of Technology in education',
      'Introduction',
      'This report is intended to inform how technology is used in common lessons and recommend the most interesting technical developments to be seen. I conducted a survey among teachers and students in order to find out what is prefered to be used by them.',
      'Technology in different subjects',
      'The majority of the people claimed that the best thing were computers and interactive boards. I was given these reasons:',
      '1 They provide an oportunity to make the lessons more enjoyable',
      '2 Everybody is able to find information on the internet whenever they want to',
      '3 Computer presentations can be easily given',
      'However, use of another technical developments vary among students and teachers depending on which subject they focus on. For instance, people were interested in Science mentioned these points:',
      '– newly equipped chemical lab with its recently purchased substances',
      '– equipment suitable for teaching Physics (e.g. digital watches, laser)',
      'Recommendations',
      'For most of the people who I asked for their reply were really important computers and interactive boards in the classrooms. I would therefore recommend seeing this. On the other hand, if you are interested in particular subjects you ought to see their specialised classrooms with a variety of modern technical developments, too.',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 4, organisation: 4, language: 3 },
    marks_source: '167791 handbook paper Candidate D examiner marks',
    examiner_commentary: 'Strong genre/organisation can coexist with Language 3.',
  }),
  caseFile({
    case_id: 'G-11',
    label: 'Music article E',
    source_family: 'paper',
    source_reference:
      '167791-b2-first-handbook.pdf pp.48–49 paper Candidate E; task from 178516 Writing 2022 Part 2 Q3',
    sample_identity: 'Paper sample · Question 3 · Candidate E',
    task_type: 'article',
    task_prompt: MUSIC_ARTICLE_TASK,
    candidate_response: [
      'I always listen to music, wherever I go I have my headphones on my ears. Listening to what I like satisfy’s me and makes me calm all the time. When the bus is taking me to school I listen to the music so I could wake up.',
      'I love to listen to classical music, jazz, rock, hip-hop, dubstep, pop music. But I can’t listen to Serbian folk, any rap, techno or K-pop music. It just anoy’s me. Of all the songs I can listen, I adore pop and dubstep the most. I’m glad that my parents listened to rock and ninetees serbian songs which I like to listen sometimes.',
      'Everybody has his own taste for music, somebody likes rock, somebody likes rap or something else, and that’s ok. I’m proud of myself that I’m listening to what I’m listening.',
    ].join('\n'),
    expected_marks: { content: 4, communicative_achievement: 3, organisation: 2, language: 2 },
    marks_source: '167791 handbook paper Candidate E examiner marks',
    examiner_commentary: 'Underdeveloped task relationship + list-like organisation + narrow range.',
  }),
  caseFile({
    case_id: 'G-12',
    label: 'Course review F',
    source_family: 'paper',
    source_reference:
      '182410-first-writing-sample-answers-and-examiner-comments-2015.pdf Question 4 Candidate F; task from 178516 Writing 2022 Part 2 Q4',
    sample_identity: 'Paper sample · Question 4 · Candidate F',
    task_type: 'review',
    task_prompt: COURSE_REVIEW_TASK,
    candidate_response: [
      'The course I have been recently is a language course. In september I went to a Italian course for improving my level of Italian, with a native teacher, Andrea.',
      'The classes were very funny. Everyday when we arrived to the class he gave us a song in which there were gaps which we had to filling them while we listened the song. After that we did differents exercise, the majority of them for improving our vocabulary. For instance we spoke about restaurant, shops, cinema and so on.',
      'The most interesting thing that I learned was how to prepare a theater play, and it was fantastic. During a week we wrote a play based on a book, and the last day of the week we interpreted it. Everyone had a different paper on it. For me it was an unforgetable experience, because I spent a wonderful time doing it and I learned a lot of idioms.',
      'I would recommend this course because Andrea is a nice person who teach you with interesting exercise. Learning Italian isn’t boring with him.',
    ].join('\n'),
    expected_marks: { content: 5, communicative_achievement: 3, organisation: 4, language: 3 },
    marks_source: '182410 sample answers 2015 Question 4 Candidate F examiner marks',
    examiner_commentary: 'Clear paragraph functions/reference support Organisation 4.',
  }),
];

fs.mkdirSync(OUT, { recursive: true });
for (const c of cases) {
  const dest = path.join(OUT, `${c.case_id}.json`);
  fs.writeFileSync(dest, JSON.stringify(c, null, 2) + '\n', 'utf8');
  console.log('wrote', dest);
}

const retrievalDate = '2026-08-11';
const manifest = {
  retrieval_date: retrievalDate,
  sources: [
    {
      id: 'handbook_167791',
      url: 'https://www.cambridgeenglish.org/Images/167791-b2-first-handbook.pdf',
      local_path: 'docs/writing-v3/calibration/sources/167791-b2-first-handbook.pdf',
      sha256: '73F1AB54345E938F2443DB5E7C81E541DF53F1A47B1D92B0D1C1664C17DA1C9A',
      identity: 'B2 First Handbook for Teachers (Cambridge English)',
      used_for: 'G-01–G-11 candidate scripts + examiner marks; digital/paper sample answers',
    },
    {
      id: 'sample_answers_182410',
      url: 'https://www.cambridgeenglish.org/images/182410-first-writing-sample-answers-and-examiner-comments-2015.pdf',
      local_path:
        'docs/writing-v3/calibration/sources/182410-first-writing-sample-answers-and-examiner-comments-2015.pdf',
      sha256: '48AE1EB99E966C5479D155EE65E9FE7FE995973CD629F2938B21E700C5E152B7',
      identity: 'First Writing sample answers and examiner comments (2015)',
      used_for: 'G-12 Candidate F course review script + marks',
    },
    {
      id: 'sample_paper_1_writing_174037',
      url: 'https://www.cambridgeenglish.org/Images/174037-b2-first-sample-paper-1.zip',
      local_path:
        'docs/writing-v3/calibration/sources/174037-b2-first-sample-paper-1/B2 First sample paper 1 Writing 2022.pdf',
      identity: 'B2 First Sample Paper 1 Writing 2022 (official zip)',
      used_for: 'G-01–G-06 exact digital task prompts',
    },
    {
      id: 'sample_paper_2_writing_178516',
      url: 'https://www.cambridgeenglish.org/Images/178516-b2-first-sample-paper-2.zip',
      local_path:
        'docs/writing-v3/calibration/sources/178516-b2-first-sample-paper-2/B2 First sample paper 2 Writing 2022.pdf',
      identity: 'B2 First Sample Paper 2 Writing 2022 (official zip)',
      used_for: 'G-07–G-12 exact paper task prompts',
    },
    {
      id: 'digital_sample_link',
      url: 'https://camengli.sh/3YMtIM6',
      resolves_to:
        'https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/preparation/',
      digital_writing_player:
        'https://ceq.inspera.com/player/?assessmentRunId=146732614&context=exam',
      note: 'Handbook-linked complete digital sample; task wording for digital set taken from matching official sample paper 1 Writing PDF (same scripts as handbook digital samples).',
    },
  ],
  golden_cases: cases.map((c) => ({
    case_id: c.case_id,
    task_prompt_checksum: c.task_prompt_checksum,
    candidate_response_checksum: c.candidate_response_checksum,
    source_reference: c.source_reference,
  })),
};

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('wrote', MANIFEST);
console.log('cases', cases.length);
