/**
 * Cambridge-style word formation.
 * Shared letters, prefixes, and suffix overlap are not enough to pass.
 * Unknown pairs require an explicit lexical-family judgement. The short
 * deterministic list is supporting evidence, not a hard whitelist.
 */

const FAMILIES = {
  decide: ['decision', 'decisions', 'decisive', 'decisively', 'decided', 'deciding', 'decidedly'],
  long: ['length', 'lengthy', 'lengths'],
  anxious: ['anxiety', 'anxiously'],
  strong: ['strength', 'strongly', 'strengthen'],
  deep: ['depth', 'deeply', 'deepen'],
  wide: ['width', 'widely', 'widen'],
  high: ['height', 'highly', 'heighten'],
  power: ['powerful', 'powerless', 'powerfully'],
};

const ARTIFICIAL_BASES = new Set([
  'beekeep',
  'beekee',
  'decisionmaking',
]);

const FREE_ROOTS = new Set([
  'make', 'making', 'maker', 'bee', 'keep', 'keeping', 'keeper',
  'work', 'working', 'play', 'playing', 'time', 'timing',
]);

function clean(value) {
  return String(value || '').trim().toLowerCase();
}

function familyOf(base) {
  return FAMILIES[clean(base)] || null;
}

function isTruncatedLemma(base) {
  const token = clean(base);
  if (!token || token.length < 4) return false;
  return Object.entries(FAMILIES).some(([lemma, members]) => {
    if (lemma === token) return false;
    if (lemma.startsWith(token) && token.length < lemma.length) return true;
    return members.some((member) => member.startsWith(token) && token.length < member.length);
  });
}

function piecesOf(answer) {
  return clean(answer).split(/[-\s]+/).filter(Boolean);
}

export function analyseLexicalFamily({
  stem,
  answer,
  pluralRequired = false,
  contextRequiresPlural = false,
  lexicalFamilyValidation,
} = {}) {
  const base = clean(stem);
  const derived = clean(answer);
  const pluralOk = Boolean(pluralRequired || contextRequiresPlural);
  const result = {
    base,
    answer: derived,
    sameLexicalFamily: false,
    extraLexicalRootIntroduced: false,
    directDerivation: false,
    artificialBase: false,
    reason: '',
  };

  if (!base || !derived) {
    result.reason = 'Stem or answer is missing.';
    return result;
  }
  if (base === derived) {
    result.reason = 'The answer is identical to the stem. That is not word formation.';
    return result;
  }
  if (ARTIFICIAL_BASES.has(base) || isTruncatedLemma(base)) {
    result.artificialBase = true;
    result.reason = `"${base}" is not a legitimate Cambridge base word. Do not invent a stem because it shares letters with "${derived}".`;
    return result;
  }

  const pieces = piecesOf(derived);
  if (pieces.length > 1) {
    const family = familyOf(base) || [];
    const extras = pieces.filter((piece) => !family.includes(piece) && !piece.startsWith(base.slice(0, Math.min(base.length, 5))));
    const foreign = pieces.filter((piece) => FREE_ROOTS.has(piece) || (!family.includes(piece) && piece !== base));
    if (foreign.length) {
      result.extraLexicalRootIntroduced = true;
      result.reason = `"${derived}" introduces another lexical element (${foreign.join(', ')}). It is not a direct derivation of ${base.toUpperCase()}.`;
      return result;
    }
    if (extras.length) {
      result.extraLexicalRootIntroduced = true;
      result.reason = `"${derived}" is not a single derivation of ${base.toUpperCase()}.`;
      return result;
    }
  }

  const family = familyOf(base);
  if (!family || !family.includes(derived)) {
    const supplied = lexicalFamilyValidation;
    const complete = supplied
      && typeof supplied.sameLexicalFamily === 'boolean'
      && typeof supplied.extraLexicalRootIntroduced === 'boolean'
      && typeof supplied.directDerivation === 'boolean'
      && typeof supplied.legitimateBase === 'boolean'
      && typeof supplied.reason === 'string'
      && supplied.reason.trim();
    if (!complete) {
      result.pipelineIncomplete = true;
      result.reason = `The pair "${base}" → "${derived}" is not in the small reference list and has no complete lexical-family judgement.`;
      return result;
    }
    if (!supplied.legitimateBase) {
      result.artificialBase = true;
      result.reason = supplied.reason;
      return result;
    }
    if (supplied.extraLexicalRootIntroduced) {
      result.extraLexicalRootIntroduced = true;
      result.reason = supplied.reason;
      return result;
    }
    if (!supplied.sameLexicalFamily || !supplied.directDerivation) {
      result.reason = supplied.reason;
      return result;
    }
    result.sameLexicalFamily = true;
    result.directDerivation = true;
    result.reason = supplied.reason;
    result.validationSource = 'linguistic-family-judgement';
    return result;
  }

  const singular = derived.endsWith('s') ? derived.slice(0, -1) : '';
  const pluralVariant = Boolean(singular && family.includes(singular) && singular !== derived);
  if (pluralVariant && !pluralOk) {
    result.sameLexicalFamily = true;
    result.reason = `"${derived}" is the plural of a family member, but the context has not shown that the plural is required.`;
    return result;
  }

  result.sameLexicalFamily = true;
  result.directDerivation = true;
  result.reason = `"${derived}" is a direct member of the ${base.toUpperCase()} family.`;
  result.validationSource = 'reference-family';
  return result;
}
