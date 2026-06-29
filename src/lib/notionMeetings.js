const NOTION_VERSION = '2022-06-28';

function notionConfig() {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const databaseId = process.env.NOTION_MEETINGS_DATABASE_ID?.trim();
  return {
    apiKey: apiKey || null,
    databaseId: databaseId || null,
    configured: Boolean(apiKey && databaseId),
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
    databaseId: cfg.databaseId ? `${cfg.databaseId.slice(0, 8)}…` : null,
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

async function resolveDatabaseProps() {
  const cfg = notionConfig();
  if (!cfg.databaseId) return null;

  if (cfg.titleProp && cfg.dateProp) {
    return {
      titleProp: cfg.titleProp,
      dateProp: cfg.dateProp,
      departmentsProp: cfg.departmentsProp,
    };
  }

  const db = await notionRequest(`/databases/${cfg.databaseId}`);
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
    const start = meeting.hora
      ? `${meeting.fecha}T${meeting.hora}:00`
      : meeting.fecha;
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

function buildAgendaBlocks(meeting) {
  const blocks = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Orden del día' } }],
      },
    },
  ];

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

  const cfg = notionConfig();
  const schema = await resolveDatabaseProps();
  const properties = buildMeetingProperties(meeting, schema);
  const blocks = buildAgendaBlocks(meeting);

  let pageId = existingPageId || meeting.notion_page_id || null;

  if (pageId) {
    await notionRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties, archived: false }),
    });
    await replacePageChildren(pageId, blocks);
  } else {
    const created = await notionRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: cfg.databaseId },
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
    return { ok: false, error: 'Faltan NOTION_API_KEY o NOTION_MEETINGS_DATABASE_ID.' };
  }
  try {
    const schema = await resolveDatabaseProps();
    return { ok: true, schema };
  } catch (err) {
    return { ok: false, error: err?.message || 'No se pudo conectar con Notion.' };
  }
}
