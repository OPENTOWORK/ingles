import { NIVELES_LEVEL_HUB } from '@/data/nivelesLevelHub';
import { partInfo as a1Rue } from '@/data/part-info/a1-reading-and-use-of-english';
import { partInfo as a2Rue } from '@/data/part-info/a2-reading-and-use-of-english';
import { partInfo as a2Listening } from '@/data/part-info/a2-listening';
import { partInfo as a2Writing } from '@/data/part-info/a2-writing';
import { partInfo as a2Speaking } from '@/data/part-info/a2-speaking';
import { partInfo as b1Rue } from '@/data/part-info/b1-reading-and-use-of-english';
import { partInfo as b1Listening } from '@/data/part-info/b1-listening';
import { partInfo as b1Writing } from '@/data/part-info/b1-writing';
import { partInfo as b1Speaking } from '@/data/part-info/b1-speaking';
import { partInfo as b2Rue } from '@/data/part-info/b2-reading-and-use-of-english';
import { partInfo as b2Listening } from '@/data/part-info/b2-listening';
import { partInfo as b2Writing } from '@/data/part-info/b2-writing';
import { partInfo as b2Speaking } from '@/data/part-info/b2-speaking';
import { partInfo as c1Rue } from '@/data/part-info/c1-reading-and-use-of-english';
import { partInfo as c1Listening } from '@/data/part-info/c1-listening';
import { partInfo as c1Writing } from '@/data/part-info/c1-writing';
import { partInfo as c1Speaking } from '@/data/part-info/c1-speaking';
import { partInfo as c2Rue } from '@/data/part-info/c2-reading-and-use-of-english';
import { partInfo as c2Listening } from '@/data/part-info/c2-listening';
import { partInfo as c2Writing } from '@/data/part-info/c2-writing';
import { partInfo as c2Speaking } from '@/data/part-info/c2-speaking';
import { buildExamTheoryPartTipsHref } from '@/lib/examPartTipsHref';

const PART_INFO_REGISTRY = {
  'a1-reading-and-use-of-english': a1Rue,
  'a2-reading-and-use-of-english': a2Rue,
  'a2-listening': a2Listening,
  'a2-writing': a2Writing,
  'a2-speaking': a2Speaking,
  'b1-reading-and-use-of-english': b1Rue,
  'b1-listening': b1Listening,
  'b1-writing': b1Writing,
  'b1-speaking': b1Speaking,
  'b2-reading-and-use-of-english': b2Rue,
  'b2-listening': b2Listening,
  'b2-writing': b2Writing,
  'b2-speaking': b2Speaking,
  'c1-reading-and-use-of-english': c1Rue,
  'c1-listening': c1Listening,
  'c1-writing': c1Writing,
  'c1-speaking': c1Speaking,
  'c2-reading-and-use-of-english': c2Rue,
  'c2-listening': c2Listening,
  'c2-writing': c2Writing,
  'c2-speaking': c2Speaking,
};

const CEFR_ORDER = ['A2', 'B1', 'B2', 'C1', 'C2'];

function examTheorySlugFromSkillPath(skillPath, href) {
  if (skillPath === 'writing') return 'writing';
  if (skillPath === 'listening') return 'listening';
  if (skillPath === 'speaking') return 'speaking';
  if (skillPath === 'reading-and-use-of-english') {
    const a2WritingPart = /\/a2\/reading-and-use-of-english\/part-[67]\/?$/i.test(href);
    return a2WritingPart ? 'writing' : 'reading-and-use-of-english';
  }
  return null;
}

/**
 * @param {string} href
 * @returns {string|null} exam theory slug (reading-and-use-of-english | writing | listening | speaking)
 */
export function examTheorySlugFromPartHref(href) {
  if (!href || href.includes('speaking-lab')) return null;

  const teoria = href.match(
    /^\/teoria\/exam-part-tips\/[^/]+\/(reading-and-use-of-english|writing|listening|speaking)\//i,
  );
  if (teoria) {
    return examTheorySlugFromSkillPath(teoria[1], href);
  }

  if (/\/writing\//.test(href)) return 'writing';
  if (/\/listening\//.test(href)) return 'listening';
  if (/\/speaking\//.test(href)) return 'speaking';
  if (/\/reading-and-use-of-english\//.test(href)) {
    return examTheorySlugFromSkillPath('reading-and-use-of-english', href);
  }
  return null;
}

/**
 * @param {string} href
 * @returns {{ levelSlug: string, partKey: string, registryKey: string } | null}
 */
export function parsePartHref(href) {
  if (!href) return null;
  const withPart = href.match(
    /^\/niveles\/([a-z0-9]+)\/(reading-and-use-of-english|writing|listening|speaking)\/part-(\d+)\/?$/i,
  );
  if (withPart) {
    const [, levelSlug, skillPath, partNum] = withPart;
    return {
      levelSlug,
      partKey: partNum,
      registryKey: `${levelSlug}-${skillPath}`,
    };
  }
  const numeric = href.match(
    /^\/niveles\/([a-z0-9]+)\/(listening|speaking)\/(\d+)\/?$/i,
  );
  if (numeric) {
    const [, levelSlug, skillPath, partNum] = numeric;
    return {
      levelSlug,
      partKey: partNum,
      registryKey: `${levelSlug}-${skillPath}`,
    };
  }
  return null;
}

export function getExamPartTipsMeta(levelSlug, skillFolder, partParam, fallbackTitle = '') {
  const partKey = String(partParam || '').replace(/^part-/, '');
  const registryKey = `${levelSlug}-${skillFolder}`;
  const bank = PART_INFO_REGISTRY[registryKey];
  const entry = bank?.[partKey] || bank?.[Number(partKey)];
  if (!entry) {
    return { title: fallbackTitle || `Part ${partKey}`, description: '', tips: '', commonErrors: '' };
  }
  return {
    title: entry.title || fallbackTitle || `Part ${partKey}`,
    description: entry.description || '',
    tips: entry.tips || '',
    commonErrors: entry.commonErrors || '',
  };
}

function lookupPartMeta(href, fallbackTitle) {
  const parsed = parsePartHref(href);
  if (!parsed) {
    return {
      title: fallbackTitle,
      description: '',
      tips: '',
    };
  }
  const bank = PART_INFO_REGISTRY[parsed.registryKey];
  const entry = bank?.[parsed.partKey];
  if (!entry) {
    return { title: fallbackTitle, description: '', tips: '' };
  }
  return {
    title: entry.title || fallbackTitle,
    description: entry.description || '',
    tips: entry.tips || '',
  };
}

/**
 * Partes con tips interactivos por apartado de Exam theory.
 * @param {string} examTheorySectionSlug
 * @returns {{ cefr: string, levelSlug: string, parts: Array<{ text: string, href: string, title: string, description: string, tips: string }> }[]}
 */
export function getExamTheoryPartGroups(examTheorySectionSlug) {
  /** @type {Map<string, { cefr: string, levelSlug: string, parts: object[] }>} */
  const byLevel = new Map();

  for (const config of Object.values(NIVELES_LEVEL_HUB)) {
    for (const topics of Object.values(config.sections || {})) {
      for (const topic of topics) {
        const slug = examTheorySlugFromPartHref(topic.href);
        if (slug !== examTheorySectionSlug) continue;

        const meta = lookupPartMeta(topic.href, topic.text);
        const levelKey = config.slug;
        if (!byLevel.has(levelKey)) {
          byLevel.set(levelKey, {
            cefr: config.cefr,
            levelSlug: config.slug,
            parts: [],
          });
        }
        byLevel.get(levelKey).parts.push({
          text: topic.text,
          href: buildExamTheoryPartTipsHref(topic.href),
          title: meta.title,
          description: meta.description,
          tips: meta.tips,
        });
      }
    }
  }

  return [...byLevel.values()].sort(
    (a, b) => CEFR_ORDER.indexOf(a.cefr) - CEFR_ORDER.indexOf(b.cefr),
  );
}
