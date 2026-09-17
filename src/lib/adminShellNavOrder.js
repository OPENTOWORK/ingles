const ORDER_STORAGE_KEY = 'dralo_admin_sidebar_order_v2';

function normalizeHref(path = '') {
  const trimmed = String(path || '').replace(/\/$/, '');
  return trimmed || '/';
}

export function applyAdminShellMenuOrder(items = [], savedOrder = []) {
  if (!Array.isArray(savedOrder) || !savedOrder.length) return items;

  const byHref = new Map(items.map((item) => [normalizeHref(item.href), item]));
  const ordered = [];
  const used = new Set();

  savedOrder.forEach((href) => {
    const key = normalizeHref(href);
    const item = byHref.get(key);
    if (item) {
      ordered.push(item);
      used.add(key);
    }
  });

  items.forEach((item) => {
    const key = normalizeHref(item.href);
    if (!used.has(key)) ordered.push(item);
  });

  return ordered;
}

function applyLegacyFlatOrder(sections = [], savedOrder = []) {
  const flat = sections.flatMap((section) => section.items || []);
  const orderedFlat = applyAdminShellMenuOrder(flat, savedOrder);
  const byHref = new Map(orderedFlat.map((item) => [normalizeHref(item.href), item]));
  const used = new Set();

  return sections.map((section) => ({
    ...section,
    items: (section.items || [])
      .map((item) => {
        const key = normalizeHref(item.href);
        if (!byHref.has(key) || used.has(key)) return null;
        used.add(key);
        return byHref.get(key);
      })
      .filter(Boolean)
      .concat(
        orderedFlat.filter((item) => {
          const key = normalizeHref(item.href);
          const inSection = (section.items || []).some(
            (candidate) => normalizeHref(candidate.href) === key,
          );
          return inSection && !used.has(key);
        }),
      ),
  }));
}

export function loadAdminShellMenuOrder(roleName = '', sections = []) {
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) {
      return sections;
    }
    const parsed = JSON.parse(raw);
    const roleKey = String(roleName || 'default').toLowerCase();
    const saved = parsed?.[roleKey];

    if (!saved) return sections;

    if (Array.isArray(saved)) {
      return applyLegacyFlatOrder(sections, saved);
    }

    if (typeof saved === 'object') {
      return sections.map((section) => ({
        ...section,
        items: applyAdminShellMenuOrder(section.items || [], saved[section.id] || []),
      }));
    }

    return sections;
  } catch {
    return sections;
  }
}

export function saveAdminShellMenuOrder(roleName = '', sections = []) {
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const roleKey = String(roleName || 'default').toLowerCase();
    parsed[roleKey] = Object.fromEntries(
      sections.map((section) => [
        section.id,
        (section.items || []).map((item) => normalizeHref(item.href)),
      ]),
    );
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}
