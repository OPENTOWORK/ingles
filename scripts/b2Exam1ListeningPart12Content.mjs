/**
 * B2 Exam 1 — Listening Part 3 (Dralo part 12): five speakers, multiple matching Q19–23.
 * Cambridge-style: paraphrased A–H pool, functional distractors, ~80–95 words per speaker.
 */

export const B2_EXAM1_PART12_DIRECTIONS =
  'Part:12\r\n\r\nYou will hear five people talking about their first experiences of paid work. For questions 19–23, choose from the list (A–H) the opinion each speaker expresses. Use the letters only once. There are three extra letters which you do not need to use.';

export const B2_EXAM1_PART12 = {
  partTitle: 'Part 3: Multiple matching (speakers)',
  title: 'First Jobs, First Lessons',
  setting: 'Five speakers describe what they learned from their first paid job.',
  directions:
    'You will hear five people talking about their first experiences of paid work. For questions 19–23, choose from the list (A–H) the opinion each speaker expresses. Use the letters only once. There are three extra letters which you do not need to use.',
  optionPool: [
    'A) feeling disappointed because the job offered fewer learning opportunities than expected',
    'B) being given more responsibility than they had anticipated',
    'C) learning to stay patient when dealing with rude or unreasonable people',
    'D) discovering that getting on with colleagues mattered more than working quickly',
    'E) finding that repetitive tasks became oddly satisfying after a while',
    'F) wishing they had asked for advice before accepting the position',
    'G) recognising that the experience changed their ideas about future study or careers',
    'H) feeling physically exhausted by work they had not taken seriously before',
  ],
  matchingAnswers: [
    { number: 19, answer: 'C' },
    { number: 20, answer: 'H' },
    { number: 21, answer: 'B' },
    { number: 22, answer: 'E' },
    { number: 23, answer: 'G' },
  ],
  questions: [
    { number: 19, prompt: 'Speaker 1' },
    { number: 20, prompt: 'Speaker 2' },
    { number: 21, prompt: 'Speaker 3' },
    { number: 22, prompt: 'Speaker 4' },
    { number: 23, prompt: 'Speaker 5' },
  ],
  speakers: [
    {
      number: 1,
      /** Key C — patience with rude customers. Hints: A (fewer skills learnt), D (team/colleagues). */
      text: `I took a summer job in a busy city café when I was seventeen. I'd imagined I'd pick up proper barista skills and maybe even learn something about running a small business, but honestly most shifts were about surviving the lunch rush rather than developing new talents. The hardest part was keeping calm when customers complained about trivial things — wrong milk, a ten-minute wait, a receipt they'd already thrown away. What surprised me was how much the team mattered: we could be under pressure, yet staying polite to each other made the whole shift bearable, even when the manager wanted everything cleared quickly. Nobody prepares you for that kind of emotional strain when every table seems to need something at once.`,
    },
    {
      number: 2,
      /** Key H — physical exhaustion, hadn't taken job seriously. Hint: F (should have asked cousin). */
      text: `My cousin helped me get holiday work in a furniture warehouse, and I didn't really ask him what the days were like — I just assumed moving boxes would be easy. On paper it sounded fine: loading lorries and checking labels. What shocked me was how heavy everything felt by mid-afternoon. I'd always joked about people who moaned after "just moving things around", yet after three days my back ached and I could barely stay awake on the bus home. My parents had warned me it would be tiring, but I waved them off. I now respect anyone who does that work year round, though I still wish I'd listened properly before I said yes.`,
    },
    {
      number: 3,
      /** Key B — more responsibility than expected. Hint: F (ignored friends' advice). */
      text: `My first paid job was as a junior leader at a children's activity camp. I expected to assist with games and stay quietly in the background while the head leader took charge. Instead she fell ill for two days and I had to run an afternoon programme for twenty primary-school children on my own. I was terrified at first, but by the second day I felt proud that parents trusted me to look after their kids properly. A friend who'd worked at the camp the previous year had told me to think carefully before accepting, but I was so keen to earn money that I didn't really take her advice on board. It was the first time an employer — even a temporary one — had treated me like an adult.`,
    },
    {
      number: 4,
      /** Key E — repetitive tasks satisfying. Hints: A (expected more management learning), D (speed vs satisfaction). */
      text: `I spent six weeks stacking shelves in a supermarket before university. At first I hated the monotony: same aisles, same products, same instructions from a supervisor who wanted everything done quickly. I honestly thought the job would teach me more about how shops are managed, and I felt a bit let down when it didn't. Yet after a couple of weeks something changed. I started noticing patterns, working faster without thinking, and actually enjoying the moment when a messy section looked neat again. It was strange to feel satisfied by something so ordinary, but it made the shift go surprisingly quickly, even though my colleagues and I sometimes grumbled about the pace we were expected to keep.`,
    },
    {
      number: 5,
      /** Key G — career path changed. Hints: A (fewer creative opportunities), D (friendly colleagues). */
      text: `I worked as a temporary assistant in a small architecture firm because I thought design sounded glamorous. Mostly I answered phones and sorted digital files, and I soon realised the role offered far fewer creative opportunities than I'd expected when I applied. The team in the open-plan office were friendly, though, and we often stayed late chatting over projects, which mattered more to me than rushing home the moment the clock struck five. Listening to senior staff explain why a scheme would not work taught me more than any school brochure. I discovered I liked the analytical side of planning, not drawing buildings, and that experience pushed me towards studying engineering instead.`,
    },
  ],
};

export function buildPart12GeneratedPayload({ revision = 'v3' } = {}) {
  const { speakers, optionPool, matchingAnswers, questions, setting, directions, partTitle, title } =
    B2_EXAM1_PART12;

  const script = speakers
    .map((s) => `Speaker ${s.number}:\n${s.text}`)
    .join('\n\n');

  const modelAnswers = matchingAnswers.map((row) => ({
    id: row.number,
    answer: row.answer,
  }));

  return {
    partTitle,
    title,
    directions,
    setting,
    script,
    optionPool,
    matchingAnswers,
    questions,
    modelAnswers,
    audioClips: speakers.map((s) => ({
      orden: s.number,
      titulo: `Speaker ${s.number}`,
      text: s.text,
      storagePath: `b2/exam-1/part-12/speaker-${String(s.number).padStart(2, '0')}.mp3`,
    })),
    combinedStoragePath: `b2/exam-1/part-12/full-${revision}.mp3`,
  };
}
