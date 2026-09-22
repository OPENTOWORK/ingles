function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

/**
 * Flatten flat or nested Part 4 repair JSON into one object.
 * Returns { ok:false } when no answer can be found. Never invents one.
 */
export function canonicalisePart4Item(raw) {
  const root = asObject(raw);
  if (!root) {
    return { ok: false, reason: 'Part 4 output was not an object, so it cannot be judged.' };
  }
  const nestedPair = asObject(root.pair) || asObject(root.replacement?.pair) || asObject(root.data?.pair);
  const nestedFamily = asObject(root.family) || asObject(root.replacement?.family) || asObject(root.data?.family);
  const embedded = asObject(root.replacement);
  const source = nestedPair || embedded || root;

  const answer = firstString(
    source.answer,
    root.answer,
    embedded?.answer,
    nestedPair?.answer,
  );
  if (!answer) {
    return { ok: false, reason: 'Canonical Part 4 item has no answer. Nested output was not treated as a pass.' };
  }

  const s1 = firstString(source.s1, source.sentence1, root.s1, root.sentence1, embedded?.sentence1);
  const keyword = firstString(source.keyword, nestedFamily?.keyword, root.keyword, embedded?.keyword);
  const s2WithGap = firstString(source.s2WithGap, source.sentence2Start, root.s2WithGap, root.sentence2Start);
  let completedS2 = firstString(source.completedS2, root.completedS2);
  if (!completedS2) {
    const rebuilt = rebuildCompletedS2(s2WithGap, answer);
    completedS2 = rebuilt || firstString(source.sentence2, root.sentence2, embedded?.sentence2);
  }
  if (!s1 || !completedS2) {
    return { ok: false, reason: 'Sentence 1 or the completed sentence 2 is missing after normalisation.' };
  }
  if (!keyword) {
    return { ok: false, reason: 'The keyword is missing after normalisation.' };
  }

  return {
    ok: true,
    item: {
      s1,
      keyword,
      s2WithGap,
      answer,
      completedS2,
      transformationFamily: firstString(
        source.transformationFamily,
        source.familyId,
        nestedFamily?.familyId,
        nestedFamily?.transformationFamily,
        root.transformationFamily,
        root.familyId,
      ),
      acceptedVariants: Array.isArray(source.acceptedVariants)
        ? source.acceptedVariants
        : Array.isArray(root.acceptedVariants)
          ? root.acceptedVariants
          : [],
    },
  };
}

export function rebuildCompletedS2(s2WithGap, answer) {
  const gap = String(s2WithGap || '');
  const key = String(answer || '').trim();
  if (!gap || !key) return '';
  if (!/_{3,}/.test(gap)) return '';
  return gap.replace(/_{3,}/, key);
}
