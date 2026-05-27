/** Prompts OpenAI para ejercicios situacionales (vía /api/dralo-ai/chat). */

export function buildSituationalGeneratePrompt(mode, scenarioId, level, options = {}) {
  const L = level || 'B2';
  const seed = options.varietySeed ?? Date.now();
  const custom = options.customBrief?.trim() || '';

  const speakingCustom = custom
    ? `Student situation request: "${custom}". Build a role-play brief they will practise with a voice coach.`
    : '';

  const prompts = {
    speaking: `Create a ${L} role-play BRIEF (not the dialogue itself) for scenario "${scenarioId}".
${speakingCustom}
Return ONLY JSON:
{"title":"...","setting":"one line","yourRole":"who the AI plays","studentRole":"who the student plays","objectives":["3 short goals"],"keyPhrases":["4 useful phrases"],"starter":"first line the AI says to begin"}`,
    writing: {
      'sms-whatsapp': `Create ONE ${L} WhatsApp-style writing task. The student must write short chat messages using natural acronyms (OMG, BTW, FYI, IDK, etc.) where appropriate.
Return ONLY JSON:
{"format":"whatsapp","title":"Chat title","context":"who is chatting and why","chatThread":[{"from":"them","text":"incoming message"},{"from":"them","text":"another message"}],"task":"what the student must write (1-3 messages)","register":"informal","acronymHints":["BTW","FYI"],"wordMin":20,"wordMax":80}`,
      'work-email': `Create ONE ${L} professional email writing task (work context).
Return ONLY JSON:
{"format":"email","title":"...","recipient":"...","subject":"...","situation":"...","bulletPoints":["must include"],"register":"formal|semi-formal","wordMin":80,"wordMax":180}`,
      article: `Create ONE ${L} article or blog post writing task (not exam essay — real publication style).
Return ONLY JSON:
{"format":"article","title":"...","audience":"...","angle":"...","bulletPoints":["..."],"wordMin":120,"wordMax":220}`,
      'social-post': `Create ONE ${L} social media post task (LinkedIn/Instagram style).
Return ONLY JSON:
{"format":"social","platform":"...","title":"...","prompt":"...","hashtags":["optional"],"wordMin":40,"wordMax":120}`,
      'formal-letter': `Create ONE ${L} formal letter task (complaint, application, or request).
Return ONLY JSON:
{"format":"letter","title":"...","addressee":"...","situation":"...","bulletPoints":["..."],"register":"formal","wordMin":100,"wordMax":200}`,
    },
    listening: {
      'airport-announcement': `Create ONE ${L} listening task: airport/public announcement (monologue). Script 80-120 words + 2 comprehension questions.
Return ONLY JSON:
{"title":"...","setting":"airport","script":"single speaker announcement (no A/B labels)","questions":[{"id":"q1","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]},{"id":"q2","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"..."},{"id":"q2","answer":"..."}]}`,
      'podcast-snippet': `Create ONE ${L} listening: casual podcast excerpt, two speakers optional, 90-130 words script + 2 MCQ.
Format script as A:/B: lines if dialogue, else monologue.
Return ONLY JSON with title, setting, script, questions, modelAnswers.`,
      'customer-service': `Create ONE ${L} listening: customer service phone call, script with A: customer B: agent, 90-130 words + 2 questions.
Return ONLY JSON.`,
      'news-bulletin': `Create ONE ${L} listening: short news bulletin monologue 80-110 words + 2 questions.
Return ONLY JSON.`,
      'work-meeting': `Create ONE ${L} listening: excerpt from a work meeting, 2-3 speakers as A:/B: lines, 100-140 words + 2 questions.
Return ONLY JSON.`,
    },
    reading: {
      'travel-blog': `Create ONE ${L} reading: travel blog post 150-200 words + 2 comprehension MCQ (authentic web style, not exam gapped text).
Return ONLY JSON with title, passage, questions, modelAnswers.`,
      'job-adverts': `Create ONE ${L} reading: 2 short job adverts + matching/comparison questions (2 MCQ).
Return ONLY JSON.`,
      'product-reviews': `Create ONE ${L} reading: 2 product reviews + 2 MCQ questions.
Return ONLY JSON.`,
      'social-thread': `Create ONE ${L} reading: social media thread or comment chain 120-180 words + 2 questions.
Return ONLY JSON.`,
      'how-to-guide': `Create ONE ${L} reading: practical how-to guide 150-190 words + 2 questions.
Return ONLY JSON.`,
    },
    'use-of-english': {
      'work-email-uoe': `Create ONE ${L} use-of-english in context: professional email with ONE grammar/vocabulary gap (open cloze style) embedded in a short email body.
Return ONLY JSON:
{"instruction":"...","context":"email excerpt","textBefore":"...","textAfter":"...","modelAnswer":"one word","briefTip":"..."}`,
      'signs-notices': `Create ONE ${L} task: public sign/notice comprehension with ONE gap (word formation or open cloze) plus brief context.
Return ONLY JSON like use-of-english open cloze plus "setting":"sign/notice".`,
      'chat-messages': `Create ONE ${L} task: informal chat thread with ONE grammar gap.
Return ONLY JSON open cloze style with chat context.`,
      'workplace-memo': `Create ONE ${L} workplace memo with ONE key-word transformation or open cloze.
Return ONLY JSON.`,
      'form-filling': `Create ONE ${L} form-filling task: short form text with ONE gap.
Return ONLY JSON open cloze style.`,
    },
  };

  if (mode === 'writing' && prompts.writing[scenarioId]) {
    return `${prompts.writing[scenarioId]}\nVariety seed: ${seed}.`;
  }
  if (mode === 'listening' && prompts.listening[scenarioId]) {
    return `${prompts.listening[scenarioId]}\nVariety seed: ${seed}.`;
  }
  if (mode === 'reading' && prompts.reading[scenarioId]) {
    return `${prompts.reading[scenarioId]}\nVariety seed: ${seed}.`;
  }
  if (mode === 'use-of-english' && prompts['use-of-english'][scenarioId]) {
    return `${prompts['use-of-english'][scenarioId]}\nVariety seed: ${seed}.`;
  }

  return `Create a ${L} situational ${mode} exercise for "${scenarioId}". Variety seed: ${seed}. Return useful JSON for a learning app.`;
}
