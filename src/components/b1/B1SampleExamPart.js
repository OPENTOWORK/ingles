'use client';

import { Fragment, useMemo, useState } from 'react';
import B2WritingLongFormAiPanel from '@/components/b2/B2WritingLongFormAiPanel';
import ExamListeningAudioPlayer from '@/components/b2/ExamListeningAudioPlayer';
import { B1_SAMPLE_TEST_1_SOURCE, buildB1WritingTaskText } from '@/data/b1PreliminarySampleTest1';
import styles from './B1SampleExamPart.module.css';

const GAP_SPLIT = /\[\[(\d+)\]\]/;

function cx(...names) {
  return names.filter(Boolean).join(' ');
}

function normalizeAnswer(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAnswerKey(part) {
  if (part.answers) return part.answers;
  return Object.fromEntries(
    (part.questions || []).filter((q) => q.answer).map((q) => [q.number, q.answer]),
  );
}

function isAnswerCorrect(expected, value) {
  if (Array.isArray(expected)) {
    const answer = normalizeAnswer(value);
    return Boolean(answer) && expected.some((accepted) => normalizeAnswer(accepted) === answer);
  }
  return String(value || '').toUpperCase() === String(expected || '').toUpperCase();
}

function formatExpected(expected) {
  return Array.isArray(expected) ? expected.slice(0, 2).join(' / ') : String(expected || '');
}

function useAnswerSheet(part) {
  const key = useMemo(() => buildAnswerKey(part), [part]);
  const numbers = useMemo(
    () => Object.keys(key).map(Number).sort((a, b) => a - b),
    [key],
  );
  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);

  const results = useMemo(
    () => Object.fromEntries(numbers.map((n) => [n, isAnswerCorrect(key[n], values[n])])),
    [numbers, key, values],
  );

  return {
    key,
    values,
    checked,
    results,
    total: numbers.length,
    score: numbers.filter((n) => results[n]).length,
    answeredCount: numbers.filter((n) => String(values[n] ?? '').trim()).length,
    setValue: (n, value) => setValues((prev) => ({ ...prev, [n]: value })),
    check: () => setChecked(true),
    reset: () => {
      setValues({});
      setChecked(false);
    },
    status: (n) => (checked ? (results[n] ? 'ok' : 'ko') : null),
  };
}

function questionRangeLabel(part) {
  if (part.kind === 'writing-choice') {
    const numbers = part.tasks.map((t) => t.number);
    return `Questions ${Math.min(...numbers)}–${Math.max(...numbers)}`;
  }
  const { questionStart, questionCount } = part;
  if (!questionStart || !questionCount) return null;
  if (questionCount === 1) return `Question ${questionStart}`;
  return `Questions ${questionStart}–${questionStart + questionCount - 1}`;
}

function Rubric({ part }) {
  const range = questionRangeLabel(part);
  if (!range && !part.directions) return null;
  return (
    <div className={styles.rubric}>
      {range ? <p className={styles.rubricRange}>{range}</p> : null}
      {part.directions ? <p className={styles.rubricText}>{part.directions}</p> : null}
    </div>
  );
}

function CheckBar({ sheet, hideFeedback, lang }) {
  if (hideFeedback || !sheet.total) return null;
  const en = lang !== 'es';
  return (
    <div className={styles.checkBar}>
      {sheet.checked ? (
        <>
          <p className={styles.score} role="status">
            {en ? 'Score' : 'Puntuación'}: {sheet.score} / {sheet.total}
          </p>
          <button type="button" className={cx(styles.button, styles.buttonGhost)} onClick={sheet.reset}>
            {en ? 'Try again' : 'Repetir'}
          </button>
        </>
      ) : (
        <button
          type="button"
          className={styles.button}
          onClick={sheet.check}
          disabled={sheet.answeredCount === 0}
        >
          {en ? 'Check answers' : 'Comprobar respuestas'}
        </button>
      )}
    </div>
  );
}

function OptionList({ number, options, sheet }) {
  const value = sheet.values[number] || '';
  const expected = sheet.key[number];
  return (
    <div className={styles.options} role="radiogroup" aria-label={`Question ${number}`}>
      {options.map((opt) => {
        const selected = value === opt.letter;
        return (
          <label
            key={opt.letter}
            className={cx(
              styles.option,
              selected && styles.optionSelected,
              sheet.checked && opt.letter === expected && styles.optionCorrect,
              sheet.checked && selected && opt.letter !== expected && styles.optionWrong,
            )}
          >
            <input
              type="radio"
              name={`b1-q${number}`}
              value={opt.letter}
              checked={selected}
              disabled={sheet.checked}
              onChange={() => sheet.setValue(number, opt.letter)}
            />
            <span className={styles.optionLetter}>{opt.letter}</span>
            <span>{opt.text}</span>
          </label>
        );
      })}
    </div>
  );
}

function GappedParagraph({ text, renderGap }) {
  const chunks = String(text).split(GAP_SPLIT);
  return (
    <p className={styles.paragraph}>
      {chunks.map((chunk, i) =>
        i % 2 === 1 ? <Fragment key={i}>{renderGap(Number(chunk))}</Fragment> : chunk,
      )}
    </p>
  );
}

function LetterGap({ number, letters, sheet, showNumber = true }) {
  const status = sheet.status(number);
  return (
    <span className={cx(styles.gap, status === 'ok' && styles.gapCorrect, status === 'ko' && styles.gapWrong)}>
      {showNumber ? <span className={styles.gapNumber}>{number}</span> : null}
      <select
        className={styles.letterSelect}
        value={sheet.values[number] || ''}
        disabled={sheet.checked}
        onChange={(e) => sheet.setValue(number, e.target.value)}
        aria-label={`Question ${number}`}
      >
        <option value="">—</option>
        {letters.map((letter) => (
          <option key={letter} value={letter}>
            {letter}
          </option>
        ))}
      </select>
      {status === 'ko' ? <span className={styles.gapKey}>{formatExpected(sheet.key[number])}</span> : null}
    </span>
  );
}

function WordGap({ number, sheet }) {
  const status = sheet.status(number);
  return (
    <span className={cx(styles.gap, status === 'ok' && styles.gapCorrect, status === 'ko' && styles.gapWrong)}>
      <span className={styles.gapNumber}>{number}</span>
      <input
        type="text"
        className={styles.gapInput}
        value={sheet.values[number] || ''}
        disabled={sheet.checked}
        onChange={(e) => sheet.setValue(number, e.target.value)}
        aria-label={`Question ${number}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {status === 'ko' ? <span className={styles.gapKey}>{formatExpected(sheet.key[number])}</span> : null}
    </span>
  );
}

function ShortTextsMcq({ part, sheet }) {
  return (
    <ol className={styles.questionList}>
      {part.questions.map((q) => (
        <li key={q.number} className={styles.question}>
          <span className={styles.questionNumber}>{q.number}</span>
          <div className={styles.questionBody}>
            <div className={cx(styles.textBox, styles[`textBox--${q.textType}`])}>
              {q.heading ? <p className={styles.textBoxHeading}>{q.heading}</p> : null}
              {(q.meta || []).map((m) => (
                <p key={m.label} className={styles.textBoxMeta}>
                  <strong>{m.label}:</strong> {m.value}
                </p>
              ))}
              <p className={styles.textBoxBody}>{q.body}</p>
            </div>
            <OptionList number={q.number} options={q.options} sheet={sheet} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Matching({ part, sheet }) {
  const letters = part.texts.map((t) => t.letter);
  return (
    <>
      <p className={styles.intro}>{part.intro}</p>
      <div className={styles.peopleGrid}>
        {part.people.map((person) => (
          <div key={person.number} className={styles.person}>
            <span className={styles.questionNumber}>{person.number}</span>
            <div>
              <p className={styles.personName}>{person.name}</p>
              <p className={styles.personText}>{person.text}</p>
            </div>
            <LetterGap number={person.number} letters={letters} sheet={sheet} showNumber={false} />
          </div>
        ))}
      </div>
      <p className={styles.textsTitle}>{part.textsTitle}</p>
      <div className={styles.textsGrid}>
        {part.texts.map((t) => (
          <div key={t.letter} className={styles.lettered}>
            <span className={styles.letterBadge}>{t.letter}</span>
            <div>
              <p className={styles.letteredTitle}>{t.title}</p>
              <p className={styles.letteredText}>{t.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ArticleCard({ title, subtitle, children }) {
  return (
    <article className={styles.card}>
      {title ? <h3 className={styles.cardTitle}>{title}</h3> : null}
      {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      {children}
    </article>
  );
}

function McqQuestions({ questions, sheet }) {
  return (
    <ol className={styles.questionList}>
      {questions.map((q) => (
        <li key={q.number} className={styles.question}>
          <span className={styles.questionNumber}>{q.number}</span>
          <div className={styles.questionBody}>
            {q.context ? <p className={styles.context}>{q.context}</p> : null}
            {q.stem ? <p className={styles.stem}>{q.stem}</p> : null}
            <OptionList number={q.number} options={q.options} sheet={sheet} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function LongTextMcq({ part, sheet }) {
  return (
    <>
      <ArticleCard title={part.title} subtitle={part.subtitle}>
        {part.paragraphs.map((text, i) => (
          <p key={i} className={styles.paragraph}>
            {text}
          </p>
        ))}
      </ArticleCard>
      <McqQuestions questions={part.questions} sheet={sheet} />
    </>
  );
}

function GappedText({ part, sheet }) {
  const letters = part.sentences.map((s) => s.letter);
  return (
    <>
      <ArticleCard title={part.title} subtitle={part.subtitle}>
        {part.paragraphs.map((text, i) => (
          <GappedParagraph
            key={i}
            text={text}
            renderGap={(n) => <LetterGap number={n} letters={letters} sheet={sheet} />}
          />
        ))}
      </ArticleCard>
      <div className={styles.textsGrid}>
        {part.sentences.map((s) => (
          <div key={s.letter} className={styles.lettered}>
            <span className={styles.letterBadge}>{s.letter}</span>
            <p className={styles.letteredText}>{s.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function McCloze({ part, sheet }) {
  const wordFor = (n) => {
    const q = part.questions.find((item) => item.number === n);
    return q?.options.find((o) => o.letter === sheet.values[n])?.text || '';
  };
  return (
    <>
      <ArticleCard title={part.title}>
        {part.paragraphs.map((text, i) => (
          <GappedParagraph
            key={i}
            text={text}
            renderGap={(n) => {
              const status = sheet.status(n);
              return (
                <span className={cx(styles.gap, status === 'ok' && styles.gapCorrect, status === 'ko' && styles.gapWrong)}>
                  <span className={styles.gapNumber}>{n}</span>
                  <span className={styles.gapBlank}>{wordFor(n) || '\u00a0'}</span>
                </span>
              );
            }}
          />
        ))}
      </ArticleCard>
      <McqQuestions questions={part.questions} sheet={sheet} />
    </>
  );
}

function OpenCloze({ part, sheet }) {
  return (
    <ArticleCard title={part.title} subtitle={part.subtitle}>
      {part.paragraphs.map((text, i) => (
        <GappedParagraph
          key={i}
          text={text}
          renderGap={(n) => <WordGap number={n} sheet={sheet} />}
        />
      ))}
    </ArticleCard>
  );
}

function WritingPanel({ writing, taskText, storageSuffix = '' }) {
  if (!writing?.storageKey) return null;
  const storageKey = `${writing.storageKey}${storageSuffix}`;
  return (
    <B2WritingLongFormAiPanel
      key={storageKey}
      storageKey={storageKey}
      wordMin={writing.wordMin}
      wordMax={writing.wordMax}
      heading={writing.heading}
      partLabel={writing.partLabel}
      partDescription={writing.partDescription}
      taskInstructions={taskText}
      taskInputText=""
      onScoresReady={writing.onScoresReady}
      lang={writing.lang}
    />
  );
}

function WritingEmail({ part, writing }) {
  const { email } = part;
  return (
    <>
      <p className={styles.intro}>{part.intro}</p>
      <div className={styles.email}>
        <div className={styles.emailHeader}>
          <span>
            <strong>From:</strong> {email.from}
          </span>
          <span>
            <strong>Subject:</strong> {email.subject}
          </span>
        </div>
        <div className={styles.emailBody}>
          <p className={styles.paragraph}>{email.greeting}</p>
          {email.lines.map((line) => (
            <div key={line.note} className={styles.emailLine}>
              <p className={styles.paragraph}>{line.text}</p>
              <span className={styles.emailNote}>{line.note}</span>
            </div>
          ))}
          {email.closing.map((line) => (
            <p key={line} className={styles.paragraph}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <p className={styles.stem}>{part.task}</p>
      <p className={styles.wordNote}>{part.wordCountNote}</p>
      <WritingPanel writing={writing} taskText={buildB1WritingTaskText(part)} />
    </>
  );
}

function WritingChoice({ part, writing, lang }) {
  const [selected, setSelected] = useState(null);
  const en = lang !== 'es';
  return (
    <>
      <div className={styles.taskChoice}>
        {part.tasks.map((task) => (
          <section
            key={task.number}
            className={cx(styles.taskCard, selected === task.number && styles.taskCardSelected)}
          >
            <p className={styles.taskLabel}>{task.label}</p>
            <p className={styles.paragraph}>{task.lead}</p>
            {task.announcement ? (
              <div className={styles.announcement}>
                <p className={styles.announcementKicker}>{task.announcement.kicker}</p>
                <p className={styles.announcementHeading}>{task.announcement.heading}</p>
                {task.announcement.lines.map((line) => (
                  <p key={line} className={styles.paragraph}>
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
            {task.openingSentence ? (
              <>
                <p className={styles.paragraph}>{task.storyIntro}</p>
                <p className={styles.openingSentence}>{task.openingSentence}</p>
              </>
            ) : null}
            <p className={styles.stem}>{task.task}</p>
            <button
              type="button"
              className={cx(styles.button, selected !== task.number && styles.buttonGhost)}
              onClick={() => setSelected(task.number)}
              aria-pressed={selected === task.number}
            >
              {selected === task.number
                ? en
                  ? 'Selected'
                  : 'Seleccionada'
                : en
                  ? `Answer question ${task.number}`
                  : `Responder la pregunta ${task.number}`}
            </button>
          </section>
        ))}
      </div>
      <p className={styles.wordNote}>{part.wordCountNote}</p>
      {selected ? (
        <WritingPanel
          writing={writing}
          taskText={buildB1WritingTaskText(part, selected)}
          storageSuffix={`-q${selected}`}
        />
      ) : null}
    </>
  );
}

function ListeningAudio({ src, partNumber, examMode, lang }) {
  return (
    <ExamListeningAudioPlayer
      src={src}
      examMode={examMode}
      clipKey={`b1-sample-1-part-${partNumber}`}
      lang={lang}
    />
  );
}

function ListeningPictures({ part, sheet }) {
  return (
    <ol className={styles.questionList}>
      {part.questions.map((q) => {
        const value = sheet.values[q.number] || '';
        return (
          <li key={q.number} className={styles.question}>
            <span className={styles.questionNumber}>{q.number}</span>
            <div className={styles.questionBody}>
              <p className={styles.stem}>{q.stem}</p>
              <div className={styles.pictures} role="radiogroup" aria-label={`Question ${q.number}`}>
                {q.options.map((opt) => {
                  const selected = value === opt.letter;
                  return (
                    <label
                      key={opt.letter}
                      className={cx(
                        styles.pictureOption,
                        selected && styles.optionSelected,
                        sheet.checked && opt.letter === sheet.key[q.number] && styles.optionCorrect,
                        sheet.checked && selected && opt.letter !== sheet.key[q.number] && styles.optionWrong,
                      )}
                    >
                      <input
                        type="radio"
                        name={`b1-q${q.number}`}
                        value={opt.letter}
                        checked={selected}
                        disabled={sheet.checked}
                        onChange={() => sheet.setValue(q.number, opt.letter)}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opt.image} alt={opt.alt} loading="lazy" />
                      <span className={styles.pictureLetter}>{opt.letter}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ListeningMcq({ part, sheet }) {
  return (
    <>
      {part.intro ? <p className={styles.intro}>{part.intro}</p> : null}
      <McqQuestions questions={part.questions} sheet={sheet} />
    </>
  );
}

function ListeningGapFill({ part, sheet }) {
  return (
    <>
      <p className={styles.intro}>{part.intro}</p>
      <ArticleCard title={part.title}>
        <ol className={styles.notesList}>
          {part.items.map((item) => (
            <li key={item.number}>
              {item.before} <WordGap number={item.number} sheet={sheet} /> {item.after}
            </li>
          ))}
        </ol>
      </ArticleCard>
    </>
  );
}

function SpeakingInterview({ part }) {
  return (
    <>
      <p className={styles.timing}>{part.timing}</p>
      {part.phases.map((phase) => (
        <ArticleCard key={phase.title} title={phase.title}>
          {phase.note ? <p className={styles.context}>{phase.note}</p> : null}
          {phase.lines ? (
            <ul className={styles.bulletList}>
              {phase.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {phase.questions ? (
            <ul className={styles.bulletList}>
              {phase.questions.map((q) => (
                <li key={q.question}>
                  {q.question}
                  {q.backUp ? <div className={styles.backUp}>Back-up: {q.backUp}</div> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </ArticleCard>
      ))}
    </>
  );
}

function SpeakingPhotos({ part }) {
  return (
    <>
      <p className={styles.timing}>
        {part.timing} · {part.candidateTime}
      </p>
      <p className={styles.script}>{part.examinerIntro}</p>
      <div className={styles.photoGrid}>
        {part.photos.map((photo) => (
          <figure key={photo.id} className={styles.photo}>
            <span className={styles.photoCaption}>
              {photo.id} · {photo.title}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.image} alt={photo.alt} loading="lazy" />
            <figcaption className={styles.context}>{photo.prompt}</figcaption>
          </figure>
        ))}
      </div>
      <ArticleCard title="Back-up prompts">
        <ul className={styles.bulletList}>
          {part.backUpPrompts.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </ArticleCard>
    </>
  );
}

function SpeakingCollaborative({ part }) {
  return (
    <>
      <p className={styles.timing}>{part.timing}</p>
      <p className={styles.script}>{part.examinerIntro}</p>
      <ArticleCard title={part.title}>
        <p className={styles.paragraph}>{part.situation}</p>
        <p className={styles.stem}>{part.task}</p>
      </ArticleCard>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.taskImage} src={part.image} alt={part.alt} loading="lazy" />
    </>
  );
}

function SpeakingDiscussion({ part }) {
  return (
    <>
      <p className={styles.timing}>{part.timing}</p>
      <ArticleCard title="Questions">
        <ul className={styles.bulletList}>
          {part.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </ArticleCard>
      <ArticleCard title="Prompts">
        <ul className={styles.bulletList}>
          {part.prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </ArticleCard>
      <p className={styles.script}>{part.closing}</p>
    </>
  );
}

const SCORED_RENDERERS = {
  'short-texts-mcq': ShortTextsMcq,
  matching: Matching,
  'long-text-mcq': LongTextMcq,
  'gapped-text': GappedText,
  'mc-cloze': McCloze,
  'open-cloze': OpenCloze,
  'listening-pictures': ListeningPictures,
  'listening-mcq': ListeningMcq,
  'listening-gap-fill': ListeningGapFill,
};

const SPEAKING_RENDERERS = {
  'speaking-interview': SpeakingInterview,
  'speaking-photos': SpeakingPhotos,
  'speaking-collaborative': SpeakingCollaborative,
  'speaking-discussion': SpeakingDiscussion,
};

function ScoredPart({ part, hideFeedback, examMode, lang }) {
  const sheet = useAnswerSheet(part);
  const Renderer = SCORED_RENDERERS[part.kind];
  return (
    <>
      {part.audio ? (
        <ListeningAudio src={part.audio} partNumber={part.partNumber} examMode={examMode} lang={lang} />
      ) : null}
      <Renderer part={part} sheet={sheet} />
      <CheckBar sheet={sheet} hideFeedback={hideFeedback} lang={lang} />
    </>
  );
}

/**
 * B1 Preliminary sample part (Reading, Writing, Listening or Speaking) with local answer checking.
 * @param {{ part: object, hideFeedback?: boolean, examMode?: boolean, lang?: string, writing?: object }} props
 */
export default function B1SampleExamPart({ part, hideFeedback = false, examMode = false, lang = 'en', writing = null }) {
  if (!part) return null;

  let body = null;
  if (SCORED_RENDERERS[part.kind]) {
    body = <ScoredPart part={part} hideFeedback={hideFeedback} examMode={examMode} lang={lang} />;
  } else if (part.kind === 'writing-email') {
    body = <WritingEmail part={part} writing={writing} />;
  } else if (part.kind === 'writing-choice') {
    body = <WritingChoice part={part} writing={writing} lang={lang} />;
  } else if (SPEAKING_RENDERERS[part.kind]) {
    const Renderer = SPEAKING_RENDERERS[part.kind];
    body = <Renderer part={part} />;
  }

  return (
    <div className={styles.paper}>
      <p className={styles.demoNote} role="status">
        {B1_SAMPLE_TEST_1_SOURCE}. Shown until this part has its own exercise in Supabase.
      </p>
      <Rubric part={part} />
      {body}
    </div>
  );
}
