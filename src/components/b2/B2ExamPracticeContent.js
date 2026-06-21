'use client';

import SkillPartPracticeHeader from '@/components/exam/SkillPartPracticeHeader';
import { getFormattedEnunciado, omitPartTitleBlocks, omitExampleEnunciadoBlocks } from '@/utils/b2ExamPaperShared';

const blockStyles = {
  label: { margin: '0.7rem 0 0.45rem', fontWeight: 700, color: '#1a365d' },
  answer: {
    margin: '0.45rem 0',
    padding: '0.45rem 0.6rem',
    background: '#ebf8ff',
    borderRadius: '8px',
    fontWeight: 600,
  },
  number: { margin: '0.35rem 0', fontWeight: 700, color: '#2d3748' },
  option: { margin: '0.2rem 0', paddingLeft: '0.35rem', color: '#334155' },
  paragraph: { margin: '0.45rem 0', lineHeight: 1.7, color: '#1f2937' },
};

/**
 * @param {{ blocks: Array<{ type: string, text: string }>, keyPrefix?: string }} props
 */
export function B2ExamFormattedEnunciado({ blocks, keyPrefix = 'enunciado' }) {
  if (!blocks?.length) return null;

  return blocks.map((block, index) => {
    if (block.type === 'image' && block.url) {
      return (
        <img
          key={`${keyPrefix}-image-${index}`}
          src={block.url}
          alt=""
          style={{
            maxWidth: '100%',
            height: 'auto',
            margin: '0.5rem 0',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        />
      );
    }
    if (block.type === 'partTitle') {
      return (
        <p key={`${keyPrefix}-partTitle-${index}`} className="levels-exam-enunciado__part-title">
          {block.text}
        </p>
      );
    }
    const style = blockStyles[block.type] || blockStyles.paragraph;
    return (
      <p key={`${keyPrefix}-${block.type}-${index}`} style={style}>
        {block.text}
      </p>
    );
  });
}

/**
 * @param {{ text?: string, showTitle?: boolean }} props
 */
export function B2ExamPassageText({ text = '', showTitle = true }) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  let startIdx = 0;
  if (lines[0]?.toLowerCase() === 'text') startIdx = 1;

  const titleLine =
    showTitle && startIdx < lines.length && lines[startIdx].length < 120 && !/^IMAGE:/i.test(lines[startIdx])
      ? lines[startIdx]
      : null;
  const bodyStart = titleLine ? startIdx + 1 : startIdx;

  return (
    <>
      {titleLine ? (
        <h3 className="levels-exam-passage-title">{titleLine}</h3>
      ) : null}
      {lines.slice(bodyStart).map((line, idx) => {
        const img = line.match(/^IMAGE:\s*(\S+)/i);
        if (img) {
          return (
            <img
              key={`passage-img-${idx}`}
              src={img[1]}
              alt=""
              style={{
                maxWidth: '100%',
                height: 'auto',
                margin: '0.5rem 0',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            />
          );
        }
        return (
          <p key={`passage-${idx}`} style={{ margin: '0.5rem 0', lineHeight: 1.78 }}>
            {line}
          </p>
        );
      })}
    </>
  );
}

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export function B2ExamQuestionItem({ children, className = '' }) {
  return <div className={`levels-exam-split__question-item${className ? ` ${className}` : ''}`}>{children}</div>;
}

/**
 * @param {{ label?: string, blocks?: Array<{ type: string, text: string }> }} props
 */
export function SkillPartInstructionsPanel({ label = 'Instructions', blocks = [] }) {
  if (!blocks?.length) return null;
  return (
    <div className="levels-exam-split__enunciado">
      <p className="levels-exam-split__section-title">{label}</p>
      <B2ExamFormattedEnunciado blocks={blocks} />
    </div>
  );
}

/**
 * Unified exam practice card — Part 1 UoE visual format for all skills/parts.
 *
 * @param {{
 *   title: string,
 *   titleSubtitle?: string | null,
 *   directionsText?: string,
 *   directionsLabel?: string,
 *   textLabel?: string,
 *   questionsLabel?: string,
 *   passageText?: string,
 *   passage?: import('react').ReactNode,
 *   beforeQuestions?: import('react').ReactNode,
 *   questions?: import('react').ReactNode,
 *   split?: 'auto' | boolean,
 *   showDirections?: boolean,
 *   showPassagePanel?: boolean,
 *   showQuestionsHeading?: boolean,
 *   stripExampleFromDirections?: boolean,
 *   contentClassName?: string,
 *   footer?: import('react').ReactNode,
 *   titleActions?: import('react').ReactNode,
 *   exerciseLabel?: string | null,
 * }} props
 */
export function B2ExamPracticeContent({
  title,
  titleSubtitle = null,
  titleActions = null,
  exerciseLabel = null,
  directionsText = '',
  directionsLabel = 'Directions',
  textLabel = 'Text',
  questionsLabel = 'Questions',
  passageText = '',
  passage = null,
  beforeQuestions = null,
  questions = null,
  split = 'auto',
  showDirections = true,
  showPassagePanel = true,
  showQuestionsHeading = true,
  stripExampleFromDirections = false,
  contentClassName = '',
  footer = null,
}) {
  const hasPassage =
    showPassagePanel && (Boolean(passageText?.trim()) || Boolean(passage));
  const useSplit = split === 'auto' ? hasPassage && Boolean(questions) : Boolean(split);
  let directionBlocks = omitPartTitleBlocks(
    getFormattedEnunciado(directionsText),
    Boolean(title?.trim() || titleSubtitle?.trim()),
  );
  if (stripExampleFromDirections) {
    directionBlocks = omitExampleEnunciadoBlocks(directionBlocks);
  }

  return (
    <div className={useSplit ? 'levels-exam-split-page' : 'levels-exam-practice-page'}>
      <div className={`levels-exam-split-card${contentClassName ? ` ${contentClassName}` : ''}`}>
        <SkillPartPracticeHeader
          title={title}
          subtitle={titleSubtitle}
          exerciseLabel={exerciseLabel}
          titleActions={titleActions}
        />

        <div className={useSplit ? 'levels-exam-split__body' : 'levels-exam-split__body levels-exam-split__body--stacked'}>
          {showDirections && directionBlocks.length > 0 ? (
            <SkillPartInstructionsPanel label={directionsLabel} blocks={directionBlocks} />
          ) : null}

          {beforeQuestions}

          {useSplit ? (
            <div className="levels-exam-split">
              {hasPassage ? (
                <div className="levels-exam-split__panel levels-exam-split__text">
                  {textLabel ? (
                    <p className="levels-exam-split__section-title">{textLabel}</p>
                  ) : null}
                  {passage || <B2ExamPassageText text={passageText} />}
                </div>
              ) : null}
              <div className="levels-exam-split__questions">
                {showQuestionsHeading && questions ? (
                  <h3 className="levels-exam-split__section-title">{questionsLabel}</h3>
                ) : null}
                <div className="levels-exam-split__questions-grid">{questions}</div>
              </div>
            </div>
          ) : (
            <>
              {hasPassage ? (
                <div className="levels-exam-split__passage-panel">
                  {textLabel ? (
                    <p className="levels-exam-split__section-title">{textLabel}</p>
                  ) : null}
                  {passage || <B2ExamPassageText text={passageText} />}
                </div>
              ) : null}
              {questions ? (
                <div className="levels-exam-split__questions levels-exam-split__questions--stacked">
                  {showQuestionsHeading ? (
                    <h3 className="levels-exam-split__section-title">{questionsLabel}</h3>
                  ) : null}
                  <div className="levels-exam-split__questions-grid">{questions}</div>
                </div>
              ) : null}
            </>
          )}

          {footer}
        </div>
      </div>
    </div>
  );
}
