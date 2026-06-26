'use client';

import ExamSkillHubCard, { getExamSkillKindFromSlug } from '@/components/exam/ExamSkillHubCard';
import ExamSkillHubCardStyles from '@/components/exam/ExamSkillHubCardStyles';

function classifyExamLink(href = '', text = '') {
  const h = href.toLowerCase();
  const t = text.toLowerCase();
  if (h.includes('exam-mode') || t.includes('exam mode')) return 'exam-mode';
  if (h.includes('writing') || t.includes('writing')) return 'writing';
  if (h.includes('listening') || t.includes('listening')) return 'listening';
  if (h.includes('speaking') || t.includes('speaking')) return 'speaking';
  if (t.includes('reading &') || t.includes('reading and')) return 'reading';
  return 'reading';
}

function cleanLinkLabel(text = '') {
  return String(text)
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')
    .trim();
}

function getExamLinkMeta(exam) {
  const kind = classifyExamLink(exam.href, exam.text);
  return {
    kind,
    label: cleanLinkLabel(exam.text),
    isExamMode: kind === 'exam-mode',
  };
}

function ExamPracticeCard({ exam, isStudent, variant = 'skill' }) {
  const blockedForStudent = isStudent && !exam.enabledForStudents;
  const { kind, label, isExamMode } = getExamLinkMeta(exam);
  const isBanner = variant === 'banner';

  return (
    <ExamSkillHubCard
      href={blockedForStudent ? null : exam.href}
      kind={kind}
      label={label}
      hint={isExamMode ? 'Full timed simulation' : 'Practise'}
      badge={blockedForStudent ? 'Coming soon' : null}
      disabled={blockedForStudent}
      featured={isExamMode}
      banner={isBanner}
      {...(isExamMode && !blockedForStudent ? { 'data-tour': 'level-exam-mode' } : {})}
    />
  );
}

export default function ExamPracticeHubSection({
  examLinks = [],
  isStudent,
  quadrant = false,
  skillsQuadrant = false,
  sectionTitle = null,
  quadrantFooter = null,
}) {
  if (!examLinks.length) return null;

  const examModeLink = examLinks.find((exam) => getExamLinkMeta(exam).isExamMode);
  const skillLinks = examLinks.filter((exam) => !getExamLinkMeta(exam).isExamMode);

  const hubClass = [
    'exam-skill-hub',
    'exam-practice-hub',
    quadrant ? 'exam-practice-hub--quadrant' : '',
    skillsQuadrant ? 'exam-practice-hub--split' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const skillsGrid =
    skillLinks.length > 0 ? (
      <div className="exam-practice-hub__skills-grid">
        {skillLinks.map((exam) => (
          <ExamPracticeCard key={exam.href} exam={exam} isStudent={isStudent} />
        ))}
      </div>
    ) : null;

  if (skillsQuadrant) {
    return (
      <section className={hubClass} data-tour="level-exam-practice">
        <div className="exam-practice-hub__skills-quadrant">
          <div className="exam-practice-hub__quadrant-inner">
            {sectionTitle ? (
              <div className="exam-practice-hub__section-head">
                <span className="page-hero__eyebrow exam-practice-hub__section-eyebrow">{sectionTitle}</span>
              </div>
            ) : null}
            <div className="exam-practice-hub__body">
              {examModeLink ? (
                <div className="exam-practice-hub__exam-mode">
                  <ExamPracticeCard exam={examModeLink} isStudent={isStudent} />
                </div>
              ) : null}
              {skillsGrid}
            </div>
            {quadrantFooter ? (
              <div className="exam-practice-hub__quadrant-footer">{quadrantFooter}</div>
            ) : null}
          </div>
        </div>

        <ExamSkillHubCardStyles />
        <ExamPracticeHubLayoutStyles />
      </section>
    );
  }

  return (
    <section className={hubClass} data-tour="level-exam-practice">
      {quadrant ? (
        <div className="exam-practice-hub__quadrant-inner">
          <div className="exam-practice-hub__body">
            {examModeLink ? (
              <div className="exam-practice-hub__exam-mode">
                <ExamPracticeCard exam={examModeLink} isStudent={isStudent} variant="banner" />
              </div>
            ) : null}

            {skillsGrid}
          </div>
        </div>
      ) : (
        <div className="exam-practice-hub__body">
          {examModeLink ? (
            <div className="exam-practice-hub__exam-mode">
              <ExamPracticeCard exam={examModeLink} isStudent={isStudent} variant="banner" />
            </div>
          ) : null}

          {skillsGrid}
        </div>
      )}

      <ExamSkillHubCardStyles />
      <ExamPracticeHubLayoutStyles />
    </section>
  );
}

export { getExamSkillKindFromSlug };

function ExamPracticeHubLayoutStyles() {
  return (
    <style jsx global>{`
      .niveles-level-page .exam-practice-hub {
        margin-top: 1.5rem;
        margin-bottom: 0.25rem;
        padding: 6px;
      }
      .niveles-level-page .exam-practice-hub--split {
        margin-top: 1.5rem;
        padding: 0;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__exam-mode {
        margin-bottom: 14px;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__exam-mode .exam-practice-hub__card {
        width: 100%;
        box-sizing: border-box;
      }
      .niveles-level-page .exam-practice-hub__skills-quadrant {
        margin-top: 0;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__skills-quadrant .exam-practice-hub__quadrant-inner {
        border-radius: 20px;
        border: 1px solid rgba(226, 232, 240, 0.95);
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 10px 32px rgba(15, 23, 42, 0.06);
        overflow: hidden;
        box-sizing: border-box;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__section-head {
        padding: 18px 20px 16px;
        border-bottom: 1px solid rgba(226, 232, 240, 0.9);
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__section-eyebrow {
        margin-bottom: 0;
        color: #4338ca;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.22);
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__body {
        padding: 18px;
        box-sizing: border-box;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__card {
        height: 132px;
        min-height: 132px;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__label {
        font-size: 1.02rem;
        line-height: 1.25;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__card--featured .exam-practice-hub__label {
        font-size: 1.02rem;
      }
      .niveles-level-page .exam-practice-hub--split .exam-practice-hub__skills-grid {
        display: grid;
        width: 100%;
        gap: 12px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      @media (max-width: 899px) {
        .niveles-level-page .exam-practice-hub--split .exam-practice-hub__skills-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 639px) {
        .niveles-level-page .exam-practice-hub--split .exam-practice-hub__skills-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .niveles-level-page .exam-practice-hub__quadrant-footer {
        padding: 14px 18px 18px;
        border-top: 1px solid rgba(226, 232, 240, 0.9);
        margin-top: 2px;
      }
      .niveles-level-page .exam-practice-hub--quadrant {
        margin-top: 1.5rem;
        margin-bottom: 0;
        padding: 0;
      }
      .niveles-level-page .exam-practice-hub--quadrant .exam-practice-hub__quadrant-inner {
        border-radius: 20px;
        border: 1px solid rgba(226, 232, 240, 0.95);
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 10px 32px rgba(15, 23, 42, 0.06);
        overflow: hidden;
      }
      .niveles-level-page .exam-practice-hub--quadrant .niveles-section-head {
        margin-bottom: 0;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        box-shadow: none;
        background: transparent;
      }
      .niveles-level-page .exam-practice-hub__body {
        padding: 16px 18px 18px;
      }
      .niveles-level-page .exam-practice-hub--quadrant .exam-practice-hub__exam-mode {
        margin-bottom: 14px;
      }
      body.reading-night-mode .niveles-level-page .exam-practice-hub--split .exam-practice-hub__skills-quadrant .exam-practice-hub__quadrant-inner {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border-color: #475569;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.28);
      }
      body.reading-night-mode .niveles-level-page .exam-practice-hub--quadrant .exam-practice-hub__quadrant-inner {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border-color: #475569;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.28);
      }
      body.reading-night-mode .niveles-level-page .exam-practice-hub--quadrant .niveles-section-head {
        border-bottom-color: #475569;
      }
      body.reading-night-mode .niveles-level-page .exam-practice-hub--split .exam-practice-hub__quadrant-footer {
        border-top-color: #475569;
      }
      body.reading-night-mode .niveles-level-page .exam-practice-hub--split .exam-practice-hub__section-head {
        border-bottom-color: #475569;
      }
    `}</style>
  );
}
