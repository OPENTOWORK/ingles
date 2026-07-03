'use client';

import { useMemo } from 'react';
import { formatWritingFeedbackDisplay } from '@/lib/formatWritingFeedback';
import {
  parseWritingCorrectionBlocks,
  renderFeedbackSectionHtml,
} from '@/lib/formatWritingFeedbackHtml';
import {
  extractFeedbackSectionBody,
  feedbackHasAnnotatedSection,
  isAnnotatedTextSection,
  isCorrectionsSectionHeading,
  sectionDisplayOrder,
  splitFeedbackSections,
} from '@/lib/writingFeedbackSections';
import WritingInteractiveAnnotatedText, {
  WritingAnnotationLegend,
} from '@/components/writing/WritingInteractiveAnnotatedText';

function sectionTitle(heading) {
  return formatWritingFeedbackDisplay(String(heading || '').replace(/^#{1,6}\s+/, ''));
}

export default function WritingFeedbackBody({ feedback = '', lang = 'en', className = '' }) {
  const isEn = lang !== 'es';

  const sections = useMemo(() => {
    return [...splitFeedbackSections(feedback)].sort(
      (a, b) => sectionDisplayOrder(a.heading) - sectionDisplayOrder(b.heading),
    );
  }, [feedback]);

  const corrections = useMemo(() => {
    const body = extractFeedbackSectionBody(feedback, '✏️');
    return parseWritingCorrectionBlocks(body);
  }, [feedback]);

  const problemsText = useMemo(() => extractFeedbackSectionBody(feedback, '🎯'), [feedback]);
  const strengthsText = useMemo(() => extractFeedbackSectionBody(feedback, '💪'), [feedback]);

  const useInteractiveAnnotated = feedbackHasAnnotatedSection(sections);

  if (!String(feedback || '').trim()) return null;

  return (
    <div className={`writing-feedback-body ${className}`.trim()}>
      {sections.map((section, index) => {
        const { heading, body } = section;
        if (!heading && !body) return null;

        if (useInteractiveAnnotated && isCorrectionsSectionHeading(heading)) {
          return null;
        }

        if (useInteractiveAnnotated && isAnnotatedTextSection(heading)) {
          return (
            <section key={`section-${index}`} className="writing-feedback-body__section">
              {heading ? (
                <h4 className="levels-b2-writing-panel__feedback-heading">{sectionTitle(heading)}</h4>
              ) : null}
              <WritingAnnotationLegend lang={lang} />
              <WritingInteractiveAnnotatedText
                raw={body}
                corrections={corrections}
                problemsText={problemsText}
                strengthsText={strengthsText}
                lang={lang}
              />
            </section>
          );
        }

        const html = renderFeedbackSectionHtml(heading, body, {
          skipAnnotated: useInteractiveAnnotated,
          skipCorrections: useInteractiveAnnotated,
        });

        if (!html) return null;

        return (
          <div
            key={`section-${index}`}
            className="writing-feedback-body__section"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}

      {useInteractiveAnnotated ? (
        <p className="writing-feedback-body__note">
          {isEn
            ? 'Tip: corrections are integrated in your text — tap any highlight.'
            : 'Consejo: las correcciones están integradas en tu texto — pulsa cualquier marca.'}
        </p>
      ) : null}
    </div>
  );
}
