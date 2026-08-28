const DRAFT_STORAGE_KEY = 'dralo-blog-editor-draft-v1';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function saveBlogEditorDraft(form) {
  if (typeof window === 'undefined' || !form) return;
  if (!form.title?.trim() && !form.content?.trim() && !form.excerpt?.trim()) return;

  try {
    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        form,
      }),
    );
  } catch {
    /* quota / private mode */
  }
}

export function loadBlogEditorDraft() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.form) return null;
    if (Date.now() - Number(parsed.savedAt || 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearBlogEditorDraft() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
