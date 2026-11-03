import { QUIZ_GAME_CATEGORIES, QUIZ_GAME_QUESTIONS } from '@/data/quizGameQuestions';

const LEVELS = ['a2', 'b1', 'b2', 'c1', 'c2'];

function item(id, category, stem, correct, distractors, why) {
  const letters = ['a', 'b', 'c', 'd'];
  return {
    id,
    category,
    stem,
    why,
    options: [correct, ...distractors].map((text, index) => ({
      id: letters[index],
      text,
      correct: index === 0,
    })),
  };
}

/** A2 Key: everyday words, present and past, short phrases. */
const A2_QUIZ_QUESTIONS = [
  item('a2v01', 'vocabulary', 'I am _____ . I want a sandwich.', 'hungry', ['angry', 'hungry for', 'hurry'], 'Hungry means you want to eat.'),
  item('a2v02', 'vocabulary', 'The ticket is not expensive. It is _____ .', 'cheap', ['chip', 'sheep', 'chief'], 'Cheap means it does not cost much.'),
  item('a2v03', 'vocabulary', 'Please speak _____ . I cannot hear you.', 'quietly', ['quickly', 'quietly than', 'quiet'], 'Quietly is the adverb: speak in a soft voice.'),
  item('a2v04', 'vocabulary', 'We go to the _____ to catch the train.', 'station', ['stadium', 'statue', 'stable'], 'A station is where trains stop.'),
  item('a2v05', 'vocabulary', 'She works in a hospital. She is a _____ .', 'nurse', ['niece', 'purse', 'notice'], 'A nurse looks after people in a hospital.'),
  item('a2v06', 'vocabulary', 'It is raining. Take your _____ .', 'umbrella', ['envelope', 'uniform', 'armchair'], 'An umbrella keeps the rain off you.'),
  item('a2v07', 'vocabulary', 'The opposite of early is _____ .', 'late', ['later than', 'last', 'least'], 'Late means not on time. Early is the opposite.'),
  item('a2v08', 'vocabulary', 'I _____ a book from the library every week.', 'borrow', ['lend', 'borrow to', 'lent'], 'You borrow something from a person or a place.'),
  item('a2v09', 'vocabulary', 'This soup is too _____ . I cannot eat it.', 'hot', ['heat', 'heating', 'hottest than'], 'Hot describes the soup. Heat is the noun.'),
  item('a2v10', 'vocabulary', 'The film starts at eight. Do not be _____ .', 'late', ['lately', 'later on', 'latest'], 'Late means after the right time.'),
  item('a2g01', 'grammar', 'She _____ to school by bus every day.', 'goes', ['go', 'going', 'is go'], 'With she/he/it, the present simple adds -es or -s.'),
  item('a2g02', 'grammar', 'Yesterday we _____ a film at the cinema.', 'watched', ['watch', 'watching', 'are watch'], 'Yesterday needs the past simple.'),
  item('a2g03', 'grammar', 'There _____ two cafés near my house.', 'are', ['is', 'be', 'has'], 'Two cafés is plural, so the verb is are.'),
  item('a2g04', 'grammar', 'I do not have _____ milk. Can you buy some?', 'any', ['some', 'a', 'many a'], 'Any is used in negative sentences with uncountable nouns.'),
  item('a2g05', 'grammar', 'My brother is _____ than me.', 'taller', ['more tall', 'tallest', 'the taller'], 'One-syllable adjectives take -er for a comparison of two people.'),
  item('a2g06', 'grammar', 'Look at those clouds. It _____ rain.', 'is going to', ['going', 'is go to', 'goes to'], 'Is going to talks about something we can see will happen.'),
  item('a2g07', 'grammar', '_____ you swim?', 'Can', ['Do can', 'Are', 'Have'], 'Can asks about ability. It does not need do.'),
  item('a2g08', 'grammar', 'How _____ apples do you want?', 'many', ['much', 'lot', 'any of'], 'Apples are countable, so the question uses many.'),
  item('a2g09', 'grammar', 'I _____ my homework at the moment.', 'am doing', ['do', 'doing', 'am do'], 'At the moment needs the present continuous.'),
  item('a2g10', 'grammar', 'We _____ not at home last night.', 'were', ['was', 'are', 'did'], 'We takes were in the past of be.'),
  item('a2u01', 'use-of-english', 'I live _____ Madrid.', 'in', ['at', 'on', 'by'], 'In is the preposition for cities.'),
  item('a2u02', 'use-of-english', 'This is _____ umbrella.', 'an', ['a', 'the some', 'any'], 'Umbrella starts with a vowel sound, so the article is an.'),
  item('a2u03', 'use-of-english', 'She does not _____ coffee.', 'like', ['likes', 'liking', 'to liking'], 'After does not, the verb stays in the base form.'),
  item('a2u04', 'use-of-english', 'They _____ football on Saturdays.', 'play', ['plays', 'are play', 'playing'], 'They takes the base form in the present simple.'),
  item('a2u05', 'use-of-english', 'The shop is _____ the bank and the post office.', 'between', ['among', 'through', 'along'], 'Between is used for a position in the middle of two places.'),
  item('a2u06', 'use-of-english', 'I have got a cat. _____ name is Luna.', 'Its', ['It is', 'His', 'Their'], 'Its is the possessive for an animal. It is means it is.'),
  item('a2u07', 'use-of-english', 'We arrived _____ the airport at six.', 'at', ['in', 'to', 'on'], 'Arrive at is used for buildings and places such as an airport.'),
  item('a2u08', 'use-of-english', 'There is not _____ sugar in the tea.', 'much', ['many', 'a few', 'several'], 'Sugar is uncountable, so the negative uses much.'),
  item('a2u09', 'use-of-english', '_____ you like a cup of tea?', 'Would', ['Do would', 'Are', 'Shall to'], 'Would you like is the polite offer.'),
  item('a2u10', 'use-of-english', 'My birthday is _____ May.', 'in', ['on', 'at', 'the'], 'Months take in. Days take on.'),
  item('a2p01', 'phrases', 'I _____ at seven o’clock every morning.', 'get up', ['get on', 'get in', 'get off'], 'Get up means leave your bed.'),
  item('a2p02', 'phrases', 'Can you help me _____ my keys? I cannot find them.', 'look for', ['look after', 'look at to', 'look up to'], 'Look for means try to find something.'),
  item('a2p03', 'phrases', 'Please _____ the light. It is dark.', 'turn on', ['turn in', 'turn up to', 'turn over'], 'Turn on means start a light or a machine.'),
  item('a2p04', 'phrases', 'It is cold. _____ your coat.', 'Put on', ['Put in', 'Put off', 'Put up'], 'Put on means dress yourself in a coat.'),
  item('a2p05', 'phrases', 'The bus stops here. We have to _____ .', 'get off', ['get up', 'get over', 'get on to'], 'Get off means leave a bus or a train.'),
  item('a2p06', 'phrases', 'I _____ my little brother when my parents are out.', 'look after', ['look for', 'look up', 'look into'], 'Look after means take care of someone.'),
  item('a2p07', 'phrases', 'Please _____ . I am talking on the phone.', 'hang on', ['hang up the coat', 'hang out of', 'hang in'], 'Hang on means wait a moment.'),
  item('a2p08', 'phrases', 'We need to _____ early tomorrow. The train is at six.', 'set off', ['set in', 'set up to', 'set on'], 'Set off means start a journey.'),
  item('a2p09', 'phrases', 'Can you _____ the word in a dictionary?', 'look up', ['look after', 'look for it to', 'look down'], 'Look up means find information in a book or online.'),
  item('a2p10', 'phrases', 'I am tired. I want to _____ on the sofa.', 'lie down', ['lie to', 'lay off', 'lie out'], 'Lie down means rest in a horizontal position.'),
];

/** B1 Preliminary: perfect tenses, conditionals, common phrasal verbs. */
const B1_QUIZ_QUESTIONS = [
  item('b1v01', 'vocabulary', 'I cannot _____ a new phone this month.', 'afford', ['effort', 'offer', 'affect'], 'Afford means have enough money for something.'),
  item('b1v02', 'vocabulary', 'The hotel _____ breakfast from seven to ten.', 'serves', ['services', 'deserves', 'reserves'], 'A hotel serves food. Service is the noun.'),
  item('b1v03', 'vocabulary', 'She gave me some useful _____ about the exam.', 'advice', ['advices', 'advise', 'advisory'], 'Advice is uncountable. Advise is the verb.'),
  item('b1v04', 'vocabulary', 'We had a long _____ from Madrid to Lisbon.', 'journey', ['travel', 'tripper', 'voyage of'], 'Journey is the noun for going from one place to another.'),
  item('b1v05', 'vocabulary', 'He is a very _____ person. He always arrives on time.', 'reliable', ['available', 'comfortable', 'possible'], 'Reliable means you can trust the person to do what they say.'),
  item('b1v06', 'vocabulary', 'The museum was so _____ that we stayed all afternoon.', 'interesting', ['interested', 'interest', 'interests'], 'Interesting describes the place. Interested describes a person.'),
  item('b1v07', 'vocabulary', 'Could you _____ this word? I do not understand it.', 'explain', ['say me', 'tell to me', 'explain me'], 'Explain does not take a person directly: explain something.'),
  item('b1v08', 'vocabulary', 'There is a lot of _____ in the city centre.', 'traffic', ['traffics', 'circulation', 'transportation'], 'Traffic is the uncountable word for cars on the road.'),
  item('b1v09', 'vocabulary', 'I _____ you try the fish. It is excellent here.', 'recommend', ['suggest you to', 'advise you trying', 'offer'], 'Recommend is followed by a clause or an -ing form, not to + object + infinitive in this pattern.'),
  item('b1v10', 'vocabulary', 'The concert was _____ because the singer was ill.', 'cancelled', ['delayed the forever', 'avoided', 'missed'], 'Cancelled means it will not happen.'),
  item('b1g01', 'grammar', 'I _____ never _____ sushi.', 'have / eaten', ['have / ate', 'did / eaten', 'has / eaten'], 'Present perfect uses have plus the past participle.'),
  item('b1g02', 'grammar', 'She has lived here _____ 2019.', 'since', ['for', 'from', 'during'], 'Since is used with a point in time. For is used with a period.'),
  item('b1g03', 'grammar', 'If it _____ tomorrow, we will stay at home.', 'rains', ['will rain', 'rained', 'is raining to'], 'The first conditional uses the present simple after if.'),
  item('b1g04', 'grammar', 'I _____ play the piano when I was a child.', 'used to', ['use to', 'am used to', 'was used'], 'Used to describes a past habit that has stopped.'),
  item('b1g05', 'grammar', 'This bag is too heavy for me _____ .', 'to carry', ['for carry', 'carrying', 'carry'], 'Too + adjective is followed by to + infinitive.'),
  item('b1g06', 'grammar', 'The woman _____ lives next door is a doctor.', 'who', ['which', 'whose she', 'what'], 'Who is the relative pronoun for people.'),
  item('b1g07', 'grammar', 'You _____ smoke in this building.', 'must not', ['do not must', 'must not to', 'have not'], 'Must not is the prohibition. It is not followed by to.'),
  item('b1g08', 'grammar', 'I am not as tall _____ my sister.', 'as', ['than', 'like', 'to'], 'As…as is the comparison of equality. Than follows a comparative.'),
  item('b1g09', 'grammar', 'While I _____ dinner, the phone rang.', 'was cooking', ['cooked', 'am cooking', 'have cooked'], 'While plus the past continuous sets the background for a past event.'),
  item('b1g10', 'grammar', 'How long _____ you _____ English?', 'have / been learning', ['are / learning', 'did / learned', 'have / learn'], 'How long with an unfinished action uses the present perfect continuous.'),
  item('b1u01', 'use-of-english', 'I am looking forward _____ the weekend.', 'to', ['for', 'at', 'on'], 'Look forward to is followed by a noun or -ing, and the preposition is to.'),
  item('b1u02', 'use-of-english', 'She is interested _____ photography.', 'in', ['on', 'at', 'for'], 'Interested takes in.'),
  item('b1u03', 'use-of-english', 'He apologised _____ being late.', 'for', ['of', 'about to', 'from'], 'Apologise for something.'),
  item('b1u04', 'use-of-english', 'We arrived _____ the station just in time.', 'at', ['to', 'in the', 'into'], 'Arrive at a station or a building.'),
  item('b1u05', 'use-of-english', 'This book was written _____ a famous journalist.', 'by', ['from', 'of', 'with'], 'The passive agent is introduced by by.'),
  item('b1u06', 'use-of-english', 'I have not finished _____ .', 'yet', ['already', 'still', 'ever'], 'Yet is used in negatives and questions about something expected.'),
  item('b1u07', 'use-of-english', 'There are not _____ chairs for everyone.', 'enough', ['too', 'much', 'several of'], 'Enough follows the noun when it means a sufficient number.'),
  item('b1u08', 'use-of-english', 'She asked me where I _____ .', 'lived', ['did live', 'do live', 'living'], 'In reported questions the word order is subject plus verb, without do.'),
  item('b1u09', 'use-of-english', 'You should _____ a doctor if you feel worse.', 'see', ['to see', 'seeing', 'seen'], 'Should is followed by the base form.'),
  item('b1u10', 'use-of-english', 'The tickets _____ sold out yesterday.', 'were', ['have', 'was', 'are been'], 'Tickets is plural and yesterday needs the past passive were sold.'),
  item('b1p01', 'phrases', 'She _____ her grandmother every Sunday.', 'looks after', ['looks for', 'looks up', 'looks into'], 'Look after means take care of.'),
  item('b1p02', 'phrases', 'I want to _____ eating sweets.', 'give up', ['give in', 'give away to', 'give out'], 'Give up means stop a habit.'),
  item('b1p03', 'phrases', 'Can you _____ what time the film starts?', 'find out', ['find up', 'look out', 'search up'], 'Find out means discover a fact.'),
  item('b1p04', 'phrases', 'The plane _____ twenty minutes late.', 'took off', ['took up', 'took on', 'took over'], 'Take off is what a plane does when it leaves the ground.'),
  item('b1p05', 'phrases', 'We need to _____ a solution before Friday.', 'come up with', ['come up to', 'come across with', 'come on'], 'Come up with means think of an idea.'),
  item('b1p06', 'phrases', 'I _____ an old friend in the supermarket.', 'ran into', ['ran out', 'ran over to', 'ran up'], 'Run into means meet someone by chance.'),
  item('b1p07', 'phrases', 'Please _____ the form and send it back.', 'fill in', ['fill up to', 'fill on', 'fill out of'], 'Fill in a form means complete it.'),
  item('b1p08', 'phrases', 'They _____ the meeting because the manager was away.', 'put off', ['put out', 'put up', 'put away'], 'Put off means postpone.'),
  item('b1p09', 'phrases', 'Children grow _____ their shoes very quickly.', 'out of', ['out from', 'up of', 'off'], 'Grow out of means become too big for something.'),
  item('b1p10', 'phrases', 'I will _____ you _____ at the station.', 'pick / up', ['pick / on', 'take / up', 'pick / off'], 'Pick someone up means collect them in a car.'),
];

/** C1 Advanced: finer grammar, reporting, and less common collocations. */
const C1_QUIZ_QUESTIONS = [
  item('c1v01', 'vocabulary', 'The report was so _____ that nothing important was left out.', 'comprehensive', ['comprehensible', 'apprehensive', 'extensive of'], 'Comprehensive means complete in its coverage.'),
  item('c1v02', 'vocabulary', 'She was _____ to accept the offer until she saw the salary.', 'reluctant', ['resilient', 'relevant', 'redundant'], 'Reluctant means unwilling.'),
  item('c1v03', 'vocabulary', 'A strike now would _____ the negotiations.', 'undermine', ['underwrite', 'undertake', 'underline'], 'Undermine means weaken something gradually.'),
  item('c1v04', 'vocabulary', 'The plan is _____ , but it will need more funding.', 'feasible', ['plausible only', 'fallible', 'flexible to'], 'Feasible means possible to do in practice.'),
  item('c1v05', 'vocabulary', 'There has been a _____ increase in rents this year.', 'substantial', ['subtle', 'subsequent', 'subsidiary'], 'Substantial means large enough to matter.'),
  item('c1v06', 'vocabulary', 'His comments were _____ as a personal attack.', 'interpreted', ['interrupted', 'intervened', 'interfered'], 'Interpret means understand something in a particular way.'),
  item('c1v07', 'vocabulary', 'The evidence is _____ . We cannot be sure.', 'inconclusive', ['inconsequent', 'inconvenient', 'inconsiderate'], 'Inconclusive means it does not prove the point.'),
  item('c1v08', 'vocabulary', 'She has an _____ knowledge of eighteenth-century art.', 'in-depth', ['in-hand', 'in-time', 'in-turn'], 'In-depth knowledge is thorough.'),
  item('c1v09', 'vocabulary', 'The new rules will _____ on 1 January.', 'take effect', ['take place', 'take part', 'take over'], 'Rules take effect when they start to apply.'),
  item('c1v10', 'vocabulary', 'He made a _____ recovery after the operation.', 'remarkable', ['remarkeable', 'noticeable only just', 'considerate'], 'Remarkable means unusual and impressive.'),
  item('c1g01', 'grammar', 'If I _____ harder last year, I would have passed.', 'had worked', ['worked', 'would work', 'have worked'], 'The third conditional uses if + past perfect.'),
  item('c1g02', 'grammar', 'I wish I _____ more time yesterday.', 'had had', ['would have', 'have', 'had'], 'Wish about a past regret uses the past perfect.'),
  item('c1g03', 'grammar', 'Not only _____ late, but he also forgot the files.', 'was he', ['he was', 'did he was', 'he did'], 'Not only at the start of the sentence causes inversion.'),
  item('c1g04', 'grammar', 'The painting is believed _____ stolen in 1994.', 'to have been', ['to be been', 'having been', 'that it was been'], 'A perfect passive infinitive reports a finished event.'),
  item('c1g05', 'grammar', 'Hardly _____ the door when the phone rang.', 'had she opened', ['she had opened', 'did she opened', 'has she opened'], 'Hardly…when uses inversion and the past perfect.'),
  item('c1g06', 'grammar', '_____ the weather, the match went ahead.', 'Despite', ['Although', 'However', 'Even'], 'Despite is followed by a noun. Although is followed by a clause.'),
  item('c1g07', 'grammar', 'It was Maria _____ found the mistake.', 'who', ['which', 'whom that', 'whose'], 'A cleft sentence uses who for a person.'),
  item('c1g08', 'grammar', 'By the time we arrive, the film _____ .', 'will have started', ['will start', 'has started', 'is starting'], 'Will have + past participle looks back from a future moment.'),
  item('c1g09', 'grammar', 'He suggested _____ the meeting until Monday.', 'postponing', ['to postpone', 'us to postpone', 'postpone'], 'Suggest is followed by -ing or a that-clause, not to + infinitive.'),
  item('c1g10', 'grammar', '_____ she left earlier, she would have caught the train.', 'Had', ['Did', 'Would', 'If had'], 'Had she left is the inverted form of If she had left.'),
  item('c1u01', 'use-of-english', 'There is little point _____ now. The office is closed.', 'in complaining', ['to complain', 'of complain', 'for complaining'], 'There is little point in is followed by -ing.'),
  item('c1u02', 'use-of-english', 'She is incapable _____ keeping a secret.', 'of', ['to', 'for', 'from'], 'Incapable of takes a noun or -ing.'),
  item('c1u03', 'use-of-english', 'No sooner _____ down than the baby woke up.', 'had I sat', ['I had sat', 'did I sat', 'I sat'], 'No sooner…than causes inversion with the past perfect.'),
  item('c1u04', 'use-of-english', 'The project was called _____ at the last minute.', 'off', ['out', 'away', 'over'], 'Call off means cancel.'),
  item('c1u05', 'use-of-english', 'He denied _____ the window.', 'breaking', ['to break', 'to have break', 'break'], 'Deny is followed by -ing.'),
  item('c1u06', 'use-of-english', 'Seldom _____ such a generous offer.', 'do we receive', ['we receive', 'we do receive', 'receive we'], 'A negative adverb at the start of the sentence causes inversion.'),
  item('c1u07', 'use-of-english', 'She insisted _____ paying for the meal.', 'on', ['to', 'in', 'for'], 'Insist on is followed by a noun or -ing.'),
  item('c1u08', 'use-of-english', 'The more you practise, _____ you become.', 'the more confident', ['more confident', 'the confident more', 'more the confident'], 'The comparative correlative is the more…, the more…'),
  item('c1u09', 'use-of-english', 'I would rather you _____ anyone about this.', 'did not tell', ['do not tell', 'not to tell', 'would not tell'], 'Would rather plus another person uses the past simple for a present preference.'),
  item('c1u10', 'use-of-english', 'It is high time the company _____ its prices.', 'revised', ['revises', 'will revise', 'revise'], 'It is high time is followed by the past simple.'),
  item('c1p01', 'phrases', 'We will have to _____ a lot of noise from the building work.', 'put up with', ['put up to', 'put off with', 'put in for'], 'Put up with means tolerate.'),
  item('c1p02', 'phrases', 'The inquiry will _____ the cause of the delay.', 'look into', ['look after', 'look up to', 'look for to'], 'Look into means investigate.'),
  item('c1p03', 'phrases', 'New technology has _____ enormous changes in publishing.', 'brought about', ['brought up', 'brought off', 'brought in to'], 'Bring about means cause something to happen.'),
  item('c1p04', 'phrases', 'She _____ a brilliant idea during the meeting.', 'came up with', ['came up to', 'came across with', 'came into'], 'Come up with means produce an idea.'),
  item('c1p05', 'phrases', 'Sales have _____ since the new advert went out.', 'picked up', ['picked on', 'picked out of', 'picked over'], 'Pick up can mean improve after a quiet period.'),
  item('c1p06', 'phrases', 'I cannot _____ what he is trying to say.', 'make out', ['make up', 'make for', 'make off'], 'Make out means manage to understand or see.'),
  item('c1p07', 'phrases', 'The festival was _____ because of the storm.', 'called off', ['called out', 'called up', 'called for'], 'Call off means cancel an event.'),
  item('c1p08', 'phrases', 'He _____ his father. They both hate waiting.', 'takes after', ['takes off', 'takes up', 'takes over'], 'Take after means resemble a relative in character.'),
  item('c1p09', 'phrases', 'We should _____ the old furniture before we move.', 'get rid of', ['get away of', 'get out to', 'get over of'], 'Get rid of means remove something you do not want.'),
  item('c1p10', 'phrases', 'The details still do not _____ . Something is missing.', 'add up', ['add in', 'add on to', 'add up with'], 'Add up means make sense when you put the facts together.'),
];

/** C2 Proficiency: precise lexis, inversion and formal linkers. */
const C2_QUIZ_QUESTIONS = [
  item('c2v01', 'vocabulary', 'Smartphones have become _____ . Almost everyone has one.', 'ubiquitous', ['unanimous', 'utilitarian', 'ulterior'], 'Ubiquitous means found everywhere.'),
  item('c2v02', 'vocabulary', 'Her notes were _____ . Every source was checked twice.', 'meticulous', ['meritorious', 'melodious', 'momentous'], 'Meticulous means extremely careful about detail.'),
  item('c2v03', 'vocabulary', 'He felt _____ about leaving: excited, but also guilty.', 'ambivalent', ['ambiguous', 'ambitious', 'ambient'], 'Ambivalent means having two opposing feelings at once.'),
  item('c2v04', 'vocabulary', 'The link between the two studies is _____ at best.', 'tenuous', ['tentative only just', 'tedious', 'temperate'], 'Tenuous means weak and not firmly based.'),
  item('c2v05', 'vocabulary', 'The chair’s answer was _____ . There was no room for doubt.', 'unequivocal', ['unilateral', 'ubiquitous', 'unwitting'], 'Unequivocal means completely clear.'),
  item('c2v06', 'vocabulary', 'A _____ approach would ignore the theory and fix the leak.', 'pragmatic', ['dogmatic', 'enigmatic', 'charismatic'], 'Pragmatic means focused on what works in practice.'),
  item('c2v07', 'vocabulary', 'The rumour was _____ by three independent witnesses.', 'corroborated', ['corroded', 'correlated', 'corralled'], 'Corroborate means confirm with extra evidence.'),
  item('c2v08', 'vocabulary', 'His apology did little to _____ the damage.', 'mitigate', ['militate', 'migrate', 'mediate the harm of'], 'Mitigate means make something bad less severe.'),
  item('c2v09', 'vocabulary', 'The clause is _____ . It can be read in two ways.', 'ambiguous', ['ambivalent', 'amphibious', 'ambient'], 'Ambiguous means open to more than one interpretation.'),
  item('c2v10', 'vocabulary', 'She gave a _____ account, with every step in order.', 'lucid', ['lurid', 'languid', 'latent'], 'Lucid means clear and easy to follow.'),
  item('c2g01', 'grammar', 'No sooner _____ the contract than the client changed the brief.', 'had we signed', ['we had signed', 'did we signed', 'have we signed'], 'No sooner is followed by inversion and the past perfect.'),
  item('c2g02', 'grammar', '_____ it not for the grant, the lab would have closed.', 'Were', ['Was', 'Had', 'If were'], 'Were it not for is the inverted form of If it were not for.'),
  item('c2g03', 'grammar', 'The director insisted that every report _____ checked.', 'be', ['is', 'was', 'would be'], 'Insist that can take the present subjunctive, the base form be.'),
  item('c2g04', 'grammar', '_____ been warned, they still entered the building.', 'Having', ['Have', 'Been', 'Had they'], 'Having been warned is a perfect passive participle clause.'),
  item('c2g05', 'grammar', 'Little _____ that the letter would change everything.', 'did she realise', ['she realised', 'she did realise', 'realised she'], 'Little at the start of the sentence causes inversion.'),
  item('c2g06', 'grammar', 'So complex _____ that few specialists understand it.', 'is the theory', ['the theory is', 'does the theory', 'the theory does'], 'So + adjective at the start inverts the verb and the subject.'),
  item('c2g07', 'grammar', 'I’d sooner you _____ the draft before sending it.', 'read', ['will read', 'to read', 'reading'], 'Would sooner plus another person uses the past simple for a present preference.'),
  item('c2g08', 'grammar', 'Under no circumstances _____ the archive be moved.', 'should', ['it should', 'should it not to', 'it must'], 'Under no circumstances is followed by inversion: should the archive be moved.'),
  item('c2g09', 'grammar', 'The novel is said _____ in a single month.', 'to have been written', ['to be written it', 'having written', 'to have writing'], 'Is said to have been written reports a finished passive action.'),
  item('c2g10', 'grammar', 'Not until the figures arrived _____ how serious the loss was.', 'did we see', ['we saw', 'we did see', 'saw we'], 'Not until at the start of the sentence inverts the main clause.'),
  item('c2u01', 'use-of-english', 'The scheme failed _____ a lack of local support.', 'for', ['because', 'due', 'owing'], 'Fail for plus a noun. Because needs a clause. Due and owing need to.'),
  item('c2u02', 'use-of-english', '_____ the protests, the bill was passed.', 'Notwithstanding', ['Despite of', 'Although of', 'However'], 'Notwithstanding can introduce a noun. Despite of is not standard.'),
  item('c2u03', 'use-of-english', 'She left the firm _____ that she had been overlooked.', 'on the grounds', ['in the grounds', 'by the ground', 'for the ground'], 'On the grounds that introduces a formal reason.'),
  item('c2u04', 'use-of-english', 'The two accounts are _____ with each other.', 'at odds', ['in odds', 'on odds', 'by odds'], 'At odds with means in conflict.'),
  item('c2u05', 'use-of-english', '_____ of his experience, he was offered the chair.', 'By virtue', ['In virtue', 'By means', 'In spite'], 'By virtue of means because of. In spite needs of, and the meaning would be the opposite.'),
  item('c2u06', 'use-of-english', 'The town was rebuilt _____ the earthquake.', 'in the wake of', ['in the way of', 'at the wake', 'on the wake of'], 'In the wake of means after and as a result of.'),
  item('c2u07', 'use-of-english', 'Rarely _____ such a complete set of letters.', 'does one find', ['one finds', 'one does find', 'finds one'], 'Rarely at the start causes inversion.'),
  item('c2u08', 'use-of-english', 'The committee is _____ to announcing the shortlist.', 'committed', ['committing', 'commitment', 'commit'], 'Be committed to is followed by a noun or -ing.'),
  item('c2u09', 'use-of-english', 'Nothing short _____ a full apology will do.', 'of', ['from', 'than', 'off'], 'Nothing short of means only this thing will be enough.'),
  item('c2u10', 'use-of-english', 'The claim does not stand _____ to scrutiny.', 'up', ['on', 'by', 'out'], 'Stand up to scrutiny means remain convincing when examined.'),
  item('c2p01', 'phrases', 'The scandal _____ a change of leadership.', 'brought about', ['brought up', 'brought off', 'brought around'], 'Bring about means cause.'),
  item('c2p02', 'phrases', 'Researchers have yet to _____ a convincing explanation.', 'come up with', ['come down with', 'come out with it to', 'come across'], 'Come up with means produce an idea or explanation.'),
  item('c2p03', 'phrases', 'Old rivalries _____ during the negotiations.', 'came to the fore', ['came to the front', 'came to the force', 'came to the four'], 'Come to the fore means become important and noticeable.'),
  item('c2p04', 'phrases', 'The minister tried to _____ the criticism.', 'brush aside', ['brush up', 'brush off it', 'brush over with'], 'Brush aside means refuse to consider something seriously.'),
  item('c2p05', 'phrases', 'We cannot _____ the possibility of fraud.', 'rule out', ['rule off', 'rule up', 'rule over'], 'Rule out means exclude a possibility.'),
  item('c2p06', 'phrases', 'The policy has _____ the people it was meant to help.', 'let down', ['let off', 'let up', 'let on'], 'Let down means disappoint.'),
  item('c2p07', 'phrases', 'She _____ a rare first edition in a second-hand shop.', 'stumbled upon', ['stumbled over', 'stumbled into', 'stumbled across with'], 'Stumble upon means find something by chance.'),
  item('c2p08', 'phrases', 'The talks _____ after three days with no agreement.', 'broke down', ['broke off', 'broke out', 'broke up'], 'Break down means fail and stop. It is used for talks, plans and machines.'),
  item('c2p09', 'phrases', 'Reviewers tend to _____ the smallest inconsistency.', 'home in on', ['home in at', 'hone in on', 'home on in'], 'Home in on means direct attention towards something. Hone means sharpen, so hone in is a common mix-up.'),
  item('c2p10', 'phrases', 'The new evidence _____ the earlier theory.', 'flies in the face of', ['flies in the front of', 'flies on the face of', 'flies at the face of'], 'Fly in the face of means directly contradict.'),
];

export function getQuizGameBank(level) {
  const slug = LEVELS.includes(String(level || '').toLowerCase())
    ? String(level).toLowerCase()
    : 'b2';
  const questions =
    slug === 'a2'
      ? A2_QUIZ_QUESTIONS
      : slug === 'b1'
        ? B1_QUIZ_QUESTIONS
        : slug === 'c1'
          ? C1_QUIZ_QUESTIONS
          : slug === 'c2'
            ? C2_QUIZ_QUESTIONS
            : QUIZ_GAME_QUESTIONS;
  return { level: slug, categories: QUIZ_GAME_CATEGORIES, questions };
}
