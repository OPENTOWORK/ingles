/**
 * B2 Exam 1 — Listening Part 2 (Dralo part 11), mountain rescue / Elena.
 * Modelled on Cambridge FCE Listening Part 2: one continuous monologue, gap sentences
 * that paraphrase in third-person summary style; 1–3 word answers heard literally.
 */

export const B2_EXAM1_PART11_DIRECTIONS =
  'Part:11\r\n\r\nYou will hear a woman called Elena talking about the training that new mountain rescue volunteers receive. For questions 9–18, complete the sentences with a word or short phrase.';

export const B2_EXAM1_PART11 = {
  partTitle: 'Listening Part 2: Sentence completion',
  title: 'Mountain rescue volunteer training',
  setting: 'A talk about preparing new members of a mountain rescue team.',
  directions:
    'You will hear a woman called Elena talking about the training that new mountain rescue volunteers receive. For questions 9–18, complete the sentences with a word or short phrase.',
  answerKey: {
    9: 'fitness',
    10: 'navigation',
    11: 'whistle',
    12: 'first aid',
    13: 'waterproof',
    14: 'helicopter',
    15: 'voluntary',
    16: 'steep',
    17: 'visibility',
    18: 'confidence',
  },
  /**
   * Cambridge-style gap sentences: third-person summary, heavy paraphrase, B2 grammar.
   * Each lead includes the (N) ___ marker inline.
   */
  questions: [
    {
      number: 9,
      lead:
        'Elena makes it clear that no one is allowed to join the team until they have passed a demanding annual (9) ___ test.',
    },
    {
      number: 10,
      lead:
        'Before volunteers go out on the hills, classroom sessions focus on map work and other basic (10) ___ skills.',
    },
    {
      number: 11,
      lead:
        'On exposed ridges, where shouting is useless, each member is expected to carry a (11) ___ .',
    },
    {
      number: 12,
      lead:
        'During their first few months, every trainee must obtain an accredited (12) ___ qualification.',
    },
    {
      number: 13,
      lead:
        'Elena insists that clothing taken on exercises has to be completely (13) ___ , even when the weather looks mild.',
    },
    {
      number: 14,
      lead:
        'When a casualty cannot be moved on foot, the team may have to arrange a (14) ___ evacuation.',
    },
    {
      number: 15,
      lead:
        'She points out that senior coordinators are unpaid and the whole service runs on a (15) ___ basis.',
    },
    {
      number: 16,
      lead:
        'Most rope practice takes place on (16) ___ ground, where a simple slip could have serious consequences.',
    },
    {
      number: 17,
      lead:
        'A large number of call-outs occur when mist or sleet reduces (17) ___ to almost nothing.',
    },
    {
      number: 18,
      lead:
        'Many recruits say that by the end of the course they feel much greater (18) ___ on the mountains.',
    },
  ],
  /**
   * One continuous monologue (~450 words). Natural B2 spoken English; answers 9→18 in order.
   * Wording deliberately differs from the gap sentences above.
   */
  script: `My name's Elena Mendez, and I coordinate training for our mountain rescue volunteers — basically I'm the person who has to decide whether newcomers are actually ready before we let them anywhere near the fells. People imagine it's all helicopters and drama, but honestly most of what we do is preparation, and a surprising amount of that happens indoors.

We're quite strict about who gets on the team. We don't take shortcuts. Every new recruit has to get through a demanding annual fitness test before we issue any kit at all — and I mean everyone, regardless of how fit they think they are. If you can't pass it, you're not going out on a call, simple as that.

Once people are in, the classroom work comes first. We spend hours on navigation — proper map reading, using a compass when the path disappears, planning a route you can actually follow when the cloud comes down. It sounds basic, but you'd be amazed how many capable walkers panic the moment the weather turns.

Out on the hill, communication's another thing we drill constantly. When you're on an exposed ridge and the wind's tearing at your hood, shouting is pointless — so every volunteer carries a whistle, something simple that won't let you down when the radios crackle and die.

Medical training isn't optional either. Within the first term, each trainee has to qualify with an accredited first aid certificate. You might be three hours from the nearest road with someone who's injured, so those skills matter as much as knowing which path to take.

We also inspect kit before every exercise. Nothing goes into a pack unless it's fully waterproof — and I don't mean shower-resistant, I mean the sort of gear that keeps you dry on an open slope in summer drizzle that would soak through cotton in minutes.

When injuries are genuinely serious, walking someone down isn't always realistic. On the worst call-outs we've had to request a helicopter from the coastguard, especially where the ground's too steep to stretcher a casualty safely.

People often ask whether team leaders get paid for coordinating all this. They don't — coordinators work on a voluntary basis, the same as everyone else on the roster. It's weekends and evenings given up because the community matters, not because there's a salary attached.

Rope work is something we practise again and again, mainly on steep terrain where one slip would have serious consequences. Flatter ground might feel safer, but it doesn't teach you what you need when someone's hanging on the line.

And visibility — honestly, that's what catches newer volunteers out. So many of our call-outs happen in poor visibility, when you know the area on a sunny day but fog or sleet means you can't see twenty metres ahead.

What do people take away from the course? Most recruits tell us the training gave them more confidence when they're up on their own in the hills. They still respect the risks — they're not reckless — but they feel ready to help when it counts.

That's really what we're trying to build — competent volunteers who won't become casualties themselves.`,
};

export function buildPart11GeneratedPayload({ script = B2_EXAM1_PART11.script, storagePath } = {}) {
  const { questions, answerKey, setting, directions, partTitle, title } = B2_EXAM1_PART11;
  const modelAnswers = Object.entries(answerKey).map(([n, answer]) => ({
    number: Number(n),
    answer,
  }));

  return {
    partTitle,
    title,
    directions,
    setting,
    script,
    questions: questions.map((q) => ({
      number: q.number,
      lead: q.lead,
      prompt: q.lead,
      type: 'short',
    })),
    modelAnswers,
    audioClips: [
      {
        orden: 1,
        titulo: 'Elena — mountain rescue training (talk)',
        text: script,
        storagePath: storagePath || 'b2/exam-1/part-11/clip-01-v6.mp3',
      },
    ],
  };
}
