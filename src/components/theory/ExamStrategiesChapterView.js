'use client';

import ExamStrategiesArticle from '@/components/theory/ExamStrategiesArticle';
import { examStrategiesSkillPath } from '@/config/appRoutes';
export default function ExamStrategiesChapterView({ skill, title, intro, content }) {
  const sectionBackHref = examStrategiesSkillPath(skill);

  return (
    <ExamStrategiesArticle
      skillSlug={skill}
      title={title}
      intro={intro}
      content={content}
      backHref={sectionBackHref}
      backLabel="Back"
    />
  );
}
