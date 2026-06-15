'use client';

import { getFormattedEnunciado, omitPartTitleBlocks } from '@/utils/b2ExamPaperShared';

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
 * @param {{ text?: string }} props
 */
export function B2ExamPassageText({ text = '' }) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  return lines.map((line, idx) => {
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
  });
}

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export function B2ExamQuestionItem({ children, className = '' }) {
  return <div className={`levels-exam-split__question-item${className ? ` ${className}` : ''}`}>{children}</div>;
}

/**
 * Unified exam practice card — Part 1 UoE visual format for all skills/parts.
 *
 * @param {{
 *   title: string,
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
 *   contentClassName?: string,
 *   footer?: import('react').ReactNode,
 * }} props
 */
export function B2ExamPracticeContent({
  title,
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
  contentClassName = '',
  footer = null,
}) {
  const hasPassage =
    showPassagePanel && (Boolean(passageText?.trim()) || Boolean(passage));
  const useSplit = split === 'auto' ? hasPassage && Boolean(questions) : Boolean(split);
  const directionBlocks = omitPartTitleBlocks(
    getFormattedEnunciado(directionsText),
    Boolean(title?.trim()),
  );

  return (
    <div className={useSplit ? 'levels-exam-split-page' : 'levels-exam-practice-page'}>
      <div className={`levels-exam-split-card${contentClassName ? ` ${contentClassName}` : ''}`}>
        {title ? <h2>{title}</h2> : null}

        <div className={useSplit ? 'levels-exam-split__body' : 'levels-exam-split__body levels-exam-split__body--stacked'}>
          {showDirections && directionBlocks.length > 0 ? (
            <div className="levels-exam-split__enunciado">
              <p className="levels-exam-split__section-title">{directionsLabel}</p>
              <B2ExamFormattedEnunciado blocks={directionBlocks} />
            </div>
          ) : null}

          {beforeQuestions}

          {useSplit ? (
            <div className="levels-exam-split">
              {hasPassage ? (
                <div className="levels-exam-split__panel levels-exam-split__text">
                  <p className="levels-exam-split__section-title">{textLabel}</p>
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
                  <p className="levels-exam-split__section-title">{textLabel}</p>
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
