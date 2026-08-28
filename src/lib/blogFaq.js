/** @typedef {{ id: string, question: string, answer: string }} BlogFaqItem */

export function createEmptyFaqItem() {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: '',
    answer: '',
  };
}

/** @param {unknown} value */
export function normalizeBlogFaqItems(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const question = String(item?.question || '').trim();
      const answer = String(item?.answer || '').trim();
      if (!question && !answer) return null;

      const id = String(item?.id || '').trim() || `faq-${index + 1}`;
      return { id, question, answer };
    })
    .filter(Boolean);
}

/** @param {BlogFaqItem[]} items */
export function serializeBlogFaqItems(items) {
  return normalizeBlogFaqItems(items).filter((item) => item.question && item.answer);
}

/** @param {BlogFaqItem[]} items */
export function hasVisibleBlogFaq(items) {
  return serializeBlogFaqItems(items).length > 0;
}
