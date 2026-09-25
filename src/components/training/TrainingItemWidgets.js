'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { parseGapFillSentence } from '@/lib/trainingGapFillGrading';
import {
  TRAINING_LONG_TEXT_FORMATS,
  isTrainingListeningItem,
  trainingDisplayOrder,
  trainingItemFormat,
  trainingLetter,
  trainingSlotModel,
  trainingSpeechText,
} from '@/lib/trainingItemFormats';
import {
  playTrainingSpeech,
  prefetchTrainingSpeech,
  stopTrainingSpeech,
  subscribeTrainingSpeech,
  trainingSpeechKey,
} from '@/lib/trainingSpeech';
import styles from './TrainingItemWidgets.module.css';

function cx(...names) {
  return names.filter(Boolean).join(' ');
}

const BOLD = /(\*\*[^*]+\*\*)/g;

/** `**word**` in bold and `\n` as a line break; everything else as plain text. */
export function RichText({ text }) {
  return String(text ?? '')
    .split('\n')
    .map((line, lineIndex) => (
      <Fragment key={lineIndex}>
        {lineIndex > 0 ? <br /> : null}
        {line.split(BOLD).map((part, partIndex) =>
          part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
            <strong key={partIndex} className={styles.bold}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            <Fragment key={partIndex}>{part}</Fragment>
          ),
        )}
      </Fragment>
    ));
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 20 20" className={styles.icon} fill="none" aria-hidden>
      <path d="M3.5 7.5h2.8L10 4.5v11l-3.7-3H3.5z" fill="currentColor" />
      <path
        d="M13 7.2a3.6 3.6 0 0 1 0 5.6M15.2 5a6.6 6.6 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useActiveSpeech() {
  const [key, setKey] = useState(null);
  useEffect(() => subscribeTrainingSpeech(setKey), []);
  return key;
}

export function ListenButton({ text, slow = false, compact = false, label }) {
  const activeKey = useActiveSpeech();
  const playing = activeKey === trainingSpeechKey(text, slow);
  const name = label || (slow ? 'Slower' : 'Listen');
  return (
    <button
      type="button"
      className={cx(compact ? styles.listenCompact : styles.listenBtn, playing && styles.listenOn)}
      onClick={() => (playing ? stopTrainingSpeech() : void playTrainingSpeech(text, { slow }))}
      aria-label={name}
      aria-pressed={playing}
    >
      <SpeakerIcon />
      {compact ? null : <span>{name}</span>}
    </button>
  );
}

/** Normal and slow playback of a listening item; downloads the voice as soon as it appears. */
export function AudioPanel({ text }) {
  useEffect(() => {
    prefetchTrainingSpeech(text);
    return () => stopTrainingSpeech();
  }, [text]);

  return (
    <div className={styles.audioPanel}>
      <ListenButton text={text} />
      <ListenButton text={text} slow />
    </div>
  );
}

/** A choice option with a speaker next to it (pronunciation items, once answered). */
export function OptionAudio({ text, show, children }) {
  if (!show) return children;
  return (
    <div className={styles.optionWithAudio}>
      {children}
      <ListenButton text={text} compact label={`Listen to “${trainingSpeechText(text)}”`} />
    </div>
  );
}

/** What the item gives before the question: audio, picture, situation, text, key word. */
export function ItemExtras({ item, collapsed }) {
  const format = trainingItemFormat(item);
  const listening = isTrainingListeningItem(item);
  const passage = format === 'gapped_text' ? '' : item.passage;
  if (!listening && !item.image && !item.context && !passage && !item.lead && !item.use) return null;

  return (
    <div className={cx(styles.extras, collapsed && styles.collapsed)}>
      {listening ? <AudioPanel text={item.audio} /> : null}
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.image} src={item.image} alt={item.imageAlt || ''} />
      ) : null}
      {item.context ? (
        <p className={styles.context}>
          <RichText text={item.context} />
        </p>
      ) : null}
      {passage ? (
        <div className={styles.passage}>
          <RichText text={passage} />
        </div>
      ) : null}
      {item.lead ? (
        <div className={styles.lead}>
          <p className={styles.leadText}>{item.lead}</p>
          {item.keyword ? <p className={styles.keyword}>{item.keyword}</p> : null}
        </div>
      ) : null}
      {item.use ? (
        <p className={styles.useChip}>
          Use <strong>{item.use}</strong>
        </p>
      ) : null}
    </div>
  );
}

function markClass(mark, ok, wrong) {
  if (mark === 'ok') return ok;
  if (mark === 'wrong') return wrong;
  return '';
}

/** Typed gaps inside a sentence or a whole paragraph, with the word in brackets when there is one. */
export function TypedGapText({ item, values, onChange, onSubmit, disabled, marks = {}, inputRef, collapsed }) {
  const long = TRAINING_LONG_TEXT_FORMATS.has(trainingItemFormat(item));
  const parts = useMemo(() => parseGapFillSentence(item.sentence), [item.sentence]);
  const numbered = (item.gaps || []).length >= 3;

  return (
    <p className={cx(long ? styles.passageText : styles.gapText, long && collapsed && styles.collapsed)}>
      {parts.map((part, position) => {
        if (part.type === 'text') return <RichText key={`t-${position}`} text={part.value} />;
        const hint = item.gaps?.[part.index - 1]?.hint;
        return (
          <span key={`g-${part.index}`} className={styles.gapWrap}>
            {numbered ? <sup className={styles.gapNo}>{part.index}</sup> : null}
            <input
              ref={part.index === 1 ? inputRef : null}
              type="text"
              className={cx(
                styles.gapInput,
                long && styles.gapInputShort,
                markClass(marks[part.index], styles.gapOk, styles.gapWrong),
              )}
              style={{ width: `${Math.min(Math.max(String(values[part.index] ?? '').length, long ? 6 : 8) + 2, 22)}ch` }}
              value={values[part.index] ?? ''}
              onChange={(event) => onChange(part.index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              disabled={disabled}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-label={`Gap ${part.index}`}
            />
            {hint ? <span className={styles.hint}>({hint})</span> : null}
          </span>
        );
      })}
    </p>
  );
}

/** Gaps with a list of words to choose from (multiple-choice cloze, linkers). */
export function SelectGapText({ item, values, onChange, disabled, marks = {}, collapsed }) {
  const format = trainingItemFormat(item);
  const parts = useMemo(() => parseGapFillSentence(item.sentence), [item.sentence]);
  const orders = useMemo(
    () =>
      (item.gaps || []).map((gap, gapIndex) =>
        trainingDisplayOrder(item, (gap.options || []).length, format === 'linker' ? 'linkers' : `gap${gapIndex}`),
      ),
    [item, format],
  );
  const numbered = (item.gaps || []).length >= 3;

  return (
    <p className={cx(styles.passageText, collapsed && styles.collapsed)}>
      {parts.map((part, position) => {
        if (part.type === 'text') return <RichText key={`t-${position}`} text={part.value} />;
        const options = item.gaps?.[part.index - 1]?.options || [];
        return (
          <span key={`g-${part.index}`} className={styles.gapWrap}>
            {numbered ? <sup className={styles.gapNo}>{part.index}</sup> : null}
            <select
              className={cx(styles.gapSelect, markClass(marks[part.index], styles.selectOk, styles.selectWrong))}
              value={values[part.index] ?? ''}
              onChange={(event) => onChange(part.index, event.target.value)}
              disabled={disabled}
              aria-label={`Gap ${part.index}`}
            >
              <option value="" disabled>
                …
              </option>
              {(orders[part.index - 1] || []).map((optionIndex) => (
                <option key={options[optionIndex]} value={options[optionIndex]}>
                  {options[optionIndex]}
                </option>
              ))}
            </select>
          </span>
        );
      })}
    </p>
  );
}

/** One typed word, with the first letter as a clue when the item gives it. */
export function ShortAnswer({ item, value, onChange, onSubmit, disabled, mark, inputRef }) {
  return (
    <div className={styles.shortAnswer}>
      {item.hint ? <span className={styles.hintLetter}>{item.hint}…</span> : null}
      <input
        ref={inputRef}
        type="text"
        className={cx(styles.shortInput, markClass(mark, styles.inputOk, styles.inputWrong))}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Your answer"
      />
    </div>
  );
}

/** Tap the part with the mistake, or the stressed syllable. */
export function TokenPicker({ item, value, onPick, disabled, showKey }) {
  const stressItem = trainingItemFormat(item) === 'stress';
  const tokens = stressItem ? item.syllables || [] : item.chunks || [];

  return (
    <div className={styles.tapBlock}>
      {stressItem ? (
        <div className={styles.stressHead}>
          <span className={styles.stressWord}>{item.word}</span>
          {showKey ? <ListenButton text={item.word} compact label={`Listen to “${item.word}”`} /> : null}
        </div>
      ) : null}
      <div className={stressItem ? styles.syllables : styles.tokens}>
        {tokens.map((token, tokenIndex) => {
          const picked = value === tokenIndex;
          const isKey = tokenIndex === item.correctIndex;
          const state = showKey
            ? isKey
              ? styles.tokenOk
              : picked
                ? styles.tokenBad
                : ''
            : picked
              ? styles.tokenOn
              : '';
          return (
            <button
              key={`${token}-${tokenIndex}`}
              type="button"
              className={cx(styles.token, state)}
              disabled={disabled}
              onClick={() => onPick(tokenIndex)}
              aria-pressed={picked}
            >
              {token}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Several right answers: every one has to be ticked, and nothing else. */
export function MultiPick({ item, picked = [], onToggle, disabled, showKey, collapsed }) {
  const options = item.options || [];
  const order = useMemo(() => trainingDisplayOrder(item, options.length, 'multi'), [item, options.length]);
  const correct = new Set(item.correctIds || []);

  return (
    <div className={cx(styles.multi, collapsed && styles.collapsed)} role="group" aria-label="Answers">
      {order.map((optionIndex) => {
        const option = options[optionIndex];
        const on = picked.includes(option.id);
        const isKey = correct.has(option.id);
        const state = showKey
          ? isKey
            ? on
              ? styles.multiOk
              : styles.multiMissed
            : on
              ? styles.multiBad
              : ''
          : on
            ? styles.multiOn
            : '';
        return (
          <button
            key={option.id}
            type="button"
            className={cx(styles.multiOption, state)}
            disabled={disabled}
            onClick={() => onToggle(option.id)}
            aria-pressed={on}
          >
            <span className={styles.check} aria-hidden>
              {on ? '✓' : ''}
            </span>
            <span>
              <RichText text={option.text} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function firstUnpaired(pairs, count, after = -1) {
  for (let step = 1; step <= count; step += 1) {
    const candidate = (after + step + count) % count;
    if (!Number.isInteger(pairs[candidate])) return candidate;
  }
  return null;
}

/** Tap an item on the left, then its partner on the right (or the other way round). */
export function MatchBoard({ item, pairs = {}, onChange, disabled, showKey, collapsed }) {
  const list = item.pairs || [];
  const rightOrder = useMemo(
    () => trainingDisplayOrder(item, list.length, 'right', { allowIdentity: false }),
    [item, list.length],
  );
  const [activeLeft, setActiveLeft] = useState(0);
  const [activeRight, setActiveRight] = useState(null);
  const leftOf = useMemo(
    () => Object.fromEntries(Object.entries(pairs).map(([left, right]) => [right, Number(left)])),
    [pairs],
  );

  const connect = (left, right) => {
    const next = {};
    Object.entries(pairs).forEach(([key, value]) => {
      if (value !== right && Number(key) !== left) next[key] = value;
    });
    next[left] = right;
    onChange(next);
    setActiveRight(null);
    setActiveLeft(firstUnpaired(next, list.length, left));
  };

  const tapLeft = (left) => {
    if (activeRight !== null) connect(left, activeRight);
    else setActiveLeft(activeLeft === left ? null : left);
  };

  const tapRight = (right) => {
    if (activeLeft !== null) connect(activeLeft, right);
    else setActiveRight(activeRight === right ? null : right);
  };

  const british = trainingItemFormat(item) === 'british_american';

  return (
    <div className={cx(styles.match, collapsed && styles.collapsed)}>
      {british ? (
        <div className={styles.matchHead}>
          <span>British</span>
          <span>American</span>
        </div>
      ) : null}
      <div className={styles.matchCols}>
        <div className={styles.matchCol}>
          {list.map((pair, left) => {
            const paired = Number.isInteger(pairs[left]);
            const state = showKey
              ? pairs[left] === left
                ? styles.matchOk
                : styles.matchBad
              : activeLeft === left
                ? styles.matchActive
                : paired
                  ? styles.matchPaired
                  : '';
            return (
              <button
                key={`l-${left}`}
                type="button"
                className={cx(styles.matchItem, state)}
                disabled={disabled}
                onClick={() => tapLeft(left)}
                aria-pressed={activeLeft === left}
              >
                <span className={styles.badge}>{left + 1}</span>
                <span>{pair.left}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.matchCol}>
          {rightOrder.map((right) => {
            const left = leftOf[right];
            const paired = Number.isInteger(left);
            const state = showKey
              ? paired && left === right
                ? styles.matchOk
                : paired
                  ? styles.matchBad
                  : ''
              : activeRight === right
                ? styles.matchActive
                : paired
                  ? styles.matchPaired
                  : '';
            return (
              <button
                key={`r-${right}`}
                type="button"
                className={cx(styles.matchItem, state)}
                disabled={disabled}
                onClick={() => tapRight(right)}
                aria-pressed={activeRight === right}
              >
                <span className={cx(styles.badge, !paired && styles.badgeEmpty)}>{paired ? left + 1 : ''}</span>
                <span>{list[right].right}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Each word gets one of the groups. */
export function ClassifyBoard({ item, assign = {}, onChange, disabled, showKey, collapsed }) {
  const words = item.words || [];
  const order = useMemo(() => trainingDisplayOrder(item, words.length, 'words'), [item, words.length]);

  return (
    <div className={cx(styles.classify, collapsed && styles.collapsed)}>
      {order.map((wordIndex) => {
        const word = words[wordIndex];
        const chosen = assign[wordIndex];
        const rowState =
          showKey && Number.isInteger(chosen) ? (chosen === word.category ? styles.rowOk : styles.rowBad) : '';
        return (
          <div key={wordIndex} className={cx(styles.classifyRow, rowState)}>
            <span className={styles.classifyWord}>{word.text}</span>
            <div className={styles.segment} role="radiogroup" aria-label={word.text}>
              {(item.categories || []).map((category, categoryIndex) => {
                const on = chosen === categoryIndex;
                const isKey = showKey && categoryIndex === word.category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={cx(
                      styles.segmentBtn,
                      on && styles.segmentOn,
                      isKey && styles.segmentKey,
                      showKey && on && !isKey && styles.segmentBad,
                    )}
                    disabled={disabled}
                    onClick={() => onChange({ ...assign, [wordIndex]: categoryIndex })}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Tap the events in order; tapping a placed one sends it back. */
export function SequenceBoard({ item, sequence = [], onChange, disabled, showKey, collapsed }) {
  const events = item.events || [];
  const order = useMemo(
    () => trainingDisplayOrder(item, events.length, 'events', { allowIdentity: false }),
    [item, events.length],
  );
  const pool = order.filter((eventIndex) => !sequence.includes(eventIndex));

  return (
    <div className={cx(styles.sequence, collapsed && styles.collapsed)}>
      {sequence.length ? (
        <ol className={styles.sequenceChosen}>
          {sequence.map((eventIndex, position) => (
            <li key={eventIndex}>
              <button
                type="button"
                className={cx(
                  styles.sequenceCard,
                  styles.sequenceCardChosen,
                  showKey && (eventIndex === position ? styles.cardOk : styles.cardBad),
                )}
                disabled={disabled}
                onClick={() => onChange(sequence.filter((value) => value !== eventIndex))}
              >
                <span className={styles.badge}>{position + 1}</span>
                <span>{events[eventIndex]}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
      {pool.length ? (
        <div className={styles.sequencePool}>
          {pool.map((eventIndex) => (
            <button
              key={eventIndex}
              type="button"
              className={styles.sequenceCard}
              disabled={disabled}
              onClick={() => onChange([...sequence, eventIndex])}
            >
              <span className={cx(styles.badge, styles.badgeEmpty)} />
              <span>{events[eventIndex]}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function nextEmptySlot(slots, count, after) {
  for (let step = 1; step <= count; step += 1) {
    const candidate = (after + step) % count;
    if (!Number.isInteger(slots[candidate])) return candidate;
  }
  return null;
}

const SLOT_MARKER = /(\[\d+\])/g;

/** Gapped text and dialogue: choose a gap, then the sentence for it. One sentence is extra. */
function PlaceBoard({ item, model, slots, onChange, disabled, showKey, collapsed }) {
  const dialogueItem = trainingItemFormat(item) === 'dialogue';
  const count = model.slots.length;
  const order = useMemo(
    () => trainingDisplayOrder(item, model.options.length, 'options', { allowIdentity: false }),
    [item, model.options.length],
  );
  const letterOf = useMemo(
    () => Object.fromEntries(order.map((optionIndex, position) => [optionIndex, trainingLetter(position)])),
    [order],
  );
  const [active, setActive] = useState(0);

  const place = (optionIndex) => {
    if (active === null) return;
    const next = {};
    Object.entries(slots).forEach(([slot, value]) => {
      if (value !== optionIndex) next[slot] = value;
    });
    next[active] = optionIndex;
    onChange(next);
    setActive(nextEmptySlot(next, count, active));
  };

  const slotState = (slotIndex) => {
    const value = slots[slotIndex];
    const filled = Number.isInteger(value);
    if (showKey) return value === model.correct[slotIndex] ? styles.slotOk : styles.slotBad;
    if (active === slotIndex) return styles.slotActive;
    return filled ? styles.slotFilled : '';
  };

  const slotContent = (slotIndex) => {
    const value = slots[slotIndex];
    if (!Number.isInteger(value)) return dialogueItem ? 'Choose a line' : slotIndex + 1;
    return (
      <>
        <span className={styles.slotLetter}>{letterOf[value]}</span>
        {model.options[value]?.text}
      </>
    );
  };

  let slotCursor = -1;

  return (
    <div className={cx(styles.place, collapsed && styles.collapsed)}>
      {dialogueItem ? (
        <div className={styles.dialogue}>
          {(item.lines || []).map((line, lineIndex) => {
            if (line.text != null) {
              return (
                <div key={lineIndex} className={styles.line}>
                  <span className={styles.speaker}>{line.speaker}</span>
                  <p className={styles.lineText}>{line.text}</p>
                </div>
              );
            }
            slotCursor += 1;
            const slotIndex = slotCursor;
            return (
              <div key={lineIndex} className={styles.line}>
                <span className={styles.speaker}>{line.speaker}</span>
                <button
                  type="button"
                  className={cx(styles.lineSlot, slotState(slotIndex))}
                  disabled={disabled}
                  onClick={() => setActive(slotIndex)}
                  aria-label={`Missing line ${slotIndex + 1}`}
                >
                  {slotContent(slotIndex)}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.placeText}>
          {String(item.passage || '')
            .split(SLOT_MARKER)
            .map((part, partIndex) => {
              const marker = part.match(/^\[(\d+)\]$/);
              if (!marker) return <RichText key={partIndex} text={part} />;
              slotCursor += 1;
              const slotIndex = slotCursor;
              return (
                <button
                  key={partIndex}
                  type="button"
                  className={cx(styles.slot, slotState(slotIndex))}
                  disabled={disabled}
                  onClick={() => setActive(slotIndex)}
                  aria-label={`Gap ${slotIndex + 1}`}
                >
                  {slotContent(slotIndex)}
                </button>
              );
            })}
        </p>
      )}

      <div className={styles.placeOptions}>
        {order.map((optionIndex, position) => {
          const used = Object.values(slots).includes(optionIndex);
          return (
            <button
              key={optionIndex}
              type="button"
              className={cx(styles.placeOption, used && styles.placeOptionUsed)}
              disabled={disabled}
              onClick={() => place(optionIndex)}
            >
              <span className={styles.badge}>{trainingLetter(position)}</span>
              <span>{model.options[optionIndex].text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Multiple matching: read the short texts and give each question a person. */
function PeopleBoard({ model, slots, onChange, disabled, showKey, collapsed }) {
  return (
    <div className={cx(styles.people, collapsed && styles.collapsed)}>
      <div className={styles.peopleTexts}>
        {model.options.map((option) => (
          <div key={option.label} className={styles.personText}>
            <p className={styles.personName}>
              <span className={styles.badge}>{option.label}</span>
              {option.name}
            </p>
            <p className={styles.personBody}>{option.text}</p>
          </div>
        ))}
      </div>
      <div className={styles.peopleQuestions}>
        {model.slots.map((question, slotIndex) => (
          <div
            key={slotIndex}
            className={cx(
              styles.personQuestion,
              showKey && (slots[slotIndex] === model.correct[slotIndex] ? styles.rowOk : styles.rowBad),
            )}
          >
            <p className={styles.personQuestionText}>{question}</p>
            <div className={styles.letterRow}>
              {model.options.map((option, optionIndex) => {
                const on = slots[slotIndex] === optionIndex;
                const isKey = showKey && model.correct[slotIndex] === optionIndex;
                return (
                  <button
                    key={option.label}
                    type="button"
                    className={cx(
                      styles.letterBtn,
                      on && styles.letterOn,
                      isKey && styles.letterKey,
                      showKey && on && !isKey && styles.letterBad,
                    )}
                    disabled={disabled}
                    onClick={() => onChange({ ...slots, [slotIndex]: optionIndex })}
                    aria-label={`${option.label}: ${option.name}`}
                    aria-pressed={on}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SlotBoard({ item, slots = {}, onChange, disabled, showKey, collapsed }) {
  const model = useMemo(() => trainingSlotModel(item), [item]);
  const props = { item, model, slots, onChange, disabled, showKey, collapsed };
  return trainingItemFormat(item) === 'multiple_matching' ? <PeopleBoard {...props} /> : <PlaceBoard {...props} />;
}
