'use client';

import { Fragment, useMemo, useState } from 'react';
import B2WritingLongFormAiPanel from '@/components/b2/B2WritingLongFormAiPanel';
import ExamListeningAudioPlayer from '@/components/b2/ExamListeningAudioPlayer';
import styles from './CambridgeSampleExamPart.module.css';

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

const NEGATIVE_CONTRACTIONS = [
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\b(\w+)n't\b/g, '$1 not'],
];

function normalizeKeyWordAnswer(value) {
  return NEGATIVE_CONTRACTIONS.reduce((text, [pattern, full]) => text.replace(pattern, full), normalizeAnswer(value));
}

function allQuestions(part) {
  if (part.extracts) return part.extracts.flatMap((extract) => extract.questions);
  return part.questions || [];
}

function buildAnswerKey(part) {
  if (part.answers) return part.answers;
  return Object.fromEntries(
    allQuestions(part)
      .filter((q) => q.keys || q.answer)
      .map((q) => [q.number, q.keys || q.answer]),
  );
}

/** Key word transformations: one mark per correct half (keys = [[firstHalves, secondHalves], …]). */
function markKeyWord(keys, value) {
  const answer = normalizeKeyWordAnswer(value);
  if (!answer) return 0;
  let best = 0;
  for (const [firstHalves, secondHalves] of keys) {
    const first = firstHalves.some((half) => {
      const h = normalizeKeyWordAnswer(half);
      return answer === h || answer.startsWith(`${h} `);
    });
    const second = secondHalves.some((half) => {
      const h = normalizeKeyWordAnswer(half);
      return answer === h || answer.endsWith(` ${h}`);
    });
    best = Math.max(best, Number(first) + Number(second));
  }
  return best;
}

function markAnswer(kind, expected, value) {
  if (kind === 'key-word') return markKeyWord(expected, value);
  if (Array.isArray(expected)) {
    const answer = normalizeAnswer(value);
    return Number(Boolean(answer) && expected.some((accepted) => normalizeAnswer(accepted) === answer));
  }
  return Number(String(value || '').toUpperCase() === String(expected || '').toUpperCase());
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
  const isKeyWord = part.kind === 'key-word';
  const perItem = isKeyWord ? 2 : part.marksPerQuestion || 1;
  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);

  const marks = useMemo(
    () =>
      Object.fromEntries(
        numbers.map((n) => {
          const mark = markAnswer(part.kind, key[n], values[n]);
          return [n, isKeyWord ? mark : mark * perItem];
        }),
      ),
    [numbers, key, values, part.kind, isKeyWord, perItem],
  );

  return {
    idPrefix: part.sample?.idPrefix || 'sample',
    key,
    values,
    checked,
    marks,
    perItem,
    total: numbers.length * perItem,
    score: numbers.reduce((sum, n) => sum + marks[n], 0),
    answeredCount: numbers.filter((n) => String(values[n] ?? '').trim()).length,
    setValue: (n, value) => setValues((prev) => ({ ...prev, [n]: value })),
    check: () => setChecked(true),
    reset: () => {
      setValues({});
      setChecked(false);
    },
    status: (n) => {
      if (!checked) return null;
      if (marks[n] >= perItem) return 'ok';
      return marks[n] > 0 ? 'partial' : 'ko';
    },
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

function ArticleCard({ title, subtitle, children }) {
  return (
    <article className={styles.card}>
      {title ? <h3 className={styles.cardTitle}>{title}</h3> : null}
      {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      {children}
    </article>
  );
}

function ScriptLines({ lines }) {
  if (!lines?.length) return null;
  return (
    <div className={styles.script}>
      {lines.map((line) => (
        <p key={line} className={styles.scriptLine}>
          {line}
        </p>
      ))}
    </div>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className={styles.bulletList}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
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
              name={`${sheet.idPrefix}-q${number}`}
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

function McqQuestions({ questions, sheet }) {
  return (
    <ol className={styles.questionList}>
      {questions.map((q) => (
        <li key={q.number} className={styles.question}>
          <span className={styles.questionNumber}>{q.number}</span>
          <div className={styles.questionBody}>
            {q.stem ? <p className={styles.stem}>{q.stem}</p> : null}
            <OptionList number={q.number} options={q.options} sheet={sheet} />
          </div>
        </li>
      ))}
    </ol>
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

function gapClass(status) {
  return cx(
    styles.gap,
    status === 'ok' && styles.gapCorrect,
    status === 'partial' && styles.gapPartial,
    status === 'ko' && styles.gapWrong,
  );
}

function ExampleGap({ answer, stem = null }) {
  return (
    <span className={cx(styles.gap, styles.gapExample)}>
      <span className={styles.gapNumber}>0</span>
      <span className={styles.gapBlank}>{answer}</span>
      {stem ? <span className={styles.stemBadge}>{stem}</span> : null}
    </span>
  );
}

function LetterSelect({ number, letters, sheet }) {
  const status = sheet.status(number);
  return (
    <span className={gapClass(status)}>
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

function WordGap({ number, sheet, stem = null }) {
  const status = sheet.status(number);
  return (
    <span className={gapClass(status)}>
      <span className={styles.gapNumber}>{number}</span>
      <input
        type="text"
        className={styles.gapInput}
        value={sheet.values[number] || ''}
        disabled={sheet.checked}
        onChange={(e) => sheet.setValue(number, e.target.value)}
        aria-label={stem ? `Question ${number} (${stem})` : `Question ${number}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {stem ? <span className={styles.stemBadge}>{stem}</span> : null}
      {status === 'ko' ? <span className={styles.gapKey}>{formatExpected(sheet.key[number])}</span> : null}
    </span>
  );
}

/* Reading and Use of English */

function McCloze({ part, sheet }) {
  const { example } = part;
  const exampleWord = example.options.find((o) => o.letter === example.answer)?.text || '';
  const wordFor = (n) => {
    const q = part.questions.find((item) => item.number === n);
    return q?.options.find((o) => o.letter === sheet.values[n])?.text || '';
  };
  const rows = [{ ...example, isExample: true }, ...part.questions];
  return (
    <>
      <ArticleCard title={part.title}>
        {part.paragraphs.map((text, i) => (
          <GappedParagraph
            key={i}
            text={text}
            renderGap={(n) => {
              if (n === 0) return <ExampleGap answer={exampleWord} />;
              return (
                <span className={gapClass(sheet.status(n))}>
                  <span className={styles.gapNumber}>{n}</span>
                  <span className={styles.gapBlank}>{wordFor(n) || '\u00a0'}</span>
                </span>
              );
            }}
          />
        ))}
      </ArticleCard>
      <div className={styles.clozeGrid}>
        {rows.map((row) => (
          <div
            key={row.number}
            className={cx(styles.clozeRow, row.isExample && styles.clozeRowExample)}
            role="radiogroup"
            aria-label={row.isExample ? 'Example' : `Question ${row.number}`}
          >
            <span className={styles.questionNumber}>{row.number}</span>
            {row.options.map((opt) => {
              if (row.isExample) {
                return (
                  <span
                    key={opt.letter}
                    className={cx(styles.clozeOption, opt.letter === row.answer && styles.optionSelected)}
                  >
                    <span className={styles.optionLetter}>{opt.letter}</span>
                    {opt.text}
                  </span>
                );
              }
              const selected = sheet.values[row.number] === opt.letter;
              const expected = sheet.key[row.number];
              return (
                <label
                  key={opt.letter}
                  className={cx(
                    styles.clozeOption,
                    selected && styles.optionSelected,
                    sheet.checked && opt.letter === expected && styles.optionCorrect,
                    sheet.checked && selected && opt.letter !== expected && styles.optionWrong,
                  )}
                >
                  <input
                    type="radio"
                    name={`${sheet.idPrefix}-q${row.number}`}
                    value={opt.letter}
                    checked={selected}
                    disabled={sheet.checked}
                    onChange={() => sheet.setValue(row.number, opt.letter)}
                  />
                  <span className={styles.optionLetter}>{opt.letter}</span>
                  {opt.text}
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function OpenCloze({ part, sheet }) {
  return (
    <ArticleCard title={part.title}>
      {part.paragraphs.map((text, i) => (
        <GappedParagraph
          key={i}
          text={text}
          renderGap={(n) =>
            n === 0 ? <ExampleGap answer={part.example.answer} /> : <WordGap number={n} sheet={sheet} />
          }
        />
      ))}
    </ArticleCard>
  );
}

function WordFormation({ part, sheet }) {
  return (
    <ArticleCard title={part.title}>
      {part.paragraphs.map((text, i) => (
        <GappedParagraph
          key={i}
          text={text}
          renderGap={(n) =>
            n === 0 ? (
              <ExampleGap answer={part.example.answer} stem={part.example.stem} />
            ) : (
              <WordGap number={n} sheet={sheet} stem={part.stems[n]} />
            )
          }
        />
      ))}
    </ArticleCard>
  );
}

function KeyWordItem({ item, sheet = null, hint = '' }) {
  const isExample = !sheet;
  const status = sheet ? sheet.status(item.number) : null;
  return (
    <li className={cx(styles.question, isExample && styles.keyWordExample)}>
      <span className={styles.questionNumber}>{item.number}</span>
      <div className={styles.questionBody}>
        <p className={styles.paragraph}>{item.first}</p>
        <span className={styles.keyWordBox}>{item.keyword}</span>
        <p className={styles.keyWordSentence}>
          {item.before}{' '}
          {isExample ? (
            <span className={styles.keyWordAnswer}>{item.answer}</span>
          ) : (
            <span className={gapClass(status)}>
              <input
                type="text"
                className={cx(styles.gapInput, styles.keyWordInput)}
                value={sheet.values[item.number] || ''}
                disabled={sheet.checked}
                onChange={(e) => sheet.setValue(item.number, e.target.value)}
                aria-label={`Question ${item.number} (${item.keyword})`}
                placeholder={hint || undefined}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </span>
          )}{' '}
          {item.after}
        </p>
        {status ? (
          <p
            className={cx(
              styles.feedback,
              status === 'ok' && styles.feedbackOk,
              status === 'partial' && styles.feedbackPartial,
              status === 'ko' && styles.feedbackKo,
            )}
          >
            {sheet.marks[item.number]} / 2 marks{status === 'ok' ? '' : ` · Key: ${item.display}`}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function KeyWordTransformations({ part, sheet }) {
  return (
    <ol className={styles.questionList}>
      <KeyWordItem item={part.example} />
      {part.questions.map((item) => (
        <KeyWordItem key={item.number} item={item} sheet={sheet} hint={part.answerHint} />
      ))}
    </ol>
  );
}

function LongTextMcq({ part, sheet }) {
  return (
    <>
      {part.intro ? <p className={styles.intro}>{part.intro}</p> : null}
      <ArticleCard title={part.title}>
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

function LetteredTexts({ texts }) {
  return (
    <div className={styles.letteredList}>
      {texts.map((t) => (
        <section key={t.letter} className={styles.lettered}>
          <span className={styles.letterBadge}>{t.letter}</span>
          <div>
            {t.title ? <p className={styles.letteredTitle}>{t.title}</p> : null}
            <p className={styles.letteredText}>{t.text}</p>
          </div>
        </section>
      ))}
    </div>
  );
}

function MatchingQuestions({ lead, questions, letters, sheet }) {
  return (
    <div className={styles.matchingBlock}>
      {lead ? <p className={styles.textsTitle}>{lead}</p> : null}
      <ol className={styles.matchingList}>
        {questions.map((q) => (
          <li key={q.number} className={styles.matchingRow}>
            <span className={styles.questionNumber}>{q.number}</span>
            <p className={styles.matchingStem}>{q.stem}</p>
            <LetterSelect number={q.number} letters={letters} sheet={sheet} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function CrossTextMatching({ part, sheet }) {
  return (
    <>
      {part.intro ? <p className={styles.intro}>{part.intro}</p> : null}
      <ArticleCard title={part.title} subtitle={part.subtitle}>
        <LetteredTexts texts={part.texts} />
      </ArticleCard>
      <MatchingQuestions
        lead={part.questionLead}
        questions={part.questions}
        letters={part.texts.map((t) => t.letter)}
        sheet={sheet}
      />
    </>
  );
}

function GappedParagraphs({ part, sheet }) {
  const letters = part.options.map((o) => o.letter);
  return (
    <>
      {part.intro ? <p className={styles.intro}>{part.intro}</p> : null}
      <ArticleCard title={part.title} subtitle={part.subtitle}>
        {part.blocks.map((block, i) => {
          if (typeof block === 'string') {
            return (
              <p key={i} className={styles.paragraph}>
                {block}
              </p>
            );
          }
          const chosen = part.options.find((o) => o.letter === sheet.values[block.gap]);
          return (
            <div key={`gap-${block.gap}`} className={styles.paragraphGap}>
              <div className={styles.paragraphGapHead}>
                <span className={styles.questionNumber}>{block.gap}</span>
                <LetterSelect number={block.gap} letters={letters} sheet={sheet} />
              </div>
              {chosen ? <p className={styles.paragraphGapPreview}>{chosen.text}</p> : null}
            </div>
          );
        })}
      </ArticleCard>
      <p className={styles.textsTitle}>
        Paragraphs {letters[0]} – {letters[letters.length - 1]}
      </p>
      <LetteredTexts texts={part.options} />
    </>
  );
}

function MultipleMatching({ part, sheet }) {
  return (
    <>
      {part.intro ? <p className={styles.intro}>{part.intro}</p> : null}
      <ArticleCard title={part.title} subtitle={part.subtitle}>
        {part.lead ? <p className={styles.cardLead}>{part.lead}</p> : null}
        <LetteredTexts texts={part.sections} />
      </ArticleCard>
      <MatchingQuestions
        lead={part.questionLead}
        questions={part.questions}
        letters={part.sections.map((s) => s.letter)}
        sheet={sheet}
      />
    </>
  );
}

/* Writing */

/** Plain-text task for the writing AI panel (task + input text the candidate must answer). */
function buildWritingTaskText(part, taskNumber = null) {
  if (!part) return '';
  if (part.kind === 'writing-essay') {
    const lines = [part.questionLabel, part.situation];
    if (part.notes) {
      const { notes } = part;
      lines.push(notes.heading, ...notes.items.map((item) => `• ${item}`), notes.opinionsHeading, ...notes.opinions);
    }
    if (part.texts) {
      lines.push(part.directions);
      part.texts.forEach((text) => lines.push(text.title, text.text));
    }
    lines.push(part.task, part.extraNote, part.wordCountNote);
    return lines.filter(Boolean).join('\n');
  }
  if (part.kind === 'writing-choice') {
    const task = part.tasks.find((t) => t.number === Number(taskNumber)) || part.tasks[0];
    if (!task) return '';
    const lines = [task.label, task.lead];
    if (task.body) lines.push(task.body);
    if (task.announcement) lines.push(task.announcement.heading, ...task.announcement.lines);
    if (task.letter) lines.push(...task.letter);
    lines.push(task.task, part.wordCountNote);
    return lines.filter(Boolean).join('\n');
  }
  return '';
}

function WritingPanel({ writing, levelLabel, taskText, storageSuffix = '' }) {
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
      examLevelLabel={levelLabel}
    />
  );
}

function WritingEssay({ part, writing }) {
  const { notes, texts } = part;
  return (
    <>
      <p className={styles.taskLabel}>{part.questionLabel}</p>
      {part.situation ? <p className={styles.paragraph}>{part.situation}</p> : null}
      {notes ? (
        <div className={styles.notesBox}>
          <div>
            <p className={styles.notesHeading}>{notes.heading}</p>
            <BulletList items={notes.items} />
          </div>
          <div className={styles.opinions}>
            <p className={styles.notesHeading}>{notes.opinionsHeading}</p>
            {notes.opinions.map((line) => (
              <p key={line} className={styles.opinion}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      {texts ? (
        <div className={styles.sourceTexts}>
          {texts.map((text) => (
            <section key={text.title} className={styles.sourceText}>
              <p className={styles.sourceTextTitle}>{text.title}</p>
              <p className={styles.paragraph}>{text.text}</p>
            </section>
          ))}
        </div>
      ) : null}
      <p className={styles.stem}>{part.task}</p>
      {part.extraNote ? <p className={styles.context}>{part.extraNote}</p> : null}
      {part.wordCountNote ? <p className={styles.wordNote}>{part.wordCountNote}</p> : null}
      <WritingPanel writing={writing} levelLabel={part.sample?.levelLabel} taskText={buildWritingTaskText(part)} />
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
            {task.body ? <p className={styles.paragraph}>{task.body}</p> : null}
            {task.announcement ? (
              <div className={styles.announcement}>
                <p className={styles.announcementHeading}>{task.announcement.heading}</p>
                {task.announcement.lines.map((line) => (
                  <p key={line} className={styles.paragraph}>
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
            {task.letter ? (
              <div className={styles.letterBox}>
                {task.letter.map((line) => (
                  <p key={line} className={styles.paragraph}>
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
            <p className={styles.stem}>{task.task}</p>
            <button
              type="button"
              className={cx(styles.button, styles.taskButton, selected !== task.number && styles.buttonGhost)}
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
      {part.wordCountNote ? <p className={styles.wordNote}>{part.wordCountNote}</p> : null}
      {selected ? (
        <WritingPanel
          writing={writing}
          levelLabel={part.sample?.levelLabel}
          taskText={buildWritingTaskText(part, selected)}
          storageSuffix={`-q${selected}`}
        />
      ) : null}
    </>
  );
}

/* Listening */

function ListeningAudio({ src, clipKey, examMode, lang }) {
  return <ExamListeningAudioPlayer src={src} examMode={examMode} clipKey={clipKey} lang={lang} />;
}

function ListeningExtracts({ part, sheet, examMode, lang }) {
  return (
    <>
      {part.extracts.map((extract, i) => (
        <ArticleCard key={extract.title} title={extract.title}>
          <p className={styles.context}>{extract.context}</p>
          <ListeningAudio
            src={extract.audio}
            clipKey={`${sheet.idPrefix}-part-${part.partNumber}-extract-${i + 1}`}
            examMode={examMode}
            lang={lang}
          />
          <McqQuestions questions={extract.questions} sheet={sheet} />
        </ArticleCard>
      ))}
    </>
  );
}

function ListeningSentenceCompletion({ part, sheet }) {
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

function ListeningMcq({ part, sheet }) {
  return (
    <>
      {part.intro ? <p className={styles.intro}>{part.intro}</p> : null}
      <McqQuestions questions={part.questions} sheet={sheet} />
    </>
  );
}

function ListeningDualMatching({ part, sheet }) {
  return (
    <>
      <p className={styles.intro}>{part.intro}</p>
      <div className={styles.dualTasks}>
        {part.tasks.map((task) => {
          const letters = task.options.map((o) => o.letter);
          return (
            <ArticleCard key={task.title} title={task.title}>
              <p className={styles.context}>{task.prompt}</p>
              <ul className={styles.dualOptions}>
                {task.options.map((opt) => (
                  <li key={opt.letter}>
                    <span className={styles.optionLetter}>{opt.letter}</span> {opt.text}
                  </li>
                ))}
              </ul>
              <ol className={styles.speakerList}>
                {Array.from({ length: part.speakers }, (_, i) => {
                  const number = task.firstQuestion + i;
                  return (
                    <li key={number} className={styles.speakerRow}>
                      <span className={styles.speakerLabel}>Speaker {i + 1}</span>
                      <span className={styles.questionNumber}>{number}</span>
                      <LetterSelect number={number} letters={letters} sheet={sheet} />
                    </li>
                  );
                })}
              </ol>
            </ArticleCard>
          );
        })}
      </div>
    </>
  );
}

/* Speaking */

function SpeakingInterview({ part }) {
  return (
    <>
      {part.phases.map((phase) => (
        <ArticleCard key={phase.title} title={phase.title}>
          {phase.note ? <p className={styles.context}>{phase.note}</p> : null}
          <ScriptLines lines={phase.lines} />
          <BulletList items={phase.questions} />
        </ArticleCard>
      ))}
    </>
  );
}

function SpeakingLongTurn({ part }) {
  return (
    <>
      {part.tasks.map((task) => (
        <ArticleCard key={task.title} title={task.title}>
          <ul className={styles.candidateQuestions}>
            {task.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <div className={styles.photoStrip}>
            {task.photos.map((p) => (
              <figure key={p.letter} className={styles.photo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </ArticleCard>
      ))}
      {part.credits ? <p className={styles.credits}>{part.credits}</p> : null}
    </>
  );
}

function SpeakingPictureTask({ part }) {
  return (
    <>
      <ArticleCard title={part.title}>
        <ScriptLines lines={part.lines} />
        <div className={styles.photoGrid}>
          {part.photos.map((p) => (
            <figure key={p.letter} className={cx(styles.photo, styles.photoLabelled)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.alt} loading="lazy" />
              <figcaption className={styles.photoLetter}>{p.letter}</figcaption>
            </figure>
          ))}
        </div>
      </ArticleCard>
      {part.steps.map((step) => (
        <ArticleCard key={step.title} title={step.title}>
          {step.note ? <p className={styles.context}>{step.note}</p> : null}
          <ScriptLines lines={step.lines} />
        </ArticleCard>
      ))}
    </>
  );
}

function SpeakingPromptCards({ part }) {
  return (
    <>
      {part.lines ? (
        <ArticleCard title={part.topic}>
          <ScriptLines lines={part.lines} />
        </ArticleCard>
      ) : null}
      {part.cards.map((card) => (
        <ArticleCard key={card.title} title={card.title}>
          <div className={styles.promptCard}>
            <p className={styles.promptQuestion}>{card.question}</p>
            <BulletList items={card.ideas} />
          </div>
          {card.timing ? <p className={styles.wordNote}>{card.timing}</p> : null}
          {card.followUp ? (
            <div className={styles.followUp}>
              <p className={styles.notesHeading}>{card.followUp.title}</p>
              {card.followUp.note ? <p className={styles.context}>{card.followUp.note}</p> : null}
              <BulletList items={card.followUp.questions} />
            </div>
          ) : null}
        </ArticleCard>
      ))}
      {part.discussion ? (
        <ArticleCard title={part.discussion.title}>
          {part.discussion.note ? <p className={styles.context}>{part.discussion.note}</p> : null}
          <ScriptLines lines={part.discussion.lines} />
          <BulletList items={part.discussion.questions} />
        </ArticleCard>
      ) : null}
    </>
  );
}

function MindMap({ question, prompts }) {
  return (
    <div className={styles.mindMap} role="group" aria-label="Part 3 task">
      <p className={styles.mindMapCentre}>{question}</p>
      {prompts.map((prompt, i) => (
        <p key={prompt} className={cx(styles.mindMapPrompt, styles[`mindMapPrompt${i + 1}`])}>
          {prompt}
        </p>
      ))}
    </div>
  );
}

function SpeakingCollaborative({ part }) {
  return <MindMap question={part.question} prompts={part.prompts} />;
}

function SpeakingDiscussion({ part }) {
  return (
    <ArticleCard title={part.topic}>
      <p className={styles.context}>{part.question}</p>
      <BulletList items={part.prompts} />
    </ArticleCard>
  );
}

const SCORED_RENDERERS = {
  'mc-cloze': McCloze,
  'open-cloze': OpenCloze,
  'word-formation': WordFormation,
  'key-word': KeyWordTransformations,
  'long-text-mcq': LongTextMcq,
  'cross-text-matching': CrossTextMatching,
  'gapped-paragraphs': GappedParagraphs,
  'multiple-matching': MultipleMatching,
  'listening-extracts': ListeningExtracts,
  'listening-sentence-completion': ListeningSentenceCompletion,
  'listening-mcq': ListeningMcq,
  'listening-dual-matching': ListeningDualMatching,
};

const SPEAKING_RENDERERS = {
  'speaking-interview': SpeakingInterview,
  'speaking-long-turn': SpeakingLongTurn,
  'speaking-picture-task': SpeakingPictureTask,
  'speaking-prompt-cards': SpeakingPromptCards,
  'speaking-collaborative': SpeakingCollaborative,
  'speaking-discussion': SpeakingDiscussion,
};

function ScoredPart({ part, hideFeedback, examMode, lang }) {
  const sheet = useAnswerSheet(part);
  const Renderer = SCORED_RENDERERS[part.kind];
  return (
    <>
      {part.audio ? (
        <ListeningAudio
          src={part.audio}
          clipKey={`${sheet.idPrefix}-part-${part.partNumber}`}
          examMode={examMode}
          lang={lang}
        />
      ) : null}
      <Renderer part={part} sheet={sheet} examMode={examMode} lang={lang} />
      <CheckBar sheet={sheet} hideFeedback={hideFeedback} lang={lang} />
    </>
  );
}

/**
 * Official Cambridge sample part (C1 Advanced, C2 Proficiency) with local answer checking.
 * `part.sample` carries the source line, level label and the id prefix for radio names and audio clip keys.
 * @param {{ part: object, hideFeedback?: boolean, examMode?: boolean, lang?: string, writing?: object }} props
 */
export default function CambridgeSampleExamPart({
  part,
  hideFeedback = false,
  examMode = false,
  lang = 'en',
  writing = null,
}) {
  if (!part) return null;

  let body = null;
  if (SCORED_RENDERERS[part.kind]) {
    body = <ScoredPart part={part} hideFeedback={hideFeedback} examMode={examMode} lang={lang} />;
  } else if (part.kind === 'writing-essay') {
    body = <WritingEssay part={part} writing={writing} />;
  } else if (part.kind === 'writing-choice') {
    body = <WritingChoice part={part} writing={writing} lang={lang} />;
  } else if (SPEAKING_RENDERERS[part.kind]) {
    const Renderer = SPEAKING_RENDERERS[part.kind];
    body = <Renderer part={part} />;
  }

  return (
    <div className={styles.paper}>
      {part.sample?.source ? (
        <p className={styles.demoNote} role="status">
          {part.sample.source}. Shown until this part has its own exercise in Supabase.
        </p>
      ) : null}
      <Rubric part={part} />
      {body}
    </div>
  );
}
