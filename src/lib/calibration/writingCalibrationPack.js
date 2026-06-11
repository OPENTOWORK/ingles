/**
 * Writing Calibration Pack — real anonymised student writings.
 *
 * SERVER-ONLY. Never import from client components. Only server-side code
 * (e.g. `src/lib/cambridgeEssayFeedback.js`) may import this module.
 *
 * IMPORTANT: `studentText` keeps the student's original errors on purpose —
 * they are exactly what we use to calibrate Dralo. Do NOT correct them.
 * Personal data has been anonymised with placeholders like [place], [region].
 *
 * NOT yet injected into the real correction prompt.
 */

if (typeof window !== 'undefined') {
  throw new Error('writingCalibrationPack is server-only and must not be imported from client components.');
}

export const WRITING_CALIBRATION_PACK = [
  {
    id: 'wcp-001',
    levelTarget: 'B2',
    estimatedLevel: 'B1',
    taskType: 'essay',
    taskPrompt: 'Fast food is always a bad thing to eat. Do you agree? Give reasons for your answer.',
    studentText: `Nowadays, fast food is very typical. There are some people who eate it and others who prefer not eat it. Fast food have many advantages and disadvantages.

On one hand, is very cheep, so you can eat without spending a lot of money. It can also save when you haven't anything to eat. For example, when you are traveling in the car and you have to stop to eat.

In the other hand, the food can be contaminated. Besides, is not healthy, so is not good to eat in many moments. A example of that is when yo eat daily in fast food chains and you start getting fat.

In conclusion, eat fast food have many good and bad things, so we have to think about this, when we can it and when we don't have to eat it.`,
    wordCount: 139,
    mainStrengths: [
      'The student gives both advantages and disadvantages.',
      'There is a basic essay structure with introduction, two body paragraphs and conclusion.',
      'The opinion is understandable, although not fully developed.',
    ],
    mainProblems: [
      'Frequent basic grammar errors make the writing sound below B2.',
      'Several sentences are incomplete or unnatural.',
      'The argument is simple and not developed enough for a strong B2 answer.',
      'There are spelling mistakes and problems with articles, subject-verb agreement and word order.',
    ],
    commonMistakes: [
      'Fast food have → fast food has',
      'is very cheep → it is very cheap',
      'prefer not eat it → prefer not to eat it',
      'In the other hand → On the other hand',
      'A example → An example',
      'when yo eat → when you eat',
    ],
    estimatedScores: {
      content: 3,
      communicativeAchievement: 2,
      organisation: 2,
      language: 1,
    },
    errorCategories: [
      'subject-verb agreement',
      'articles',
      'spelling',
      'word order',
      'grammar',
      'task response',
    ],
    idealFeedbackStyle:
      'Be supportive but strict. Do not call this B2. Explain that the student has ideas and structure, but the language control is still around B1.',
    improvedVersionCurrentLevel: `Nowadays, fast food is very common. Some people eat it often, while others prefer not to eat it. Fast food has both advantages and disadvantages.

On the one hand, it is usually very cheap, so people can eat without spending a lot of money. It can also be useful when you do not have anything else to eat. For example, if you are travelling by car, it is easy to stop and buy fast food.

On the other hand, fast food can sometimes be unhealthy or badly prepared. It often contains too much fat, salt and sugar. An example of this is when people eat in fast food restaurants every day and start to gain weight.

In conclusion, fast food has some good and bad points. However, we should think carefully about when we eat it and try not to eat it too often.`,
    strongerB2Version: null,
    whatNotToOvercorrect: [
      'Do not rewrite it as a polished C1 essay.',
      'Do not remove the simple structure completely.',
      'Do not inflate the level just because the essay has paragraphs.',
      'Focus on basic sentence control before advanced vocabulary.',
    ],
  },
  {
    id: 'wcp-002',
    levelTarget: 'B2',
    estimatedLevel: 'low B2',
    taskType: 'essay',
    taskPrompt: 'Fast food is always a bad thing to eat. Do you agree? Give reasons for your answer.',
    studentText: `Nowadays, fast food has become an important part of modern life. Many people consume it because it is quick, cheap and available almost everywhere.

However, it is often argue that fast food is always a bad option to eat.

On the one hand, it is undeniable that fast food is extremely convenient. For example, students can get a meal in just a few minutes, which saves a lot of time. In addition, it is usually cheaper than cooking at home or eating in a restaurant. Therefore, it is easy to understand why people choose it regularly.

On the other hand, fast food is often prepared with low quality ingredients. Moreover, it contains too much sugar and salt, which can lead a serious health problems. Furthermore, food contamination is another risk, since these products are cooked in large quantities and sometimes not stored properly.

To sum up, although fast food is convenient, the negative effects on health and the possible contamination make it a bad choice. Consequently, people should try to eat homemade and balanced meals when it is possible.`,
    wordCount: 179,
    mainStrengths: [
      'The essay is clearly organised into introduction, arguments and conclusion.',
      'The student uses appropriate linking expressions such as however, on the one hand, on the other hand and to sum up.',
      'The answer is relevant and gives clear reasons.',
    ],
    mainProblems: [
      'There are still some grammar errors that stop it from being a strong B2.',
      'Some phrases are unnatural or slightly inaccurate.',
      'The argument is clear, but the opinion could be expressed more directly.',
    ],
    commonMistakes: [
      'it is often argue → it is often argued',
      'low quality ingredients → low-quality ingredients',
      'can lead a serious health problems → can lead to serious health problems',
      'when it is possible → whenever possible',
    ],
    estimatedScores: {
      content: 4,
      communicativeAchievement: 4,
      organisation: 4,
      language: 3,
    },
    errorCategories: ['verb tense', 'grammar', 'vocabulary', 'prepositions', 'articles'],
    idealFeedbackStyle:
      'Treat this as low B2. Praise the organisation and clarity, but point out that language accuracy still needs work before it becomes solid B2.',
    improvedVersionCurrentLevel: `Nowadays, fast food has become an important part of modern life. Many people consume it because it is quick, cheap and available almost everywhere.

However, it is often argued that fast food is not a good option to eat regularly.

On the one hand, it is undeniable that fast food is extremely convenient. For example, students can get a meal in just a few minutes, which saves a lot of time. In addition, it is usually cheaper than cooking at home or eating in a restaurant. Therefore, it is easy to understand why people choose it regularly.

On the other hand, fast food is often prepared with low-quality ingredients. Moreover, it contains too much sugar and salt, which can lead to serious health problems. Furthermore, food contamination is another risk, since these products are cooked in large quantities and are sometimes not stored properly.

To sum up, although fast food is convenient, its negative effects on health and the possible risk of contamination make it a bad choice. Consequently, people should try to eat homemade and balanced meals whenever possible.`,
    strongerB2Version: `Fast food has become a normal part of modern life because it is quick, affordable and available almost everywhere. Although it can be useful in some situations, I believe it should not be eaten regularly.

One clear advantage is convenience. Students and workers can buy a meal in only a few minutes, which saves time on busy days. It is also often cheaper than cooking at home or eating in a restaurant, so it is easy to understand why many people choose it.

However, fast food is often made with low-quality ingredients and contains too much salt, sugar and fat. This can lead to serious health problems if people eat it too often. There is also a risk of poor food hygiene when meals are prepared quickly and in large quantities.

In conclusion, fast food can be useful occasionally, but its disadvantages are more serious than its benefits. People should try to choose healthier, homemade meals whenever possible.`,
    whatNotToOvercorrect: [
      'Do not lower the level too much; this is stronger than B1.',
      'Do not replace all simple language with advanced vocabulary.',
      'Keep the clear organisation.',
      'Focus feedback on accuracy and more natural phrasing.',
    ],
  },
  {
    id: 'wcp-003',
    levelTarget: 'B2',
    estimatedLevel: 'B1+',
    taskType: 'email',
    taskPrompt:
      'Your English-speaking friend Chris is planning to visit your country. Write an email answering their questions about the best time to visit, places to go, places to avoid and what to bring.',
    studentText: `Hi Chris!

I'm too excited to answer all your questions! It is been a long time since the last time we talk together. I can remember it, it was summer of the last year. It is amazing that we will be together in a couple months! That's why I recommend you to come here in summer, the weather is perfect and also in this time of the year we have many tradition festivities to enjoy. The best places to visit in [country] on summer are the coast mediterranean zones, like [place], [place] and [place]. But, if you want a fresher weather, coming to [place], [place], [place] or [region] are a good choice. My favourite one is [region], obviously because is where I exactly live and also because you have in one way beautiful beaches and in the other one big mountains. In my opinion, you should avoid very touristic places like [place], there, many people goes because of the hype that is creates. Going to more unusual places is a good option too in those places you could feel more relax and also services are going to be cheaper. I think that you don't have to bring me nothing, because the best present is going to see you again.

Bye!`,
    wordCount: 210,
    mainStrengths: [
      'The student answers the main points of the task.',
      'The tone is friendly and suitable for an informal email.',
      'There are some good attempts to give reasons and personal recommendations.',
    ],
    mainProblems: [
      'The answer is too long for a typical B2 writing task.',
      'There are frequent grammar and word choice errors.',
      'Some sentences are too long and need clearer punctuation.',
      'There are several unnatural phrases and direct translations from Spanish.',
    ],
    commonMistakes: [
      'It is been → It has been',
      'we talk together → we talked',
      'summer of the last year → last summer',
      'in a couple months → in a couple of months',
      'tradition festivities → traditional festivals',
      'on summer → in summer',
      'a fresher weather → cooler weather',
      'many people goes → many people go',
      'you don’t have to bring me nothing → you don’t have to bring me anything',
    ],
    estimatedScores: {
      content: 4,
      communicativeAchievement: 3,
      organisation: 3,
      language: 2,
    },
    errorCategories: [
      'verb tense',
      'word order',
      'vocabulary',
      'grammar',
      'subject-verb agreement',
      'register',
      'prepositions',
    ],
    idealFeedbackStyle:
      'Encourage the student because the message is communicative and friendly, but be strict about accuracy, sentence control and word limit.',
    improvedVersionCurrentLevel: `Hi Chris!

I'm really excited to answer all your questions. It has been a long time since we last talked, and I can't wait to see you again.

I recommend coming in summer because the weather is usually good and there are many traditional festivals to enjoy. If you like the coast, there are lots of beautiful places to visit. However, if you prefer cooler weather, you could go to the north of the country. My favourite area is [region] because it has both beaches and mountains.

In my opinion, you should avoid very touristy places because they can be crowded and expensive. It is better to visit quieter places, where you can relax more and spend less money.

You don't need to bring me anything. The best present will be seeing you again!

Bye!`,
    strongerB2Version: `Hi Chris!

I'm really excited to hear that you're coming to visit. It has been ages since we last saw each other, so it will be great to spend some time together again.

I think the best time to come is summer because the weather is usually warm and there are plenty of traditional festivals. If you enjoy the beach, the coast would be a great choice. However, if you prefer cooler weather and beautiful landscapes, I would recommend visiting the north, especially [region], where you can find both beaches and mountains.

I would avoid the most touristy places because they are often crowded and expensive. Instead, we could visit some quieter areas, where it is easier to relax and enjoy the local atmosphere.

You don't need to bring anything special, just comfortable clothes and maybe a light jacket. The best present will be seeing you again!

Bye!`,
    whatNotToOvercorrect: [
      'Do not remove the friendly informal tone.',
      'Do not make the email sound too formal.',
      'Do not ignore the word limit problem.',
      'Focus on sentence control, common tense errors and natural informal expressions.',
    ],
  },
];

export default WRITING_CALIBRATION_PACK;
