const NOTION_VERSION = '2022-06-28';

export function normalizeNotionId(id = '') {
  const raw = String(id).replace(/-/g, '').trim();
  if (raw.length !== 32) return String(id).trim();
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function notionConfig() {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const pageId = process.env.NOTION_MEETINGS_PAGE_ID?.trim();
  const databaseId = process.env.NOTION_MEETINGS_DATABASE_ID?.trim();
  const parentId = pageId || databaseId || null;
  const parentType = process.env.NOTION_MEETINGS_PARENT_TYPE?.trim().toLowerCase() || 'auto';

  return {
    apiKey: apiKey || null,
    pageId: pageId ? normalizeNotionId(pageId) : null,
    databaseId: databaseId ? normalizeNotionId(databaseId) : null,
    parentId: parentId ? normalizeNotionId(parentId) : null,
    parentType,
    configured: Boolean(apiKey && parentId),
    titleProp: process.env.NOTION_MEETINGS_TITLE_PROP?.trim() || null,
    dateProp: process.env.NOTION_MEETINGS_DATE_PROP?.trim() || null,
    departmentsProp: process.env.NOTION_MEETINGS_DEPARTMENTS_PROP?.trim() || null,
  };
}

export function isNotionMeetingsConfigured() {
  return notionConfig().configured;
}

export function notionPageUrl(pageId) {
  if (!pageId) return null;
  const slug = String(pageId).replace(/-/g, '');
  return `https://www.notion.so/${slug}`;
}

export function getNotionMeetingsStatus() {
  const cfg = notionConfig();
  return {
    configured: cfg.configured,
    parentId: cfg.parentId ? `${cfg.parentId.replace(/-/g, '').slice(0, 8)}…` : null,
    parentType: cfg.pageId ? 'page' : cfg.databaseId ? 'database' : cfg.parentType,
  };
}

async function notionRequest(path, options = {}) {
  const { apiKey } = notionConfig();
  if (!apiKey) {
    throw new Error('NOTION_API_KEY no configurada.');
  }

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `Notion API ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function extractDatabaseSchema(db, cfg) {
  const props = db?.properties || {};
  let titleProp = cfg.titleProp;
  let dateProp = cfg.dateProp;
  let departmentsProp = cfg.departmentsProp;

  for (const [name, def] of Object.entries(props)) {
    if (!titleProp && def.type === 'title') titleProp = name;
    if (!dateProp && def.type === 'date') dateProp = name;
    if (!departmentsProp && def.type === 'multi_select') departmentsProp = name;
  }

  if (!titleProp) {
    throw new Error('La base de datos de Notion no tiene una columna de tipo título.');
  }

  return { titleProp, dateProp, departmentsProp };
}

async function resolveParent() {
  const cfg = notionConfig();
  if (!cfg.parentId) return null;

  const tryDatabase = async () => {
    const db = await notionRequest(`/databases/${cfg.parentId}`);
    return {
      type: 'database',
      id: cfg.parentId,
      schema: extractDatabaseSchema(db, cfg),
      title: db?.title?.[0]?.plain_text || null,
    };
  };

  const tryPage = async () => {
    const page = await notionRequest(`/pages/${cfg.parentId}`);
    return {
      type: 'page',
      id: cfg.parentId,
      schema: { titleProp: 'title', dateProp: null, departmentsProp: null },
      title: page?.properties?.title?.title?.[0]?.plain_text || null,
    };
  };

  if (cfg.parentType === 'database') return tryDatabase();
  if (cfg.parentType === 'page') return tryPage();

  if (cfg.pageId) return tryPage();
  if (cfg.databaseId) {
    try {
      return await tryDatabase();
    } catch (error) {
      const message = String(error?.message || '');
      if (!message.includes('Could not find database')) throw error;
      return tryPage();
    }
  }

  try {
    return await tryDatabase();
  } catch (error) {
    const message = String(error?.message || '');
    if (!message.includes('Could not find database')) throw error;
    return tryPage();
  }
}

function richText(content) {
  const text = String(content || '').trim();
  if (!text) return [];
  const chunks = [];
  for (let i = 0; i < text.length; i += 1800) {
    chunks.push({
      type: 'text',
      text: { content: text.slice(i, i + 1800) },
    });
  }
  return chunks;
}

function buildMeetingProperties(meeting, schema) {
  const title = meeting.titulo || 'Reunión de equipo';
  const properties = {
    [schema.titleProp]: {
      title: [{ type: 'text', text: { content: title.slice(0, 2000) } }],
    },
  };

  if (schema.dateProp && meeting.fecha) {
    const start = meeting.hora ? `${meeting.fecha}T${meeting.hora}:00` : meeting.fecha;
    properties[schema.dateProp] = {
      date: { start },
    };
  }

  if (schema.departmentsProp && meeting.departamentos?.length) {
    properties[schema.departmentsProp] = {
      multi_select: meeting.departamentos.map((name) => ({ name: String(name).slice(0, 100) })),
    };
  }

  return properties;
}

function buildPageModeMetaBlocks(meeting) {
  const blocks = [];

  if (meeting.fecha) {
    const when = meeting.hora ? `${meeting.fecha} · ${meeting.hora}` : meeting.fecha;
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: `Cuándo: ${when}` } }],
      },
    });
  }

  if (meeting.departamentos?.length) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `Departamentos: ${meeting.departamentos.join(', ')}` },
          },
        ],
      },
    });
  }

  return blocks;
}

function buildAgendaBlocks(meeting, { includePageMeta = false } = {}) {
  const blocks = includePageMeta ? buildPageModeMetaBlocks(meeting) : [];

  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Orden del día' } }],
    },
  });

  for (const punto of meeting.puntos_dia || []) {
    const text = String(punto?.text || '').trim();
    if (!text) continue;
    blocks.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: richText(text),
      },
    });
  }

  if (meeting.notas) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Notas' } }],
      },
    });
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: richText(meeting.notas),
      },
    });
  }

  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'Sincronizado desde Dralo · Buzón y reuniones' },
          annotations: { italic: true, color: 'gray' },
        },
      ],
    },
  });

  return blocks;
}

async function replacePageChildren(pageId, blocks) {
  const existing = await notionRequest(`/blocks/${pageId}/children?page_size=100`);
  for (const block of existing?.results || []) {
    if (block.id) {
      await notionRequest(`/blocks/${block.id}`, { method: 'DELETE' });
    }
  }

  if (blocks.length > 0) {
    await notionRequest(`/blocks/${pageId}/children`, {
      method: 'PATCH',
      body: JSON.stringify({ children: blocks.slice(0, 100) }),
    });
  }
}

/**
 * @param {object} meeting — reunión mapeada de Dralo
 * @param {string} [existingPageId]
 * @returns {Promise<{ pageId: string, url: string } | null>}
 */
export async function syncMeetingToNotion(meeting, existingPageId = null) {
  if (!isNotionMeetingsConfigured()) return null;

  const parent = await resolveParent();
  if (!parent) return null;

  const properties = buildMeetingProperties(meeting, parent.schema);
  const blocks = buildAgendaBlocks(meeting, { includePageMeta: parent.type === 'page' });

  let pageId = existingPageId || meeting.notion_page_id || null;

  if (pageId) {
    await notionRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties, archived: false }),
    });
    await replacePageChildren(pageId, blocks);
  } else {
    const parentPayload =
      parent.type === 'page'
        ? { page_id: parent.id }
        : { database_id: parent.id };

    const created = await notionRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: parentPayload,
        properties,
        children: blocks.slice(0, 100),
      }),
    });
    pageId = created.id;
  }

  return { pageId, url: notionPageUrl(pageId) };
}

export async function archiveMeetingInNotion(pageId) {
  if (!pageId || !isNotionMeetingsConfigured()) return;
  await notionRequest(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  });
}

export async function testNotionMeetingsConnection() {
  if (!isNotionMeetingsConfigured()) {
    return {
      ok: false,
      error: 'Faltan NOTION_API_KEY y NOTION_MEETINGS_PAGE_ID o NOTION_MEETINGS_DATABASE_ID.',
    };
  }
  try {
    const parent = await resolveParent();
    return {
      ok: true,
      parentType: parent.type,
      parentTitle: parent.title,
      schema: parent.schema,
    };
  } catch (err) {
    const message = err?.message || 'No se pudo conectar con Notion.';
    if (message.includes('shared with your integration')) {
      return {
        ok: false,
        error:
          'La integración «Dralo Reuniones» no tiene acceso. En Notion abre English Department → ⋯ → Connections → añade la integración.',
      };
    }
    return { ok: false, error: message };
  }
}
