/**
 * Local repair order for naturalness-first v2.
 * Unaffected items are never the recommended target.
 */

export function nextPart1Repair({ distractorsRepaired = false, sentenceRepaired = false } = {}) {
  if (!distractorsRepaired) {
    return {
      action: 'repair-distractor',
      scope: 'failed-item',
      instruction: 'Replace only the distractor that also survives. Leave every other item unchanged.',
    };
  }
  if (!sentenceRepaired) {
    return {
      action: 'repair-sentence',
      scope: 'failed-item',
      instruction: 'If two natural words remain possible, move the gap inside this sentence only.',
    };
  }
  return {
    action: 'regenerate-item',
    scope: 'failed-item',
    instruction: 'Discard this item and choose a different sentence from the passage. Do not rewrite the other items.',
  };
}

export function nextPart2Repair({ gapMoved = false } = {}) {
  if (!gapMoved) {
    return {
      action: 'move-gap',
      scope: 'failed-gap',
      instruction: 'Close this gap and choose a different function word in the finished prose. Do not rewrite the passage yet.',
    };
  }
  return {
    action: 'rewrite-passage',
    scope: 'passage',
    instruction: 'Only if no unique gap remains, write a new natural paragraph and discover gaps again.',
  };
}

export function nextPart3Repair() {
  return {
    action: 'new-position',
    scope: 'failed-item',
    instruction: 'Choose a different word already in the natural text. Do not force this sentence to keep the rejected base.',
  };
}

export function nextPart4Repair() {
  return {
    action: 'replace-family',
    scope: 'failed-item',
    instruction: 'Drop this Transformation Family and try another route that keeps the same meaning in natural British English. Do not bend the sentences around the failed keyword.',
  };
}
